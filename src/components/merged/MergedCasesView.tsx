import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { CaseRecord } from '../../types';
import { StatusBadge, BureauBadge, PriorityBadge } from '../common/StatusBadge';
import { MergeCasesModal } from './MergeCasesModal';
import {
  GitMerge,
  Layers,
  ExternalLink,
  Plus,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  ChevronRight
} from 'lucide-react';

export const MergedCasesView: React.FC = () => {
  const { cases, setSelectedCaseId, setSelectedInstitutionId, setActiveTab, unmergeCase } = useCaseWatch();
  const { user } = useAuth();

  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedPrimaryForModal, setSelectedPrimaryForModal] = useState<string | undefined>(undefined);
  const [unmergingChildId, setUnmergingChildId] = useState<string | null>(null);
  const [unmergeReason, setUnmergeReason] = useState('');

  const primaryCases = useMemo(() => {
    return cases.filter(c => c.mergedCaseIds && c.mergedCaseIds.length > 0);
  }, [cases]);

  const childCases = useMemo(() => {
    return cases.filter(c => c.isMerged);
  }, [cases]);

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
    <div className="space-y-5">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#86A9FF]/10 text-[#86A9FF] border border-[#86A9FF]/30 rounded-lg">
              <GitMerge className="w-5 h-5 text-[#86A9FF]" />
            </span>
            <h2 className="text-lg font-bold text-[#E8EAED]">
              Consolidated & Merged Case Registry
            </h2>
          </div>
          <p className="text-xs text-[#A0A7B2] mt-1">
            Centrally manages duplicate, concurrent, or related complaints consolidated under primary lead dossiers.
            Prevents duplicated regulatory effort while preserving all original audit histories.
          </p>
        </div>

        <button
          onClick={() => handleOpenMerge()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Consolidate / Merge Cases</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#111419] p-4 rounded-lg border border-[#272D35] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Primary Lead Dossiers</span>
            <Layers className="w-4 h-4 text-[#A0A7B2]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#E8EAED] mt-1">
            {primaryCases.length}
          </div>
          <p className="text-[10px] text-[#737D8B] mt-1">Master active regulatory files</p>
        </div>

        <div className="bg-[#111419] p-4 rounded-lg border border-[#272D35] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Consolidated Sub-Complaints</span>
            <GitMerge className="w-4 h-4 text-[#86A9FF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#86A9FF] mt-1">
            {childCases.length}
          </div>
          <p className="text-[10px] text-[#737D8B] mt-1">Secondary cases merged into lead files</p>
        </div>

        <div className="bg-[#111419] p-4 rounded-lg border border-[#272D35] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Duplication Mitigation</span>
            <ShieldCheck className="w-4 h-4 text-[#69C9A0]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#69C9A0] mt-1">
            100%
          </div>
          <p className="text-[10px] text-[#737D8B] mt-1">Cross-bureau redundancy eliminated</p>
        </div>
      </div>

      {/* Primary Case Groups List */}
      {primaryCases.length === 0 ? (
        <div className="p-12 text-center bg-[#111419] rounded-lg border border-[#272D35] shadow-sm">
          <GitMerge className="w-8 h-8 text-[#737D8B] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#E8EAED]">No Cases Currently Merged</h3>
          <p className="text-xs text-[#737D8B] max-w-md mx-auto mt-1 mb-4">
            When multiple students, parents, or staff file complaints regarding the same institutional incident,
            consolidate them into a master dossier to coordinate regulatory proceedings.
          </p>
          <button
            onClick={() => handleOpenMerge()}
            className="px-3.5 py-1.5 bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#E8EAED] rounded-md text-xs font-semibold transition-colors"
          >
            Consolidate Complaints Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {primaryCases.map(primary => {
            const mergedChildren = (primary.mergedCaseIds || [])
              .map(id => caseMap.get(id))
              .filter(Boolean) as CaseRecord[];

            return (
              <div
                key={primary.caseId}
                className="bg-[#161A20] rounded-lg border border-[#272D35] shadow-sm overflow-hidden"
              >
                {/* Primary Case Ribbon */}
                <div className="p-4 sm:p-5 bg-[#111419] border-b border-[#272D35] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#E8EAED]">{primary.caseId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#86A9FF]/10 text-[#86A9FF] border border-[#86A9FF]/30">
                        PRIMARY LEAD DOSSIER
                      </span>
                      <BureauBadge bureau={primary.bureau} size="sm" />
                      <StatusBadge status={primary.status} size="sm" />
                      <PriorityBadge priority={primary.priority} />
                    </div>

                    <h3 className="text-sm font-bold text-[#E8EAED] pt-0.5">
                      {primary.institutionName}{' '}
                      <span className="font-mono text-xs font-normal text-[#A0A7B2]">
                        (PID: {primary.institutionId})
                      </span>
                    </h3>

                    <p className="text-xs text-[#A0A7B2]">
                      <strong className="text-[#E8EAED]">Lead Category:</strong> {primary.category} • Officer: {primary.assignedOfficer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenMerge(primary.caseId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#E8EAED] text-xs font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Merge Another Case</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCaseId(primary.caseId);
                        setActiveTab('registry');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] text-xs font-semibold shadow-sm transition-colors"
                    >
                      <span>Open Dossier</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Consolidated Child Complaints */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-semibold text-[#737D8B] uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <GitMerge className="w-3.5 h-3.5 text-[#86A9FF]" />
                      <span>Consolidated Sub-Complaints ({mergedChildren.length})</span>
                    </h4>
                    <span className="text-[11px] text-[#737D8B]">
                      Regulatory actions on lead case apply concurrently
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {mergedChildren.map(child => (
                      <div
                        key={child.caseId}
                        className="p-3.5 rounded-md border border-[#272D35] bg-[#0B0D10] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#38414D] transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#E8EAED]">{child.caseId}</span>
                            <BureauBadge bureau={child.bureau} size="sm" />
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#161A20] text-[#A0A7B2] border border-[#272D35]">
                              By {child.complainantType}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#E8EAED] truncate">{child.category}</p>
                          <p className="text-[11px] text-[#A0A7B2] line-clamp-1">{child.description}</p>
                          {child.mergeReason && (
                            <p className="text-[10px] text-[#737D8B] font-mono">
                              Consolidation Note: {child.mergeReason}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setUnmergingChildId(child.caseId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#272D35] hover:border-[#F16D75]/40 text-[#A0A7B2] hover:text-[#F16D75] text-[11px] font-medium transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Unmerge</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCaseId(child.caseId);
                              setActiveTab('registry');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#A0A7B2] hover:text-[#E8EAED] text-[11px] font-medium transition-colors"
                          >
                            <span>Dossier</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unmerge Confirmation Modal */}
      {unmergingChildId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090B]/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#161A20] border border-[#272D35] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#E8B75C]/10 text-[#E8B75C] rounded-lg border border-[#E8B75C]/30">
                <AlertCircle className="w-5 h-5 text-[#E8B75C]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#E8EAED]">Unmerge Complaint Proceeding</h3>
                <p className="text-xs text-[#737D8B] font-mono">Dossier: {unmergingChildId}</p>
              </div>
            </div>

            <p className="text-xs text-[#A0A7B2] leading-relaxed">
              This action will restore <strong className="text-[#E8EAED]">{unmergingChildId}</strong> as an independent
              complaint matter with its own administrative status.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#A0A7B2] mb-1">
                Reason for Separation / Unmerging
              </label>
              <textarea
                rows={2}
                value={unmergeReason}
                onChange={e => setUnmergeReason(e.target.value)}
                placeholder="e.g. Complainant provided distinct factual grievances warranting independent hearing..."
                className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#272D35]">
              <button
                onClick={() => setUnmergingChildId(null)}
                className="px-3.5 py-1.5 rounded-md border border-[#272D35] text-[#A0A7B2] hover:bg-[#161A20] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmUnmerge(unmergingChildId)}
                className="px-3.5 py-1.5 rounded-md bg-[#E8B75C] hover:bg-[#E8B75C]/90 text-[#08090B] text-xs font-semibold shadow-sm"
              >
                Confirm Unmerge
              </button>
            </div>
          </div>
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
