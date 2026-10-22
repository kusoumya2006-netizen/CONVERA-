import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface MergeCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrimaryCaseId?: string;
}

export const MergeCasesModal: React.FC<MergeCasesModalProps> = ({
  isOpen,
  onClose,
  defaultPrimaryCaseId
}) => {
  const { cases, mergeCases } = useCaseWatch();
  const { user } = useAuth();

  const [primaryId, setPrimaryId] = useState(defaultPrimaryCaseId || '');
  const [childId, setChildId] = useState('');
  const [mergeReason, setMergeReason] = useState('');
  const [officerName, setOfficerName] = useState(user?.displayName || 'Authorized Bureau Officer');
  const [errorText, setErrorText] = useState<string | null>(null);

  const eligiblePrimaryCases = cases.filter(c => !c.isMerged);
  const eligibleChildCases = cases.filter(
    c => !c.isMerged && c.caseId !== primaryId
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    if (isSubmitting) return;

    if (!primaryId) {
      setErrorText('Please select a master (primary) complaint.');
      return;
    }
    if (!childId) {
      setErrorText('Please select a candidate complaint to merge.');
      return;
    }
    if (primaryId === childId) {
      setErrorText('Cannot merge a case into itself.');
      return;
    }
    if (!mergeReason.trim()) {
      setErrorText('Please state the official regulatory justification for this merger.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await mergeCases(primaryId, childId, mergeReason.trim(), officerName.trim());
      setIsSubmitting(false);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorText(err?.message || 'Merger failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Consolidate Duplicate / Concurrent Grievances"
      subtitle="Administrative Merger Protocol for Connected Complaints"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Compliance info notice */}
        <div className="p-3 bg-[#E8B75C]/10 border border-[#E8B75C]/30 rounded-lg flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#E8B75C] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-[#E8B75C] text-xs">Administrative Merger Guidelines</h5>
            <p className="text-[11px] text-[#A0A7B2] leading-relaxed">
              Consolidating complaints links the secondary case to the master lead dossier. The child complaint will mirror
              disposition actions while preserving its original complainant particulars and chronological action ledger.
            </p>
          </div>
        </div>

        {errorText && (
          <div className="p-2.5 bg-[#F16D75]/10 text-[#F16D75] rounded-md border border-[#F16D75]/30 text-xs">
            {errorText}
          </div>
        )}

        {/* Primary Case Selection */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            1. Select Master Lead Dossier (Primary Case) <span className="text-[#F16D75]">*</span>
          </label>
          <select
            value={primaryId}
            onChange={e => {
              setPrimaryId(e.target.value);
              if (childId === e.target.value) setChildId('');
            }}
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            required
          >
            <option value="">-- Choose Primary Dossier --</option>
            {eligiblePrimaryCases.map(c => (
              <option key={c.caseId} value={c.caseId}>
                {c.caseId} — [{c.bureau}] {c.institutionName} ({c.category})
              </option>
            ))}
          </select>
        </div>

        {/* Child Case Selection */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            2. Select Complaint to Merge In (Sub-Complaint) <span className="text-[#F16D75]">*</span>
          </label>
          <select
            value={childId}
            onChange={e => setChildId(e.target.value)}
            disabled={!primaryId}
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C] disabled:opacity-40"
            required
          >
            <option value="">-- Choose Case to Consolidate --</option>
            {eligibleChildCases.map(c => (
              <option key={c.caseId} value={c.caseId}>
                {c.caseId} — [{c.bureau}] {c.institutionName} ({c.category})
              </option>
            ))}
          </select>
        </div>

        {/* Justification / Reason */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Official Consolidation Reason & Incident Context <span className="text-[#F16D75]">*</span>
          </label>
          <textarea
            rows={3}
            value={mergeReason}
            onChange={e => setMergeReason(e.target.value)}
            placeholder="e.g. Duplicate grievance submitted by students of the same department regarding capitation fee demands..."
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            required
          />
        </div>

        {/* Officer name */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">Authorizing Official</label>
          <input
            type="text"
            value={officerName}
            onChange={e => setOfficerName(e.target.value)}
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            required
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[#272D35] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-md border border-[#272D35] text-[#A0A7B2] hover:bg-[#161A20] hover:text-[#E8EAED] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3 h-3 border-2 border-[#08090B] border-t-transparent rounded-full animate-spin" />
                <span>Executing Merger...</span>
              </>
            ) : (
              'Execute Consolidation'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
