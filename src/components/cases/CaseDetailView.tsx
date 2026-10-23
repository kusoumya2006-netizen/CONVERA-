import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, BureauBadge, PriorityBadge, UrgencyBadgeView } from '../common/StatusBadge';
import { calculateDeterministicUrgency } from '../../engine/urgencyCalculator';
import { calculateExplainablePriority } from '../../engine/priorityEngine';
import { parseActionMetadata } from '../../engine/actionHistoryHelper';
import { ActionHistoryTimeline } from './ActionHistoryTimeline';
import { ActionFormModal } from './ActionFormModal';
import { AddCaseHistoryModal } from './AddCaseHistoryModal';
import { ReopenCaseModal } from './ReopenCaseModal';
import { HistoryActivityType } from '../../types';
import {
  ArrowLeft,
  UserCheck,
  GitCompare,
  Edit3,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  GitMerge,
  Layers,
  FileText,
  Clock,
  PlusCircle,
  Paperclip,
  ShieldAlert,
  Lock,
  ChevronRight,
  FileCheck2,
  Share2,
  Flame,
  HelpCircle
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
    setSelectedInstitutionId,
    navigateToGraph
  } = useCaseWatch();

  const { user } = useAuth();

  const [activeDossierTab, setActiveDossierTab] = useState<'DOSSIER' | 'HISTORY'>('DOSSIER');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState(false);
  const [historyModalInitialType, setHistoryModalInitialType] = useState<HistoryActivityType>('Progress Update');
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  if (!selectedCaseId) return null;

  const caseRecord = cases.find(c => c.caseId === selectedCaseId);
  if (!caseRecord) {
    return (
      <div className="p-8 text-center bg-[#111419] rounded-lg border border-[#272D35]">
        <p className="text-[#A0A7B2]">Case record not found.</p>
        <button
          onClick={() => setSelectedCaseId(null)}
          className="mt-3 px-3.5 py-1.5 rounded-md bg-[#161A20] border border-[#272D35] hover:bg-[#1C2129] text-[#E8EAED] text-xs font-medium"
        >
          Back to Case Registry
        </button>
      </div>
    );
  }

  const institution = institutions.find(i => i.institutionId === caseRecord.institutionId);
  const caseActions = actions.filter(a => a.caseId === caseRecord.caseId);

  // Jurisdiction check
  const hasJurisdiction = !user ||
    user.role === 'SUPER_ADMIN' ||
    user.bureau === 'ALL' ||
    user.bureau === caseRecord.bureau;

  // Check if this case is part of any active overlap alert
  const matchingAlert = alerts.find(
    a => a.caseIds.includes(caseRecord.caseId) && a.reviewStatus !== 'DISMISSED'
  );

  const activeOverlapCaseIds = new Set(
    alerts.filter(a => a.reviewStatus === 'PENDING_REVIEW').flatMap(a => a.caseIds)
  );
  const urgency = calculateDeterministicUrgency(caseRecord, activeOverlapCaseIds);
  const isOverdue = urgency.isOverdue;
  const priorityAnalysis = calculateExplainablePriority(caseRecord, alerts);

  // Extract evidence references recorded across all actions
  const evidenceRecords = caseActions
    .map(a => ({ action: a, meta: parseActionMetadata(a) }))
    .filter(item => item.meta.evidenceRef);

  const handleOpenAddHistory = (type: HistoryActivityType = 'Progress Update') => {
    setHistoryModalInitialType(type);
    setIsAddHistoryModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Navigation & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => setSelectedCaseId(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A0A7B2] hover:text-[#E8EAED] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Registry</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {caseRecord.status === 'Disposed' && (
            <button
              onClick={() => setIsReopenModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E8B75C]/40 bg-[#E8B75C]/10 hover:bg-[#E8B75C]/20 text-[#E8B75C] text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#E8B75C]" />
              <span>Reopen Case</span>
            </button>
          )}

          {/* Dedicated Add Case History Button */}
          <button
            onClick={() => handleOpenAddHistory('Progress Update')}
            disabled={!hasJurisdiction}
            title={
              hasJurisdiction
                ? 'Record a progress update, investigation note, evidence, or communication'
                : `Jurisdiction restricted: Signed in as ${user?.bureau} official.`
            }
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all ${
              hasJurisdiction
                ? 'bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B]'
                : 'bg-[#272D35] text-[#737D8B] cursor-not-allowed border border-[#38414D]'
            }`}
          >
            {hasJurisdiction ? (
              <PlusCircle className="w-3.5 h-3.5 text-[#08090B]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#737D8B]" />
            )}
            <span>Add Case History</span>
          </button>

          {/* Action / Reassign / Escalate Options */}
          <button
            onClick={() => setIsActionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#E8EAED] text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#A0A7B2]" />
            <span>Transfer / Escalate</span>
          </button>

          {/* View in Cross-Bureau Intelligence Graph */}
          <button
            onClick={() => navigateToGraph({ type: 'case', id: caseRecord.caseId })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#A3B86C] text-xs font-semibold transition-colors"
            title="Inspect relational connections in Cross-Bureau Intelligence Graph"
          >
            <Share2 className="w-3.5 h-3.5 text-[#A3B86C]" />
            <span>View in Graph</span>
          </button>
        </div>
      </div>

      {/* Merged Child Alert Banner */}
      {caseRecord.isMerged && caseRecord.mergedIntoCaseId && (
        <div className="p-4 rounded-lg bg-[#161A20] border-l-4 border-l-[#86A9FF] border-y border-r border-[#272D35] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <GitMerge className="w-5 h-5 text-[#86A9FF] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#86A9FF] uppercase tracking-wide font-mono">
                Consolidated Complaint Notice
              </h4>
              <p className="text-xs text-[#A0A7B2] mt-0.5 leading-relaxed">
                This grievance has been consolidated into lead master case{' '}
                <strong className="font-mono text-[#E8EAED]">{caseRecord.mergedIntoCaseId}</strong>.
                {caseRecord.mergeReason && ` Reason: ${caseRecord.mergeReason}.`}
                {caseRecord.mergedBy && ` Merged by ${caseRecord.mergedBy}.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCaseId(caseRecord.mergedIntoCaseId!)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#111419] hover:bg-[#161A20] border border-[#272D35] text-[#86A9FF] text-xs font-semibold shrink-0 transition-colors"
          >
            <span>Open Primary Dossier</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Historical Reopened Banner if previously disposed */}
      {caseRecord.reopenedAt && (
        <div className="p-4 rounded-lg bg-[#161A20] border-l-4 border-l-[#E8B75C] border-y border-r border-[#272D35] flex items-start gap-2.5">
          <RotateCcw className="w-5 h-5 text-[#E8B75C] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#E8B75C] uppercase tracking-wide font-mono">
              Proceeding Reopened from Prior Disposal
            </h4>
            <p className="text-xs text-[#A0A7B2] mt-0.5 leading-relaxed">
              Reopened on {new Date(caseRecord.reopenedAt).toLocaleDateString('en-IN')} by{' '}
              <strong className="text-[#E8EAED]">{caseRecord.reopenedBy}</strong>. Ground:{' '}
              <span className="italic text-[#E8EAED]">"{caseRecord.reopenReason}"</span>
            </p>
          </div>
        </div>
      )}

      {/* Overlap Warning Box if involved */}
      {matchingAlert && (
        <div className="p-4 rounded-lg bg-[#161A20] border-l-4 border-l-[#F16D75] border-y border-r border-[#272D35] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <GitCompare className="w-5 h-5 text-[#F16D75] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#F16D75] uppercase tracking-wide font-mono">
                Concurrent Cross-Bureau Proceeding Warning
              </h4>
              <p className="text-xs text-[#A0A7B2] mt-0.5 leading-relaxed">{matchingAlert.reason}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('overlaps')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#111419] hover:bg-[#161A20] border border-[#272D35] text-[#F16D75] text-xs font-semibold shrink-0 transition-colors"
          >
            <span>Open Coordination Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Disposed Resolution Card */}
      {caseRecord.status === 'Disposed' && (
        <div className="p-5 rounded-lg bg-[#161A20] border-l-4 border-l-[#69C9A0] border-y border-r border-[#272D35] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#272D35] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#69C9A0]" />
              <div>
                <h3 className="text-sm font-bold text-[#E8EAED]">
                  Case Disposal & Resolution Record
                </h3>
                <p className="text-[11px] text-[#A0A7B2]">
                  Formally closed upon satisfactory verification of compliance and grievance redressal.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#737D8B] font-mono block">Completed On</span>
              <span className="font-mono text-xs font-bold text-[#69C9A0]">
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
              <span className="text-[10px] uppercase font-bold text-[#737D8B] font-mono block">Completed By</span>
              <div className="flex items-center gap-1.5 font-bold text-[#E8EAED] mt-0.5">
                <UserCheck className="w-4 h-4 text-[#69C9A0]" />
                <span>{caseRecord.completedBy || caseRecord.assignedOfficer}</span>
              </div>
              {caseRecord.completedByOfficerId && (
                <span className="font-mono text-[10px] text-[#A0A7B2] block mt-0.5">
                  Officer ID: {caseRecord.completedByOfficerId}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#737D8B] font-mono block">Turnaround Benchmark</span>
              <span className="font-medium text-[#A0A7B2] mt-0.5 block">
                Disposed within regulatory schedule for Bureau ({caseRecord.bureau})
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#272D35]">
            <span className="text-[10px] uppercase font-bold text-[#737D8B] font-mono block mb-1">
              Final Official Resolution Summary
            </span>
            <div className="p-3 bg-[#0B0D10] rounded-md border border-[#272D35] text-xs text-[#E8EAED] leading-relaxed">
              {caseRecord.resolutionSummary || caseRecord.lastAction}
            </div>
          </div>
        </div>
      )}

      {/* Explainable Priority & Escalation Engine Recommendation */}
      <div className={`p-4 rounded-lg bg-[#111419] border ${
        priorityAnalysis.level === 'CRITICAL'
          ? 'border-l-4 border-l-[#F16D75] border-y-[#272D35] border-r-[#272D35]'
          : priorityAnalysis.level === 'HIGH'
          ? 'border-l-4 border-l-[#FFC759] border-y-[#272D35] border-r-[#272D35]'
          : 'border-[#272D35]'
      } space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#272D35]">
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${
              priorityAnalysis.level === 'CRITICAL'
                ? 'text-[#F16D75]'
                : priorityAnalysis.level === 'HIGH'
                ? 'text-[#FFC759]'
                : 'text-[#86A9FF]'
            }`} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[#E8EAED] uppercase tracking-wide font-mono">
                  Explainable Priority & Escalation Engine
                </h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${priorityAnalysis.badgeClass}`}>
                  SCORE {priorityAnalysis.score}/100 — {priorityAnalysis.level} PRIORITY
                </span>
              </div>
              <p className="text-[11px] text-[#A0A7B2] mt-0.5">
                {priorityAnalysis.summaryExplanation}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#737D8B] font-mono block">Scrutiny Urgency</span>
            <span className="font-mono text-xs font-bold text-[#E8EAED]">{urgency.indicatorText}</span>
          </div>
        </div>

        {/* Contributing Factors Pills */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-[#737D8B] font-mono block">Contributing Factors</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {priorityAnalysis.factors.map((f, i) => (
              <div key={i} className="p-2 rounded bg-[#0B0D10] border border-[#272D35] text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#E8EAED] flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      f.impact === 'CRITICAL' ? 'bg-[#F16D75]' : f.impact === 'HIGH' ? 'bg-[#FFC759]' : 'bg-[#86A9FF]'
                    }`} />
                    {f.label}
                  </span>
                  <span className="font-mono text-[10px] text-[#A3B86C] font-bold">+{f.scoreContribution} pts</span>
                </div>
                <p className="text-[11px] text-[#737D8B]">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action */}
        <div className="p-3 rounded bg-[#161A20] border border-[#272D35] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A3B86C] font-mono block">Recommended Next Action</span>
            <p className="text-xs text-[#E8EAED] font-medium mt-0.5">{priorityAnalysis.recommendedNextAction}</p>
          </div>
          {hasJurisdiction && caseRecord.status !== 'Disposed' && (
            <button
              onClick={() => handleOpenAddHistory('Status Change')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] text-xs font-bold shrink-0 transition-colors"
            >
              <span>Take Recommended Action</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Dossier Container */}
      <div className="bg-[#111419] rounded-lg border border-[#272D35] shadow-sm overflow-hidden">
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 border-b border-[#272D35] bg-[#161A20] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-base font-bold text-[#E8EAED]">{caseRecord.caseId}</span>
              <BureauBadge bureau={caseRecord.bureau} />
              <StatusBadge status={caseRecord.status} />
              <PriorityBadge priority={caseRecord.priority} />
            </div>
            <h2 className="text-base font-bold text-[#E8EAED]">{caseRecord.category}</h2>
            <p className="text-xs text-[#A0A7B2] mt-1">
              Received on {new Date(caseRecord.receivedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} by {caseRecord.complainantType}
            </p>
          </div>

          {/* SLA Pill */}
          <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35] text-right min-w-[200px]">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono block">Expected Disposal</span>
            <span className={`font-mono text-sm font-bold block mt-0.5 ${isOverdue ? 'text-[#F16D75]' : 'text-[#E8EAED]'}`}>
              {caseRecord.expectedDisposalDate ? caseRecord.expectedDisposalDate.split('T')[0] : 'N/A'}
            </span>
            <div className="mt-1.5 flex flex-col items-end gap-1">
              {caseRecord.status !== 'Disposed' ? (
                <>
                  <UrgencyBadgeView analysis={urgency} size="sm" showCountdown />
                  <span className="text-[10px] text-[#A0A7B2] font-mono text-right" title={urgency.indicatorText}>
                    {urgency.indicatorText}
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-mono font-semibold inline-block px-1.5 py-0.2 rounded border bg-[#69C9A0]/10 text-[#69C9A0] border-[#69C9A0]/30">
                  Resolved & Disposed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Tab Switcher inside Case Dossier */}
        <div className="flex border-b border-[#272D35] bg-[#0B0D10] px-5 sm:px-6">
          <button
            onClick={() => setActiveDossierTab('DOSSIER')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeDossierTab === 'DOSSIER'
                ? 'border-[#A3B86C] text-[#E8EAED]'
                : 'border-transparent text-[#737D8B] hover:text-[#A0A7B2]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Complaint Dossier & Evidence</span>
          </button>

          <button
            onClick={() => setActiveDossierTab('HISTORY')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeDossierTab === 'HISTORY'
                ? 'border-[#A3B86C] text-[#E8EAED]'
                : 'border-transparent text-[#737D8B] hover:text-[#A0A7B2]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>History & Activity Log</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeDossierTab === 'HISTORY'
                ? 'bg-[#A3B86C]/20 text-[#A3B86C]'
                : 'bg-[#161A20] text-[#737D8B]'
            }`}>
              {caseActions.length}
            </span>
          </button>
        </div>

        {/* TAB 1: Complaint Dossier & Evidence */}
        {activeDossierTab === 'DOSSIER' && (
          <div>
            {/* Institution Info & Metadata Grid */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-[#272D35]">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-[#737D8B] uppercase tracking-wider font-mono">
                  Technical Institution
                </span>
                <div
                  className="text-sm font-bold text-[#E8EAED] hover:text-[#A3B86C] cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedInstitutionId(caseRecord.institutionId);
                    setActiveTab('institutions');
                  }}
                >
                  {institution?.name || caseRecord.institutionName}
                </div>
                <p className="text-xs text-[#A0A7B2] font-mono">PID: {caseRecord.institutionId}</p>
                {institution && <p className="text-[11px] text-[#737D8B]">{institution.address}</p>}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-[#737D8B] uppercase tracking-wider font-mono">
                  Assigned Scrutiny Officer
                </span>
                <div className="text-sm font-bold text-[#E8EAED] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#A0A7B2]" />
                  <span>{caseRecord.assignedOfficer}</span>
                </div>
                <p className="text-xs text-[#A0A7B2]">Bureau: {caseRecord.bureau}</p>
                <p className="text-[11px] text-[#737D8B]">Regional Cell: {institution?.region || 'Central'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-[#737D8B] uppercase tracking-wider font-mono">
                  Directive & Action State
                </span>
                <div className="text-xs font-semibold text-[#E8EAED]">
                  {caseRecord.nextAction || 'Under routine scrutiny'}
                </div>
                <p className="text-[11px] text-[#737D8B] mt-1 leading-relaxed">
                  Last Action: {caseRecord.lastAction} ({new Date(caseRecord.lastActionAt).toLocaleDateString('en-IN')})
                </p>
              </div>
            </div>

            {/* Narrative Description */}
            <div className="p-5 sm:p-6 border-b border-[#272D35] bg-[#161A20]/50">
              <h4 className="text-xs font-bold text-[#E8EAED] uppercase tracking-wider mb-2 font-mono">
                Complaint / Violation Particulars
              </h4>
              <p className="text-xs text-[#E8EAED] leading-relaxed whitespace-pre-wrap bg-[#0B0D10] p-4 rounded-lg border border-[#272D35]">
                {caseRecord.description}
              </p>
            </div>

            {/* Evidence & Supporting Documents Section */}
            <div className="p-5 sm:p-6 border-b border-[#272D35]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#69C9A0]" />
                  <h4 className="text-xs font-bold text-[#E8EAED] uppercase tracking-wider font-mono">
                    Evidence & Supporting Documentation ({evidenceRecords.length})
                  </h4>
                </div>
                {hasJurisdiction && (
                  <button
                    onClick={() => handleOpenAddHistory('Evidence Added')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A3B86C] hover:text-[#B7CA82] transition-colors"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Attach Evidence Record</span>
                  </button>
                )}
              </div>

              {evidenceRecords.length === 0 ? (
                <div className="p-4 bg-[#0B0D10] rounded-lg border border-[#272D35] text-xs text-[#737D8B] flex items-center justify-between">
                  <span>No formal evidence attachments or documents recorded yet on this case.</span>
                  {hasJurisdiction && (
                    <button
                      onClick={() => handleOpenAddHistory('Evidence Added')}
                      className="px-2.5 py-1 rounded bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#A0A7B2] hover:text-[#E8EAED] text-[11px]"
                    >
                      Record Evidence
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {evidenceRecords.map(({ action, meta }) => (
                    <div
                      key={action.actionId}
                      className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35] hover:border-[#38414D] transition-colors flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded bg-[#69C9A0]/10 text-[#69C9A0] shrink-0 mt-0.5">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-bold text-[#E8EAED] truncate">
                            {meta.evidenceRef}
                          </span>
                          <span className="text-[10px] text-[#737D8B] font-mono shrink-0">
                            {new Date(meta.timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A0A7B2] line-clamp-2">
                          {meta.cleanRemarks}
                        </p>
                        <p className="text-[10px] text-[#737D8B]">
                          Verified by: <strong className="text-[#A0A7B2]">{meta.officerName}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Case — Merged Children List if this is a primary case */}
            {caseRecord.mergedCaseIds && caseRecord.mergedCaseIds.length > 0 && (
              <div className="p-5 sm:p-6 border-b border-[#272D35] bg-[#86A9FF]/5">
                <h4 className="text-xs font-bold text-[#86A9FF] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                  <Layers className="w-4 h-4 text-[#86A9FF]" />
                  <span>Consolidated Duplicate / Concurrent Complaints ({caseRecord.mergedCaseIds.length})</span>
                </h4>
                <p className="text-[11px] text-[#A0A7B2] mb-3">
                  The following complaints have been consolidated into this primary lead dossier:
                </p>
                <div className="flex flex-wrap gap-2">
                  {caseRecord.mergedCaseIds.map(childId => (
                    <button
                      key={childId}
                      onClick={() => setSelectedCaseId(childId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] text-[#86A9FF] border border-[#86A9FF]/30 text-xs font-mono font-medium transition-colors"
                    >
                      <GitMerge className="w-3.5 h-3.5 text-[#86A9FF]" />
                      <span>{childId}</span>
                      <ExternalLink className="w-3 h-3 text-[#86A9FF]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cross-Referenced / Related Cases */}
            <div className="p-5 sm:p-6 border-b border-[#272D35]">
              <h4 className="text-xs font-bold text-[#E8EAED] uppercase tracking-wider mb-2 font-mono">
                Cross-Referenced & Linked Case Matters ({caseRecord.relatedCaseIds.length})
              </h4>
              {caseRecord.relatedCaseIds.length === 0 ? (
                <p className="text-xs text-[#737D8B]">No linked cases currently associated.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {caseRecord.relatedCaseIds.map(relId => (
                    <button
                      key={relId}
                      onClick={() => setSelectedCaseId(relId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#A0A7B2] hover:text-[#E8EAED] text-xs font-mono font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#737D8B]" />
                      <span>{relId}</span>
                      <ExternalLink className="w-3 h-3 text-[#737D8B]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Summary Preview on Dossier Tab */}
            <div className="p-5 sm:p-6 bg-[#161A20]/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold text-[#E8EAED] uppercase tracking-wider font-mono">
                    Recent Case Activity Timeline ({caseActions.length})
                  </h4>
                  <p className="text-[11px] text-[#737D8B] mt-0.5">
                    Latest regulatory actions and scrutiny notes recorded on this dossier.
                  </p>
                </div>
                <button
                  onClick={() => setActiveDossierTab('HISTORY')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#A3B86C] hover:text-[#B7CA82] transition-colors"
                >
                  <span>Open Full Activity Log ({caseActions.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Compact Timeline View */}
              <ActionHistoryTimeline actions={caseActions.slice(0, 3)} showFilters={false} />
            </div>
          </div>
        )}

        {/* TAB 2: Full History & Activity Log */}
        {activeDossierTab === 'HISTORY' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* History Header & Add Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#161A20] rounded-lg border border-[#272D35]">
              <div>
                <h3 className="text-sm font-bold text-[#E8EAED] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#A3B86C]" />
                  <span>Case Activity Ledger & Immutable Audit Trail</span>
                </h3>
                <p className="text-xs text-[#A0A7B2] mt-0.5">
                  Chronological record of official regulatory scrutiny, inspections, hearing notices, and status shifts.
                </p>
              </div>

              <button
                onClick={() => handleOpenAddHistory('Progress Update')}
                disabled={!hasJurisdiction}
                title={
                  hasJurisdiction
                    ? 'Record a progress update, investigation note, evidence, or communication'
                    : `Jurisdiction restricted: Signed in as ${user?.bureau} official.`
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all shrink-0 ${
                  hasJurisdiction
                    ? 'bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B]'
                    : 'bg-[#272D35] text-[#737D8B] cursor-not-allowed border border-[#38414D]'
                }`}
              >
                {hasJurisdiction ? (
                  <PlusCircle className="w-3.5 h-3.5 text-[#08090B]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#737D8B]" />
                )}
                <span>Add Case History Entry</span>
              </button>
            </div>

            {/* Rich Interactive Timeline Component */}
            <ActionHistoryTimeline actions={caseActions} showFilters={true} />
          </div>
        )}
      </div>

      {/* Add Case History Modal */}
      <AddCaseHistoryModal
        isOpen={isAddHistoryModalOpen}
        onClose={() => setIsAddHistoryModalOpen(false)}
        caseRecord={caseRecord}
        initialActivityType={historyModalInitialType}
      />

      {/* Action Form Modal (Transfer Bureau / Link / Escalate) */}
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
