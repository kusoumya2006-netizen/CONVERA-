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
        return <Activity className="w-3.5 h-3.5 text-[#737D8B]" />;
    }
  };

  const recentActions = actions.slice(0, 7);

  return (
    <div className="bg-[#111419] rounded-lg border border-[#272D35] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#272D35] bg-[#161A20] flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#E8EAED]">Regulatory Action Stream</h3>
        <span className="text-[10px] text-[#737D8B] font-mono">Live Audit Trail</span>
      </div>
      <div className="divide-y divide-[#272D35]/70 max-h-96 overflow-y-auto">
        {recentActions.map(action => (
          <div
            key={action.actionId}
            onClick={() => setSelectedCaseId(action.caseId)}
            className="p-3 hover:bg-[#161A20] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <div className="flex items-center gap-1.5 font-medium text-[#E8EAED]">
                <span className="p-1 rounded bg-[#0B0D10] border border-[#272D35]">{getActionIcon(action.actionType)}</span>
                <span className="font-mono font-semibold text-[#E8EAED]">{action.caseId}</span>
                <BureauBadge bureau={action.bureau} size="sm" />
              </div>
              <span className="text-[#737D8B] font-mono text-[10px]">
                {new Date(action.timestamp).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <p className="text-xs text-[#A0A7B2] line-clamp-2 pl-6 leading-relaxed">{action.remarks}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
