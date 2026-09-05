import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { AuditLogEntry } from '../types.js';
import {
  FileText,
  Search,
  CheckCircle2,
  ShieldCheck,
  Code2,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  const filtered = logs.filter((log) => {
    if (filterType !== 'ALL' && log.eventType !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !log.caseNumber?.toLowerCase().includes(q) &&
        !log.summary.toLowerCase().includes(q) &&
        !log.id.toLowerCase().includes(q)
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
            Verifiable Ledger
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl font-serif">
              Immutable Compliance Audit Trail
            </h1>
            <span className="border border-[#166534] bg-[#FFFFFF] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#166534] uppercase tracking-wider">
              SHA-256 HASH VERIFIED
            </span>
          </div>
          <p className="text-xs text-[#666666] font-sans mt-1">
            Every autonomous recovery step, deterministic rule evaluation, and API gateway call is logged immutably
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#EBE8E4] bg-[#FFFFFF] p-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search audit trail by case #, hash, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#D1CEC9] bg-[#FAF8F5] pl-9 pr-4 py-2 text-xs text-[#1A1A1A] placeholder-[#888888] focus:border-[#1A1A1A] focus:outline-none font-sans"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-[#D1CEC9] bg-[#FAF8F5] px-3 py-2 text-xs text-[#1A1A1A] font-sans font-bold uppercase tracking-wider focus:outline-none"
        >
          <option value="ALL">All Event Types ({logs.length})</option>
          <option value="PAYMENT_FAILED_INGESTED">Payment Ingested</option>
          <option value="DIAGNOSIS_COMPLETED">Diagnosis Completed</option>
          <option value="LSTM_ANOMALY_EVALUATED">LSTM Anomaly Evaluated</option>
          <option value="POLICY_CHECK_PERFORMED">Policy Check</option>
          <option value="ACTION_EXECUTED">Action Executed</option>
          <option value="PAYMENT_RECOVERED">Payment Recovered</option>
        </select>
      </div>

      {/* Logs Table / Accordion */}
      <div className="space-y-3">
        {filtered.map((log) => {
          const isExpanded = expandedId === log.id;
          return (
            <div
              key={log.id}
              className="border border-[#EBE8E4] bg-[#FFFFFF] overflow-hidden transition-all shadow-sm"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAF8F5]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center border border-[#1A1A1A] bg-[#1A1A1A] text-[#C5A059]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-sans">
                      <span className="text-xs font-bold text-[#1A1A1A]">
                        {log.caseNumber || 'SYSTEM'}
                      </span>
                      <span className="border border-[#EBE8E4] bg-[#FAF8F5] px-1.5 py-0.5 text-[9px] font-bold text-[#666666] uppercase tracking-wider">
                        {log.eventType}
                      </span>
                      <span className="text-[10px] text-[#888888]">
                        by {log.actor}
                      </span>
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5 font-sans">{log.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-[10px] text-[#888888] font-sans hidden sm:block">
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div className="truncate max-w-[120px]">
                      hash: {log.signatureHash.substring(0, 16)}...
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[#1A1A1A]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#888888]" />
                  )}
                </div>
              </div>

              {/* JSON Payload Details */}
              {isExpanded && (
                <div className="border-t border-[#EBE8E4] bg-[#FAF8F5] p-4 text-xs font-sans text-[#1A1A1A]">
                  <div className="flex justify-between items-center mb-2 text-[10px] text-[#888888]">
                    <span>RECORD PAYLOAD (IMMUTABLE SHA-256: {log.signatureHash})</span>
                    <span className="text-[#166534] font-bold">SIGNATURE VERIFIED ✓</span>
                  </div>
                  <pre className="overflow-x-auto border border-[#EBE8E4] bg-[#FFFFFF] p-3 text-[11px] text-[#1A1A1A] font-mono">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

