"""Offline LSTM anomaly gate for RevRakshak.

This module never calls Razorpay or any network service. It trains only on
normal payment-attempt sequences and returns a bounded PASS, MANUAL_REVIEW,
or VETO decision. When PyTorch is unavailable or a sequence is too short, the
velocity rule is used instead.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from typing import Any, Iterable

import numpy as np

try:
    import torch
    import torch.nn as nn
except ImportError:  # pragma: no cover - exercised in environments without torch
    torch = None
    nn = None


@dataclass
class GateResult:
    anomaly_score: float
    threshold: float
    decision: str
    reason: str
    used_fallback: bool
    fallback_reason: str | None = None
    feature_errors: dict[str, float] | None = None


if nn is not None:
    class LSTMAutoencoder(nn.Module):
        def __init__(self, seq_len: int = 10, n_features: int = 4, latent_dim: int = 32):
            super().__init__()
            self.seq_len = seq_len
            self.encoder = nn.LSTM(n_features, latent_dim, num_layers=2, batch_first=True, dropout=0.2)
            self.decoder = nn.LSTM(latent_dim, latent_dim, num_layers=2, batch_first=True, dropout=0.2)
            self.output_layer = nn.Linear(latent_dim, n_features)

        def forward(self, values):
            _, (hidden, _) = self.encoder(values)
            context = hidden[-1].unsqueeze(1).repeat(1, self.seq_len, 1)
            decoded, _ = self.decoder(context)
            return self.output_layer(decoded)
else:
    LSTMAutoencoder = None


class PaymentSequenceGate:
    def __init__(self, seq_len: int = 10, threshold: float = 0.65, min_sequence_length: int = 3):
        self.seq_len = seq_len
        self.threshold = threshold
        self.min_sequence_length = min_sequence_length
        self.model = None
        self.calibration_error = 1.0

    @staticmethod
    def _vector(event: dict[str, Any], previous: dict[str, Any] | None) -> list[float]:
        amount = min(1.0, max(0.0, float(event.get("amount", 0)) / 10000.0))
        gap = min(1.0, max(0.0, float(event.get("timeDeltaMinutes", event.get("time_delta_minutes", 0))) / 60.0))
        method = event.get("paymentMethod", event.get("payment_method", ""))
        previous_method = (previous or {}).get("paymentMethod", (previous or {}).get("payment_method", ""))
        switched = 1.0 if previous and method != previous_method else 0.0
        failed = 1.0 if event.get("status", "FAILED") == "FAILED" else 0.0
        return [amount, gap, switched, failed]

    def vectorize(self, events: Iterable[dict[str, Any]]) -> np.ndarray:
        values = list(events)
        vectors = [self._vector(event, values[index - 1] if index else None) for index, event in enumerate(values)]
        vectors = vectors[-self.seq_len:]
        if len(vectors) < self.seq_len:
            vectors = [[0.0] * 4] * (self.seq_len - len(vectors)) + vectors
        return np.asarray(vectors, dtype=np.float32)

    def train(self, healthy_sequences: list[list[dict[str, Any]]]) -> dict[str, float]:
        if torch is None or not healthy_sequences:
            self.model = None
            return {"status": "RULE_FALLBACK", "calibration_error": self.calibration_error}
        values = np.stack([self.vectorize(sequence) for sequence in healthy_sequences])
        split = max(1, int(len(values) * 0.15))
        train_values = torch.tensor(values[split:], dtype=torch.float32)
        validation_values = torch.tensor(values[:split], dtype=torch.float32)
        self.model = LSTMAutoencoder(self.seq_len).to("cpu")
        optimizer = torch.optim.Adam(self.model.parameters(), lr=1e-3)
        criterion = nn.MSELoss()
        for _ in range(20):
            self.model.train()
            optimizer.zero_grad()
            loss = criterion(self.model(train_values), train_values)
            loss.backward()
            nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            optimizer.step()
        self.model.eval()
        with torch.no_grad():
            errors = ((self.model(validation_values) - validation_values) ** 2).mean(dim=(1, 2)).numpy()
        self.calibration_error = float(max(np.percentile(errors, 95), 1e-6))
        return {"status": "TRAINED", "calibration_error": self.calibration_error}

    def predict(self, events: list[dict[str, Any]]) -> GateResult:
        if len(events) < self.min_sequence_length:
            return self._velocity_fallback(events, "SEQUENCE_TOO_SHORT")
        values = self.vectorize(events)
        if self.model is None or torch is None:
            return self._velocity_fallback(events, "MODEL_UNAVAILABLE")
        with torch.no_grad():
            tensor = torch.tensor(values, dtype=torch.float32).unsqueeze(0)
            reconstructed = self.model(tensor).squeeze(0).numpy()
        errors = np.mean((values - reconstructed) ** 2, axis=0)
        raw_error = float(np.mean(errors))
        score = min(1.0, raw_error / self.calibration_error)
        decision = "VETO" if score >= self.threshold else "MANUAL_REVIEW" if score >= self.threshold * 0.72 else "PASS"
        return GateResult(
            anomaly_score=round(score, 4),
            threshold=self.threshold,
            decision=decision,
            reason="LSTM reconstruction error exceeded the bounded safety threshold." if decision == "VETO" else "Sequence is within the calibrated normal range.",
            used_fallback=False,
            feature_errors={name: round(float(error), 6) for name, error in zip(("amount", "time_gap", "method_switch", "failed_status"), errors)},
        )

    def _velocity_fallback(self, events: list[dict[str, Any]], reason: str) -> GateResult:
        methods = {event.get("paymentMethod", event.get("payment_method")) for event in events}
        rapid_attempts = sum(float(event.get("timeDeltaMinutes", event.get("time_delta_minutes", 0))) <= 10 for event in events)
        veto = len(methods) >= 3 and rapid_attempts >= 3
        return GateResult(
            anomaly_score=0.9 if veto else 0.2,
            threshold=self.threshold,
            decision="VETO" if veto else "PASS",
            reason="Velocity fallback detected rapid multi-method attempts." if veto else "Velocity fallback found no unsafe retry pattern.",
            used_fallback=True,
            fallback_reason=reason,
            feature_errors={"distinct_methods": float(len(methods)), "rapid_attempts": float(rapid_attempts)},
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("events_json", help="JSON file containing {healthy: [...], sequence: [...]} data")
    args = parser.parse_args()
    with open(args.events_json, encoding="utf-8") as handle:
        data = json.load(handle)
    gate = PaymentSequenceGate()
    print(json.dumps({"training": gate.train(data.get("healthy", [])), "prediction": asdict(gate.predict(data.get("sequence", [])))}, indent=2))


if __name__ == "__main__":
    main()