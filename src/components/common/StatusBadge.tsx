import React from 'react';
import { CaseStatus, Bureau, Priority, ReviewStatus } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<CaseStatus, string> = {
    'Pending': 'bg-[#E8B75C]/10 text-[#E8B75C] border-[#E8B75C]/30',
    'Under Process': 'bg-[#86A9FF]/10 text-[#86A9FF] border-[#86A9FF]/30',
    'Disposed': 'bg-[#69C9A0]/10 text-[#69C9A0] border-[#69C9A0]/30',
    'Transferred': 'bg-[#A0A7B2]/10 text-[#CBD5E1] border-[#272D35]',
    'Escalated': 'bg-[#F16D75]/10 text-[#F16D75] border-[#F16D75]/30'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${styles[status]} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-90"></span>
      {status}
    </span>
  );
};

export const BureauBadge: React.FC<{ bureau: Bureau; size?: 'sm' | 'md' }> = ({ bureau, size = 'md' }) => {
  const styles: Record<Bureau, string> = {
    'RB': 'bg-[#A3B86C]/10 text-[#A3B86C] border-[#A3B86C]/30',
    'PGRC': 'bg-[#86A9FF]/10 text-[#86A9FF] border-[#86A9FF]/30',
    'AB': 'bg-[#CBD5E1]/10 text-[#E8EAED] border-[#272D35]',
    'Finance': 'bg-[#E8B75C]/10 text-[#E8B75C] border-[#E8B75C]/30',
    'Vigilance': 'bg-[#F16D75]/10 text-[#F16D75] border-[#F16D75]/30'
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
    <span className={`inline-flex items-center rounded border font-medium ${styles[bureau]} ${sizeClasses}`} title={labels[bureau]}>
      {bureau}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; size?: 'sm' | 'md' }> = ({ priority, size = 'md' }) => {
  const styles: Record<Priority, string> = {
    'LOW': 'text-[#737D8B] bg-[#111419] border-[#272D35]',
    'MEDIUM': 'text-[#E8B75C] bg-[#E8B75C]/10 border-[#E8B75C]/30',
    'HIGH': 'text-[#E8B75C] bg-[#E8B75C]/20 border-[#E8B75C]/40 font-semibold',
    'CRITICAL': 'text-[#F16D75] bg-[#F16D75]/15 border-[#F16D75]/40 font-bold'
  };

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]';

  return (
    <span className={`inline-flex items-center font-mono rounded border ${styles[priority]} ${sizeClasses}`}>
      {priority}
    </span>
  );
};

export const OverlapReviewBadge: React.FC<{ status: ReviewStatus }> = ({ status }) => {
  const styles: Record<ReviewStatus, string> = {
    'PENDING_REVIEW': 'bg-[#F16D75]/15 text-[#F16D75] border-[#F16D75]/35',
    'COORDINATED': 'bg-[#69C9A0]/15 text-[#69C9A0] border-[#69C9A0]/35',
    'DISMISSED': 'bg-[#111419] text-[#737D8B] border-[#272D35]'
  };

  const labels: Record<ReviewStatus, string> = {
    'PENDING_REVIEW': 'Action Required',
    'COORDINATED': 'Coordinated',
    'DISMISSED': 'Dismissed'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
