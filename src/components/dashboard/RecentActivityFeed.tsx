import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { BureauBadge } from '../common/StatusBadge';
import { Activity, ShieldAlert, FileText, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { ActionType } from '../../types';

export const RecentActivityFeed: React.FC = () => {
  const { actions, setSelectedCaseId } = useCaseWatch();

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'CASE_FILED':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'NOTICE_ISSUED':
      case 'COMMITTEE_INSPECTION':
      case 'HEARING_SCHEDULED':
        return <Activity className="w-3.5 h-3.5 text-amber-600" />;
      case 'INTER_BUREAU_COORDINATED':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'BUREAU_REASSIGNED':
      case 'CASE_ESCALATED':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />;
      case 'CASE_DISPOSED':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const recentActions = actions.slice(0, 7);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Recent Regulatory Action Stream</h3>
        <span className="text-[11px] text-slate-500">Live Audit Trail</span>
      </div>
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {recentActions.map(action => (
          <div
            key={action.actionId}
            onClick={() => setSelectedCaseId(action.caseId)}
            className="p-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="p-1 rounded bg-slate-100">{getActionIcon(action.actionType)}</span>
                <span className="font-mono font-semibold text-slate-900">{action.caseId}</span>
                <BureauBadge bureau={action.bureau} size="sm" />
              </div>
              <span className="text-slate-400">
                {new Date(action.timestamp).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="text-xs text-slate-800 line-clamp-2 pl-6">{action.remarks}</p>
            <p className="text-[10px] text-slate-400 pl-6 mt-1">Officer: {action.officer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
