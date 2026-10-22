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
            <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
              <GitMerge className="w-5 h-5 text-blue-700" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Consolidated & Merged Case Registry
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manages duplicate, concurrent, or related complaints consolidated under primary lead dossiers.
            Prevents duplicated regulatory effort while preserving all original audit histories.
          </p>
        </div>

        <button
          onClick={() => handleOpenMerge()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gov-olive hover:bg-gov-olive-light text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Consolidate / Merge Cases</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Primary Lead Dossiers</span>
            <Layers className="w-4 h-4 text-gov-olive" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {primaryCases.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Master active regulatory files</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Consolidated Sub-Complaints</span>
            <GitMerge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
            {childCases.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Secondary cases merged into lead files</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Duplication Mitigation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            100%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Cross-bureau redundancy eliminated</p>
        </div>
      </div>

      {/* Primary Case Groups List */}
      {primaryCases.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-slate-200 shadow-sm">
          <GitMerge className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Cases Currently Merged</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            When multiple students, parents, or staff file complaints regarding the same institutional incident,
            consolidate them into a master dossier to coordinate regulatory proceedings.
          </p>
          <button
            onClick={() => handleOpenMerge()}
            className="px-4 py-2 bg-gov-olive text-white rounded-lg text-xs font-semibold hover:bg-gov-olive-light"
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
                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Lead / Primary Case Card Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wide">
                        Lead Primary Case
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {prim.caseId}
                      </span>
                      <BureauBadge bureau={prim.bureau} size="sm" />
                      <StatusBadge status={prim.status} size="sm" />
                      <PriorityBadge priority={prim.priority} />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {prim.category} — {prim.institutionName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenMerge(prim.caseId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Merge Another Case</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCaseId(prim.caseId);
                        setActiveTab('registry');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-gov-olive hover:bg-gov-olive-light text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <span>View Lead Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-Complaints Consolidated Table */}
                <div className="p-4 bg-white">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GitMerge className="w-3.5 h-3.5 text-blue-600" />
                    <span>Consolidated Linked Complaints ({children.length})</span>
                  </h4>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
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
                          className="p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 max-w-xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">
                                {child.caseId}
                              </span>
                              <BureauBadge bureau={child.bureau} size="sm" />
                              <span className="text-[11px] text-slate-500">
                                Filed by: <strong className="text-slate-700">{child.complainantType}</strong>
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                • PID: {child.institutionId}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-700 font-medium line-clamp-1">
                              {child.description}
                            </p>

                            {/* Merge Details Banner */}
                            <div className="p-2 bg-blue-50/70 border border-blue-100 rounded text-[11px] text-blue-900 flex flex-col sm:flex-row sm:items-center gap-2">
                              <span>
                                <strong>Reason for Merge:</strong> {child.mergeReason || 'Duplicate grievance on identical subject matter'}
                              </span>
                              <span className="text-blue-700 sm:ml-auto shrink-0">
                                Merged on {mergeDateFormatted} by <strong>{child.mergedBy || 'Regulatory Officer'}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons for Child Case */}
                          <div className="flex items-center gap-2 shrink-0">
                            {unmergingChildId === child.caseId ? (
                              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
                                <input
                                  type="text"
                                  value={unmergeReason}
                                  onChange={e => setUnmergeReason(e.target.value)}
                                  placeholder="Reason to unmerge..."
                                  className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] w-40"
                                />
                                <button
                                  onClick={() => handleConfirmUnmerge(child.caseId)}
                                  className="px-2 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded text-[10px] font-bold"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setUnmergingChildId(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setUnmergingChildId(child.caseId)}
                                title="Separate this complaint from the primary dossier if independent action is required"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-medium"
                              >
                                <RotateCcw className="w-3 h-3 text-slate-500" />
                                <span>Unmerge</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedCaseId(child.caseId);
                                setActiveTab('registry');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold"
                            >
                              <span>Dossier</span>
                              <ExternalLink className="w-3 h-3 text-slate-500" />
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
