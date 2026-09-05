import React from 'react';
import { useApp } from '../context/AppContext.js';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Radio,
  Cpu,
  Database,
  Clock
} from 'lucide-react';

export const SystemHealthView: React.FC = () => {
  const { health, faultInjections, toggleFault } = useApp();

  if (!health) {
    return <div className="p-8 text-center text-[#666666] font-serif">Loading system telemetry...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
            Infrastructure Telemetry
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl font-serif">
              System Architecture &amp; Service Health
            </h1>
            <span className="border border-[#166534] bg-[#FFFFFF] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#166534] uppercase tracking-wider">
              DISTRIBUTED CONTROL PLANE
            </span>
          </div>
          <p className="text-xs text-[#666666] font-sans mt-1">
            Real-time status of event streaming bus, hot data layer, ML inference microservices, and gateway integrations
          </p>
        </div>

        <div className="flex items-center gap-2 font-sans text-xs text-[#666666]">
          <span className="h-2 w-2 bg-[#166534] animate-pulse" />
          <span>Services: <strong className="text-[#1A1A1A] font-serif">{health.services.length} monitored</strong></span>
        </div>
      </div>

      {/* Microservice Topology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {health.services.map((svc) => {
          const isOk = svc.status === 'HEALTHY';
          const isDegraded = svc.status === 'DEGRADED';
          return (
            <div
                key={svc.name}
              className={`border p-5 space-y-3 transition-all shadow-sm ${
                isOk
                  ? 'border-[#EBE8E4] bg-[#FFFFFF]'
                  : isDegraded
                  ? 'border-[#C5A059] bg-[#FAF8F5]'
                  : 'border-[#991B1B] bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] font-serif">{svc.displayName}</span>
                <span
                  className={`border px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider ${
                    isOk
                      ? 'border-[#166534] bg-[#FFFFFF] text-[#166534]'
                      : isDegraded
                      ? 'border-[#C5A059] bg-[#FFFFFF] text-[#C5A059]'
                      : 'border-[#991B1B] bg-[#FFFFFF] text-[#991B1B]'
                  }`}
                >
                  {svc.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-[#666666] border-t border-[#EBE8E4] pt-3">
                <div>
                  <span className="text-[10px] text-[#888888] uppercase font-bold block">LATENCY</span>
                  <span className="font-bold text-[#1A1A1A] font-serif">{svc.latencyMs}ms</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#888888] uppercase font-bold block">ERROR RATE</span>
                  <span className="font-bold text-[#1A1A1A] font-serif">{(svc.errorRate * 100).toFixed(2)}%</span>
                </div>
              </div>

              {svc.fallbackActive && (
                <div className="border border-[#C5A059] bg-[#FAF8F5] p-2 text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider">
                  CIRCUIT BREAKER OPEN: Fallback mechanism active
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resilience Simulation Control */}
      <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-serif text-[#1A1A1A] flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#C5A059]" />
              Interactive Chaos Engineering &amp; Fault Injection
            </h3>
            <p className="text-xs text-[#666666] font-sans mt-0.5">
              Simulate microservice degradation to verify non-negotiable automatic fallback pipelines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-4 flex justify-between items-center shadow-xs">
            <div>
              <h4 className="text-xs font-bold font-serif text-[#1A1A1A]">Kill LSTM Inference Model</h4>
              <p className="text-[10px] text-[#666666] font-sans">Fallback: Velocity rule checks</p>
            </div>
            <button
              onClick={() => toggleFault('lstmDown', !faultInjections.lstmDown)}
              className={`border px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                faultInjections.lstmDown
                  ? 'border-[#991B1B] bg-[#991B1B] text-white'
                  : 'border-[#1A1A1A] bg-[#1A1A1A] text-[#C5A059] hover:bg-[#333333]'
              }`}
            >
              {faultInjections.lstmDown ? 'DOWN' : 'HEALTHY'}
            </button>
          </div>

          <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-4 flex justify-between items-center shadow-xs">
            <div>
              <h4 className="text-xs font-bold font-serif text-[#1A1A1A]">Kill Voice Engine</h4>
              <p className="text-[10px] text-[#666666] font-sans">Fallback: Hinglish SMS / Link</p>
            </div>
            <button
              onClick={() => toggleFault('voiceDown', !faultInjections.voiceDown)}
              className={`border px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                faultInjections.voiceDown
                  ? 'border-[#991B1B] bg-[#991B1B] text-white'
                  : 'border-[#1A1A1A] bg-[#1A1A1A] text-[#C5A059] hover:bg-[#333333]'
              }`}
            >
              {faultInjections.voiceDown ? 'DOWN' : 'HEALTHY'}
            </button>
          </div>

          <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-4 flex justify-between items-center shadow-xs">
            <div>
              <h4 className="text-xs font-bold font-serif text-[#1A1A1A]">Razorpay Rate Limiting</h4>
              <p className="text-[10px] text-[#666666] font-sans">Fallback: Kafka retry queue</p>
            </div>
            <button
              onClick={() => toggleFault('razorpayDegraded', !faultInjections.razorpayDegraded)}
              className={`border px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                faultInjections.razorpayDegraded
                  ? 'border-[#C5A059] bg-[#C5A059] text-white'
                  : 'border-[#1A1A1A] bg-[#1A1A1A] text-[#C5A059] hover:bg-[#333333]'
              }`}
            >
              {faultInjections.razorpayDegraded ? 'THROTTLED' : 'NORMAL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

