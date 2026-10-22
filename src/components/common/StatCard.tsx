import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'olive' | 'amber' | 'rose' | 'blue';
  onClick?: () => void;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
  badge
}) => {
  const iconColors = {
    default: 'text-[#A0A7B2]',
    olive: 'text-[#A3B86C]',
    amber: 'text-[#E8B75C]',
    rose: 'text-[#F16D75]',
    blue: 'text-[#86A9FF]'
  };

  const badgeStyles = {
    default: 'bg-[#161A20] text-[#A0A7B2] border-[#272D35]',
    olive: 'bg-[#A3B86C]/10 text-[#A3B86C] border-[#A3B86C]/30',
    amber: 'bg-[#E8B75C]/10 text-[#E8B75C] border-[#E8B75C]/30',
    rose: 'bg-[#F16D75]/15 text-[#F16D75] border-[#F16D75]/35',
    blue: 'bg-[#86A9FF]/10 text-[#86A9FF] border-[#86A9FF]/30'
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border border-[#272D35] bg-[#111419] transition-all duration-150 ${
        onClick
          ? 'cursor-pointer hover:bg-[#161A20] hover:border-[#38414D]'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-[#A0A7B2] font-mono truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-[#E8EAED] font-mono">
              {value}
            </span>
            {badge && (
              <span className={`inline-flex items-center text-[9px] font-mono px-1.5 py-0.2 rounded border ${badgeStyles[variant]}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] text-[#737D8B] truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-md bg-[#161A20] border border-[#272D35] shrink-0 ${iconColors[variant]}`}>
          <Icon className="w-4 h-4 stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
};
