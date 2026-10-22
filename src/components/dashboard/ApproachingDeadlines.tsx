import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { BureauBadge, PriorityBadge, UrgencyBadgeView } from '../common/StatusBadge';
import { calculateDeterministicUrgency, compareCasesByUrgency } from '../../engine/urgencyCalculator';
import {
  Clock,
  AlertTriangle,
  ChevronRight,
  UserX,
  Flame,
  ArrowRight,
  ListOrdered
} from 'lucide-react';

type CommandTab = 'OVERDUE' | 'DUE_24H' | 'APPROACHING' | 'CRITICAL' | 'ALL_RANKED';

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
      analysis: calculateDeterministicUrgency(c, activeOverlapCaseIds),
      urgency: calculateDeterministicUrgency(c, activeOverlapCaseIds)
    }));

  const overdueList = activeCases.filter(c => c.analysis.isOverdue);
  const due24hList = activeCases.filter(c => !c.analysis.isOverdue && c.analysis.isDueWithin24h);
  const approachingList = activeCases.filter(c => !c.analysis.isOverdue && !c.analysis.isDueWithin24h && c.analysis.isApproaching);
  const criticalList = activeCases.filter(c => c.priority === 'CRITICAL' || c.status === 'Escalated');
  const allRankedList = [...activeCases].sort(compareCasesByUrgency);

  const getFilteredList = () => {
    switch (activeTabFilter) {
      case 'OVERDUE':
        return [...overdueList].sort(compareCasesByUrgency);
      case 'DUE_24H':
        return [...due24hList].sort(compareCasesByUrgency);
      case 'APPROACHING':
        return [...approachingList].sort(compareCasesByUrgency);
      case 'CRITICAL':
        return [...criticalList].sort(compareCasesByUrgency);
      case 'ALL_RANKED':
        return allRankedList;
    }
  };

  const displayedList = getFilteredList().slice(0, 6);

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
          onClick={() => setActiveTabFilter('DUE_24H')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTabFilter === 'DUE_24H'
              ? 'bg-[#E8B75C]/15 text-[#E8B75C] border border-[#E8B75C]/35 font-bold'
              : 'text-[#737D8B] hover:text-[#A0A7B2]'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Due &le;24h</span>
          <span className="px-1 py-0.2 rounded text-[10px] bg-[#161A20] text-[#E8EAED]">
            {due24hList.length}
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
          <span>&le;7 Days</span>
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
          onClick={() => setActiveTabFilter('ALL_RANKED')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTabFilter === 'ALL_RANKED'
              ? 'bg-[#161A20] text-[#E8EAED] border border-[#38414D] font-bold'
              : 'text-[#737D8B] hover:text-[#A0A7B2]'
          }`}
        >
          <ListOrdered className="w-3 h-3" />
          <span>Priority Queue</span>
          <span className="px-1 py-0.2 rounded text-[10px] bg-[#161A20] text-[#E8EAED]">
            {allRankedList.length}
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
                    
                    {/* Feature 2: Explainable Urgency Badge with Countdown */}
                    <UrgencyBadgeView analysis={c.analysis} size="sm" showCountdown />

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
                    <span className="text-[#A3B86C] truncate" title={c.analysis.indicatorText}>
                      Reason: {c.analysis.indicatorText}
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
        <span>Showing {displayedList.length} of {allRankedList.length} Active Cases</span>
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
