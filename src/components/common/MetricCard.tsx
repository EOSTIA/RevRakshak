import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'indigo' | 'danger';
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subtitle,
  change,
  changeType = 'positive',
  icon: Icon,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-l-4 border-l-[#166534] bg-[#FFFFFF] border-[#EBE8E4]';
      case 'warning':
        return 'border-l-4 border-l-[#C5A059] bg-[#FFFFFF] border-[#EBE8E4]';
      case 'indigo':
        return 'border-l-4 border-l-[#1A1A1A] bg-[#FFFFFF] border-[#EBE8E4]';
      case 'danger':
        return 'border-l-4 border-l-[#991B1B] bg-[#FFFFFF] border-[#EBE8E4]';
      default:
        return 'border-l-4 border-l-[#C5A059] bg-[#FFFFFF] border-[#EBE8E4]';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-[#166534] bg-[#F0FDF4] border border-[#DCFCE7]';
      case 'warning':
        return 'text-[#C5A059] bg-[#FFFDF9] border border-[#F5E6CC]';
      case 'indigo':
        return 'text-[#1A1A1A] bg-[#F9F7F4] border border-[#EBE8E4]';
      case 'danger':
        return 'text-[#991B1B] bg-[#FEF2F2] border border-[#FEE2E2]';
      default:
        return 'text-[#1A1A1A] bg-[#F9F7F4] border border-[#EBE8E4]';
    }
  };

  return (
    <div
      id={id}
      className={`relative overflow-hidden border p-5 transition-all duration-200 shadow-sm ${getVariantStyles()}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-[#666666] tracking-[0.2em] uppercase font-sans">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-black tracking-tight text-[#1A1A1A] font-serif">
            {value}
          </h3>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center ${getIconColor()}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-4 pt-3 border-t border-[#F0EBE6] flex items-center justify-between text-xs font-sans">
          {change && (
            <span
              className={`font-semibold tracking-wide ${
                changeType === 'positive'
                  ? 'text-[#166534]'
                  : changeType === 'negative'
                  ? 'text-[#991B1B]'
                  : 'text-[#666666]'
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-[#666666] italic text-[11px]">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

