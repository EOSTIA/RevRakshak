import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.js';
import { PaymentEvent } from '../types.js';
import {
  CreditCard,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { openCaseDetail } = useApp();
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    api.getPaymentEvents().then(setEvents).catch(console.error);
  }, []);

  const filtered = events.filter((ev) => {
    if (statusFilter !== 'ALL' && ev.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !ev.paymentId.toLowerCase().includes(q) &&
        !ev.orderId.toLowerCase().includes(q) &&
        !ev.customerName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
            Ingestion Telemetry
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl font-serif">
              Live Ingested Payment Events
            </h1>
            <span className="border border-[#1A1A1A] bg-[#1A1A1A] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider">
              KAFKA EVENT STREAM
            </span>
          </div>
          <p className="text-xs text-[#666666] font-sans mt-1">
            Raw payment webhooks ingested via Razorpay sandbox and mapped into recovery diagnostic pipelines
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#EBE8E4] bg-[#FFFFFF] p-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search payment ID, order, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#D1CEC9] bg-[#FAF8F5] pl-9 pr-4 py-2 text-xs text-[#1A1A1A] placeholder-[#888888] focus:border-[#1A1A1A] focus:outline-none font-sans"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#D1CEC9] bg-[#FAF8F5] px-3 py-2 text-xs text-[#1A1A1A] font-sans font-bold uppercase tracking-wider focus:outline-none"
        >
          <option value="ALL">All Event Types ({events.length})</option>
          <option value="FAILED">Payment Failed (At-Risk)</option>
          <option value="AUTHORIZED">Authorized / Pending</option>
          <option value="CAPTURED">Captured / Settled</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden border border-[#EBE8E4] bg-[#FFFFFF] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b-2 border-[#1A1A1A] bg-[#FAF8F5] text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#1A1A1A]">
            <tr>
              <th className="py-3.5 px-4">Payment ID &amp; Time</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Method &amp; Bank</th>
              <th className="py-3.5 px-4">Status &amp; Error Code</th>
              <th className="py-3.5 px-4">Recovery Pipeline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE8E4]">
            {filtered.map((ev) => (
              <tr key={ev.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3.5 px-4 font-sans">
                  <div className="font-bold text-[#1A1A1A]">{ev.paymentId}</div>
                  <div className="text-[10px] text-[#888888]">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-serif font-bold text-[#1A1A1A]">{ev.customerName}</div>
                  <div className="text-[10px] text-[#666666] font-sans">{ev.customerPhone}</div>
                </td>
                <td className="py-3.5 px-4 font-serif font-black text-[#1A1A1A] text-sm">
                  ₹{ev.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 text-[#444444] font-sans">
                  <div className="font-bold text-[#1A1A1A]">{ev.method}</div>
                  <div className="text-[10px] text-[#666666]">{ev.bank || 'HDFC Bank'}</div>
                </td>
                <td className="py-3.5 px-4">
                  {ev.status === 'FAILED' ? (
                    <span className="text-[#991B1B] font-bold font-sans flex items-center gap-1">
                      <AlertOctagon className="h-3.5 w-3.5" /> FAILED ({ev.errorCode})
                    </span>
                  ) : (
                    <span className="text-[#166534] font-bold font-sans flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {ev.status}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {ev.associatedCaseId ? (
                    <button
                      onClick={() => openCaseDetail(ev.associatedCaseId!)}
                      className="border border-[#1A1A1A] bg-[#FAF8F5] px-2.5 py-1 text-[10px] font-sans font-bold text-[#1A1A1A] uppercase tracking-wider hover:bg-[#1A1A1A] hover:text-white transition-colors shadow-xs"
                    >
                      Active Case &rarr;
                    </button>
                  ) : (
                    <span className="text-[#888888] text-[10px] font-sans">No action required</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

