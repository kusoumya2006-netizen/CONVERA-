import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { BureauBadge } from '../common/StatusBadge';
import { Clock, AlertTriangle, ChevronRight } from 'lucide-react';

export const ApproachingDeadlines: React.FC = () => {
  const { cases, setSelectedCaseId } = useCaseWatch();

  const nowMs = Date.now();

  // Find cases that are active and either overdue or due within 10 days
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
    <div className="bg-obsidian-850 rounded-xl border border-slate-800 shadow-md overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-obsidian-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Urgent SLA & Expected Disposal Deadlines</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Next 10 Days & Overdue</span>
      </div>
      <div className="divide-y divide-slate-800/60">
        {urgentCases.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No urgent SLA deadlines pending.</div>
        ) : (
          urgentCases.map(c => {
            const isOverdue = c.diffDays < 0;
            return (
              <div
                key={c.caseId}
                onClick={() => setSelectedCaseId(c.caseId)}
                className="p-3.5 hover:bg-slate-800/40 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-100">{c.caseId}</span>
                    <BureauBadge bureau={c.bureau} size="sm" />
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        OVERDUE BY {Math.abs(c.diffDays)} DAYS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono">
                        DUE IN {c.diffDays} DAYS
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-300 truncate">{c.institutionName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{c.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
