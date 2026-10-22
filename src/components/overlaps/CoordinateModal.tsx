import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { OverlapAlert, Bureau, ReviewStatus } from '../../types';
import { Modal } from '../common/Modal';
import { AlertTriangle } from 'lucide-react';

interface CoordinateModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: OverlapAlert;
}

export const CoordinateModal: React.FC<CoordinateModalProps> = ({ isOpen, onClose, alert: overlapAlert }) => {
  const { reviewOverlapAlert, linkRelatedCases } = useCaseWatch();

  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    overlapAlert.reviewStatus === 'PENDING_REVIEW' ? 'COORDINATED' : overlapAlert.reviewStatus
  );
  const [leadBureau, setLeadBureau] = useState<Bureau>(overlapAlert.leadBureau || (overlapAlert.involvedBureaus[0] || 'RB'));
  const [reviewer, setReviewer] = useState(overlapAlert.reviewedBy || 'Redressal Coordinator / Advisor (AICTE)');
  const [remarks, setRemarks] = useState(
    overlapAlert.coordinationRemarks ||
      'Concurred with Regulation Bureau and PGRC directors. Coordinated joint hearing date fixed; individual cases remain active under respective bureau purview.'
  );
  const [autoCrossLink, setAutoCrossLink] = useState(true);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setValidationError('Please enter coordination remarks.');
      return;
    }

    reviewOverlapAlert(overlapAlert.alertId, reviewStatus, remarks, leadBureau, reviewer);

    if (autoCrossLink && overlapAlert.caseIds.length >= 2) {
      for (let i = 0; i < overlapAlert.caseIds.length; i++) {
        for (let j = i + 1; j < overlapAlert.caseIds.length; j++) {
          linkRelatedCases(
            overlapAlert.caseIds[i],
            overlapAlert.caseIds[j],
            `Cross-linked under Overlap Alert ${overlapAlert.alertId}. Lead Bureau: ${leadBureau}.`,
            reviewer
          );
        }
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inter-Bureau Coordination Console"
      subtitle={`Institution: ${overlapAlert.institutionName} (PID: ${overlapAlert.institutionId})`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Compliance Note */}
        <div className="p-3 bg-[#E8B75C]/10 border border-[#E8B75C]/30 rounded-lg text-[#E8B75C] flex items-start gap-2 text-[11px] leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-[#E8B75C] shrink-0 mt-0.5" />
          <div className="text-[#E8EAED]">
            <strong className="text-[#E8B75C]">Administrative Rule:</strong> Recording a coordination decision coordinates regulatory actions across bureaus. In compliance with AICTE guidelines, reviewing an alert does <strong>NOT</strong> automatically dispose, merge, or dismiss individual complaints.
          </div>
        </div>

        {validationError && (
          <div className="p-2.5 bg-[#F16D75]/10 text-[#F16D75] rounded-md border border-[#F16D75]/30 text-xs">
            {validationError}
          </div>
        )}

        {/* Status & Lead Bureau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">
              Coordination Review Status <span className="text-[#F16D75]">*</span>
            </label>
            <select
              value={reviewStatus}
              onChange={e => setReviewStatus(e.target.value as ReviewStatus)}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-semibold text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="COORDINATED">Coordinated (Joint Action Protocol Active)</option>
              <option value="PENDING_REVIEW">Pending Review (Action Needed)</option>
              <option value="DISMISSED">Dismissed (Distinct unrelated matters)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">
              Designated Lead Bureau / Cell
            </label>
            <select
              value={leadBureau}
              onChange={e => setLeadBureau(e.target.value as Bureau)}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-semibold text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              {overlapAlert.involvedBureaus.map(b => (
                <option key={b} value={b}>
                  {b === 'RB' ? 'Regulation Bureau (RB) - Lead' : `${b} - Lead`}
                </option>
              ))}
              <option value="AB">Approval Bureau (AB)</option>
              <option value="Vigilance">Vigilance Cell</option>
            </select>
          </div>
        </div>

        {/* Reviewing Officer */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Reviewing Official / Coordinating Officer
          </label>
          <input
            type="text"
            value={reviewer}
            onChange={e => setReviewer(e.target.value)}
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            required
          />
        </div>

        {/* Coordination Remarks */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Joint Coordination Directives & Hearing Minutes <span className="text-[#F16D75]">*</span>
          </label>
          <textarea
            rows={4}
            value={remarks}
            onChange={e => {
              setRemarks(e.target.value);
              setValidationError('');
            }}
            placeholder="Record joint consultation notes, lead bureau assignment rationale, harmonized hearing schedule, or inspection instructions..."
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            required
          />
        </div>

        {/* Cross Link Option */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="crossLinkCheck"
            checked={autoCrossLink}
            onChange={e => setAutoCrossLink(e.target.checked)}
            className="mt-0.5 rounded border-[#272D35] bg-[#0B0D10] text-[#A3B86C] focus:ring-[#A3B86C]"
          />
          <label htmlFor="crossLinkCheck" className="text-[#A0A7B2] font-medium cursor-pointer">
            Automatically establish bidirectional cross-reference links between all {overlapAlert.caseIds.length} involved cases in the Case Registry.
          </label>
        </div>

        {/* Actions */}
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
            className="px-3.5 py-1.5 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] font-semibold shadow-sm transition-colors"
          >
            Save Coordination Decision
          </button>
        </div>
      </form>
    </Modal>
  );
};
