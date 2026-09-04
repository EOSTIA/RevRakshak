import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.js';
import { CustomerProfile } from '../types.js';
import {
  Users,
  Search,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const CustomerIntelligenceView: React.FC = () => {
  const { cases, openCaseDetail } = useApp();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Extract unique customers from cases
    const custMap = new Map<string, CustomerProfile>();
    cases.forEach((c) => {
      if (!custMap.has(c.customer.id)) {
        custMap.set(c.customer.id, c.customer);
      }
    });
    setCustomers(Array.from(custMap.values()));
  }, [cases]);

  const filtered = customers.filter((cust) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        cust.name.toLowerCase().includes(q) ||
        cust.email.toLowerCase().includes(q) ||
        cust.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-sans font-bold">
            Behavioral Dossier
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl font-serif">
              Customer Recovery Intelligence
            </h1>
            <span className="border border-[#1A1A1A] bg-[#1A1A1A] px-2.5 py-0.5 text-[10px] font-sans font-bold text-[#C5A059] uppercase tracking-wider">
              BEHAVIORAL PROFILES
            </span>
          </div>
          <p className="text-xs text-[#666666] font-sans mt-1">
            Historical payment propensities, language preferences, and outreach consent states
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 border border-[#EBE8E4] bg-[#FFFFFF] p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#D1CEC9] bg-[#FAF8F5] pl-9 pr-4 py-2 text-xs text-[#1A1A1A] placeholder-[#888888] focus:border-[#1A1A1A] focus:outline-none font-sans"
          />
        </div>
        <span className="text-xs font-sans text-[#666666] border border-[#EBE8E4] bg-[#FAF8F5] px-3 py-1.5 shadow-xs">
          Total Profiles: <strong className="text-[#1A1A1A] font-serif">{customers.length}</strong>
        </span>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cust) => {
          const matchingCase = cases.find((c) => c.customer.id === cust.id);

          return (
            <div
              key={cust.id}
              className="border border-[#EBE8E4] bg-[#FFFFFF] p-5 space-y-4 flex flex-col justify-between hover:border-[#1A1A1A] transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold font-serif text-[#1A1A1A]">{cust.name}</h4>
                    <div className="text-xs text-[#666666] font-sans mt-0.5">{cust.phone}</div>
                    <div className="text-[11px] text-[#888888] font-sans">{cust.email}</div>
                  </div>
                  <span className="border border-[#D1CEC9] bg-[#FAF8F5] px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]">
                    {cust.preferredLanguage}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-sans border-t border-[#EBE8E4] pt-3">
                  <div>
                    <span className="text-[#888888] text-[10px] uppercase font-bold block tracking-wider">RECOVERY RATE</span>
                    <span className="font-serif font-bold text-[#166534]">
                      {Math.round(cust.historicalRecoveryRate * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888888] text-[10px] uppercase font-bold block tracking-wider">AVG TICKET</span>
                    <span className="font-serif font-black text-[#1A1A1A]">
                      ₹{cust.averageTicketSize.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888888] text-[10px] uppercase font-bold block tracking-wider">PAYMENT METHOD</span>
                    <span className="font-bold text-[#1A1A1A]">
                      {cust.primaryPaymentMethod}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888888] text-[10px] uppercase font-bold block tracking-wider">OUTREACH CONSENT</span>
                    <span className="font-bold text-[#166534]">
                      {cust.contactConsentGranted ? 'GRANTED' : 'DENIED'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE8E4] flex items-center justify-between font-sans">
                <span className="text-[10px] text-[#888888]">
                  {cust.successfulTransactions} successful / {cust.totalTransactions} total
                </span>
                {matchingCase && (
                  <button
                    onClick={() => openCaseDetail(matchingCase.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1A1A1A] hover:text-[#C5A059] uppercase tracking-wider"
                  >
                    View Case <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

