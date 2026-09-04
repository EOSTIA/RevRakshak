import React from 'react';
import { LstmAnomalyResult, PaymentSequenceEvent } from '../../types.js';
import { ShieldAlert, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

interface LstmSequenceVisualizerProps {
  id?: string;
  anomalyResult: LstmAnomalyResult;
  paymentSequence?: PaymentSequenceEvent[];
}

export const LstmSequenceVisualizer: React.FC<LstmSequenceVisualizerProps> = ({
  id,
  anomalyResult,
  paymentSequence = []
}) => {
  const isVeto = anomalyResult.decision === 'VETO';
  const score = anomalyResult.anomalyScore;
  const threshold = anomalyResult.threshold;

  return (
    <div id={id} className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1A1A1A] pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center font-bold text-sm ${
              isVeto ? 'bg-[#991B1B] text-white' : 'bg-[#1A1A1A] text-white'
            }`}
          >
            {isVeto ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
              Neural Sequence Gate
            </div>
            <h4 className="text-lg font-bold text-[#1A1A1A] font-serif flex items-center gap-2">
              LSTM Autoencoder Sequence Gate
              {anomalyResult.isFallbackActive && (
                <span className="bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 text-[10px] font-sans font-bold text-[#92400E]">
                  FALLBACK: VELOCITY RULE
                </span>
              )}
            </h4>
            <p className="text-xs text-[#666666] font-sans">
              Sequence reconstruction error (MSE) evaluated over historical attempt vectors
            </p>
          </div>
        </div>

        {/* Anomaly Score Gauge Metric */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-[0.2em] font-sans block">
              Reconstruction Loss (MSE)
            </span>
            <span
              className={`font-serif text-2xl font-black ${
                isVeto ? 'text-[#991B1B]' : 'text-[#166534]'
              }`}
            >
              {score.toFixed(2)}
            </span>
            <span className="text-xs text-[#888888] ml-1 font-sans">/ threshold {threshold.toFixed(2)}</span>
          </div>

          <div
            className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-[0.15em] border ${
              isVeto
                ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                : 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
            }`}
          >
            {isVeto ? 'VETO BLOCKED' : 'SAFETY PASS'}
          </div>
        </div>
      </div>

      {/* Model Architecture Flow Representation */}
      <div className="my-6 border border-[#EBE8E4] bg-[#F9F7F4] p-5">
        <div className="flex items-center justify-between text-xs text-[#666666] mb-3">
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059]">
            Sequential Latent Compression &amp; Reconstruction
          </span>
          <span className="font-sans text-[11px] text-[#1A1A1A] font-semibold flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5 text-[#C5A059]" /> Latent Dimension: 16 &bull; Latency: {anomalyResult.latencyMs}ms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
          {/* Step 1: Input */}
          <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-3 shadow-xs">
            <div className="text-[10px] text-[#C5A059] font-sans font-bold uppercase tracking-wider">
              01. Input Sequence
            </div>
            <div className="text-xs font-bold text-[#1A1A1A] mt-1 font-serif">
              Sequence (N=10)
            </div>
            <div className="text-[10px] text-[#666666] mt-0.5 font-mono">
              [Δt, Δ₹, Card, Method]
            </div>
          </div>

          <div className="hidden md:flex justify-center text-[#999999]">
            <ArrowRight className="h-4 w-4" />
          </div>

          {/* Step 2: Encoder & Bottleneck */}
          <div className="border border-[#1A1A1A] bg-[#1A1A1A] text-white p-3 shadow-sm">
            <div className="text-[10px] text-[#C5A059] font-sans font-bold uppercase tracking-wider">
              02. Latent Encoder
            </div>
            <div className="text-xs font-bold text-white mt-1 font-serif">
              Latent Space (z=16)
            </div>
            <div className="text-[10px] text-[#CCC] mt-0.5 font-sans">
              Normal Velocity Manifold
            </div>
          </div>

          <div className="hidden md:flex justify-center text-[#999999]">
            <ArrowRight className="h-4 w-4" />
          </div>

          {/* Step 3: Decoder & Error */}
          <div
            className={`border p-3 shadow-xs ${
              isVeto
                ? 'border-[#FECACA] bg-[#FEF2F2]'
                : 'border-[#BBF7D0] bg-[#F0FDF4]'
            }`}
          >
            <div
              className={`text-[10px] font-sans font-bold uppercase tracking-wider ${
                isVeto ? 'text-[#991B1B]' : 'text-[#166534]'
              }`}
            >
              03. Reconstruction Loss
            </div>
            <div className="text-xs font-bold text-[#1A1A1A] mt-1 font-serif">
              MSE: {score.toFixed(2)}
            </div>
            <div
              className={`text-[10px] font-sans font-semibold mt-0.5 ${
                isVeto ? 'text-[#991B1B]' : 'text-[#166534]'
              }`}
            >
              {isVeto ? 'Loss > Threshold (Veto)' : 'Loss ≤ Threshold (Safe)'}
            </div>
          </div>
        </div>
      </div>

      {/* Feature-Level Reconstruction Errors */}
      {anomalyResult.featureErrors.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] font-bold text-[#666666] uppercase tracking-[0.2em] font-sans mb-3">
            Feature-Level Reconstruction Error Attribution
          </div>
          <div className="space-y-3">
            {anomalyResult.featureErrors.map((feat, idx) => (
              <div
                key={idx}
                className="border border-[#EBE8E4] bg-[#F9F7F4] p-3.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1A1A1A] font-serif">{feat.featureName}</span>
                  <div className="flex items-center gap-4 font-sans text-xs">
                    <span className="text-[#666666]">
                      Error: <strong className="text-[#1A1A1A] font-mono">{feat.reconstructionError.toFixed(2)}</strong>
                    </span>
                    <span
                      className={`font-bold ${
                        feat.reconstructionError > 0.4 ? 'text-[#991B1B]' : 'text-[#1A1A1A]'
                      }`}
                    >
                      Contribution: {feat.contributionPercent}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 h-1.5 w-full bg-[#E5E0DA] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      feat.reconstructionError > 0.4 ? 'bg-[#991B1B]' : 'bg-[#1A1A1A]'
                    }`}
                    style={{ width: `${Math.min(feat.contributionPercent * 1.5, 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#666666] font-sans">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Sequence History if present */}
      {paymentSequence.length > 0 && (
        <div className="mt-5 border-t border-[#EBE8E4] pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-sans uppercase font-bold tracking-[0.2em] text-[#C5A059]">
              Evaluated Temporal Sequence (Last {paymentSequence.length} Events)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {paymentSequence.map((ev, i) => (
              <div
                key={ev.id || i}
                className="border border-[#EBE8E4] bg-[#FFFFFF] p-3 text-xs shadow-xs"
              >
                <div className="flex justify-between items-center text-[#666666] font-sans text-[10px] uppercase font-bold">
                  <span>Attempt #{i + 1}</span>
                  <span
                    className={
                      ev.status === 'SUCCESS' ? 'text-[#166534]' : 'text-[#991B1B]'
                    }
                  >
                    {ev.status}
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between items-baseline">
                  <span className="font-serif font-black text-[#1A1A1A] text-sm">₹{ev.amount.toLocaleString('en-IN')}</span>
                  <span className="text-[11px] text-[#666666] font-sans">{ev.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

