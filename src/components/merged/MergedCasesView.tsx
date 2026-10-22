import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { CaseRecord } from '../../types';
import { StatusBadge, BureauBadge, PriorityBadge } from '../common/StatusBadge';
import { MergeCasesModal } from './MergeCasesModal';
import {
  GitMerge,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  ShieldCheck,
  AlertCircle,
  Clock,
  UserCheck,
  RotateCcw,
  Building2,
  FileText,
  ChevronRight
} from 'lucide-react';

export const MergedCasesView: React.FC = () => {
  const { cases, setSelectedCaseId, setSelectedInstitutionId, setActiveTab, unmergeCase } = useCaseWatch();
  const { user } = useAuth();

  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedPrimaryForModal, setSelectedPrimaryForModal] = useState<string | undefined>(undefined);
  const [unmergingChildId, setUnmergingChildId] = useState<string | null>(null);
  const [unmergeReason, setUnmergeReason] = useState('');

  // Primary cases are cases that have mergedCaseIds && mergedCaseIds.length > 0
  const primaryCases = useMemo(() => {
    return cases.filter(c => c.mergedCaseIds && c.mergedCaseIds.length > 0);
  }, [cases]);

  // Child cases are cases that have isMerged === true
  const childCases = useMemo(() => {
    return cases.filter(c => c.isMerged);
  }, [cases]);

  // Lookup map for fast case resolution
  const caseMap = useMemo(() => {
    const map = new Map<string, CaseRecord>();
    for (const c of cases) {
      map.set(c.caseId, c);
    }
    return map;
  }, [cases]);

  const handleOpenMerge = (primaryId?: string) => {
    setSelectedPrimaryForModal(primaryId);
    setIsMergeModalOpen(true);
  };

  const handleConfirmUnmerge = (childId: string) => {
    const officerName = user?.displayName || 'Authorized Bureau Officer';
    const reason = unmergeReason.trim() || 'Administrative separation of grievance proceedings';
    unmergeCase(childId, officerName, reason);
    setUnmergingChildId(null);
    setUnmergeReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-950/70 text-blue-300 border border-blue-800/60 rounded-lg">
              <GitMerge className="w-5 h-5 text-blue-400" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Consolidated & Merged Case Registry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manages duplicate, concurrent, or related complaints consolidated under primary lead dossiers.
            Prevents duplicated regulatory effort while preserving all original audit histories.
          </p>
        </div>

        <button
          onClick={() => handleOpenMerge()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Consolidate / Merge Cases</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-obsidian-850 p-4 rounded-lg border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Primary Lead Dossiers</span>
            <Layers className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {primaryCases.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Master active regulatory files</p>
        </div>

        <div className="bg-obsidian-850 p-4 rounded-lg border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Consolidated Sub-Complaints</span>
            <GitMerge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-300 mt-1">
            {childCases.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Secondary cases merged into lead files</p>
        </div>

        <div className="bg-obsidian-850 p-4 rounded-lg border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Duplication Mitigation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            100%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Cross-bureau redundancy eliminated</p>
        </div>
      </div>

      {/* Primary Case Groups List */}
      {primaryCases.length === 0 ? (
        <div className="p-12 text-center bg-obsidian-850 rounded-lg border border-slate-800 shadow-sm">
          <GitMerge className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No Cases Currently Merged</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            When multiple students, parents, or staff file complaints regarding the same institutional incident,
            consolidate them into a master dossier to coordinate regulatory proceedings.
          </p>
          <button
            onClick={() => handleOpenMerge()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Consolidate Your First Duplicate Complaint
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {primaryCases.map(prim => {
            const children = (prim.mergedCaseIds || [])
              .map(id => caseMap.get(id))
              .filter(Boolean) as CaseRecord[];

            return (
              <div
                key={prim.caseId}
                className="bg-obsidian-850 rounded-lg border border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Lead / Primary Case Card Header */}
                <div className="p-4 bg-obsidian-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/70 text-blue-300 border border-blue-800/60 uppercase tracking-wide">
                        Lead Primary Case
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-100">
                        {prim.caseId}
                      </span>
                      <BureauBadge bureau={prim.bureau} size="sm" />
                      <StatusBadge status={prim.status} size="sm" />
                      <PriorityBadge priority={prim.priority} />
                    </div>
                    <div className="text-xs font-bold text-slate-200">
                      {prim.category} — {prim.institutionName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenMerge(prim.caseId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Merge Another Case</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCaseId(prim.caseId);
                        setActiveTab('registry');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <span>View Lead Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-Complaints Consolidated Table */}
                <div className="p-4 bg-obsidian-850">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GitMerge className="w-3.5 h-3.5 text-blue-400" />
                    <span>Consolidated Linked Complaints ({children.length})</span>
                  </h4>

                  <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-lg overflow-hidden">
                    {children.map(child => {
                      const mergeDateFormatted = child.mergedAt
                        ? new Date(child.mergedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Recorded';

                      return (
                        <div
                          key={child.caseId}
                          className="p-3 bg-obsidian-900/40 hover:bg-obsidian-900/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 max-w-xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-slate-100">
                                {child.caseId}
                              </span>
                              <BureauBadge bureau={child.bureau} size="sm" />
                              <span className="text-[11px] text-slate-400">
                                Filed by: <strong className="text-slate-200">{child.complainantType}</strong>
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                • PID: {child.institutionId}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 font-medium line-clamp-1">
                              {child.description}
                            </p>

                            {/* Merge Details Banner */}
                            <div className="p-2 bg-blue-950/40 border border-blue-900/60 rounded text-[11px] text-blue-200 flex flex-col sm:flex-row sm:items-center gap-2">
                              <span>
                                <strong>Reason for Merge:</strong> {child.mergeReason || 'Duplicate grievance on identical subject matter'}
                              </span>
                              <span className="text-blue-300 sm:ml-auto shrink-0">
                                Merged on {mergeDateFormatted} by <strong>{child.mergedBy || 'Regulatory Officer'}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons for Child Case */}
                          <div className="flex items-center gap-2 shrink-0">
                            {unmergingChildId === child.caseId ? (
                              <div className="flex items-center gap-2 p-2 bg-amber-950/40 border border-amber-800/80 rounded">
                                <input
                                  type="text"
                                  value={unmergeReason}
                                  onChange={e => setUnmergeReason(e.target.value)}
                                  placeholder="Reason to unmerge..."
                                  className="px-2 py-1 bg-obsidian-950 border border-slate-700 text-slate-100 rounded text-[11px] w-40"
                                />
                                <button
                                  onClick={() => handleConfirmUnmerge(child.caseId)}
                                  className="px-2 py-1 bg-amber-900 hover:bg-amber-800 text-white rounded text-[10px] font-bold"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setUnmergingChildId(null)}
                                  className="px-2 py-1 bg-obsidian-900 border border-slate-700 text-slate-300 rounded text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setUnmergingChildId(child.caseId)}
                                title="Separate this complaint from the primary dossier if independent action is required"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 text-[11px] font-medium"
                              >
                                <RotateCcw className="w-3 h-3 text-slate-400" />
                                <span>Unmerge</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedCaseId(child.caseId);
                                setActiveTab('registry');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-[11px] font-semibold"
                            >
                              <span>Dossier</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Merge Modal */}
      <MergeCasesModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        defaultPrimaryCaseId={selectedPrimaryForModal}
      />
    </div>
  );
};
