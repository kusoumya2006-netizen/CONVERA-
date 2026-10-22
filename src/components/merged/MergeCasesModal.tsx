import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { GitMerge, AlertCircle, ShieldCheck } from 'lucide-react';

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

  // Eligible primary cases: any case that is NOT an already merged child
  const eligiblePrimaryCases = cases.filter(c => !c.isMerged);

  // Eligible child cases: any case that is NOT an already merged child and NOT the selected primary
  const eligibleChildCases = cases.filter(
    c => !c.isMerged && c.caseId !== primaryId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

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

    const success = mergeCases(primaryId, childId, mergeReason.trim(), officerName.trim());
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Consolidate & Merge Duplicate Complaints"
      subtitle="Link overlapping matters under a single primary regulatory dossier"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Informational Guidance */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2.5">
          <GitMerge className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-blue-950 text-xs">Case Consolidation Protocol</h5>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Consolidating cases links the secondary complaint into the master dossier. All original records,
              complainant statements, and historical audits remain permanently accessible and cross-referenced.
            </p>
          </div>
        </div>

        {errorText && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Primary Case Selection */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            1. Master Primary Complaint (Lead Case) <span className="text-rose-500">*</span>
          </label>
          <select
            value={primaryId}
            onChange={e => {
              setPrimaryId(e.target.value);
              setErrorText(null);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-gov-olive"
            required
          >
            <option value="">-- Select Master Complaint Dossier --</option>
            {eligiblePrimaryCases.map(c => (
              <option key={c.caseId} value={c.caseId}>
                {c.caseId} — [{c.bureau}] {c.institutionName} ({c.category})
              </option>
            ))}
          </select>
        </div>

        {/* Child Case Selection */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            2. Secondary Complaint to Merge Into Lead Case <span className="text-rose-500">*</span>
          </label>
          <select
            value={childId}
            onChange={e => {
              setChildId(e.target.value);
              setErrorText(null);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-gov-olive"
            required
            disabled={!primaryId}
          >
            <option value="">-- Select Duplicate / Concurrent Complaint --</option>
            {eligibleChildCases.map(c => (
              <option key={c.caseId} value={c.caseId}>
                {c.caseId} — [{c.bureau}] {c.institutionName} ({c.category})
              </option>
            ))}
          </select>
          {!primaryId && (
            <p className="text-[10px] text-slate-400 mt-1">Please select a master case first.</p>
          )}
        </div>

        {/* Merging Officer */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Consolidating Regulatory Officer
          </label>
          <input
            type="text"
            value={officerName}
            onChange={e => setOfficerName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-gov-olive"
            required
          />
        </div>

        {/* Merge Reason */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Regulatory Justification for Consolidation <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={mergeReason}
            onChange={e => {
              setMergeReason(e.target.value);
              setErrorText(null);
            }}
            placeholder="e.g. Multiple student submissions received concerning identical unapproved development fee imposition for 2025-26 academic term..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-gov-olive"
            required
          />
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gov-olive hover:bg-gov-olive-light text-white font-semibold shadow-sm"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Confirm & Consolidate Cases</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
