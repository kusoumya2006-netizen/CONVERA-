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
  const variantStyles = {
    default: 'border-slate-200 bg-white text-slate-800',
    olive: 'border-gov-olive/30 bg-emerald-50/50 text-gov-olive',
    amber: 'border-amber-200 bg-amber-50/40 text-amber-900',
    rose: 'border-rose-200 bg-rose-50/40 text-rose-950',
    blue: 'border-blue-200 bg-blue-50/40 text-blue-900'
  };

  const iconStyles = {
    default: 'bg-slate-100 text-slate-600',
    olive: 'bg-gov-olive-soft text-gov-olive',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-700',
    blue: 'bg-blue-100 text-blue-700'
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-lg border shadow-sm transition-all duration-150 ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wide uppercase text-slate-700">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
            {badge && (
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-700">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
