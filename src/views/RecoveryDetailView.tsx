import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { RiskBadge } from '../components/common/RiskBadge.js';
import { LstmSequenceVisualizer } from '../components/common/LstmSequenceVisualizer.js';
import { ActionExecutionModal } from '../components/common/ActionExecutionModal.js';
import { ActionType, RecoveryCase } from '../types.js';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Cpu,
  Coins,
  Building2,
  ExternalLink,
  MessageSquare,
  PhoneCall,
  Flame,
  Check,
  X,
  Play
} from 'lucide-react';

export const RecoveryDetailView: React.FC = () => {
  const { cases, selectedCaseId, setActiveView, refreshAllData, addToast } = useApp();

  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<ActionType>('CREATE_PAYMENT_LINK');

  // Find the selected recovery case or fallback to first
  const currentCase = cases.find((c) => c.id === selectedCaseId || c.caseNumber === selectedCaseId) || cases[0];

  if (!currentCase) {
    return (
      <div className="p-8 text-center text-[#666666] font-serif">
        Recovery case not found.{' '}
        <button
          onClick={() => setActiveView('recovery-queue')}
          className="text-[#1A1A1A] font-bold underline font-sans"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  const isVetoed = currentCase.anomalyResult.decision === 'VETO';
  const isRecovered = currentCase.status === 'PAYMENT_RECOVERED';
  const topAction = currentCase.candidateActions.find((a) => a.recommended) || currentCase.candidateActions[0];

  const handleOpenActionModal = (action: ActionType) => {
    setSelectedActionType(action);
    setIsExecutionModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('recovery-queue')}
            className="flex h-9 w-9 items-center justify-center border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-sans font-bold block">
                Case File
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-0.5">
              <h1 className="text-xl font-black font-serif text-[#1A1A1A] sm:text-2xl">
                Case #{currentCase.caseNumber}
              </h1>
              <StatusBadge status={currentCase.status} />
              <RiskBadge
                decision={currentCase.anomalyResult.decision}
                score={currentCase.anomalyResult.anomalyScore}
              />
            </div>
            <p className="text-xs text-[#666666] font-sans mt-0.5">
              Payment ID: <span className="font-mono text-[#1A1A1A]">{currentCase.paymentId}</span> &bull; Order: <span className="font-mono text-[#1A1A1A]">{currentCase.orderId}</span>
            </p>
          </div>
        </div>

        {/* Action Header CTAs */}
        <div className="flex flex-wrap items-center gap-2 font-sans">
          {!isRecovered && !isVetoed && (
            <button
              onClick={() => handleOpenActionModal(topAction?.actionType || 'CREATE_PAYMENT_LINK')}
              className="inline-flex items-center gap-2 bg-[#1A1A1A] px-4 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              Execute Recommended Action
            </button>
          )}

          {isVetoed && (
            <button
              onClick={() => handleOpenActionModal('ESCALATE_HUMAN_REVIEW')}
              className="inline-flex items-center gap-2 bg-[#92400E] px-4 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-[#78350F] transition-colors shadow-xs"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Escalate to Human Review
            </button>
          )}

          {currentCase.status === 'ACTION_EXECUTED' && (
            <button
              onClick={() => handleOpenActionModal('CREATE_PAYMENT_LINK')}
              className="inline-flex items-center gap-2 bg-[#166534] px-4 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-[#14532D] transition-colors shadow-xs"
            >
              <Play className="h-3.5 w-3.5" />
              Simulate Webhook Payment
            </button>
          )}
        </div>
      </div>

      {/* Hero Payment Overview Banner */}
      <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-[0.25em] block">
            Stuck Transaction Amount
          </span>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-3xl font-black font-serif text-[#1A1A1A]">
              ₹{currentCase.amount.toLocaleString('en-IN')}
            </span>
            {isRecovered && (
              <span className="bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-0.5 text-xs font-sans font-bold text-[#166534] uppercase tracking-wider">
                100% RECOVERED &bull; RECONCILED
              </span>
            )}
          </div>
          <p className="text-xs text-[#666666] mt-2 font-serif">
            Customer: <strong className="text-[#1A1A1A]">{currentCase.customer.name}</strong> ({currentCase.customer.email})
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs">
          <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-3 shadow-xs">
            <span className="text-[#888888] font-sans font-bold block text-[10px] uppercase tracking-wider">DIAGNOSIS CONFIDENCE</span>
            <span className="text-sm font-black font-serif text-[#1A1A1A]">
              {Math.round(currentCase.diagnosisConfidence * 100)}%
            </span>
          </div>
          <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-3 shadow-xs">
            <span className="text-[#888888] font-sans font-bold block text-[10px] uppercase tracking-wider">HISTORICAL RECOVERY RATE</span>
            <span className="text-sm font-black font-serif text-[#166534]">
              {Math.round(currentCase.customer.historicalRecoveryRate * 100)}%
            </span>
          </div>
          <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-3 shadow-xs">
            <span className="text-[#888888] font-sans font-bold block text-[10px] uppercase tracking-wider">EXPECTED NET RECOVERY</span>
            <span className="text-sm font-black font-serif text-[#166534]">
              ₹{Math.round(topAction?.expectedNetRecoveryValue || currentCase.amount * 0.8).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Complete 8-Stage Event Timeline */}
      <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
          Audit Chronology
        </div>
        <h3 className="text-base font-bold text-[#1A1A1A] font-serif mb-1">
          End-to-End Recovery Event Sequence
        </h3>
        <p className="text-xs text-[#666666] mb-6 font-sans">
          Deterministic traceability from ingestion to resolution
        </p>

        <div className="relative border-l-2 border-[#1A1A1A] pl-6 ml-3 space-y-6">
          {currentCase.timelineEvents.map((evt, idx) => {
            return (
              <div key={evt.id || idx} className="relative group">
                {/* Node dot */}
                <div
                  className={`absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center border ${
                    evt.status === 'COMPLETED'
                      ? 'border-[#166534] bg-[#F0FDF4] text-[#166534]'
                      : evt.status === 'IN_PROGRESS'
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                      : 'border-[#D1CEC9] bg-[#FFFFFF] text-[#888888]'
                  }`}
                >
                  {evt.status === 'COMPLETED' ? (
                    <Check className="h-3 w-3 stroke-[3]" />
                  ) : (
                    <div className="h-1.5 w-1.5 bg-current" />
                  )}
                </div>

                <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="border border-[#D1CEC9] bg-[#FFFFFF] px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]">
                        {evt.actorService}
                      </span>
                      <h4 className="text-xs font-bold text-[#1A1A1A] font-serif">{evt.title}</h4>
                    </div>
                    <span className="text-[10px] font-sans text-[#888888]">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#444444] mt-1.5 font-sans">{evt.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI DECISION TRACE: "Why RevRakshak chose this action" */}
      <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 space-y-6 shadow-sm">
        <div className="border-b border-[#EBE8E4] pb-4">
          <div className="flex items-center gap-2 text-[#C5A059] text-[10px] font-sans font-bold uppercase tracking-[0.25em]">
            <Cpu className="h-3.5 w-3.5" /> Comprehensive AI Decision Trace &amp; Audit
          </div>
          <h3 className="text-lg font-black text-[#1A1A1A] font-serif mt-1">
            Why RevRakshak chose this action
          </h3>
          <p className="text-xs text-[#666666] font-sans">
            Every autonomous recovery intervention is bounded, explainable, gated by ML risk checks, and verified deterministically.
          </p>
        </div>

        {/* 1. Failure Diagnosis & 2. Customer Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diagnosis Card */}
          <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C5A059]">
                1. Root-Cause Diagnosis
              </span>
              <span className="border border-[#D1CEC9] bg-[#FFFFFF] px-2 py-0.5 text-[10px] font-sans font-bold text-[#1A1A1A]">
                LightGBM v3.1
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#1A1A1A] font-serif">
                {currentCase.failureCause.replace(/_/g, ' ')}
              </div>
              <p className="text-xs text-[#666666] mt-1 font-sans">{currentCase.failureReasonDetails}</p>
            </div>
            <div className="flex items-center justify-between border-t border-[#EBE8E4] pt-3 text-xs font-sans">
              <span className="text-[#666666]">Model Confidence:</span>
              <span className="font-serif font-black text-[#166534]">
                {Math.round(currentCase.diagnosisConfidence * 100)}%
              </span>
            </div>
          </div>

          {/* Customer Context Card */}
          <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C5A059]">
                2. Customer Operational Context
              </span>
              <span className="border border-[#D1CEC9] bg-[#FFFFFF] px-2 py-0.5 text-[10px] font-sans font-bold text-[#1A1A1A]">
                Redis Hot Cache
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <div>
                <span className="text-[#888888] block text-[10px] uppercase font-bold tracking-wider">HISTORICAL SUCCESSES</span>
                <span className="font-bold text-[#1A1A1A]">
                  {currentCase.customer.successfulTransactions} of {currentCase.customer.totalTransactions}
                </span>
              </div>
              <div>
                <span className="text-[#888888] block text-[10px] uppercase font-bold tracking-wider">AVG SUCCESSFUL TICKET</span>
                <span className="font-bold text-[#1A1A1A]">
                  ₹{currentCase.customer.averageTicketSize.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[#888888] block text-[10px] uppercase font-bold tracking-wider">PREFERRED CHANNEL</span>
                <span className="font-bold text-[#1A1A1A]">
                  {currentCase.customer.primaryPaymentMethod}
                </span>
              </div>
              <div>
                <span className="text-[#888888] block text-[10px] uppercase font-bold tracking-wider">OUTREACH CONSENT</span>
                <span className="font-bold text-[#166534]">
                  {currentCase.customer.contactConsentGranted ? 'GRANTED ✓' : 'NOT GRANTED ✕'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Candidate Interventions & Expected Recovery Value (E[V]) */}
        <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C5A059] block">
                3. Propensity &amp; Expected Value Optimization (E[V])
              </span>
              <p className="text-[11px] text-[#666666] mt-0.5 font-sans">
                Formula: <code className="text-[#1A1A1A] font-bold">E[V] = P(Recovery) × Amount − Cost(Intervention) − Cost(Contact Risk)</code>
              </p>
            </div>
            <span className="border border-[#D1CEC9] bg-[#FFFFFF] px-2 py-0.5 text-[10px] font-sans font-bold text-[#1A1A1A]">
              Contextual Bandit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {currentCase.candidateActions.map((cand, idx) => (
              <div
                key={idx}
                className={`border p-4 transition-all shadow-xs ${
                  cand.recommended
                    ? 'border-[#1A1A1A] bg-[#FFFFFF]'
                    : 'border-[#EBE8E4] bg-[#FAF8F5]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-serif font-bold text-[#1A1A1A]">{cand.label}</span>
                  {cand.recommended && (
                    <span className="bg-[#F0FDF4] border border-[#BBF7D0] px-1.5 py-0.5 text-[9px] font-sans font-bold text-[#166534] uppercase tracking-wider">
                      OPTIMAL
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Probability:</span>
                    <span className="font-bold text-[#1A1A1A]">
                      {Math.round(cand.recoveryProbability * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Gross Recover:</span>
                    <span className="text-[#444444]">₹{Math.round(cand.expectedRecoveryGross)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#EBE8E4] pt-1.5">
                    <span className="text-[#666666]">Net E[V]:</span>
                    <span className="font-serif font-bold text-[#166534]">
                      ₹{Math.round(cand.expectedNetRecoveryValue).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. LSTM Anomaly Gate Visualization (Track 03 + Track 02 Bar) */}
        <LstmSequenceVisualizer
          anomalyResult={currentCase.anomalyResult}
          paymentSequence={currentCase.customer.paymentSequence}
        />

        {/* 5. Policy Engine Deterministic Evaluation */}
        <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C5A059] block">
                5. Policy Engine Deterministic Validation Firewall
              </span>
              <p className="text-[11px] text-[#666666] mt-0.5 font-sans">
                Evaluated against active merchant configuration ({currentCase.policyEvaluation.checks.length} rules checked)
              </p>
            </div>
            <span
              className={`px-2.5 py-0.5 text-xs font-sans font-bold uppercase tracking-wider ${
                currentCase.policyEvaluation.overallResult === 'APPROVED'
                  ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                  : 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
              }`}
            >
              {currentCase.policyEvaluation.overallResult}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentCase.policyEvaluation.checks.map((chk) => (
              <div
                key={chk.ruleId}
                className="flex items-start justify-between border border-[#EBE8E4] bg-[#FFFFFF] p-3 text-xs shadow-xs"
              >
                <div>
                  <div className="font-serif font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    {chk.passed ? (
                      <Check className="h-3.5 w-3.5 text-[#166534]" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-[#991B1B]" />
                    )}
                    {chk.ruleName}
                  </div>
                  <div className="text-[11px] text-[#666666] mt-1 font-sans">{chk.explanation}</div>
                </div>
                <div className="text-right font-sans text-[10px] text-[#666666] shrink-0 ml-2">
                  <div>Limit: {chk.thresholdValue}</div>
                  <div>Actual: <strong className="text-[#1A1A1A]">{chk.actualValue}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Final Decision & Execution Action Bar */}
        <div className="border-2 border-[#1A1A1A] bg-[#FAF8F5] p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-[0.25em] block">
              6. Final Autonomous Decision
            </span>
            <h4 className="text-base font-bold text-[#1A1A1A] font-serif mt-0.5">
              {currentCase.selectedAction.replace(/_/g, ' ')}
            </h4>
            <p className="text-xs text-[#666666] mt-1 max-w-xl font-sans">
              {currentCase.policyEvaluation.explanation}
            </p>
          </div>

          <div className="flex items-center gap-3 font-sans">
            {!isRecovered && !isVetoed && (
              <button
                onClick={() => handleOpenActionModal(topAction?.actionType || 'CREATE_PAYMENT_LINK')}
                className="inline-flex items-center gap-2 bg-[#1A1A1A] px-5 py-2.5 text-xs font-bold text-white uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs"
              >
                <Send className="h-4 w-4" />
                Execute via Gateway
              </button>
            )}

            {isVetoed && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-2 text-xs font-sans font-bold text-[#991B1B] uppercase tracking-wider">
                Action VETOED &bull; Outbound Outreach Blocked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Execution Drawer / Modal */}
      <ActionExecutionModal
        isOpen={isExecutionModalOpen}
        onClose={() => setIsExecutionModalOpen(false)}
        recoveryCase={currentCase}
        selectedActionType={selectedActionType}
        onSuccess={(updated) => {
          refreshAllData();
        }}
      />
    </div>
  );
};

