import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { CaseRecord } from '../../types';
import { Modal } from '../common/Modal';
import { AlertTriangle } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      alert('Please specify an official regulatory reason for reopening this case.');
      return;
    }

    reopenCase(caseRecord.caseId, reopenReason.trim(), officerName.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reopen Disposed Complaint Proceeding"
      subtitle={`Dossier: ${caseRecord.caseId} | Institution: ${caseRecord.institutionName || caseRecord.institutionId}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
            className="px-3.5 py-1.5 rounded-md border border-[#272D35] text-[#A0A7B2] hover:bg-[#161A20] hover:text-[#E8EAED] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-md bg-[#E8B75C] hover:bg-[#E8B75C]/90 text-[#08090B] font-semibold shadow-sm transition-colors"
          >
            Confirm Reopening
          </button>
        </div>
      </form>
    </Modal>
  );
};
