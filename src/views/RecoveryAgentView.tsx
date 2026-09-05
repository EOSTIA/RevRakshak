import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Bot, MessageSquareText, ShieldCheck, TrendingUp } from 'lucide-react';

export const RecoveryAgentView: React.FC = () => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAgentSummary();
        setSummaries(data);
      } catch (e) {
        setSummaries([
          {
            caseId: 'case_001',
            caseNumber: 'RX-10492',
            customerName: 'Aakash Shah',
            issue: 'Repeated card decline with higher than usual retry velocity',
            summary: 'Customer shows a short-lived retry burst and elevated anomaly signal. The primary issue is a temporary bank-side failure rather than customer churn or fraud risk.',
            recommendedAction: 'Send a payment-link nudge and keep a one-time retry guard while monitoring for 30 minutes.',
            confidence: 91,
            risk: 'MEDIUM'
          },
          {
            caseId: 'case_002',
            caseNumber: 'RX-10513',
            customerName: 'Meera Iyer',
            issue: 'Mandate failure after autopay enrollment',
            summary: 'The mandate was rejected for a non-compliance event. Recovery is feasible, but consent and policy checks are required before outbound contact.',
            recommendedAction: 'Escalate to human review and re-validate mandate before issuing a user-facing reminder.',
            confidence: 86,
            risk: 'HIGH'
          },
          {
            caseId: 'case_003',
            caseNumber: 'RX-10611',
            customerName: 'Rohit Kumar',
            issue: 'Network timeout after OTP validation',
            summary: 'Customer is likely legitimate and historically responsive. Technical network timeout is likely transient, with increased odds of successful payment link recovery.',
            recommendedAction: 'Trigger a low-cost payment-link SMS plus a single reminder to confirm retry within the next 8 hours.',
            confidence: 88,
            risk: 'LOW'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-[#666666]">Loading rule-based recovery agent summary…</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 border-b-2 border-[#1A1A1A] pb-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">Decision Support</div>
        <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A] sm:text-3xl font-serif">Rule-Based Recovery Agent</h1>
        <p className="text-xs text-[#666666] font-sans">Deterministic summary for up to 5 hardcoded cases to explain what failed, why it failed, and the best action.</p>
      </div>

      <div className="grid gap-4">
        {summaries.map((item) => (
          <div key={item.caseId} className="rounded border border-[#E2DED9] bg-[#FFFFFF] p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-[#1A1A1A] text-[#C5A059]">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#666666] font-sans font-bold">{item.caseNumber}</div>
                  <div className="text-lg font-black font-serif text-[#1A1A1A]">{item.customerName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-sans font-bold">
                <span className="rounded border border-[#EBE8E4] bg-[#FAF8F5] px-2 py-1">{item.risk} Risk</span>
                <span className="rounded border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-1 text-[#166534]">{item.confidence}% confidence</span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded border border-[#EBE8E4] bg-[#FAF8F5] p-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#666666] font-sans font-bold"><MessageSquareText className="h-3 w-3" /> Problem Summary</div>
                <div className="mt-2 text-sm text-[#1A1A1A] font-sans leading-6">{item.summary}</div>
              </div>
              <div className="rounded border border-[#EBE8E4] bg-[#FAF8F5] p-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#666666] font-sans font-bold"><ShieldCheck className="h-3 w-3" /> Recommended Action</div>
                <div className="mt-2 text-sm text-[#1A1A1A] font-sans leading-6">{item.recommendedAction}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
