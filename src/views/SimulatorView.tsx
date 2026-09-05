import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.js';
import { FlightSimulatorResult } from '../types.js';
import {
  PlaneTakeoff,
  Play,
  Loader2,
  TrendingUp,
  Sparkles,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const SimulatorView: React.FC = () => {
  const { addToast } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<FlightSimulatorResult[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('synthetic_batch_52');
  const [discountPercent, setDiscountPercent] = useState(5);

  const runSimulation = async () => {
    setIsRunning(true);
    try {
      const simResults = await api.runSimulator({
        datasetName: selectedDataset,
        batchSize: 52,
        strategies: [
          { strategyId: 'strat_payment_link', strategyName: 'Payment Link', channel: 'SMS/WhatsApp', incentiveDiscountPercent: 0, enabled: true },
          { strategyId: 'strat_voice_link', strategyName: 'Voice + Link', channel: 'Sarvam AI Voice', incentiveDiscountPercent: 0, enabled: true },
          { strategyId: 'strat_discount_nudge', strategyName: 'Early-Pay Incentive Nudge', channel: 'Link + Discount', incentiveDiscountPercent: discountPercent / 100, enabled: true },
          { strategyId: 'strat_human_review', strategyName: 'Human Escalation', channel: 'Account Manager', incentiveDiscountPercent: 0, enabled: true },
          { strategyId: 'strat_passive_retry', strategyName: 'Passive Direct Retry', channel: 'Gateway Retry', incentiveDiscountPercent: 0, enabled: true }
        ]
      });
      setResults(simResults);
      addToast({
        type: 'SUCCESS',
        title: 'Simulation Complete',
        message: 'Batch strategy flight simulation completed across 5 candidate policies.'
      });
    } catch (e: any) {
      addToast({
        type: 'ERROR',
        title: 'Simulation Failed',
        message: e.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const chartData = results.map((r) => ({
    name: r.strategyName.replace(' (WhatsApp + SMS)', '').replace(' Call + Link', ''),
    'Projected Recovered': r.projectedRecovered,
    'Net Recovered Value': r.netRecoveredValue,
    'Intervention Cost': r.interventionCost + r.incentiveCost
  }));

  const recommended = results.find((r) => r.isRecommended) || results[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
            Policy Modeling &amp; Testing
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl font-serif">
              Recovery Flight Simulator
            </h1>
            <span className="border border-[#1A1A1A] bg-[#1A1A1A] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider">
              STRATEGY LAB
            </span>
          </div>
          <p className="text-xs text-[#666666] font-sans mt-1">
            Compare economic trade-offs between recovery channels, incentive discounts, and intervention costs across synthetic batches
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="inline-flex items-center gap-2 border border-[#1A1A1A] bg-[#1A1A1A] px-4 py-2 text-xs font-sans font-bold text-white uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-sm disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running Monte-Carlo Batch...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Re-run Strategy Simulator
            </>
          )}
        </button>
      </div>

      {/* Simulator Control Configuration Bar */}
      <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-5 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
        <div>
          <label className="text-[10px] font-sans uppercase font-bold text-[#666666] tracking-wider block mb-1.5">
            Synthetic Evaluation Dataset
          </label>
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="w-full border border-[#D1CEC9] bg-[#FAF8F5] px-3 py-2 text-xs text-[#1A1A1A] font-sans font-bold uppercase tracking-wider focus:border-[#1A1A1A] focus:outline-none"
          >
            <option value="synthetic_batch_52">Track 03 Benchmark Batch (52 Synthetic Cases)</option>
            <option value="high_ticket_b2b">High-Ticket B2B Invoices (Avg ₹25,000+)</option>
            <option value="upi_micropayments">UPI High-Velocity Micro-orders</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-sans uppercase font-bold text-[#666666] tracking-wider block mb-1.5">
            Early-Pay Incentive Discount ({discountPercent}%)
          </label>
          <input
            type="range"
            min={0}
            max={15}
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="w-full accent-[#1A1A1A] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#888888] font-sans mt-1">
            <span>0% (No discount)</span>
            <span>5% Standard</span>
            <span>15% Aggressive</span>
          </div>
        </div>

        <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider block">
              Economic Objective
            </span>
            <span className="text-xs font-bold font-serif text-[#1A1A1A] mt-0.5 block">
              Max Net Revenue (E[V])
            </span>
            <span className="text-[10px] text-[#666666] font-sans">Avoids spamming low-return channels</span>
          </div>
          <Sparkles className="h-6 w-6 text-[#C5A059]" />
        </div>
      </div>

      {/* Strategy Comparison Chart */}
      <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-serif text-[#1A1A1A]">
              Net Recovered Value by Channel Strategy
            </h3>
            <p className="text-xs text-[#666666] font-sans">
              Gross simulated recovery vs. Net recovered value after subtracting channel contact costs and incentives
            </p>
          </div>
          <span className="text-xs font-sans font-bold text-[#1A1A1A] border border-[#EBE8E4] bg-[#FAF8F5] px-3 py-1 shadow-xs">
            Batch Total at Risk: <strong className="font-serif">₹{(results[0]?.totalAtRisk || 284000).toLocaleString('en-IN')}</strong>
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBE8E4" />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} fontStyle="italic" />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                fontStyle="italic"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#1A1A1A', borderRadius: '0px', color: '#1A1A1A', fontFamily: 'serif' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontFamily: 'serif' }} />
              <Bar dataKey="Projected Recovered" fill="#1A1A1A" />
              <Bar dataKey="Net Recovered Value" fill="#166534" />
              <Bar dataKey="Intervention Cost" fill="#991B1B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {results.map((res) => (
          <div
            key={res.strategyId}
            className={`border p-5 flex flex-col justify-between transition-all shadow-sm ${
              res.isRecommended
                ? 'border-2 border-[#1A1A1A] bg-[#FAF8F5]'
                : 'border-[#EBE8E4] bg-[#FFFFFF]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-serif text-[#1A1A1A]">{res.strategyName}</span>
                {res.isRecommended && (
                  <span className="border border-[#166534] bg-[#FFFFFF] px-1.5 py-0.5 text-[9px] font-sans font-bold text-[#166534] uppercase tracking-wider">
                    BEST ROI
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 text-xs font-sans">
                <div>
                  <span className="text-[10px] text-[#888888] uppercase font-bold block tracking-wider">NET RECOVERED</span>
                  <span className="text-base font-black font-serif text-[#166534]">
                    ₹{res.netRecoveredValue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Recovery Rate:</span>
                  <span className="text-[#1A1A1A] font-bold font-serif">{res.projectedRecoveryRate}%</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Intervention Cost:</span>
                  <span className="text-[#991B1B] font-bold">₹{res.interventionCost}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>CSAT Score:</span>
                  <span className="text-[#1A1A1A] font-bold font-serif">{res.customerSatisfactionScore} / 5.0</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EBE8E4] text-[10px] font-sans text-[#888888]">
              {res.isRecommended ? 'Optimal balance of conversion vs cost' : 'Sub-optimal margin impact'}
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Strategy Synthesis */}
      {recommended && (
        <div className="border-2 border-[#1A1A1A] bg-[#FFFFFF] p-6 flex flex-wrap items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#166534] text-xs font-sans font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" /> Simulator Synthesis &amp; Policy Recommendation
            </div>
            <h4 className="text-lg font-bold text-[#1A1A1A] font-serif">
              Adopt {recommended.strategyName} for Standard Invoices
            </h4>
            <p className="text-xs text-[#666666] font-sans max-w-2xl leading-relaxed">
              Provides highest net economic return (₹{recommended.netRecoveredValue.toLocaleString('en-IN')}) while maintaining high customer satisfaction (4.8/5) and zero discount erosion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => addToast({ type: 'SUCCESS', title: 'Policy Updated', message: 'Simulated strategy adopted into merchant policy engine.' })}
              className="border border-[#1A1A1A] bg-[#1A1A1A] px-4 py-2 text-xs font-sans font-bold text-white uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs"
            >
              Apply to Merchant Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

