import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.js';
import { MerchantPolicy } from '../types.js';
import {
  ShieldCheck,
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  Cpu,
  Lock,
  Clock,
  DollarSign
} from 'lucide-react';

export const PoliciesView: React.FC = () => {
  const { policy, addToast, refreshAllData } = useApp();
  const [formData, setFormData] = useState<MerchantPolicy | null>(policy);
  const [nlPrompt, setNlPrompt] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [compilerResult, setCompilerResult] = useState<{
    explanation: string;
    deterministicRuleCount: number;
  } | null>(null);

  useEffect(() => {
    if (policy) {
      setFormData(policy);
    }
  }, [policy]);

  if (!formData) {
    return <div className="p-8 text-center text-[#666666] font-serif">Loading policy engine...</div>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updatePolicies(formData);
      addToast({
        type: 'SUCCESS',
        title: 'Merchant Policy Updated',
        message: 'New deterministic safety bounds pushed to Action Gateway.'
      });
      await refreshAllData();
    } catch (e: any) {
      addToast({
        type: 'ERROR',
        title: 'Save Failed',
        message: e.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompileNl = async () => {
    if (!nlPrompt.trim()) return;
    setIsCompiling(true);
    try {
      const res = await api.compileNaturalLanguagePolicy(nlPrompt);
      setFormData(res.compiledPolicy);
      setCompilerResult({
        explanation: res.explanation,
        deterministicRuleCount: res.deterministicRuleCount
      });
      addToast({
        type: 'SUCCESS',
        title: 'Policy Compiled Deterministically',
        message: res.explanation
      });
      await refreshAllData();
    } catch (e: any) {
      addToast({
        type: 'ERROR',
        title: 'Compilation Failed',
        message: e.message
      });
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
            Deterministic Governance
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl font-serif">
              Merchant Recovery Policy Center
            </h1>
            <span className="border border-[#1A1A1A] bg-[#1A1A1A] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider">
              DETERMINISTIC FIREWALL
            </span>
          </div>
          <p className="text-xs text-[#666666] font-sans mt-1">
            Configure hard deterministic boundaries for autonomous action execution and risk vetoes
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 border border-[#1A1A1A] bg-[#1A1A1A] px-4 py-2 text-xs font-sans font-bold text-white uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save &amp; Deploy Rules
        </button>
      </div>

      {/* Trust Callout Banner */}
      <div className="border border-[#1A1A1A] bg-[#FAF8F5] p-5 flex items-start gap-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#1A1A1A] bg-[#1A1A1A] text-[#C5A059]">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#1A1A1A] font-serif flex items-center gap-2">
            Deterministic Execution Guarantee
            <span className="border border-[#166534] bg-[#FFFFFF] text-[#166534] px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider">
              100% NON-PROBABILISTIC ENFORCEMENT
            </span>
          </h4>
          <p className="text-xs text-[#666666] font-sans mt-1 leading-relaxed">
            The LLM never directly receives financial credentials or executes actions. Natural language rules are compiled into strictly bounded JSON schemas verified by the Action Gateway before external API invocation.
          </p>
        </div>
      </div>

      {/* Natural Language Policy Compiler Box */}
      <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#C5A059]" />
            Natural-Language Policy Compiler (AI-Assisted)
          </h3>
          <span className="text-[11px] font-sans text-[#888888]">
            Powered by Gemini API / Structured Parser
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder='e.g., "Never contact a customer more than twice in 24 hours and require human approval above ₹25,000"'
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            className="flex-1 border border-[#D1CEC9] bg-[#FAF8F5] px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#888888] focus:border-[#1A1A1A] focus:outline-none font-sans"
          />
          <button
            onClick={handleCompileNl}
            disabled={isCompiling || !nlPrompt.trim()}
            className="inline-flex items-center justify-center gap-2 border border-[#1A1A1A] bg-[#1A1A1A] px-5 py-2.5 text-xs font-sans font-bold text-white uppercase tracking-wider hover:bg-[#333333] transition-all disabled:opacity-50 shadow-sm"
          >
            {isCompiling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Compiling Rules...
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4" />
                Compile to Rules
              </>
            )}
          </button>
        </div>

        {compilerResult && (
          <div className="border border-[#166534] bg-[#FAF8F5] p-4 text-xs space-y-1 font-sans">
            <span className="font-serif font-bold text-[#166534] block">
              Compiler Output &amp; Verification
            </span>
            <p className="text-[#1A1A1A]">{compilerResult.explanation}</p>
          </div>
        )}
      </div>

      {/* Visual Rule Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Limits */}
        <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold font-serif text-[#1A1A1A] flex items-center gap-2 border-b border-[#EBE8E4] pb-3">
            <DollarSign className="h-4 w-4 text-[#166534]" />
            Financial &amp; Risk Thresholds
          </h3>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <div className="flex justify-between text-[#666666] mb-1">
                <span>Maximum Autonomous Recovery Amount:</span>
                <span className="font-serif font-bold text-[#1A1A1A]">
                  ₹{formData.maxAutomatedRecoveryAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={5000}
                value={formData.maxAutomatedRecoveryAmount}
                onChange={(e) =>
                  setFormData({ ...formData, maxAutomatedRecoveryAmount: Number(e.target.value) })
                }
                className="w-full accent-[#1A1A1A] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#666666] mb-1">
                <span>Require Human Approval Above:</span>
                <span className="font-serif font-bold text-[#C5A059]">
                  ₹{formData.requireHumanApprovalAbove.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={50000}
                step={2500}
                value={formData.requireHumanApprovalAbove}
                onChange={(e) =>
                  setFormData({ ...formData, requireHumanApprovalAbove: Number(e.target.value) })
                }
                className="w-full accent-[#1A1A1A] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#666666] mb-1">
                <span>LSTM Anomaly Gate Veto Threshold:</span>
                <span className="font-serif font-bold text-[#991B1B]">
                  MSE &gt; {formData.anomalyThreshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.3}
                max={0.9}
                step={0.05}
                value={formData.anomalyThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, anomalyThreshold: Number(e.target.value) })
                }
                className="w-full accent-[#1A1A1A] cursor-pointer"
              />
              <p className="text-[10px] text-[#888888] mt-1">
                Sequences with reconstruction error above {formData.anomalyThreshold} are instantly blocked as potential card-testing/abuse.
              </p>
            </div>
          </div>
        </div>

        {/* Consumer Protection & Calling Rules */}
        <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold font-serif text-[#1A1A1A] flex items-center gap-2 border-b border-[#EBE8E4] pb-3">
            <Clock className="h-4 w-4 text-[#C5A059]" />
            Outreach Bounds &amp; TRAI Compliance
          </h3>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <div className="flex justify-between text-[#666666] mb-1">
                <span>Max Outreach Contacts per Customer (24h):</span>
                <span className="font-serif font-bold text-[#1A1A1A]">
                  {formData.maxContactsPerCustomer24h} contacts
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                value={formData.maxContactsPerCustomer24h}
                onChange={(e) =>
                  setFormData({ ...formData, maxContactsPerCustomer24h: Number(e.target.value) })
                }
                className="w-full accent-[#1A1A1A] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[#888888] text-[10px] uppercase font-bold block mb-1">Allowed Window Start:</span>
                <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-2 font-serif font-bold text-[#1A1A1A]">
                  09:00 AM IST
                </div>
              </div>
              <div>
                <span className="text-[#888888] text-[10px] uppercase font-bold block mb-1">Allowed Window End:</span>
                <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-2 font-serif font-bold text-[#1A1A1A]">
                  09:00 PM IST (TRAI Cap)
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#EBE8E4]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowPaymentLinks}
                  onChange={(e) => setFormData({ ...formData, allowPaymentLinks: e.target.checked })}
                  className="accent-[#1A1A1A]"
                />
                <span className="text-[#1A1A1A] font-medium">Allow Razorpay Instant Payment Links</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowVoiceRecovery}
                  onChange={(e) => setFormData({ ...formData, allowVoiceRecovery: e.target.checked })}
                  className="accent-[#1A1A1A]"
                />
                <span className="text-[#1A1A1A] font-medium">Allow Conversational Hinglish Voice Calls</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requireConsentForOutreach}
                  onChange={(e) =>
                    setFormData({ ...formData, requireConsentForOutreach: e.target.checked })
                  }
                  className="accent-[#1A1A1A]"
                />
                <span className="text-[#1A1A1A] font-medium">Enforce Explicit Customer Contact Consent</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

