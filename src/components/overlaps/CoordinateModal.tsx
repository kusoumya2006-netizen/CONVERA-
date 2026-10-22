import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { OverlapAlert, Bureau, ReviewStatus, SemanticComparisonResult } from '../../types';
import { Modal } from '../common/Modal';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';

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
  const [dismissalReason, setDismissalReason] = useState(
    overlapAlert.dismissalReason ||
      'Complaints concern distinct legal matters and departments; concurrent proceedings do not interfere.'
  );
  const [autoCrossLink, setAutoCrossLink] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!remarks.trim()) {
      setValidationError('Please enter coordination remarks.');
      return;
    }

    if (reviewStatus === 'DISMISSED' && !dismissalReason.trim()) {
      setValidationError('Please provide a specific justification/reason for dismissing this overlap.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewResult = await reviewOverlapAlert(
        overlapAlert.alertId,
        reviewStatus,
        remarks.trim(),
        leadBureau,
        reviewer.trim(),
        reviewStatus === 'DISMISSED' ? dismissalReason.trim() : undefined
      );

      if (!reviewResult.success) {
        setValidationError(reviewResult.error || 'Failed to save coordination decision in database.');
        setIsSubmitting(false);
        return;
      }

      if (autoCrossLink && reviewStatus !== 'DISMISSED' && overlapAlert.caseIds.length >= 2) {
        for (let i = 0; i < overlapAlert.caseIds.length; i++) {
          for (let j = i + 1; j < overlapAlert.caseIds.length; j++) {
            await linkRelatedCases(
              overlapAlert.caseIds[i],
              overlapAlert.caseIds[j],
              `Cross-linked under Overlap Alert ${overlapAlert.alertId}. Lead Bureau: ${leadBureau}.`,
              reviewer.trim()
            );
          }
        }
      }

      onClose();
    } catch (err: any) {
      setValidationError(err?.message || 'An unexpected error occurred while saving the coordination decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
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

        {/* Experimental Description Similarity if available */}
        {overlapAlert.semanticComparisons && overlapAlert.semanticComparisons.length > 0 && (
          <div className="p-3 bg-[#111419] border border-[#272D35] rounded-lg space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#86A9FF] font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experimental Description Similarity ({overlapAlert.semanticComparisons[0]?.modelName})</span>
            </div>
            {overlapAlert.semanticComparisons.map((sc: SemanticComparisonResult, idx: number) => (
              <div key={idx} className="text-[11px] text-[#A0A7B2] flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#E8EAED]">{sc.caseId1} ↔ {sc.caseId2}</span>
                  <span className={`font-mono font-semibold ${sc.label === 'HIGH_SEMANTIC_SIMILARITY' ? 'text-[#86A9FF]' : sc.label === 'MODERATE_SEMANTIC_SIMILARITY' ? 'text-[#E8B75C]' : 'text-[#737D8B]'}`}>
                    {sc.similarityPercentage}% ({sc.label.replace(/_/g, ' ')})
                  </span>
                </div>
                <div className="text-[10px] text-[#737D8B]">{sc.interpretation}</div>
              </div>
            ))}
            <div className="text-[10px] text-[#A0A7B2] pt-1 border-t border-[#1C2129] leading-relaxed">
              Uses a predefined domain vocabulary to estimate thematic similarity. May miss differently worded complaints outside its vocabulary. Not a duplicate probability; human review required.
            </div>
          </div>
        )}

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
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-semibold text-[#E8EAED] focus:outline-none focus:border-[#A3B86C] disabled:opacity-50"
            >
              <option value="COORDINATED">Coordinated (Joint Action Protocol Active)</option>
              <option value="PENDING_REVIEW">Pending Review (Action Needed)</option>
              <option value="DISMISSED">Dismissed (Distinct Unrelated Matters / False Positive)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">
              Designated Lead Bureau / Cell
            </label>
            <select
              value={leadBureau}
              onChange={e => setLeadBureau(e.target.value as Bureau)}
              disabled={isSubmitting || reviewStatus === 'DISMISSED'}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-semibold text-[#E8EAED] focus:outline-none focus:border-[#A3B86C] disabled:opacity-50"
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

        {/* False Positive Dismissal Reason if Dismissed */}
        {reviewStatus === 'DISMISSED' && (
          <div className="p-3 bg-[#111419] border border-[#F16D75]/30 rounded-lg space-y-1.5">
            <label className="block font-semibold text-[#F16D75] mb-1">
              Dismissal Justification / False Positive Rationale <span className="text-[#F16D75]">*</span>
            </label>
            <textarea
              rows={2}
              value={dismissalReason}
              onChange={e => {
                setDismissalReason(e.target.value);
                setValidationError('');
              }}
              disabled={isSubmitting}
              placeholder="State the regulatory basis for dismissal (e.g. distinct campuses, separate academic years, completely unrelated grievance subjects)..."
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#F16D75] disabled:opacity-50"
              required
            />
          </div>
        )}

        {/* Reviewing Officer */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Reviewing Official / Coordinating Officer
          </label>
          <input
            type="text"
            value={reviewer}
            onChange={e => setReviewer(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C] disabled:opacity-50"
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
            disabled={isSubmitting}
            placeholder="Record joint consultation notes, lead bureau assignment rationale, harmonized hearing schedule, or inspection instructions..."
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C] disabled:opacity-50"
            required
          />
        </div>

        {/* Cross Link Option */}
        {reviewStatus !== 'DISMISSED' && (
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="crossLinkCheck"
              checked={autoCrossLink}
              onChange={e => setAutoCrossLink(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 rounded border-[#272D35] bg-[#0B0D10] text-[#A3B86C] focus:ring-[#A3B86C] disabled:opacity-50"
            />
            <label htmlFor="crossLinkCheck" className="text-[#A0A7B2] font-medium cursor-pointer">
              Automatically establish bidirectional cross-reference links between all {overlapAlert.caseIds.length} involved cases in the Case Registry.
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-[#272D35] flex justify-end gap-2">
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
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSubmitting ? 'Saving Decision...' : 'Save Coordination Decision'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
