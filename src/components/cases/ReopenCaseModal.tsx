import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { CaseRecord } from '../../types';
import { Modal } from '../common/Modal';
import { RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

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
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-amber-900 text-xs">Regulatory Reopening Protocol</h5>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Reopening this complaint will transition its status from <strong>Disposed</strong> back to{' '}
              <strong>Under Process</strong>. The prior disposal record, completion officer, and resolution summary
              will be permanently preserved in the immutable regulatory audit trail.
            </p>
          </div>
        </div>

        {/* Prior Resolution Info */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Historical Closure:</span>
            <span className="font-mono text-slate-700 font-semibold">
              {caseRecord.completedAt ? caseRecord.completedAt.split('T')[0] : 'Recorded'}
            </span>
          </div>
          {caseRecord.completedBy && (
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Disposed By:</span>
              <span className="font-semibold text-slate-800">{caseRecord.completedBy}</span>
            </div>
          )}
          {caseRecord.resolutionSummary && (
            <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
              <span className="font-semibold text-slate-700">Prior Resolution: </span>
              {caseRecord.resolutionSummary}
            </div>
          )}
        </div>

        {/* Officer Name */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Reopening Authorizing Officer
          </label>
          <input
            type="text"
            value={officerName}
            onChange={e => setOfficerName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-gov-olive"
            required
          />
        </div>

        {/* Reopening Reason */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Official Reopening Justification / New Grounds <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reopenReason}
            onChange={e => setReopenReason(e.target.value)}
            placeholder="e.g. Complainant submitted rejoinder with corroborating bank records / Incomplete compliance report submitted by institution..."
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirm Reopening</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
