import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { BureauBadge, PriorityBadge, StatusBadge } from '../common/StatusBadge';
import { calculateDeterministicUrgency } from '../../engine/urgencyCalculator';
import {
  Clock,
  AlertTriangle,
  ChevronRight,
  UserX,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';

type CommandTab = 'OVERDUE' | 'DUE_SOON' | 'APPROACHING' | 'CRITICAL' | 'UNASSIGNED';

export const ApproachingDeadlines: React.FC = () => {
  const { cases, alerts, setSelectedCaseId, setActiveTab } = useCaseWatch();
  const [activeTabFilter, setActiveTabFilter] = useState<CommandTab>('OVERDUE');

  // Build active overlap cases lookup
  const activeOverlapCaseIds = new Set<string>();
  alerts
    .filter(a => a.reviewStatus === 'PENDING_REVIEW')
    .forEach(a => a.caseIds.forEach(id => activeOverlapCaseIds.add(id)));

  // Exclude disposed cases from active command centre
  const activeCases = cases
    .filter(c => c.status !== 'Disposed')
    .map(c => ({
      ...c,
      analysis: calculateDeterministicUrgency(c, activeOverlapCaseIds)
    }));

  const overdueList = activeCases.filter(c => c.analysis.isOverdue);
  const dueSoonList = activeCases.filter(c => !c.analysis.isOverdue && (c.analysis.isDueToday || c.analysis.daysUntilDue <= 2));
  const approachingList = activeCases.filter(c => c.analysis.isApproaching && c.analysis.daysUntilDue > 2);
  const criticalList = activeCases.filter(c => c.priority === 'CRITICAL' || c.status === 'Escalated');
  const unassignedList = activeCases.filter(c => c.analysis.isUnassigned);

  const getFilteredList = () => {
    switch (activeTabFilter) {
      case 'OVERDUE':
        return overdueList;
      case 'DUE_SOON':
        return dueSoonList;
      case 'APPROACHING':
        return approachingList;
      case 'CRITICAL':
        return criticalList;
      case 'UNASSIGNED':
        return unassignedList;
    }
  };

  const displayedList = getFilteredList().sort((a, b) => b.analysis.urgencyScore - a.analysis.urgencyScore).slice(0, 6);

  return (
    <div className="bg-[#111419] rounded-lg border border-[#272D35] shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header with Title and Mode */}
      <div className="p-3.5 border-b border-[#272D35] bg-[#161A20] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#E8B75C]" />
          <h3 className="text-xs font-bold text-[#E8EAED] uppercase tracking-wider font-mono">
            Action Priority Command Centre
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#737D8B]">Deterministic Urgency Queue</span>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-1 p-2 bg-[#0B0D10] border-b border-[#272D35] overflow-x-auto text-[11px] font-mono">
        <button
          onClick={() => setActiveTabFilter('OVERDUE')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTabFilter === 'OVERDUE'
              ? 'bg-[#F16D75]/15 text-[#F16D75] border border-[#F16D75]/35 font-bold'
              : 'text-[#737D8B] hover:text-[#A0A7B2]'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Overdue</span>
          <span className="px-1 py-0.2 rounded text-[10px] bg-[#161A20] text-[#E8EAED]">
            {overdueList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTabFilter('DUE_SOON')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTabFilter === 'DUE_SOON'
              ? 'bg-[#E8B75C]/15 text-[#E8B75C] border border-[#E8B75C]/35 font-bold'
              : 'text-[#737D8B] hover:text-[#A0A7B2]'
          }`}
        >
          <span>Due &lt;48h</span>
          <span className="px-1 py-0.2 rounded text-[10px] bg-[#161A20] text-[#E8EAED]">
            {dueSoonList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTabFilter('APPROACHING')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTabFilter === 'APPROACHING'
              ? 'bg-[#86A9FF]/15 text-[#86A9FF] border border-[#86A9FF]/35 font-bold'
              : 'text-[#737D8B] hover:text-[#A0A7B2]'
          }`}
        >
          <span>&lt;7 Days</span>
          <span className="px-1 py-0.2 rounded text-[10px] bg-[#161A20] text-[#E8EAED]">
            {approachingList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTabFilter('CRITICAL')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTabFilter === 'CRITICAL'
              ? 'bg-[#A3B86C]/15 text-[#A3B86C] border border-[#A3B86C]/35 font-bold'
              : 'text-[#737D8B] hover:text-[#A0A7B2]'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>Critical</span>
          <span className="px-1 py-0.2 rounded text-[10px] bg-[#161A20] text-[#E8EAED]">
            {criticalList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTabFilter('UNASSIGNED')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTabFilter === 'UNASSIGNED'
              ? 'bg-[#161A20] text-[#E8EAED] border border-[#38414D] font-bold'
              : 'text-[#737D8B] hover:text-[#A0A7B2]'
          }`}
        >
          <UserX className="w-3 h-3" />
          <span>Unassigned</span>
          <span className="px-1 py-0.2 rounded text-[10px] bg-[#161A20] text-[#E8EAED]">
            {unassignedList.length}
          </span>
        </button>
      </div>

      {/* Case List Display */}
      <div className="divide-y divide-[#272D35]/70 flex-1 overflow-y-auto">
        {displayedList.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#737D8B] space-y-1">
            <p className="text-[#A0A7B2] font-semibold">No cases in this queue.</p>
            <p className="text-[11px]">All deadlines in this category are currently satisfied.</p>
          </div>
        ) : (
          displayedList.map(c => {
            const isOverdue = c.analysis.isOverdue;

            return (
              <div
                key={c.caseId}
                onClick={() => {
                  setSelectedCaseId(c.caseId);
                  setActiveTab('registry');
                }}
                className="p-3 hover:bg-[#161A20] flex items-start justify-between gap-3 cursor-pointer transition-colors group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#E8EAED] group-hover:text-white">
                      {c.caseId}
                    </span>
                    <BureauBadge bureau={c.bureau} size="sm" />
                    <PriorityBadge priority={c.priority} size="sm" />
                    
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#F16D75]/15 text-[#F16D75] border border-[#F16D75]/35">
                        <AlertTriangle className="w-2.5 h-2.5 text-[#F16D75]" />
                        OVERDUE {Math.abs(c.analysis.daysUntilDue)}D
                      </span>
                    ) : c.analysis.isDueToday ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E8B75C]/15 text-[#E8B75C] border border-[#E8B75C]/35">
                        DUE TODAY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#161A20] text-[#A0A7B2] border border-[#272D35]">
                        Due in {c.analysis.daysUntilDue}d
                      </span>
                    )}

                    {c.analysis.hasPendingOverlap && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F16D75]/10 text-[#F16D75] border border-[#F16D75]/30">
                        Overlap Alert
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-[#E8EAED] truncate">
                    {c.institutionName}
                  </p>

                  <div className="text-[11px] text-[#A0A7B2] flex items-center gap-1 truncate">
                    <span className="text-[#737D8B] font-mono">Next:</span>
                    <span>{c.nextAction || c.lastAction}</span>
                  </div>

                  <div className="pt-0.5 text-[10px] font-mono text-[#737D8B] flex items-center justify-between">
                    <span className="text-[#A3B86C] truncate">
                      Basis: {c.analysis.primaryReason.split('•')[0]}
                    </span>
                    <span className="text-[#A0A7B2] shrink-0">
                      Officer: {c.assignedOfficer.split('(')[0]}
                    </span>
                  </div>
                </div>

                <div className="self-center pl-1 text-[#737D8B] group-hover:text-[#A3B86C] transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Strip */}
      <div className="p-2.5 bg-[#0B0D10] border-t border-[#272D35] flex items-center justify-between text-[11px] font-mono text-[#737D8B]">
        <span>Total Active In Queue: {displayedList.length}</span>
        <button
          onClick={() => setActiveTab('registry')}
          className="text-[#A3B86C] hover:text-[#B7CA82] font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Open Full Registry</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
