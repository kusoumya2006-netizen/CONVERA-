import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { StatusBadge, BureauBadge, PriorityBadge } from '../common/StatusBadge';
import { ActionHistoryTimeline } from './ActionHistoryTimeline';
import { ActionFormModal } from './ActionFormModal';
import { ReopenCaseModal } from './ReopenCaseModal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  UserCheck,
  Building2,
  AlertTriangle,
  GitCompare,
  Edit3,
  ExternalLink,
  ShieldCheck,
  FileText,
  RotateCcw,
  CheckCircle2,
  GitMerge,
  Layers
} from 'lucide-react';

export const CaseDetailView: React.FC = () => {
  const {
    selectedCaseId,
    setSelectedCaseId,
    cases,
    actions,
    institutions,
    alerts,
    setActiveTab,
    setSelectedInstitutionId
  } = useCaseWatch();

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  if (!selectedCaseId) return null;

  const caseRecord = cases.find(c => c.caseId === selectedCaseId);
  if (!caseRecord) {
    return (
      <div className="p-8 text-center bg-obsidian-850 rounded-lg border border-slate-800">
        <p className="text-slate-400">Case not found.</p>
        <button
          onClick={() => setSelectedCaseId(null)}
          className="mt-3 px-4 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs"
        >
          Back to Registry
        </button>
      </div>
    );
  }

  const institution = institutions.find(i => i.institutionId === caseRecord.institutionId);
  const caseActions = actions.filter(a => a.caseId === caseRecord.caseId);

  // Check if this case is part of any active overlap alert
  const matchingAlert = alerts.find(
    a => a.caseIds.includes(caseRecord.caseId) && a.reviewStatus !== 'DISMISSED'
  );

  const nowMs = Date.now();
  const dueMs = new Date(caseRecord.expectedDisposalDate).getTime();
  const diffDays = Math.ceil((dueMs - nowMs) / (1000 * 60 * 60 * 24));
  const isOverdue = caseRecord.status !== 'Disposed' && diffDays < 0;

  return (
    <div className="space-y-6">
      {/* Top Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => setSelectedCaseId(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Registry</span>
        </button>

        <div className="flex items-center gap-2">
          {caseRecord.status === 'Disposed' && (
            <button
              onClick={() => setIsReopenModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-800/80 bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reopen Case</span>
            </button>
          )}

          <button
            onClick={() => setIsActionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Record Action / Update Status</span>
          </button>
        </div>
      </div>

      {/* Merged Child Alert Banner */}
      {caseRecord.isMerged && caseRecord.mergedIntoCaseId && (
        <div className="p-4 rounded-lg bg-blue-950/60 border border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <GitMerge className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wide">
                Consolidated Complaint Notice
              </h4>
              <p className="text-xs text-blue-300/90 mt-0.5">
                This grievance has been merged into master lead case{' '}
                <strong className="font-mono text-white">{caseRecord.mergedIntoCaseId}</strong>.
                {caseRecord.mergeReason && ` Reason: ${caseRecord.mergeReason}.`}
                {caseRecord.mergedBy && ` Merged by ${caseRecord.mergedBy}.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCaseId(caseRecord.mergedIntoCaseId!)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shrink-0"
          >
            <span>Open Primary Dossier</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Historical Reopened Banner if previously disposed */}
      {caseRecord.reopenedAt && (
        <div className="p-4 rounded-lg bg-amber-950/50 border border-amber-800/70 flex items-start gap-2.5">
          <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wide">
              Proceeding Reopened from Prior Disposal
            </h4>
            <p className="text-xs text-amber-300/90 mt-0.5">
              Reopened on {new Date(caseRecord.reopenedAt).toLocaleDateString('en-IN')} by{' '}
              <strong className="text-white">{caseRecord.reopenedBy}</strong>. Ground:{' '}
              <em>"{caseRecord.reopenReason}"</em>
            </p>
          </div>
        </div>
      )}

      {/* Overlap Warning Box if involved */}
      {matchingAlert && (
        <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <GitCompare className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wide">
                Concurrent Cross-Bureau Proceeding Warning
              </h4>
              <p className="text-xs text-rose-300/90 mt-0.5">{matchingAlert.reason}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('overlaps')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold shrink-0"
          >
            <span>Open Coordination Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Disposed Resolution Card (P1 Requirement) */}
      {caseRecord.status === 'Disposed' && (
        <div className="p-5 rounded-lg bg-emerald-950/40 border border-emerald-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/60 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-emerald-200">
                  Case Disposal & Resolution Record
                </h3>
                <p className="text-[11px] text-emerald-400/80">
                  Formally closed upon satisfactory verification of compliance and grievance redressal.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Completed On</span>
              <span className="font-mono text-xs font-bold text-emerald-200">
                {caseRecord.completedAt
                  ? new Date(caseRecord.completedAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : new Date(caseRecord.lastActionAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Completed By</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-200 mt-0.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>{caseRecord.completedBy || caseRecord.assignedOfficer}</span>
              </div>
              {caseRecord.completedByOfficerId && (
                <span className="font-mono text-[10px] text-emerald-400 block">
                  Officer ID: {caseRecord.completedByOfficerId}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Disposal Target Metric</span>
              <span className="font-semibold text-emerald-200 mt-0.5 block">
                Closed within regulatory turnaround period ({caseRecord.bureau})
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-800/60">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
              Final Official Resolution Summary
            </span>
            <div className="p-3 bg-obsidian-950 rounded-lg border border-emerald-900/60 text-xs text-emerald-200 leading-relaxed font-medium">
              {caseRecord.resolutionSummary || caseRecord.lastAction}
            </div>
          </div>
        </div>
      )}

      {/* Main Dossier Card */}
      <div className="bg-obsidian-850 rounded-lg border border-slate-800 shadow-sm overflow-hidden">
        {/* Header Ribbon */}
        <div className="p-6 border-b border-slate-800 bg-obsidian-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="font-mono text-base font-bold text-slate-100">{caseRecord.caseId}</span>
              <BureauBadge bureau={caseRecord.bureau} />
              <StatusBadge status={caseRecord.status} />
              <PriorityBadge priority={caseRecord.priority} />
            </div>
            <h2 className="text-base font-bold text-slate-100">{caseRecord.category}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Received on {new Date(caseRecord.receivedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} by {caseRecord.complainantType}
            </p>
          </div>

          {/* SLA Pill */}
          <div className="p-3.5 bg-obsidian-950 rounded-lg border border-slate-800 text-right min-w-[180px]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Expected Disposal Target</span>
            <span className={`font-mono text-sm font-bold block mt-0.5 ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
              {caseRecord.expectedDisposalDate ? caseRecord.expectedDisposalDate.split('T')[0] : 'N/A'}
            </span>
            <span className={`text-[10px] font-semibold inline-block px-1.5 py-0.5 rounded mt-1 ${
              caseRecord.status === 'Disposed'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                : isOverdue
                ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60 font-bold'
                : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
            }`}>
              {caseRecord.status === 'Disposed'
                ? 'Resolved'
                : isOverdue
                ? `Overdue by ${Math.abs(diffDays)} Days`
                : `Target in ${diffDays} Days`}
            </span>
          </div>
        </div>

        {/* Institution Info & Metadata Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Technical Institution
            </span>
            <div
              className="text-sm font-bold text-slate-100 hover:text-slate-300 cursor-pointer"
              onClick={() => {
                setSelectedInstitutionId(caseRecord.institutionId);
                setActiveTab('institutions');
              }}
            >
              {institution?.name || caseRecord.institutionName}
            </div>
            <p className="text-xs text-slate-400 font-mono">PID: {caseRecord.institutionId}</p>
            {institution && <p className="text-[11px] text-slate-400">{institution.address}</p>}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Scrutiny Officer
            </span>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-300" />
              <span>{caseRecord.assignedOfficer}</span>
            </div>
            <p className="text-xs text-slate-400">Bureau Jurisdiction: {caseRecord.bureau}</p>
            <p className="text-[11px] text-slate-400">Regional Cell: {institution?.region || 'Central'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Current Directive & Next Action
            </span>
            <div className="text-xs font-semibold text-slate-200">
              {caseRecord.nextAction || 'Under routine review'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Last Action: {caseRecord.lastAction} ({new Date(caseRecord.lastActionAt).toLocaleDateString('en-IN')})
            </p>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="p-6 border-b border-slate-800 bg-obsidian-900/40">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            Detailed Complaint / Violation Particulars
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-obsidian-950 p-4 rounded-lg border border-slate-800">
            {caseRecord.description}
          </p>
        </div>

        {/* Primary Case — Merged Children List if this is a primary case */}
        {caseRecord.mergedCaseIds && caseRecord.mergedCaseIds.length > 0 && (
          <div className="p-6 border-b border-slate-800 bg-blue-950/20">
            <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Consolidated Duplicate / Concurrent Complaints ({caseRecord.mergedCaseIds.length})</span>
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              The following complaints have been consolidated into this primary lead dossier:
            </p>
            <div className="flex flex-wrap gap-2">
              {caseRecord.mergedCaseIds.map(childId => (
                <button
                  key={childId}
                  onClick={() => setSelectedCaseId(childId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/60 text-xs font-mono font-medium transition-colors"
                >
                  <GitMerge className="w-3.5 h-3.5 text-blue-400" />
                  <span>{childId}</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Referenced / Related Cases */}
        <div className="p-6 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            Cross-Referenced & Linked Case Matters ({caseRecord.relatedCaseIds.length})
          </h4>
          {caseRecord.relatedCaseIds.length === 0 ? (
            <p className="text-xs text-slate-400">No linked cases currently associated.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {caseRecord.relatedCaseIds.map(relId => (
                <button
                  key={relId}
                  onClick={() => setSelectedCaseId(relId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-medium transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{relId}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chronological Action History Timeline */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-100">
              Chronological Regulatory Action History ({caseActions.length})
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Immutable Audit Trail</span>
          </div>

          <ActionHistoryTimeline actions={caseActions} />
        </div>
      </div>

      {/* Action Form Modal */}
      <ActionFormModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        caseRecord={caseRecord}
      />

      {/* Reopen Case Modal */}
      <ReopenCaseModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        caseRecord={caseRecord}
      />
    </div>
  );
};
