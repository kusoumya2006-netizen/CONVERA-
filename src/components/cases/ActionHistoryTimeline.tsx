import React from 'react';
import { CaseAction, ActionType } from '../../types';
import { BureauBadge } from '../common/StatusBadge';
import {
  FileText,
  Activity,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle,
  MessageSquare,
  Clock
} from 'lucide-react';

interface ActionHistoryTimelineProps {
  actions: CaseAction[];
}

export const ActionHistoryTimeline: React.FC<ActionHistoryTimelineProps> = ({ actions }) => {
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'CASE_FILED':
        return <FileText className="w-3.5 h-3.5 text-[#86A9FF]" />;
      case 'NOTICE_ISSUED':
      case 'COMMITTEE_INSPECTION':
      case 'HEARING_SCHEDULED':
        return <Activity className="w-3.5 h-3.5 text-[#E8B75C]" />;
      case 'INTER_BUREAU_COORDINATED':
        return <ShieldAlert className="w-3.5 h-3.5 text-[#F16D75]" />;
      case 'BUREAU_REASSIGNED':
      case 'CASE_ESCALATED':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-[#A0A7B2]" />;
      case 'CASE_DISPOSED':
        return <CheckCircle className="w-3.5 h-3.5 text-[#69C9A0]" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-[#737D8B]" />;
    }
  };

  const sortedActions = [...actions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (sortedActions.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#737D8B] bg-[#0B0D10] rounded-lg border border-[#272D35]">
        No formal administrative actions recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#272D35]">
      {sortedActions.map(action => (
        <div key={action.actionId} className="relative group">
          {/* Dot / Icon */}
          <div className="absolute -left-6 top-1 p-1 rounded-full bg-[#0B0D10] border border-[#272D35] shadow-sm">
            {getActionIcon(action.actionType)}
          </div>

          <div className="bg-[#161A20] p-3.5 rounded-lg border border-[#272D35] hover:border-[#38414D] transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#E8EAED] tracking-tight">
                  {action.actionType.replace(/_/g, ' ')}
                </span>
                <BureauBadge bureau={action.bureau} size="sm" />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#737D8B] font-mono">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(action.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#E8EAED] leading-relaxed">{action.remarks}</p>

            <div className="mt-2 pt-2 border-t border-[#272D35] flex items-center justify-between text-[11px] text-[#737D8B]">
              <span>Authorized Officer: <strong className="text-[#A0A7B2]">{action.officer}</strong></span>
              <span className="font-mono text-[10px] text-[#737D8B]">ID: {action.actionId}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
