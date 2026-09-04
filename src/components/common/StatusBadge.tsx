import React from 'react';
import { RecoveryStatus } from '../../types.js';

interface StatusBadgeProps {
  id?: string;
  status: RecoveryStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ id, status, size = 'sm' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PAYMENT_RECOVERED':
        return {
          label: '₹ Money Recovered',
          styles: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
        };
      case 'ACTION_EXECUTED':
      case 'CUSTOMER_CONTACTED':
        return {
          label: status === 'CUSTOMER_CONTACTED' ? 'Customer Contacted' : 'Action Executed',
          styles: 'bg-[#F9F7F4] text-[#1A1A1A] border-[#D1CEC9]'
        };
      case 'POLICY_BLOCKED':
        return {
          label: 'Policy / Risk Vetoed',
          styles: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
        };
      case 'HUMAN_REVIEW':
        return {
          label: 'Manual Review Required',
          styles: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
        };
      case 'RECOVERY_FAILED':
      case 'EXPIRED':
        return {
          label: 'Unrecovered Exception',
          styles: 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
        };
      case 'ACTION_QUEUED':
        return {
          label: 'Action Queued',
          styles: 'bg-[#FFFDF9] text-[#C5A059] border-[#F5E6CC]'
        };
      case 'POLICY_APPROVED':
        return {
          label: 'Policy Approved',
          styles: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
        };
      default:
        return {
          label: status.replace(/_/g, ' '),
          styles: 'bg-[#F9F7F4] text-[#444444] border-[#EBE8E4]'
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 border font-sans uppercase tracking-[0.1em] font-bold ${config.styles} ${sizeClasses}`}
    >
      <span className="h-1.5 w-1.5 bg-current shrink-0" />
      {config.label}
    </span>
  );
};

