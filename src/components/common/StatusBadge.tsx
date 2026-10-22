import React from 'react';
import { CaseStatus, Bureau, Priority, AlertConfidence, ReviewStatus } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<CaseStatus, string> = {
    'Pending': 'bg-amber-950/40 text-amber-300 border-amber-800/60',
    'Under Process': 'bg-blue-950/40 text-blue-300 border-blue-800/60',
    'Disposed': 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
    'Transferred': 'bg-purple-950/40 text-purple-300 border-purple-800/60',
    'Escalated': 'bg-rose-950/40 text-rose-300 border-rose-800/60'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${styles[status]} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80"></span>
      {status}
    </span>
  );
};

export const BureauBadge: React.FC<{ bureau: Bureau; size?: 'sm' | 'md' }> = ({ bureau, size = 'md' }) => {
  const styles: Record<Bureau, string> = {
    'RB': 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
    'PGRC': 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50',
    'AB': 'bg-sky-950/40 text-sky-300 border-sky-800/50',
    'Finance': 'bg-amber-950/40 text-amber-300 border-amber-800/50',
    'Vigilance': 'bg-red-950/40 text-red-300 border-red-800/50'
  };

  const labels: Record<Bureau, string> = {
    'RB': 'Regulation Bureau (RB)',
    'PGRC': 'Grievance Cell (PGRC)',
    'AB': 'Approval Bureau (AB)',
    'Finance': 'Finance Bureau',
    'Vigilance': 'Vigilance Cell'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px] font-mono' : 'px-2.5 py-1 text-xs font-medium font-mono';

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${styles[bureau]} ${sizeClasses}`} title={labels[bureau]}>
      {bureau}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles: Record<Priority, string> = {
    'LOW': 'text-slate-400 bg-slate-900 border-slate-700/60',
    'MEDIUM': 'text-amber-300 bg-amber-950/40 border-amber-800/50',
    'HIGH': 'text-orange-300 bg-orange-950/40 border-orange-800/50',
    'CRITICAL': 'text-rose-300 bg-rose-950/50 border-rose-800 font-bold'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono rounded border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const OverlapReviewBadge: React.FC<{ status: ReviewStatus }> = ({ status }) => {
  const styles: Record<ReviewStatus, string> = {
    'PENDING_REVIEW': 'bg-rose-950/50 text-rose-300 border-rose-800 animate-pulse',
    'COORDINATED': 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
    'DISMISSED': 'bg-slate-900 text-slate-400 border-slate-700'
  };

  const labels: Record<ReviewStatus, string> = {
    'PENDING_REVIEW': 'Action Required',
    'COORDINATED': 'Coordinated',
    'DISMISSED': 'Dismissed'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
