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
        <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-amber-200 flex items-start gap-2 text-[11px] leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-100">Mandatory Administrative Rule:</strong> Recording a coordination decision coordinates regulatory actions across bureaus. In compliance with AICTE guidelines, reviewing an alert does <strong>NOT</strong> automatically dispose, merge, or dismiss individual complaints.
          </div>
        </div>

        {validationError && (
          <div className="p-2 bg-rose-950/60 text-rose-200 rounded border border-rose-800/80 text-xs">
            {validationError}
          </div>
        )}

        {/* Status & Lead Bureau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Coordination Review Status <span className="text-rose-400">*</span>
            </label>
            <select
              value={reviewStatus}
              onChange={e => setReviewStatus(e.target.value as ReviewStatus)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-slate-500"
            >
              <option value="COORDINATED" className="bg-obsidian-900 text-slate-200">Coordinated (Joint Action Protocol Active)</option>
              <option value="PENDING_REVIEW" className="bg-obsidian-900 text-slate-200">Pending Review (Action Needed)</option>
              <option value="DISMISSED" className="bg-obsidian-900 text-slate-200">Dismissed (Distinct unrelated matters)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Designated Lead Bureau / Cell
            </label>
            <select
              value={leadBureau}
              onChange={e => setLeadBureau(e.target.value as Bureau)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-slate-500"
            >
              {overlapAlert.involvedBureaus.map(b => (
                <option key={b} value={b} className="bg-obsidian-900 text-slate-200">
                  {b === 'RB' ? 'Regulation Bureau (RB) - Lead' : `${b} - Lead`}
                </option>
              ))}
              <option value="AB" className="bg-obsidian-900 text-slate-200">Approval Bureau (AB)</option>
              <option value="Vigilance" className="bg-obsidian-900 text-slate-200">Vigilance Cell</option>
            </select>
          </div>
        </div>

        {/* Reviewing Officer */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">
            Reviewing Official / Coordinating Officer
          </label>
          <input
            type="text"
            value={reviewer}
            onChange={e => setReviewer(e.target.value)}
            className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-slate-500"
            required
          />
        </div>

        {/* Coordination Remarks */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">
            Joint Coordination Directives & Hearing Minutes <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            value={remarks}
            onChange={e => {
              setRemarks(e.target.value);
              setValidationError('');
            }}
            placeholder="Record joint consultation notes, lead bureau assignment rationale, harmonized hearing schedule, or inspection instructions..."
            className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
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
            className="mt-0.5 rounded border-slate-700 bg-obsidian-950 text-slate-400 focus:ring-slate-500"
          />
          <label htmlFor="crossLinkCheck" className="text-slate-300 font-medium cursor-pointer">
            Automatically establish bidirectional cross-reference links between all {overlapAlert.caseIds.length} involved cases in the Case Registry.
          </label>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold shadow-sm"
          >
            Save Coordination Decision
          </button>
        </div>
      </form>
    </Modal>
  );
};
