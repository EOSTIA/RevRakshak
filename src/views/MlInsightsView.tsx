import React from 'react';
import { useApp } from '../context/AppContext.js';
import {
  BrainCircuit,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart2,
  Layers,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

export const MlInsightsView: React.FC = () => {
  const { summary } = useApp();

  // Model performance metrics
  const models = [
    {
      name: 'LightGBM Root Cause Diagnostic Classifier',
      version: 'v3.1.2-prod',
      accuracy: '94.2%',
      f1Score: '0.931',
      latency: '24ms',
      description: 'Multi-class classifier predicting root cause from 28 gateway response signals'
    },
    {
      name: 'Sequential LSTM Anomaly Autoencoder',
      version: 'v2.4.0-prod',
      accuracy: '98.6%',
      f1Score: '0.974',
      latency: '38ms',
      description: 'Reconstructs sequential attempt history to catch card-testing and velocity bursts'
    },
    {
      name: 'Contextual Bandit Propensity Engine',
      version: 'v4.0.1-prod',
      accuracy: '89.4%',
      f1Score: '0.887',
      latency: '18ms',
      description: 'Calculates expected value E[V] across payment links, voice nudges, and smart retries'
    }
  ];

  // Feature Importance Data
  const featureImportance = [
    { feature: 'Error Code Sub-string', importance: 94 },
    { feature: 'Customer 30d Historical Recovery Rate', importance: 88 },
    { feature: 'Issuing Bank Active Success Ratio', importance: 82 },
    { feature: 'Attempt Time Delta (Δt seconds)', importance: 79 },
    { feature: 'Payment Method Switching Count', importance: 74 },
    { feature: 'Invoice Amount vs Customer Mean', importance: 68 },
    { feature: 'Historical UPI Autopay Success', importance: 61 }
  ];

  // Anomaly Reconstruction Error Distribution Histogram
  const reconstructionData = [
    { bin: '0.00-0.10', count: 42, type: 'normal' },
    { bin: '0.11-0.20', count: 35, type: 'normal' },
    { bin: '0.21-0.30', count: 28, type: 'normal' },
    { bin: '0.31-0.40', count: 19, type: 'normal' },
    { bin: '0.41-0.50', count: 12, type: 'normal' },
    { bin: '0.51-0.60', count: 6, type: 'normal' },
    { bin: '0.61-0.65', count: 4, type: 'threshold' },
    { bin: '0.66-0.80', count: 7, type: 'anomaly' },
    { bin: '0.81-1.00', count: 5, type: 'anomaly' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
            Statistical Diagnostics
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl font-serif">
              ML Observability &amp; Risk Diagnostics
            </h1>
            <span className="border border-[#1A1A1A] bg-[#1A1A1A] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider">
              MODEL GOVERNANCE
            </span>
          </div>
          <p className="text-xs text-[#666666] font-sans mt-1">
            Real-time inference telemetry, feature attribution, and LSTM autoencoder reconstruction error distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="border border-[#EBE8E4] bg-[#FFFFFF] px-3 py-1 text-xs font-sans font-bold text-[#166534] flex items-center gap-1.5 shadow-xs">
            <Activity className="h-3.5 w-3.5 text-[#166534]" /> 3 Active Inference Endpoints
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((m, idx) => (
          <div
            key={idx}
            className="border border-[#EBE8E4] bg-[#FFFFFF] p-5 space-y-3 flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider">
                  {m.version}
                </span>
                <span className="border border-[#EBE8E4] bg-[#FAF8F5] px-2 py-0.5 text-[10px] font-sans font-bold text-[#1A1A1A]">
                  {m.latency}
                </span>
              </div>
              <h4 className="text-sm font-bold font-serif text-[#1A1A1A] mt-2">{m.name}</h4>
              <p className="text-xs text-[#666666] font-sans mt-1 leading-relaxed">{m.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-[#EBE8E4] pt-3 text-xs font-sans">
              <div>
                <span className="text-[#888888] text-[10px] uppercase font-bold block tracking-wider">ACCURACY</span>
                <span className="font-serif font-bold text-[#166534] text-base">{m.accuracy}</span>
              </div>
              <div>
                <span className="text-[#888888] text-[10px] uppercase font-bold block tracking-wider">F1-SCORE</span>
                <span className="font-serif font-bold text-[#1A1A1A] text-base">{m.f1Score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts: Reconstruction Error Histogram & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reconstruction Error Distribution */}
        <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-[#1A1A1A]">
                LSTM Reconstruction Error Distribution (MSE)
              </h3>
              <span className="border border-[#991B1B] bg-[#FAF8F5] text-[#991B1B] px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider">
                VETO THRESHOLD: 0.65
              </span>
            </div>
            <p className="text-xs text-[#666666] font-sans mt-1">
              Normal payment sequences cluster &lt; 0.40. Anomalous patterns form distinct right-tail (&gt; 0.65).
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reconstructionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE8E4" />
                <XAxis dataKey="bin" stroke="#888888" fontSize={10} fontStyle="italic" />
                <YAxis stroke="#888888" fontSize={11} fontStyle="italic" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#1A1A1A', borderRadius: '0px', color: '#1A1A1A', fontFamily: 'serif' }}
                />
                <Bar dataKey="count">
                  {reconstructionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === 'anomaly'
                          ? '#991B1B'
                          : entry.type === 'threshold'
                          ? '#C5A059'
                          : '#1A1A1A'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnostic Feature Importance */}
        <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-base font-bold font-serif text-[#1A1A1A]">
              Diagnostic Classifier Feature Attribution
            </h3>
            <p className="text-xs text-[#666666] font-sans mt-1">
              Relative SHAP feature importance for failure classification
            </p>
          </div>

          <div className="space-y-3 font-sans">
            {featureImportance.map((feat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1A1A1A] font-medium">{feat.feature}</span>
                  <span className="font-serif text-[#C5A059] font-bold">{feat.importance}%</span>
                </div>
                <div className="h-2 w-full bg-[#FAF8F5] border border-[#EBE8E4] overflow-hidden">
                  <div
                    className="h-full bg-[#1A1A1A]"
                    style={{ width: `${feat.importance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

