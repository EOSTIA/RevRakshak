import React, { useState } from 'react';
import { useApp, ActiveView } from '../../context/AppContext.js';
import {
  LayoutDashboard,
  Inbox,
  CreditCard,
  Users,
  BrainCircuit,
  PlaneTakeoff,
  ClockAlert,
  ShieldCheck,
  FileText,
  Activity,
  Search,
  Zap,
  Bot,
  Radio,
  SlidersHorizontal,
  X,
  CheckCircle,
  AlertTriangle,
  Play,
  Loader2,
  Menu
} from 'lucide-react';
import { api } from '../../services/api.js';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    activeView,
    setActiveView,
    summary,
    faultInjections,
    toggleFault,
    toasts,
    removeToast,
    refreshAllData,
    addToast,
    globalSearch,
    setGlobalSearch
  } = useApp();

  const [isFaultDrawerOpen, setIsFaultDrawerOpen] = useState(false);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveView; label: string; icon: any; num: string; badge?: string | number }[] = [
    { id: 'control-tower', label: 'Revenue Control Tower', icon: LayoutDashboard, num: '01' },
    { id: 'recovery-pipeline', label: 'Recovery Pipeline', icon: Zap, num: '01.5' },
    { id: 'recovery-agent', label: 'Recovery Agent', icon: Bot, num: '01.6' },
    {
      id: 'recovery-queue',
      label: 'Recovery Queue',
      icon: Inbox,
      num: '02',
      badge: summary?.activeRecoveryCount || undefined
    },
    { id: 'transactions', label: 'Payment Events', icon: CreditCard, num: '03' },
    { id: 'customers', label: 'Customer Intelligence', icon: Users, num: '04' },
    { id: 'ai-insights', label: 'ML Observability', icon: BrainCircuit, num: '05' },
    { id: 'simulator', label: 'Flight Simulator', icon: PlaneTakeoff, num: '06' },
    { id: 'promises', label: 'Promise-to-Pay', icon: ClockAlert, num: '07' },
    { id: 'policies', label: 'Policy Center', icon: ShieldCheck, num: '08' },
    { id: 'audit', label: 'Audit Trail', icon: FileText, num: '09' },
    { id: 'system', label: 'Microservice Health', icon: Activity, num: '10' }
  ];

  const handleRunBatch = async () => {
    setIsBatchRunning(true);
    try {
      const res = await api.runBatchRecovery();
      addToast({
        type: 'SUCCESS',
        title: 'Batch Recovery Completed',
        message: `Processed ${res.totalProcessed} cases. Recovered ${res.totalRecovered} transactions (₹${res.recoveredAmount.toLocaleString('en-IN')}). ${res.vetoedCount} Vetoed by Risk Gate.`
      });
      await refreshAllData();
    } catch (e: any) {
      addToast({
        type: 'ERROR',
        title: 'Batch Run Failed',
        message: e.message
      });
    } finally {
      setIsBatchRunning(false);
    }
  };

  const lstmDegraded = faultInjections.lstmDown;

  return (
    <div className="flex min-h-screen bg-[#FDFCFB] text-[#1A1A1A] selection:bg-[#C5A059]/30">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-[#E2DED9] lg:bg-[#FAF8F5] lg:fixed lg:inset-y-0 lg:z-30 shadow-xs">
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b-2 border-[#1A1A1A] px-6 bg-[#FFFFFF]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('control-tower')}>
            <div className="flex h-10 w-10 items-center justify-center bg-[#1A1A1A] text-white font-black text-sm tracking-tighter border-2 border-[#C5A059]">
              RR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-[#1A1A1A] font-serif text-base uppercase">
                  REVRAKSHAK
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-sans font-bold">
                Recovery Control Plane
              </p>
            </div>
          </div>
        </div>

        {/* Live Architecture Status Pills */}
        <div className="px-4 py-3.5 border-b border-[#E2DED9] bg-[#F4EFEB]">
          <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.2em] text-[#666666] font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-[#166534] animate-pulse" /> Live Telemetry
            </span>
            <button
              onClick={() => setIsFaultDrawerOpen(true)}
              className="text-[#1A1A1A] hover:text-[#C5A059] text-[10px] font-bold underline flex items-center gap-1 uppercase"
            >
              <SlidersHorizontal className="h-2.5 w-2.5" /> Fault Sim
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-sans">
            <div className="flex items-center gap-1.5 text-[#333333]">
              <span className="h-1.5 w-1.5 bg-[#166534]" />
              <span>Razorpay API</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#333333]">
              <span className="h-1.5 w-1.5 bg-[#166534]" />
              <span>Kafka Bus</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#333333]">
              <span className="h-1.5 w-1.5 bg-[#166534]" />
              <span>Redis Cache</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 ${
                  lstmDegraded ? 'bg-[#92400E]' : 'bg-[#166534]'
                }`}
              />
              <span className={lstmDegraded ? 'text-[#92400E] font-bold' : 'text-[#333333]'}>
                {lstmDegraded ? 'LSTM: Fallback' : 'LSTM Gate'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-xs font-sans font-medium transition-all ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white border-l-4 border-l-[#C5A059] shadow-xs'
                    : 'text-[#444444] hover:bg-[#EFEAE4] hover:text-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold font-sans ${isActive ? 'text-[#C5A059]' : 'text-[#888888]'}`}>
                    {item.num}
                  </span>
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-[#C5A059]' : 'text-[#666666]'
                    }`}
                  />
                  <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-sans font-bold ${
                      isActive
                        ? 'bg-[#C5A059] text-[#1A1A1A]'
                        : 'bg-[#E5E0DA] text-[#444444]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Batch Runner in Sidebar */}
        <div className="p-4 border-t-2 border-[#1A1A1A] bg-[#FFFFFF]">
          <button
            onClick={handleRunBatch}
            disabled={isBatchRunning}
            className="flex w-full items-center justify-center gap-2 bg-[#1A1A1A] px-3 py-2.5 text-xs font-bold text-white uppercase tracking-[0.15em] hover:bg-[#333333] transition-all disabled:opacity-50 font-sans shadow-sm"
          >
            {isBatchRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C5A059]" />
                Executing Pipeline...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-[#C5A059]" />
                Run Synthetic Batch (52)
              </>
            )}
          </button>
          <div className="mt-2 flex items-center justify-between text-[9px] text-[#666666] uppercase tracking-[0.2em] font-sans">
            <span>Automated Payment Testing</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b-2 border-[#1A1A1A] bg-[#FFFFFF]/95 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#1A1A1A] hover:bg-[#F9F7F4]"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 border border-[#D1CEC9] bg-[#FAF8F5] px-3.5 py-2 text-xs text-[#666666] focus-within:border-[#1A1A1A]">
              <Search className="h-3.5 w-3.5 text-[#666666]" />
              <input
                type="text"
                placeholder="Search payment ID, customer, order..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearch.trim()) setActiveView('recovery-queue');
                }}
                className="w-64 bg-transparent text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none font-sans"
              />
              <kbd className="border border-[#D1CEC9] bg-[#FFFFFF] px-1.5 py-0.5 text-[10px] font-sans text-[#666666] font-bold">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Recovered Today Pill */}
            {summary && (
              <div className="hidden sm:flex items-center gap-2 border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-1.5 text-xs font-sans">
                <span className="text-[#166534] font-medium">Recovered Today:</span>
                <span className="font-bold text-[#166534] font-serif text-sm">
                  ₹{summary.recoveredToday.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#166534] font-bold bg-[#DCFCE7] px-1.5 py-0.2">
                  {summary.recoveryRatePercent}% Rate
                </span>
              </div>
            )}

            {/* Fault Simulator Button */}
            <button
              onClick={() => setIsFaultDrawerOpen(true)}
              className="flex items-center gap-1.5 border border-[#D1CEC9] bg-[#FAF8F5] px-3.5 py-2 text-xs font-bold text-[#1A1A1A] uppercase tracking-[0.1em] hover:bg-[#EFEAE4] transition-colors font-sans"
            >
              <Zap className="h-3.5 w-3.5 text-[#C5A059]" />
              <span className="hidden md:inline">Resilience Fault Sim</span>
            </button>

            {/* Demo Mode Badge */}
            <span className="bg-[#1A1A1A] text-white px-2.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
              RAZORPAY TEST MODE
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-[#1A1A1A]/95 p-6 backdrop-blur-md text-white">
            <div className="flex justify-between items-center mb-8 border-b border-[#333333] pb-4">
              <div className="flex items-center gap-2 font-serif font-black text-xl">
                <div className="h-8 w-8 bg-[#C5A059] text-[#1A1A1A] flex items-center justify-center text-xs font-black">RR</div>
                REVRAKSHAK
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#CCCCCC] hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between p-3 text-sm font-sans font-medium ${
                      isActive ? 'bg-[#C5A059] text-[#1A1A1A] font-bold' : 'text-[#CCCCCC] hover:bg-[#333333]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="bg-[#1A1A1A] text-white px-2 py-0.5 text-xs font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t-2 border-[#1A1A1A] bg-[#FFFFFF] px-2 py-2 flex justify-around items-center">
          <button
            onClick={() => setActiveView('control-tower')}
            className={`flex flex-col items-center gap-1 text-[10px] font-sans font-bold p-1 ${
              activeView === 'control-tower' ? 'text-[#C5A059]' : 'text-[#666666]'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Tower</span>
          </button>
          <button
            onClick={() => setActiveView('recovery-queue')}
            className={`flex flex-col items-center gap-1 text-[10px] font-sans font-bold p-1 ${
              activeView === 'recovery-queue' ? 'text-[#C5A059]' : 'text-[#666666]'
            }`}
          >
            <Inbox className="h-5 w-5" />
            <span>Recovery</span>
          </button>
          <button
            onClick={() => setActiveView('simulator')}
            className={`flex flex-col items-center gap-1 text-[10px] font-sans font-bold p-1 ${
              activeView === 'simulator' ? 'text-[#C5A059]' : 'text-[#666666]'
            }`}
          >
            <PlaneTakeoff className="h-5 w-5" />
            <span>Simulator</span>
          </button>
          <button
            onClick={() => setActiveView('ai-insights')}
            className={`flex flex-col items-center gap-1 text-[10px] font-sans font-bold p-1 ${
              activeView === 'ai-insights' ? 'text-[#C5A059]' : 'text-[#666666]'
            }`}
          >
            <BrainCircuit className="h-5 w-5" />
            <span>ML Models</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-sans font-bold p-1 text-[#666666]"
          >
            <Menu className="h-5 w-5" />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* Fault Injection / Resilience Demo Drawer */}
      {isFaultDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#1A1A1A]/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FAF8F5] border-l-2 border-[#1A1A1A] p-6 flex flex-col justify-between shadow-2xl animate-slide-left">
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-4 mb-6">
                <div className="flex items-center gap-2 text-[#1A1A1A] font-bold text-sm font-serif">
                  <Zap className="h-5 w-5 text-[#C5A059]" />
                  <span>Resilience &amp; Fault Injection Panel</span>
                </div>
                <button
                  onClick={() => setIsFaultDrawerOpen(false)}
                  className="p-1 text-[#666666] hover:bg-[#EBE8E4] hover:text-[#1A1A1A]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-[#444444] mb-6 leading-relaxed font-sans">
                <em>Gracefully handles dependency failure with automatic fallback</em>. Kill a service to see Resilience4j circuit breakers &amp; fallback pipelines in action.
              </p>

              <div className="space-y-4">
                {/* Fault 1: LSTM Service Down */}
                <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] font-serif">
                        LSTM Anomaly Model Service
                      </h4>
                      <p className="text-[11px] text-[#666666] mt-0.5 font-sans">
                        Fallback: Rule-based Velocity Check
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFault('lstmDown', !faultInjections.lstmDown)}
                      className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                        faultInjections.lstmDown
                          ? 'bg-[#991B1B] text-white'
                          : 'bg-[#1A1A1A] text-white hover:bg-[#333333]'
                      }`}
                    >
                      {faultInjections.lstmDown ? 'DEGRADED (FALLBACK)' : 'KILL SERVICE'}
                    </button>
                  </div>
                  {faultInjections.lstmDown && (
                    <div className="mt-3 flex items-center gap-2 bg-[#FFFBEB] p-2 text-[11px] text-[#92400E] border border-[#FDE68A]">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Circuit Breaker OPEN. System scoring with velocity fallback rule safely.</span>
                    </div>
                  )}
                </div>

                {/* Fault 2: Voice Provider Down */}
                <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] font-serif">
                        Outbound Voice Engine
                      </h4>
                      <p className="text-[11px] text-[#666666] mt-0.5 font-sans">
                        Fallback: Hinglish SMS
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFault('voiceDown', !faultInjections.voiceDown)}
                      className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                        faultInjections.voiceDown
                          ? 'bg-[#991B1B] text-white'
                          : 'bg-[#1A1A1A] text-white hover:bg-[#333333]'
                      }`}
                    >
                      {faultInjections.voiceDown ? 'DEGRADED (SMS FALLBACK)' : 'KILL VOICE'}
                    </button>
                  </div>
                  {faultInjections.voiceDown && (
                    <div className="mt-3 flex items-center gap-2 bg-[#FFFBEB] p-2 text-[11px] text-[#92400E] border border-[#FDE68A]">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Voice service down. Nudges auto-diverted to Hinglish SMS templates.</span>
                    </div>
                  )}
                </div>

                {/* Fault 3: Razorpay Rate Limit Latency */}
                <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] font-serif">
                        Razorpay Gateway Rate Limit Latency
                      </h4>
                      <p className="text-[11px] text-[#666666] mt-0.5 font-sans">
                        Fallback: Kafka Retry Backoff Queue
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFault('razorpayDegraded', !faultInjections.razorpayDegraded)}
                      className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                        faultInjections.razorpayDegraded
                          ? 'bg-[#C5A059] text-[#1A1A1A]'
                          : 'bg-[#1A1A1A] text-white hover:bg-[#333333]'
                      }`}
                    >
                      {faultInjections.razorpayDegraded ? 'THROTTLED (QUEUED)' : 'INJECT LAG'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-[#1A1A1A] pt-4">
              <button
                onClick={() => setIsFaultDrawerOpen(false)}
                className="w-full bg-[#1A1A1A] py-2.5 text-xs font-bold text-white uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors font-sans"
              >
                Close Control Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between border-2 p-4 shadow-xl bg-[#FFFFFF] animate-fade-in ${
              t.type === 'SUCCESS'
                ? 'border-[#166534] text-[#166534]'
                : t.type === 'WARNING'
                ? 'border-[#C5A059] text-[#92400E]'
                : t.type === 'ERROR'
                ? 'border-[#991B1B] text-[#991B1B]'
                : 'border-[#1A1A1A] text-[#1A1A1A]'
            }`}
          >
            <div className="flex items-start gap-3">
              {t.type === 'SUCCESS' && <CheckCircle className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />}
              {t.type === 'WARNING' && <AlertTriangle className="h-5 w-5 text-[#C5A059] shrink-0 mt-0.5" />}
              {t.type === 'ERROR' && <AlertTriangle className="h-5 w-5 text-[#991B1B] shrink-0 mt-0.5" />}
              <div>
                <h5 className="text-xs font-bold text-[#1A1A1A] font-serif">{t.title}</h5>
                <p className="text-[11px] text-[#444444] mt-0.5 leading-relaxed font-sans">{t.message}</p>
                <span className="text-[9px] font-sans uppercase tracking-wider text-[#888888] mt-1 block">{t.timestamp}</span>
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#888888] hover:text-[#1A1A1A] shrink-0 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

