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
    default: 'border-slate-800 bg-obsidian-850 hover:border-slate-700 text-slate-200',
    olive: 'border-emerald-900/40 bg-obsidian-850 hover:border-emerald-700/60 text-emerald-300',
    amber: 'border-amber-900/40 bg-obsidian-850 hover:border-amber-700/60 text-amber-300',
    rose: 'border-rose-900/40 bg-obsidian-850 hover:border-rose-700/60 text-rose-300',
    blue: 'border-blue-900/40 bg-obsidian-850 hover:border-blue-700/60 text-blue-300'
  };

  const iconStyles = {
    default: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    olive: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50',
    amber: 'bg-amber-950/60 text-amber-400 border border-amber-800/50',
    rose: 'bg-rose-950/60 text-rose-400 border border-rose-800/50',
    blue: 'bg-blue-950/60 text-blue-400 border border-blue-800/50'
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-3.5 rounded-xl border shadow-md transition-all duration-200 ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:translate-y-[-1px]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 font-mono">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">{value}</span>
            {badge && (
              <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg shrink-0 ${iconStyles[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
