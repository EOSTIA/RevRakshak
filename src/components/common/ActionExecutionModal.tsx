import React, { useState } from 'react';
import { RecoveryCase, ActionType } from '../../types.js';
import { api } from '../../services/api.js';
import { useApp } from '../../context/AppContext.js';
import {
  CheckCircle2,
  Loader2,
  Send,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  X
} from 'lucide-react';

interface ActionExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recoveryCase: RecoveryCase;
  selectedActionType: ActionType;
  onSuccess: (updatedCase: RecoveryCase) => void;
}

export const ActionExecutionModal: React.FC<ActionExecutionModalProps> = ({
  isOpen,
  onClose,
  recoveryCase,
  selectedActionType,
  onSuccess
}) => {
  const { addToast, refreshAllData } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isWebhookSimulating, setIsWebhookSimulating] = useState<boolean>(false);
  const [executedCase, setExecutedCase] = useState<RecoveryCase | null>(null);
  const [isRecoveredSuccess, setIsRecoveredSuccess] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const steps = [
    { title: '1. Deterministic Policy Verification', desc: 'Validating amount cap, contact frequency & calling hours' },
    { title: '2. Action Gateway & Idempotency Check', desc: 'Acquiring Redis distributed lock and verifying schema' },
    { title: '3. Razorpay Test API Integration', desc: 'Creating Payment Link via Test Mode adapter' },
    { title: '4. Multi-channel Customer Outreach', desc: 'Dispatching Hinglish template with circuit breaker fallback' }
  ];

  const handleStartExecution = async () => {
    setIsExecuting(true);
    setExecutionError(null);

    try {
      // Step 1: Policy
      setCurrentStep(1);
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Idempotency
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 600));

      // Step 3 & 4: API Call
      setCurrentStep(3);
      const res = await api.executeAction(recoveryCase.id, selectedActionType);

      if (!res.success) {
        throw new Error(res.message || 'Action Gateway vetoed the execution.');
      }

      setCurrentStep(4);
      setExecutedCase(res.case);
      addToast({
        type: 'SUCCESS',
        title: 'Action Executed via Gateway',
        message: `Recovery workflow initiated for ₹${recoveryCase.amount.toLocaleString('en-IN')}`
      });
      await refreshAllData();
    } catch (err: any) {
      setExecutionError(err.message || 'Failed to execute recovery action.');
      addToast({
        type: 'ERROR',
        title: 'Action Blocked',
        message: err.message
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!executedCase && !recoveryCase) return;
    const targetId = executedCase ? executedCase.id : recoveryCase.id;

    setIsWebhookSimulating(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const res = await api.simulatePaymentWebhook(targetId);
      if (res.success) {
        setIsRecoveredSuccess(true);
        setExecutedCase(res.case);
        onSuccess(res.case);
        addToast({
          type: 'SUCCESS',
          title: '₹ Money Recovered!',
          message: `Razorpay webhook confirmed ₹${res.case.amount.toLocaleString('en-IN')} recovered!`
        });
        await refreshAllData();
      }
    } catch (err: any) {
      addToast({
        type: 'ERROR',
        title: 'Webhook Simulation Failed',
        message: err.message
      });
    } finally {
      setIsWebhookSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl border-2 border-[#1A1A1A] bg-[#FFFFFF] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] bg-[#F9F7F4] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#1A1A1A] text-white">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                Bounded Execution Gateway
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] font-serif">
                Action Gateway Execution Workflow
              </h3>
              <p className="text-xs text-[#666666] font-sans">
                Case {recoveryCase.caseNumber} &bull; ₹{recoveryCase.amount.toLocaleString('en-IN')} &bull; {recoveryCase.customer.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#666666] hover:bg-[#EBE8E4] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Action Overview Card */}
          <div className="border border-[#EBE8E4] bg-[#F9F7F4] p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-[0.2em] font-sans block">
                Target Intervention Action
              </span>
              <span className="text-base font-bold text-[#1A1A1A] font-serif mt-0.5 block">
                {selectedActionType.replace(/_/g, ' ')}
              </span>
              <p className="text-xs text-[#666666] mt-1 font-sans">
                Channel: <strong className="text-[#1A1A1A]">WhatsApp / SMS / Test Link</strong> &bull; Language: <strong className="text-[#1A1A1A]">{recoveryCase.customer.preferredLanguage}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-[0.2em] font-sans block">
                Recovery Value at Risk
              </span>
              <span className="text-2xl font-black font-serif text-[#166534]">
                ₹{recoveryCase.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-[#666666] uppercase tracking-[0.2em] font-sans">
              Bounded Execution Sequence
            </div>
            <div className="space-y-2">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isDone = currentStep > stepNum || executedCase !== null;
                const isCurrent = currentStep === stepNum && isExecuting;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between border p-3 transition-all ${
                      isDone
                        ? 'border-[#BBF7D0] bg-[#F0FDF4]'
                        : isCurrent
                        ? 'border-[#1A1A1A] bg-[#FAF8F5]'
                        : 'border-[#EBE8E4] bg-[#FFFFFF] text-[#888888]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-[#166534] shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 text-[#1A1A1A] animate-spin shrink-0" />
                      ) : (
                        <div className="h-4 w-4 border border-[#CCCCCC] shrink-0" />
                      )}
                      <div>
                        <div
                          className={`text-xs font-bold font-serif ${
                            isDone
                              ? 'text-[#166534]'
                              : isCurrent
                              ? 'text-[#1A1A1A]'
                              : 'text-[#666666]'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-[11px] text-[#888888] font-sans">{step.desc}</div>
                      </div>
                    </div>
                    {isDone && (
                      <span className="text-[10px] font-sans font-bold text-[#166534] uppercase tracking-wider">
                        VERIFIED ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Error Banner */}
          {executionError && (
            <div className="flex items-center gap-3 border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{executionError}</span>
            </div>
          )}

          {/* Success Banner / Link Details */}
          {(executedCase?.razorpayDetails || isRecoveredSuccess) && (
            <div className="border border-[#1A1A1A] bg-[#FAF8F5] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Razorpay Test Mode Artifact
                </span>
                <span className="bg-[#1A1A1A] text-white px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-widest">
                  SANDBOX TEST API
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-[#FFFFFF] p-2.5 border border-[#EBE8E4]">
                <span className="text-[#666666]">Payment Link:</span>
                <span className="text-[#1A1A1A] select-all font-semibold">
                  {executedCase?.razorpayDetails?.shortUrl || 'https://rzp.io/i/plink_rx10492'}
                </span>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    addToast({ type: 'INFO', title: 'Razorpay Sandbox', message: 'Test Mode Payment Link opened in simulation.' });
                  }}
                  className="text-[#666666] hover:text-[#1A1A1A] flex items-center gap-1 font-sans"
                >
                  <ExternalLink className="h-3 w-3" /> Preview
                </a>
              </div>

              {/* Recovery Celebration */}
              {isRecoveredSuccess ? (
                <div className="border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-center space-y-1">
                  <DollarSign className="h-8 w-8 text-[#166534] mx-auto" />
                  <h4 className="text-lg font-black text-[#1A1A1A] font-serif">
                    ₹{recoveryCase.amount.toLocaleString('en-IN')} RECOVERED!
                  </h4>
                  <p className="text-xs text-[#166534] font-sans">
                    Razorpay webhook payment.authorized received &amp; verified. Funds reconciled.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between border border-[#EBE8E4] bg-[#FFFFFF] p-3">
                  <div className="text-xs text-[#444444] font-sans">
                    Simulate customer clicking link and completing payment:
                  </div>
                  <button
                    onClick={handleSimulateWebhook}
                    disabled={isWebhookSimulating}
                    className="inline-flex items-center gap-1.5 bg-[#166534] px-4 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-[#14532D] transition-colors disabled:opacity-50 font-sans"
                  >
                    {isWebhookSimulating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Verifying Webhook...
                      </>
                    ) : (
                      'Simulate Customer Payment'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#EBE8E4] bg-[#F9F7F4] px-6 py-4">
          <button
            onClick={onClose}
            className="border border-[#D1CEC9] bg-[#FFFFFF] px-4 py-2 text-xs font-bold text-[#444444] uppercase tracking-wider hover:bg-[#EBE8E4] transition-colors font-sans"
          >
            {isRecoveredSuccess ? 'Close Window' : 'Cancel'}
          </button>

          {!executedCase && !isRecoveredSuccess && (
            <button
              onClick={handleStartExecution}
              disabled={isExecuting}
              className="inline-flex items-center gap-2 bg-[#1A1A1A] px-5 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-[#333333] transition-colors disabled:opacity-50 font-sans shadow-md"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Executing Action Gateway...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-[#C5A059]" />
                  Execute Recovery Action
                </>
              )}
            </button>
          )}

          {isRecoveredSuccess && (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-[#166534] px-5 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-[#14532D] transition-colors font-sans"
            >
              <CheckCircle2 className="h-4 w-4" />
              Completed &amp; Reconciled
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

