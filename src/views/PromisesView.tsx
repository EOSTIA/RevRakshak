import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.js';
import { PromiseToPay } from '../types.js';
import {
  ClockAlert,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  MessageSquare,
  DollarSign,
  User,
  ArrowRight
} from 'lucide-react';

export const PromisesView: React.FC = () => {
  const { addToast, openCaseDetail } = useApp();
  const [promises, setPromises] = useState<PromiseToPay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadPromises = async () => {
    try {
      const data = await api.getPromises();
      setPromises(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromises();
  }, []);

  const filtered = promises.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  const getStatusBadge = (status: PromiseToPay['status']) => {
    switch (status) {
      case 'KEPT':
        return (
          <span className="border border-[#166534] bg-[#FFFFFF] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#166534] uppercase tracking-wider">
            KEPT ✓
          </span>
        );
      case 'DUE_TODAY':
        return (
          <span className="border border-[#C5A059] bg-[#FFFFFF] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider">
            DUE TODAY
          </span>
        );
      case 'BROKEN':
        return (
          <span className="border border-[#991B1B] bg-[#FFFFFF] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#991B1B] uppercase tracking-wider">
            BROKEN (RE-SCORE)
          </span>
        );
      default:
        return (
          <span className="border border-[#1A1A1A] bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#1A1A1A] uppercase tracking-wider">
            ACTIVE SCHEDULED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
            Deferral Commitments
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl font-serif">
              Promise-to-Pay Management
            </h1>
            <span className="border border-[#1A1A1A] bg-[#1A1A1A] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider">
              LIFECYCLE TRACKER
            </span>
          </div>
          <p className="text-xs text-[#666666] font-sans mt-1">
            Capture deferral commitments from conversational voice/SMS and trigger automated scheduled reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#D1CEC9] bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#1A1A1A] font-sans font-bold uppercase tracking-wider focus:outline-none"
          >
            <option value="ALL">All Promises ({promises.length})</option>
            <option value="ACTIVE">Active Scheduled</option>
            <option value="DUE_TODAY">Due Today</option>
            <option value="KEPT">Kept / Recovered</option>
            <option value="BROKEN">Broken / Re-entered</option>
          </select>
        </div>
      </div>

      {/* Lifecycle Flow Diagram Banner */}
      <div className="border border-[#EBE8E4] bg-[#FFFFFF] p-4 shadow-sm">
        <div className="text-[10px] font-sans uppercase font-bold text-[#666666] tracking-wider mb-2">
          Deterministic Promise Lifecycle Workflow
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs font-sans">
          <div className="bg-[#FAF8F5] p-2.5 border border-[#EBE8E4]">
            <span className="font-bold text-[#1A1A1A] block">1. Commitment Ingested</span>
            <p className="text-[10px] text-[#666666] mt-0.5">Payday / deferred date confirmed</p>
          </div>
          <div className="bg-[#FAF8F5] p-2.5 border border-[#EBE8E4]">
            <span className="font-bold text-[#C5A059] block">2. Smart Reminder</span>
            <p className="text-[10px] text-[#666666] mt-0.5">Automated SMS/WhatsApp on due date</p>
          </div>
          <div className="bg-[#FAF8F5] p-2.5 border border-[#166534]">
            <span className="font-bold text-[#166534] block">3A. Payment Verified</span>
            <p className="text-[10px] text-[#666666] mt-0.5">Marked KEPT, case resolved</p>
          </div>
          <div className="bg-[#FAF8F5] p-2.5 border border-[#991B1B]">
            <span className="font-bold text-[#991B1B] block">3B. Broken Promise</span>
            <p className="text-[10px] text-[#666666] mt-0.5">Re-enters diagnostic ML pipeline</p>
          </div>
        </div>
      </div>

      {/* Promises Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="border border-[#EBE8E4] bg-[#FFFFFF] p-5 space-y-4 hover:border-[#1A1A1A] transition-all flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-xs text-[#C5A059] font-bold">
                      {p.caseNumber}
                    </span>
                    <span className="text-[#888888] text-xs">&bull;</span>
                    <span className="text-xs text-[#666666] font-medium">{p.customerName}</span>
                  </div>
                  <h4 className="text-xl font-black font-serif text-[#1A1A1A] mt-1">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </h4>
                </div>
                {getStatusBadge(p.status)}
              </div>

              <div className="border border-[#EBE8E4] bg-[#FAF8F5] p-3 text-xs space-y-2 font-sans">
                <div className="flex items-center justify-between text-[#666666]">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Calendar className="h-3.5 w-3.5 text-[#1A1A1A]" /> Promised Date:
                  </span>
                  <span className="font-bold font-serif text-[#1A1A1A]">{p.promisedDate}</span>
                </div>
                <div className="flex items-center justify-between text-[#666666]">
                  <span className="flex items-center gap-1.5 font-bold">
                    <ClockAlert className="h-3.5 w-3.5 text-[#C5A059]" /> Reminder Scheduled:
                  </span>
                  <span className="text-[#1A1A1A]">
                    {new Date(p.reminderScheduledAt).toLocaleDateString()} at 09:30 IST
                  </span>
                </div>
                <p className="text-[11px] text-[#666666] pt-1 border-t border-[#EBE8E4]">
                  {p.notes}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EBE8E4] flex items-center justify-between font-sans">
              <span className="text-[10px] text-[#888888]">
                Channel: {p.channel.replace(/_/g, ' ')}
              </span>
              <button
                onClick={() => openCaseDetail(p.caseId)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1A1A1A] hover:text-[#C5A059] uppercase tracking-wider"
              >
                Inspect Case <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

