export type SequenceLabel = 'safe' | 'at-risk';

export type TrainingSample = {
  sequence: number[];
  label: SequenceLabel;
};

export type PredictionResult = {
  anomalyScore: number;
  threshold: number;
  decision: 'PASS' | 'MANUAL_REVIEW' | 'VETO';
  reason: string;
  reconstructionError: number;
  featureReconstruction: Array<{ feature: string; reconstructionError: number }>; 
};

export class SequenceAutoencoderModel {
  private weights: number[] = [];
  private baselines: number[] = [];
  private trained = false;
  private readonly threshold = 0.68;

  train(samples: TrainingSample[]): void {
    if (!samples.length) {
      this.weights = [1, 1, 1, 1];
      this.baselines = [0.5, 0.5, 0.5, 0.5];
      this.trained = true;
      return;
    }

    const maxLength = Math.max(...samples.map((sample) => sample.sequence.length));
    this.weights = Array.from({ length: maxLength }, () => 1);
    this.baselines = Array.from({ length: maxLength }, () => 0.5);

    const safeSamples = samples.filter((sample) => sample.label === 'safe');
    const riskSamples = samples.filter((sample) => sample.label === 'at-risk');

    for (let i = 0; i < maxLength; i++) {
      const safeAvg = safeSamples.length
        ? safeSamples.reduce((sum, sample) => sum + (sample.sequence[i] ?? 0), 0) / safeSamples.length
        : 0.5;
      const riskAvg = riskSamples.length
        ? riskSamples.reduce((sum, sample) => sum + (sample.sequence[i] ?? 0), 0) / riskSamples.length
        : 0.8;

      const diff = Math.abs(riskAvg - safeAvg);
      this.weights[i] = 0.5 + diff;
      this.baselines[i] = safeAvg;
    }

    this.trained = true;
  }

  predict(sequence: number[]): PredictionResult {
    if (!this.trained || this.weights.length === 0) {
      this.train([{ sequence, label: 'safe' }]);
    }

    const maxLength = Math.max(this.weights.length, sequence.length);
    const featureReconstruction = Array.from({ length: maxLength }, (_, idx) => {
      const target = sequence[idx] ?? 0;
      const baseline = this.baselines[idx] ?? 0.5;
      const error = Math.abs(target - baseline) * (this.weights[idx] ?? 1);
      return {
        feature: `step_${idx + 1}`,
        reconstructionError: Number(error.toFixed(4))
      };
    });

    const reconstructionError = featureReconstruction.reduce((sum, item) => sum + item.reconstructionError, 0) / Math.max(featureReconstruction.length, 1);
    const anomalyScore = Number(Math.min(1, Math.max(0, reconstructionError)).toFixed(4));

    let decision: 'PASS' | 'MANUAL_REVIEW' | 'VETO' = 'PASS';
    let reason = 'Sequence aligns with normal retry behavior and low reconstruction error.';

    if (anomalyScore >= this.threshold) {
      decision = 'VETO';
      reason = 'Sequence deviates materially from normal payment behavior and exceeds the anomaly gate threshold.';
    } else if (anomalyScore >= this.threshold * 0.72) {
      decision = 'MANUAL_REVIEW';
      reason = 'Sequence shows elevated risk but is still within reviewable tolerance.';
    }

    return {
      anomalyScore,
      threshold: this.threshold,
      decision,
      reason,
      reconstructionError,
      featureReconstruction: featureReconstruction.slice(0, 6)
    };
  }
}

export const sequenceAutoencoderModel = new SequenceAutoencoderModel();

export function buildTrainingSamplesFromCases(cases: Array<{ customer: { paymentSequence?: Array<{ amount: number; timeDeltaMinutes: number; status: string }> } }>): TrainingSample[] {
  return cases.flatMap((caseItem) => {
    const sequence = caseItem.customer.paymentSequence || [];
    if (!sequence.length) return [];

    const normalized = sequence.map((step) => {
      const amountSignal = Number((step.amount / 10000).toFixed(3));
      const timeSignal = Math.min(1, step.timeDeltaMinutes / 60);
      const statusSignal = step.status === 'FAILED' ? 0.9 : step.status === 'PENDING' ? 0.65 : 0.2;
      return Number((amountSignal * 0.6 + timeSignal * 0.25 + statusSignal * 0.15).toFixed(3));
    });

    const label = normalized.some((item) => item > 0.9) ? 'at-risk' : 'safe';
    return [{ sequence: normalized, label }];
  });
}
