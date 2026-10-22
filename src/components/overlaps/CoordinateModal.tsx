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

    // Record coordination decision
    reviewOverlapAlert(overlapAlert.alertId, reviewStatus, remarks, leadBureau, reviewer);

    // Optionally cross-link all cases together
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
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2 text-[11px] leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Mandatory Administrative Rule:</strong> Recording a coordination decision coordinates regulatory actions across bureaus. In compliance with AICTE guidelines, reviewing an alert does <strong>NOT</strong> automatically dispose, merge, or dismiss individual complaints.
          </div>
        </div>

        {validationError && (
          <div className="p-2 bg-rose-50 text-rose-800 rounded border border-rose-200 text-xs">
            {validationError}
          </div>
        )}

        {/* Status & Lead Bureau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Coordination Review Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={reviewStatus}
              onChange={e => setReviewStatus(e.target.value as ReviewStatus)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              <option value="COORDINATED">Coordinated (Joint Action Protocol Active)</option>
              <option value="PENDING_REVIEW">Pending Review (Action Needed)</option>
              <option value="DISMISSED">Dismissed (Distinct unrelated matters)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Designated Lead Bureau / Cell
            </label>
            <select
              value={leadBureau}
              onChange={e => setLeadBureau(e.target.value as Bureau)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
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
          <label className="block font-semibold text-slate-700 mb-1">
            Reviewing Official / Coordinating Officer
          </label>
          <input
            type="text"
            value={reviewer}
            onChange={e => setReviewer(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            required
          />
        </div>

        {/* Coordination Remarks */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Joint Coordination Directives & Hearing Minutes <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={remarks}
            onChange={e => {
              setRemarks(e.target.value);
              setValidationError('');
            }}
            placeholder="Record joint consultation notes, lead bureau assignment rationale, harmonized hearing schedule, or inspection instructions..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-gov-olive"
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
            className="mt-0.5 rounded border-slate-300 text-gov-olive focus:ring-gov-olive"
          />
          <label htmlFor="crossLinkCheck" className="text-slate-700 font-medium cursor-pointer">
            Automatically establish bidirectional cross-reference links between all {overlapAlert.caseIds.length} involved cases in the Case Registry.
          </label>
        </div>

        {/* Actions */}
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
            className="px-4 py-2 rounded-lg bg-gov-olive hover:bg-gov-olive-light text-white font-semibold shadow-sm"
          >
            Save Coordination Decision
          </button>
        </div>
      </form>
    </Modal>
  );
};
