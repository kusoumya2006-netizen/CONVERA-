import React from 'react';
import { CaseStatus, Bureau, Priority, AlertConfidence, ReviewStatus } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<CaseStatus, string> = {
    'Pending': 'bg-amber-100 text-amber-800 border-amber-300',
    'Under Process': 'bg-blue-100 text-blue-800 border-blue-300',
    'Disposed': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Transferred': 'bg-purple-100 text-purple-800 border-purple-300',
    'Escalated': 'bg-rose-100 text-rose-800 border-rose-300'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${styles[status]} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export const BureauBadge: React.FC<{ bureau: Bureau; size?: 'sm' | 'md' }> = ({ bureau, size = 'md' }) => {
  const styles: Record<Bureau, string> = {
    'RB': 'bg-gov-olive-soft text-gov-olive border-gov-olive/30',
    'PGRC': 'bg-indigo-50 text-indigo-800 border-indigo-200',
    'AB': 'bg-sky-50 text-sky-800 border-sky-200',
    'Finance': 'bg-amber-50 text-amber-900 border-amber-200',
    'Vigilance': 'bg-red-50 text-red-900 border-red-200'
  };

  const labels: Record<Bureau, string> = {
    'RB': 'Regulation Bureau (RB)',
    'PGRC': 'Grievance Cell (PGRC)',
    'AB': 'Approval Bureau (AB)',
    'Finance': 'Finance Bureau',
    'Vigilance': 'Vigilance Cell'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${styles[bureau]} ${sizeClasses}`} title={labels[bureau]}>
      {bureau}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles: Record<Priority, string> = {
    'LOW': 'text-slate-600 bg-slate-100 border-slate-200',
    'MEDIUM': 'text-amber-700 bg-amber-50 border-amber-200',
    'HIGH': 'text-orange-700 bg-orange-50 border-orange-200',
    'CRITICAL': 'text-rose-700 bg-rose-50 border-rose-300 font-bold'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const OverlapReviewBadge: React.FC<{ status: ReviewStatus }> = ({ status }) => {
  const styles: Record<ReviewStatus, string> = {
    'PENDING_REVIEW': 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse',
    'COORDINATED': 'bg-emerald-50 text-emerald-800 border-emerald-300',
    'DISMISSED': 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const labels: Record<ReviewStatus, string> = {
    'PENDING_REVIEW': 'Action Required',
    'COORDINATED': 'Coordinated',
    'DISMISSED': 'Dismissed'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
