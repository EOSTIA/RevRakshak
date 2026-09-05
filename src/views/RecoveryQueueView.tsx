import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { RiskBadge } from '../components/common/RiskBadge.js';
import {
  Search,
  SlidersHorizontal,
  Filter,
  ArrowUpDown,
  Play,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldX,
  AlertTriangle
} from 'lucide-react';
import { RecoveryStatus, FailureCause, RiskDecision } from '../types.js';

export const RecoveryQueueView: React.FC = () => {
  const { cases, openCaseDetail, refreshAllData, globalSearch } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [causeFilter, setCauseFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('EXPECTED_VALUE_DESC');

  useEffect(() => {
    setSearchQuery(globalSearch);
  }, [globalSearch]);

  // Filter & Sort
  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => {
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (causeFilter !== 'ALL' && c.failureCause !== causeFilter) return false;
        if (riskFilter !== 'ALL' && c.anomalyResult.decision !== riskFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCase = c.caseNumber.toLowerCase().includes(q);
          const matchCust = c.customer.name.toLowerCase().includes(q);
          const matchPay = c.paymentId.toLowerCase().includes(q);
          const matchOrder = c.orderId.toLowerCase().includes(q);
          if (!matchCase && !matchCust && !matchPay && !matchOrder) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'AMOUNT_DESC') return b.amount - a.amount;
        if (sortBy === 'AMOUNT_ASC') return a.amount - b.amount;
        if (sortBy === 'ANOMALY_DESC') return b.anomalyResult.anomalyScore - a.anomalyResult.anomalyScore;
        if (sortBy === 'EXPECTED_VALUE_DESC') {
          const topA = a.candidateActions.find((x) => x.recommended) || a.candidateActions[0];
          const topB = b.candidateActions.find((x) => x.recommended) || b.candidateActions[0];
          return (topB?.expectedNetRecoveryValue || 0) - (topA?.expectedNetRecoveryValue || 0);
        }
        // Default recency
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [cases, statusFilter, causeFilter, riskFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
            Autonomous Pipeline Roster
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl font-serif">
            Autonomous Recovery Queue
          </h1>
          <p className="text-xs text-[#666666] font-sans">
            Intelligent priority queue sorted by expected net recovery value (E[V]) and safety clearance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-sans text-[#666666] border border-[#EBE8E4] bg-[#FFFFFF] px-3 py-1 shadow-xs">
            Showing <strong className="text-[#1A1A1A] font-serif">{filteredCases.length}</strong> of {cases.length} cases
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#EBE8E4] bg-[#FFFFFF] p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search by Case #, customer, pay_id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#D1CEC9] bg-[#FAF8F5] pl-9 pr-4 py-2 text-xs text-[#1A1A1A] placeholder-[#888888] focus:border-[#1A1A1A] focus:outline-none font-sans"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#D1CEC9] bg-[#FAF8F5] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none font-sans font-bold uppercase tracking-wider"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTION_QUEUED">Action Queued</option>
            <option value="ACTION_EXECUTED">Action Executed</option>
            <option value="CUSTOMER_CONTACTED">Customer Contacted</option>
            <option value="PAYMENT_RECOVERED">Payment Recovered</option>
            <option value="POLICY_BLOCKED">Policy Vetoed</option>
            <option value="HUMAN_REVIEW">Human Review</option>
            <option value="RECOVERY_FAILED">Failed Exception</option>
          </select>

          {/* Risk Gate Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border border-[#D1CEC9] bg-[#FAF8F5] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none font-sans font-bold uppercase tracking-wider"
          >
            <option value="ALL">All Risk Decisions</option>
            <option value="PASS">Risk Gate: PASS</option>
            <option value="VETO">Risk Gate: VETO</option>
            <option value="MANUAL_REVIEW">Manual Gated</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-[#D1CEC9] bg-[#FAF8F5] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none font-sans font-bold uppercase tracking-wider"
          >
            <option value="EXPECTED_VALUE_DESC">Sort: Net Expected Value (High to Low)</option>
            <option value="AMOUNT_DESC">Sort: Amount (High to Low)</option>
            <option value="AMOUNT_ASC">Sort: Amount (Low to High)</option>
            <option value="ANOMALY_DESC">Sort: Anomaly Score (High to Low)</option>
            <option value="RECENCY">Sort: Most Recent</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-hidden border border-[#EBE8E4] bg-[#FFFFFF] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b-2 border-[#1A1A1A] bg-[#FAF8F5] text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#1A1A1A]">
              <tr>
                <th className="py-3.5 px-4">Case # / Time</th>
                <th className="py-3.5 px-4">Customer &amp; Contact</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Diagnosis Root Cause</th>
                <th className="py-3.5 px-4">LSTM Anomaly Score</th>
                <th className="py-3.5 px-4">Optimal Action &amp; E[V]</th>
                <th className="py-3.5 px-4">Pipeline Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E4]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#666666] font-serif">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const topAction = c.candidateActions.find((a) => a.recommended) || c.candidateActions[0];
                  const isRecovered = c.status === 'PAYMENT_RECOVERED';
                  const isVetoed = c.anomalyResult.decision === 'VETO';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => openCaseDetail(c.id)}
                      className="group cursor-pointer hover:bg-[#FAF8F5] transition-colors"
                    >
                      {/* Case ID */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-[#1A1A1A] group-hover:text-[#C5A059] transition-colors">
                          {c.caseNumber}
                        </div>
                        <div className="text-[10px] text-[#888888]">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-serif font-bold text-[#1A1A1A]">{c.customer.name}</div>
                        <div className="text-[11px] text-[#666666] font-sans">{c.customer.phone}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-serif font-black text-[#1A1A1A] text-sm">
                        ₹{c.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Failure Cause */}
                      <td className="py-3.5 px-4">
                        <div className="font-serif font-bold text-[#1A1A1A]">
                          {c.failureCause.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] font-sans text-[#666666] truncate max-w-[180px]">
                          {c.failureReasonDetails}
                        </div>
                      </td>

                      {/* Anomaly Score */}
                      <td className="py-3.5 px-4">
                        <RiskBadge
                          decision={c.anomalyResult.decision}
                          score={c.anomalyResult.anomalyScore}
                          threshold={c.anomalyResult.threshold}
                        />
                      </td>

                      {/* Action & Expected Value */}
                      <td className="py-3.5 px-4">
                        <div className="font-serif font-bold text-[#1A1A1A]">
                          {topAction?.label || c.selectedAction.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] font-sans font-bold text-[#166534]">
                          E[V]: ₹{Math.round(topAction?.expectedNetRecoveryValue || c.amount * 0.8).toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      {/* CTA */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCaseDetail(c.id);
                          }}
                          className="border border-[#1A1A1A] bg-[#FFFFFF] px-3 py-1 text-[10px] font-sans font-bold text-[#1A1A1A] uppercase tracking-wider group-hover:bg-[#1A1A1A] group-hover:text-white transition-all shadow-xs"
                        >
                          Inspect &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

