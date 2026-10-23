import React, { useState, useEffect } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { CaseRecord, CaseStatus, HistoryActivityType } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge, BureauBadge } from '../common/StatusBadge';
import {
  FileText,
  Activity,
  FileCheck2,
  Send,
  ArrowRightLeft,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Calendar,
  Lock
} from 'lucide-react';

interface AddCaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseRecord: CaseRecord;
  initialActivityType?: HistoryActivityType;
}

export const AddCaseHistoryModal: React.FC<AddCaseHistoryModalProps> = ({
  isOpen,
  onClose,
  caseRecord,
  initialActivityType = 'Progress Update'
}) => {
  const { addCaseHistoryEntry } = useCaseWatch();
  const { user } = useAuth();

  const [activityType, setActivityType] = useState<HistoryActivityType>(initialActivityType);
  const [description, setDescription] = useState('');
  const [shouldChangeStatus, setShouldChangeStatus] = useState(initialActivityType === 'Status Change');
  const [newStatus, setNewStatus] = useState<CaseStatus>(caseRecord.status);
  const [resolutionSummary, setResolutionSummary] = useState(caseRecord.resolutionSummary || '');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [nextAction, setNextAction] = useState(caseRecord.nextAction || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync initial type when opened
  useEffect(() => {
    if (isOpen) {
      setActivityType(initialActivityType);
      setShouldChangeStatus(initialActivityType === 'Status Change');
      setNewStatus(caseRecord.status);
      setResolutionSummary(caseRecord.resolutionSummary || '');
      setNextAction(caseRecord.nextAction || '');
      setDescription('');
      setEvidenceRef('');
      setSubmitError(null);
    }
  }, [isOpen, initialActivityType, caseRecord]);

  // When activityType switches to 'Status Change', auto-enable status transition
  useEffect(() => {
    if (activityType === 'Status Change') {
      setShouldChangeStatus(true);
    }
  }, [activityType]);

  // Jurisdiction check
  const hasJurisdiction = !user ||
    user.role === 'SUPER_ADMIN' ||
    user.bureau === 'ALL' ||
    user.bureau === caseRecord.bureau;

  const activityTypes: { type: HistoryActivityType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: 'Progress Update',
      label: 'Progress Update',
      icon: <FileText className="w-3.5 h-3.5 text-[#86A9FF]" />,
      desc: 'Routine procedural steps, case scrutiny notes, and internal updates'
    },
    {
      type: 'Investigation Note',
      label: 'Investigation Note',
      icon: <Activity className="w-3.5 h-3.5 text-[#E8B75C]" />,
      desc: 'Site inspection findings, committee hearing minutes, and factual verifications'
    },
    {
      type: 'Evidence Added',
      label: 'Evidence Added',
      icon: <FileCheck2 className="w-3.5 h-3.5 text-[#69C9A0]" />,
      desc: 'Submitted compliance documents, affidavits, lab reports, or student proofs'
    },
    {
      type: 'Communication',
      label: 'Communication',
      icon: <Send className="w-3.5 h-3.5 text-[#B58BFF]" />,
      desc: 'Show-cause notices issued, institutional explanations received, or summons'
    },
    {
      type: 'Status Change',
      label: 'Status Change',
      icon: <ArrowRightLeft className="w-3.5 h-3.5 text-[#A3B86C]" />,
      desc: 'Formal regulatory status transitions (e.g. Under Process, Disposed, Escalated)'
    },
    {
      type: 'Other',
      label: 'Other',
      icon: <MessageSquare className="w-3.5 h-3.5 text-[#A0A7B2]" />,
      desc: 'General administrative log or advisory directive'
    }
  ];

  const getPlaceholder = () => {
    switch (activityType) {
      case 'Investigation Note':
        return 'Describe committee findings, inspection observations, lab audit results, faculty attendance checks...';
      case 'Evidence Added':
        return 'Specify the evidence received, submission party, verified certificates, compliance undertakings...';
      case 'Communication':
        return 'Summarize official communication, notice reference number, hearing schedule dispatch, institution response...';
      case 'Status Change':
        return 'State the regulatory grounds and justification for transitioning the case status...';
      case 'Progress Update':
      case 'Other':
      default:
        return 'Record detailed observations, next milestones, committee directives, or procedural notes...';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!hasJurisdiction) {
      setSubmitError(`Jurisdiction Denied: Officials from ${user?.bureau} cannot modify cases under ${caseRecord.bureau}.`);
      return;
    }

    if (!description.trim()) {
      setSubmitError('Please enter a description for this case history entry.');
      return;
    }

    if (shouldChangeStatus && newStatus === 'Disposed' && !resolutionSummary.trim()) {
      setSubmitError('Disposing and closing a case requires a formal Resolution Summary.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await addCaseHistoryEntry({
        caseId: caseRecord.caseId,
        activityType,
        description: description.trim(),
        newStatus: shouldChangeStatus ? newStatus : undefined,
        evidenceRef: evidenceRef.trim() || undefined,
        nextAction: nextAction.trim() || undefined,
        resolutionSummary: shouldChangeStatus && newStatus === 'Disposed' ? resolutionSummary.trim() : undefined
      });

      if (!result.success) {
        setSubmitError(result.error || 'Failed to record case history in database.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'An unexpected error occurred while saving.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Add Case History & Activity Entry"
      subtitle={`Dossier: ${caseRecord.caseId} | Institution: ${caseRecord.institutionName || caseRecord.institutionId}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Jurisdiction Restriction Banner */}
        {!hasJurisdiction && (
          <div className="p-3 bg-[#F16D75]/10 border border-[#F16D75]/30 rounded-lg text-[#F16D75] flex items-start gap-2.5">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs text-[#F16D75]">Jurisdiction Restricted</p>
              <p className="text-[11px] text-[#E8EAED]/80 mt-0.5">
                You are currently signed in as an official in the <strong>{user?.bureau}</strong> bureau. Only authorized officials of the <strong>{caseRecord.bureau}</strong> bureau or Central Coordinators may record activity on this complaint dossier.
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {submitError && (
          <div className="p-3 bg-[#F16D75]/10 border border-[#F16D75]/30 rounded-lg text-[#F16D75] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs text-[#F16D75]">Action Recording Error</p>
              <p className="text-[11px] text-[#E8EAED]/90 font-mono mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Officer Identity Card (Derived strictly from authenticated session) */}
        <div className="p-3 bg-[#0B0D10] border border-[#272D35] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#161A20] border border-[#272D35] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#A3B86C]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#E8EAED]">{user?.displayName || caseRecord.assignedOfficer}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#A3B86C]/10 text-[#A3B86C] border border-[#A3B86C]/30 font-mono">
                  Verified Session
                </span>
              </div>
              <p className="text-[11px] text-[#737D8B]">
                {user?.designation || `${caseRecord.bureau} Scrutiny Officer`} • Bureau: <strong className="text-[#A0A7B2]">{user?.bureau || caseRecord.bureau}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <BureauBadge bureau={caseRecord.bureau} size="sm" />
            <StatusBadge status={caseRecord.status} size="sm" />
          </div>
        </div>

        {/* Activity Type Selector */}
        <div>
          <label className="block font-semibold text-[#737D8B] mb-2 uppercase text-[10px] font-mono">
            Select Case Activity Type <span className="text-[#F16D75]">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activityTypes.map(item => {
              const isSelected = activityType === item.type;
              return (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setActivityType(item.type)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-[#161A20] text-[#E8EAED] border-[#A3B86C] shadow-sm ring-1 ring-[#A3B86C]/40'
                      : 'bg-[#0B0D10] text-[#737D8B] border-[#272D35] hover:bg-[#161A20] hover:text-[#A0A7B2]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#E8EAED]">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-[#737D8B] leading-tight line-clamp-2">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Update Description (Mandatory) */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Activity Details & Update Description <span className="text-[#F16D75]">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            required
          />
        </div>

        {/* Status Transition Section */}
        <div className="p-3 bg-[#0B0D10] border border-[#272D35] rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldChangeStatus}
                onChange={e => setShouldChangeStatus(e.target.checked)}
                className="rounded border-[#272D35] text-[#A3B86C] focus:ring-[#A3B86C] bg-[#161A20]"
              />
              <span className="font-semibold text-xs text-[#E8EAED]">
                Transition Case Status with this activity
              </span>
            </label>
            <div className="flex items-center gap-1 text-[11px] text-[#737D8B] font-mono">
              <span>Current:</span>
              <StatusBadge status={caseRecord.status} size="sm" />
            </div>
          </div>

          {shouldChangeStatus && (
            <div className="space-y-3 pt-2 border-t border-[#272D35]">
              <div>
                <label className="block font-semibold text-[#737D8B] text-[10px] font-mono uppercase mb-1">
                  New Status Target
                </label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as CaseStatus)}
                  className="w-full px-3 py-2 bg-[#161A20] border border-[#272D35] rounded-md text-xs font-semibold text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
                >
                  <option value="Pending">Pending (Awaiting Scrutiny)</option>
                  <option value="Under Process">Under Process (Active Inquiry / Hearing)</option>
                  <option value="Disposed">Disposed (Complaint Resolved & Closed)</option>
                  <option value="Transferred">Transferred (Reassigned jurisdiction)</option>
                  <option value="Escalated">Escalated (Referred to Executive Committee)</option>
                </select>
              </div>

              {/* Disposal Resolution Summary if Disposed */}
              {newStatus === 'Disposed' && (
                <div className="p-3 bg-[#69C9A0]/10 border border-[#69C9A0]/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-[#69C9A0] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#69C9A0]" />
                    <span>Case Disposal & Final Resolution Summary *</span>
                  </div>
                  <p className="text-[11px] text-[#A0A7B2] leading-tight">
                    Document the final regulatory findings, inspection clearance, certificate release, or compliance proof.
                  </p>
                  <textarea
                    rows={3}
                    value={resolutionSummary}
                    onChange={e => setResolutionSummary(e.target.value)}
                    placeholder="e.g. Institution submitted compliance undertaking; all certificates released to students; verified by Regional Office..."
                    className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#69C9A0]"
                    required
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optional References Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Evidence / Document Reference */}
          <div>
            <label className="flex items-center gap-1 font-semibold text-[#A0A7B2] mb-1">
              <Paperclip className="w-3.5 h-3.5 text-[#69C9A0]" />
              <span>Evidence / Document Reference (Optional)</span>
            </label>
            <input
              type="text"
              value={evidenceRef}
              onChange={e => setEvidenceRef(e.target.value)}
              placeholder="e.g. DOC-2026-INSP-04.pdf or Aff-Faculty-12"
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            />
          </div>

          {/* Next Action / Follow-up Directive */}
          <div>
            <label className="flex items-center gap-1 font-semibold text-[#A0A7B2] mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#E8B75C]" />
              <span>Next Action / Follow-up Note (Optional)</span>
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              placeholder="e.g. Standing Appellate Committee hearing on 28th Oct"
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-3 border-t border-[#272D35] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-md border border-[#272D35] text-[#A0A7B2] hover:bg-[#161A20] hover:text-[#E8EAED] font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !hasJurisdiction}
            className="px-4 py-1.5 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#08090B] border-t-transparent rounded-full animate-spin" />
                <span>Recording Entry...</span>
              </>
            ) : (
              <span>Commit Activity to Case Ledger</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
