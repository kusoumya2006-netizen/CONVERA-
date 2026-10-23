import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { sortCasesByPriorityScore, PriorityLevel } from '../../engine/priorityEngine';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  GitCompare,
  Share2,
  ChevronRight,
  ShieldAlert,
  Flame,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const PriorityActionQueue: React.FC = () => {
  const { cases, alerts, setSelectedCaseId, setActiveTab, navigateToGraph } = useCaseWatch();
  const [levelFilter, setLevelFilter] = useState<'ALL' | PriorityLevel>('ALL');

  // Compute prioritized cases excluding disposed matters
  const activeCases = cases.filter(c => c.status !== 'Disposed');
  const prioritizedList = sortCasesByPriorityScore(activeCases, alerts);

  const filteredList = levelFilter === 'ALL'
    ? prioritizedList
    : prioritizedList.filter(item => item.analysis.level === levelFilter);

  const criticalCount = prioritizedList.filter(i => i.analysis.level === 'CRITICAL').length;
  const highCount = prioritizedList.filter(i => i.analysis.level === 'HIGH').length;

  const topItems = filteredList.slice(0, 5);

  return (
    <div className="bg-[#111419] rounded-lg border border-[#272D35] p-5 shadow-sm space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272D35]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-[#F16D75]/10 border border-[#F16D75]/30 text-[#F16D75]">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#E8EAED]">
                Priority Action Queue — Urgent Matters
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F16D75]/20 text-[#F16D75] border border-[#F16D75]/40">
                {criticalCount} Critical
              </span>
              {highCount > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFC759]/20 text-[#FFC759] border border-[#FFC759]/40">
                  {highCount} High
                </span>
              )}
            </div>
            <p className="text-xs text-[#A0A7B2] mt-0.5">
              Explainable priority rankings derived from statutory deadlines, inter-bureau overlaps, and stalled next actions.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                levelFilter === lvl
                  ? 'bg-[#1C2129] text-[#E8EAED] border border-[#A3B86C]'
                  : 'text-[#737D8B] hover:text-[#E8EAED] hover:bg-[#161A20] border border-transparent'
              }`}
            >
              {lvl === 'ALL' ? 'Top Items' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Item Cards */}
      {topItems.length === 0 ? (
        <div className="p-8 text-center bg-[#0B0D10] rounded-md border border-[#272D35]">
          <CheckCircle className="w-8 h-8 text-[#69C9A0] mx-auto mb-2 opacity-80" />
          <p className="text-xs font-semibold text-[#E8EAED]">No Urgent Backlog</p>
          <p className="text-[11px] text-[#737D8B] mt-0.5">All active proceedings are within statutory SLA limits.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topItems.map(({ caseRecord, analysis }) => {
            const isCritical = analysis.level === 'CRITICAL';
            const isHigh = analysis.level === 'HIGH';

            return (
              <div
                key={caseRecord.caseId}
                className={`p-4 rounded-lg bg-[#0B0D10] border transition-all hover:border-[#A3B86C]/40 ${
                  isCritical
                    ? 'border-l-4 border-l-[#F16D75] border-y-[#272D35] border-r-[#272D35]'
                    : isHigh
                    ? 'border-l-4 border-l-[#FFC759] border-y-[#272D35] border-r-[#272D35]'
                    : 'border-[#272D35]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Left: Case Info & Factors */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#E8EAED]">
                        {caseRecord.caseId}
                      </span>
                      <span className="text-xs text-[#737D8B]">•</span>
                      <span className="text-xs text-[#A0A7B2] truncate max-w-[280px]">
                        {caseRecord.institutionName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#161A20] border border-[#272D35] text-[#A0A7B2]">
                        {caseRecord.bureau}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${analysis.badgeClass}`}>
                        SCORE {analysis.score} — {analysis.level}
                      </span>
                    </div>

                    {/* Contributing Factors Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {analysis.factors.map((factor, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#161A20] border border-[#272D35] text-[#A0A7B2]"
                          title={factor.detail}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              factor.impact === 'CRITICAL'
                                ? 'bg-[#F16D75]'
                                : factor.impact === 'HIGH'
                                ? 'bg-[#FFC759]'
                                : 'bg-[#86A9FF]'
                            }`}
                          />
                          <span>{factor.label}</span>
                          <span className="font-mono text-[9px] text-[#737D8B]">(+{factor.scoreContribution})</span>
                        </span>
                      ))}
                    </div>

                    {/* Recommended Next Action Derived from Engine */}
                    <div className="p-2.5 rounded bg-[#161A20]/80 border border-[#272D35] text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#A3B86C] font-mono block">
                        Recommended Next Step:
                      </span>
                      <p className="text-[#E8EAED] text-xs mt-0.5 font-medium leading-relaxed">
                        {analysis.recommendedNextAction}
                      </p>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center md:flex-col gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => {
                        setSelectedCaseId(caseRecord.caseId);
                        setActiveTab('registry');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#E8EAED] text-xs font-semibold transition-colors"
                    >
                      <span>Open Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#737D8B]" />
                    </button>
                    <button
                      onClick={() => navigateToGraph({ type: 'case', id: caseRecord.caseId })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#A3B86C] text-xs font-medium transition-colors"
                      title="Inspect connections in Cross-Bureau Intelligence Graph"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>View in Graph</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer link to view full registry sorted by priority */}
      <div className="flex items-center justify-between pt-2 border-t border-[#272D35] text-xs text-[#737D8B]">
        <span>Ranked deterministically across {activeCases.length} active regulatory proceedings.</span>
        <button
          onClick={() => setActiveTab('registry')}
          className="text-xs text-[#A3B86C] hover:underline inline-flex items-center gap-1 font-medium"
        >
          <span>View All in Case Registry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
