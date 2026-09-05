import type { LstmAnomalyResult, PaymentSequenceEvent } from '../../src/types.js';

type PythonPrediction = {
  anomaly_score: number;
  threshold: number;
  decision: 'PASS' | 'MANUAL_REVIEW' | 'VETO';
  reason: string;
  used_fallback: boolean;
  fallback_reason?: string;
  feature_errors?: Record<string, number>;
};

export async function scoreWithPythonLstm(sequence: PaymentSequenceEvent[]): Promise<LstmAnomalyResult | null> {
  const baseUrl = process.env.LSTM_SERVICE_URL;
  if (!baseUrl) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.LSTM_TIMEOUT_MS || 800));
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: sequence }),
      signal: controller.signal
    });
    if (!response.ok) return null;
    const prediction = await response.json() as PythonPrediction;
    return {
      anomalyScore: prediction.anomaly_score,
      threshold: prediction.threshold,
      decision: prediction.decision,
      reason: prediction.reason,
      featureErrors: Object.entries(prediction.feature_errors || {}).map(([featureName, reconstructionError]) => ({ featureName, inputScore: 0, reconstructedScore: 0, reconstructionError, contributionPercent: 0, description: `${featureName} reconstruction error` })),
      isFallbackActive: prediction.used_fallback,
      fallbackReason: prediction.fallback_reason,
      latencyMs: 0
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}