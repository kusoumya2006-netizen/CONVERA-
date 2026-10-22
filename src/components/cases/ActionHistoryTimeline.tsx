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
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'NOTICE_ISSUED':
      case 'COMMITTEE_INSPECTION':
      case 'HEARING_SCHEDULED':
        return <Activity className="w-4 h-4 text-amber-600" />;
      case 'INTER_BUREAU_COORDINATED':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'BUREAU_REASSIGNED':
      case 'CASE_ESCALATED':
        return <ArrowRightLeft className="w-4 h-4 text-purple-600" />;
      case 'CASE_DISPOSED':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-600" />;
    }
  };

  const sortedActions = [...actions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (sortedActions.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-obsidian-950 rounded-lg border border-slate-800">
        No formal administrative actions recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {sortedActions.map(action => (
        <div key={action.actionId} className="relative group">
          {/* Dot / Icon */}
          <div className="absolute -left-6 top-1 p-1 rounded-full bg-obsidian-950 border border-slate-700 shadow-sm">
            {getActionIcon(action.actionType)}
          </div>

          <div className="bg-obsidian-900 p-3.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 tracking-tight">
                  {action.actionType.replace(/_/g, ' ')}
                </span>
                <BureauBadge bureau={action.bureau} size="sm" />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
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

            <p className="text-xs text-slate-200 leading-relaxed">{action.remarks}</p>

            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Authorized Officer: <strong className="text-slate-200">{action.officer}</strong></span>
              <span className="font-mono text-[10px] text-slate-500">ID: {action.actionId}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
