import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Activity, ArrowRight, Bot, ShieldCheck, Sparkles } from 'lucide-react';

const stagePalette: Record<string, string> = {
  active: 'border-[#1A1A1A] bg-[#F9F7F4] text-[#1A1A1A]',
  warning: 'border-[#C5A059] bg-[#FFF9EE] text-[#7C5A1E]',
  success: 'border-[#166534] bg-[#F0FDF4] text-[#166534]',
  blocked: 'border-[#7F1D1D] bg-[#FEF2F2] text-[#7F1D1D]'
};

export const RecoveryPipelineView: React.FC = () => {
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getPipelineFlow();
        setStages(data);
      } catch (e) {
        setStages([
          { id: 'ingest', label: 'Payment Event Ingest', shortLabel: 'Ingest', description: 'Kafka ingestion of failed capture webhooks', x: 40, y: 80, status: 'active', volume: 52, tone: '#1A1A1A' },
          { id: 'diagnose', label: 'Diagnosis & Root Cause', shortLabel: 'Diagnose', description: 'ML-driven failure classification', x: 240, y: 80, status: 'success', volume: 38, tone: '#166534' },
          { id: 'risk-gate', label: 'Risk Gate', shortLabel: 'Risk', description: 'LSTM anomaly plus policy guardrails', x: 440, y: 80, status: 'warning', volume: 24, tone: '#C5A059' },
          { id: 'action', label: 'Action Gateway', shortLabel: 'Action', description: 'Payment link / SMS / human escalation', x: 640, y: 80, status: 'active', volume: 17, tone: '#1A1A1A' },
          { id: 'recover', label: 'Verification & Recovery', shortLabel: 'Verify', description: 'Webhook reconciliation and money recovery', x: 840, y: 80, status: 'success', volume: 11, tone: '#166534' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-[#666666]">Loading recovery pipeline flow…</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 border-b-2 border-[#1A1A1A] pb-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">Revenue Recovery Workflow</div>
        <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A] sm:text-3xl font-serif">Recovery Recommendation Pipeline</h1>
        <p className="text-xs text-[#666666] font-sans">Interactive flow for the top 3 recovery cases, from webhook ingestion to verified recovery.</p>
      </div>

      <div className="relative overflow-x-auto rounded border border-[#E2DED9] bg-[#FAF8F5] p-5">
        <div className="relative min-w-[980px] h-[220px]">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div
                className={`absolute w-40 rounded border-2 p-3 shadow-sm ${stagePalette[stage.status] || stagePalette.active}`}
                style={{ left: stage.x, top: stage.y }}
              >
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.15em] font-sans font-bold">
                  <span>{stage.shortLabel}</span>
                  <span className="rounded-full bg-white/60 px-1.5 py-0.5">{stage.volume}</span>
                </div>
                <div className="mt-2 text-sm font-bold font-serif">{stage.label}</div>
                <div className="mt-1 text-[10px] font-sans leading-tight opacity-80">{stage.description}</div>
              </div>
              {index < stages.length - 1 && (
                <div className="absolute flex items-center justify-center text-[#C5A059]" style={{ left: stage.x + 160, top: stage.y + 44 }}>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { title: 'Case A — Card-testing spike', detail: 'Customer attempted repeated UPI / card retries; anomaly score breached threshold; action: block risky retries and send soft payment link.', accent: 'bg-[#F0FDF4]' },
          { title: 'Case B — Network timeout with personal history', detail: 'Temporary network error but high customer lifetime value; action: retry once, then send concise payment link with consent gating.', accent: 'bg-[#FFF9EE]' },
          { title: 'Case C — Mandate failure + contact consent issue', detail: 'Recovery is viable, but compliance requires human review before voice outreach and payment-link dispatch.', accent: 'bg-[#FEF2F2]' }
        ].map((caseItem) => (
          <div key={caseItem.title} className={`rounded border border-[#E2DED9] p-4 ${caseItem.accent}`}>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#666666] font-sans font-bold">
              <Sparkles className="h-3 w-3 text-[#C5A059]" /> Hardcoded Recommendation
            </div>
            <div className="mt-2 text-base font-bold font-serif text-[#1A1A1A]">{caseItem.title}</div>
            <p className="mt-2 text-xs leading-relaxed text-[#444444] font-sans">{caseItem.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
