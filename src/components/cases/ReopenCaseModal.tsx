import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { CaseRecord } from '../../types';
import { Modal } from '../common/Modal';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface ReopenCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseRecord: CaseRecord;
}

export const ReopenCaseModal: React.FC<ReopenCaseModalProps> = ({
  isOpen,
  onClose,
  caseRecord
}) => {
  const { reopenCase } = useCaseWatch();
  const { user } = useAuth();

  const [reopenReason, setReopenReason] = useState('');
  const [officerName, setOfficerName] = useState(
    user?.displayName || caseRecord.assignedOfficer || 'Authorized Regulatory Officer'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!reopenReason.trim()) {
      setSubmitError('Please specify an official regulatory reason for reopening this case.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await reopenCase(caseRecord.caseId, reopenReason.trim(), officerName.trim());
      if (!res.success) {
        setSubmitError(res.error || 'Failed to reopen case in database.');
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'An unexpected error occurred while reopening the case.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Reopen Disposed Complaint Proceeding"
      subtitle={`Dossier: ${caseRecord.caseId} | Institution: ${caseRecord.institutionName || caseRecord.institutionId}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {submitError && (
          <div className="p-3 bg-[#F16D75]/10 border border-[#F16D75]/30 rounded-md text-[#F16D75] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-[#F16D75]">Reopening Error</p>
              <p className="text-[11px] text-[#E8EAED]/90 leading-relaxed font-mono">{submitError}</p>
            </div>
          </div>
        )}

        {/* Warning Callout */}
        <div className="p-3.5 bg-[#E8B75C]/10 border border-[#E8B75C]/30 rounded-lg flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#E8B75C] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-[#E8B75C] text-xs">Regulatory Reopening Protocol</h5>
            <p className="text-[11px] text-[#A0A7B2] leading-relaxed">
              Reopening this complaint will transition its status from <strong>Disposed</strong> back to{' '}
              <strong className="text-[#E8EAED]">Under Process</strong>. The prior disposal record, completion officer, and resolution summary
              will be permanently preserved in the immutable regulatory audit trail.
            </p>
          </div>
        </div>

        {/* Prior Resolution Info */}
        <div className="p-3 bg-[#0B0D10] rounded-md border border-[#272D35] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#737D8B] block">Prior Disposal Summary</span>
          <p className="text-xs text-[#E8EAED]">{caseRecord.resolutionSummary || caseRecord.lastAction}</p>
        </div>

        {/* Reason for Reopening */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Official Reason / Ground for Reopening <span className="text-[#F16D75]">*</span>
          </label>
          <textarea
            rows={3}
            value={reopenReason}
            onChange={e => setReopenReason(e.target.value)}
            placeholder="e.g. Fresh non-compliance evidence received from complainant; violation of conditional undertaking..."
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            required
          />
        </div>

        {/* Authorizing Officer */}
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

        {/* Buttons */}
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
            className="px-3.5 py-1.5 rounded-md bg-[#E8B75C] hover:bg-[#E8B75C]/90 text-[#08090B] font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3 h-3 border-2 border-[#08090B] border-t-transparent rounded-full animate-spin" />
                <span>Reopening Case...</span>
              </>
            ) : (
              'Confirm Reopening'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
