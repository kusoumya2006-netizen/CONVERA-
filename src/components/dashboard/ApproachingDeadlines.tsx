import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { BureauBadge } from '../common/StatusBadge';
import { Clock, AlertTriangle } from 'lucide-react';

export const ApproachingDeadlines: React.FC = () => {
  const { cases, setSelectedCaseId } = useCaseWatch();

  const nowMs = Date.now();

  const urgentCases = cases
    .filter(c => c.status !== 'Disposed')
    .map(c => {
      const dueMs = new Date(c.expectedDisposalDate).getTime();
      const diffDays = Math.ceil((dueMs - nowMs) / (1000 * 60 * 60 * 24));
      return { ...c, diffDays };
    })
    .filter(c => c.diffDays <= 12)
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 5);

  return (
    <div className="bg-[#111419] rounded-lg border border-[#272D35] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#272D35] bg-[#161A20] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#E8B75C]" />
          <h3 className="text-sm font-bold text-[#E8EAED]">Urgent SLA Deadlines</h3>
        </div>
        <span className="text-[10px] font-mono text-[#737D8B]">Next 10 Days & Overdue</span>
      </div>
      <div className="divide-y divide-[#272D35]/70">
        {urgentCases.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#737D8B]">No urgent SLA deadlines pending.</div>
        ) : (
          urgentCases.map(c => {
            const isOverdue = c.diffDays < 0;
            return (
              <div
                key={c.caseId}
                onClick={() => setSelectedCaseId(c.caseId)}
                className="p-3 hover:bg-[#161A20] flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#E8EAED]">{c.caseId}</span>
                    <BureauBadge bureau={c.bureau} size="sm" />
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#F16D75]/15 text-[#F16D75] border border-[#F16D75]/35">
                        <AlertTriangle className="w-3 h-3 text-[#F16D75]" />
                        OVERDUE {Math.abs(c.diffDays)}D
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E8B75C]/10 text-[#E8B75C] border border-[#E8B75C]/30">
                        DUE IN {c.diffDays}D
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#E8EAED] truncate">{c.institutionName}</p>
                  <p className="text-[11px] text-[#A0A7B2] truncate">{c.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
