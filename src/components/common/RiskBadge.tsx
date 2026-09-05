import React from 'react';
import { RiskDecision } from '../../types.js';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface RiskBadgeProps {
  id?: string;
  decision: RiskDecision;
  score?: number;
  threshold?: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  id,
  decision,
  score,
  threshold = 0.65
}) => {
  if (decision === 'VETO') {
    return (
      <span
        id={id}
        className="inline-flex items-center gap-1.5 border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1 text-xs font-bold text-[#991B1B] font-sans uppercase tracking-[0.1em]"
      >
        <ShieldX className="h-3.5 w-3.5" />
        <span>RISK VETO</span>
        {score !== undefined && (
          <span className="font-mono font-normal">({score.toFixed(2)} &gt; {threshold})</span>
        )}
      </span>
    );
  }

  if (decision === 'MANUAL_REVIEW') {
    return (
      <span
        id={id}
        className="inline-flex items-center gap-1.5 border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-xs font-bold text-[#92400E] font-sans uppercase tracking-[0.1em]"
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        <span>MANUAL GATED</span>
        {score !== undefined && <span className="font-mono font-normal">({score.toFixed(2)})</span>}
      </span>
    );
  }

  return (
    <span
      id={id}
      className="inline-flex items-center gap-1.5 border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1 text-xs font-bold text-[#166534] font-sans uppercase tracking-[0.1em]"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span>SAFETY PASS</span>
      {score !== undefined && (
        <span className="font-mono font-normal">({score.toFixed(2)} ≤ {threshold})</span>
      )}
    </span>
  );
};

