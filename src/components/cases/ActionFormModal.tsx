import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { CaseRecord, CaseStatus, Bureau } from '../../types';
import { Modal } from '../common/Modal';
import { CheckCircle2 } from 'lucide-react';

interface ActionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseRecord: CaseRecord;
}

export const ActionFormModal: React.FC<ActionFormModalProps> = ({ isOpen, onClose, caseRecord }) => {
  const {
    cases,
    updateCaseStatus,
    addCaseAction,
    reassignBureau,
    recordEscalation,
    linkRelatedCases
  } = useCaseWatch();
  const { user } = useAuth();

  const [mode, setMode] = useState<
    'STATUS_UPDATE' | 'ADD_REMARKS' | 'REASSIGN_BUREAU' | 'ESCALATE' | 'LINK_CASE'
  >('STATUS_UPDATE');

  const [newStatus, setNewStatus] = useState<CaseStatus>(caseRecord.status);
  const [newBureau, setNewBureau] = useState<Bureau>(caseRecord.bureau);
  const [selectedCaseToLink, setSelectedCaseToLink] = useState('');
  const [officerName, setOfficerName] = useState(
    user?.displayName || caseRecord.assignedOfficer
  );
  const [resolutionSummary, setResolutionSummary] = useState(caseRecord.resolutionSummary || '');
  const [remarks, setRemarks] = useState('');
  const [nextAction, setNextAction] = useState(caseRecord.nextAction);

  const linkableCases = cases.filter(
    c => c.caseId !== caseRecord.caseId && !caseRecord.relatedCaseIds.includes(c.caseId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      alert('Please enter administrative remarks.');
      return;
    }

    if (mode === 'STATUS_UPDATE') {
      if (newStatus === 'Disposed' && !resolutionSummary.trim()) {
        alert('Please provide a formal Resolution Summary for disposing and closing this case.');
        return;
      }
      updateCaseStatus(
        caseRecord.caseId,
        newStatus,
        remarks,
        officerName,
        resolutionSummary.trim() || undefined,
        user?.uid
      );
    } else if (mode === 'ADD_REMARKS') {
      addCaseAction(caseRecord.caseId, 'REMARKS_ADDED', remarks, officerName, nextAction);
    } else if (mode === 'REASSIGN_BUREAU') {
      reassignBureau(caseRecord.caseId, newBureau, remarks, officerName);
    } else if (mode === 'ESCALATE') {
      recordEscalation(caseRecord.caseId, remarks, officerName);
    } else if (mode === 'LINK_CASE') {
      if (!selectedCaseToLink) {
        alert('Please select a case to link.');
        return;
      }
      linkRelatedCases(caseRecord.caseId, selectedCaseToLink, remarks, officerName);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Administrative Action / Status Transition"
      subtitle={`Case Dossier: ${caseRecord.caseId} | Current Bureau: ${caseRecord.bureau}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Action Mode Switcher */}
        <div>
          <label className="block font-semibold text-[#737D8B] mb-1.5 uppercase text-[10px] font-mono">
            Select Administrative Action Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'STATUS_UPDATE', label: 'Update Status' },
              { id: 'ADD_REMARKS', label: 'Add Action Note' },
              { id: 'REASSIGN_BUREAU', label: 'Transfer Bureau' },
              { id: 'ESCALATE', label: 'Escalate Case' },
              { id: 'LINK_CASE', label: 'Link Related Case' }
            ].map(m => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`py-2 px-2.5 rounded-md border text-center font-semibold transition-colors ${
                  mode === m.id
                    ? 'bg-[#161A20] text-[#E8EAED] border-[#A3B86C] shadow-sm'
                    : 'bg-[#0B0D10] text-[#737D8B] border-[#272D35] hover:bg-[#161A20] hover:text-[#A0A7B2]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fields based on mode */}
        {mode === 'STATUS_UPDATE' && (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-[#A0A7B2] mb-1">Transition Status To</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as CaseStatus)}
                className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
              >
                <option value="Pending">Pending (Awaiting Scrutiny)</option>
                <option value="Under Process">Under Process (Active Inquiry / Hearing)</option>
                <option value="Disposed">Disposed (Complaint Resolved & Closed)</option>
                <option value="Transferred">Transferred (Reassigned jurisdiction)</option>
                <option value="Escalated">Escalated (Referred to Executive Committee)</option>
              </select>
            </div>

            {newStatus === 'Disposed' && (
              <div className="p-3 bg-[#69C9A0]/10 border border-[#69C9A0]/30 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 text-[#69C9A0] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#69C9A0]" />
                  <span>Case Disposal & Final Resolution Summary</span>
                </div>
                <p className="text-[11px] text-[#A0A7B2] leading-tight">
                  Document the final regulatory findings, inspection committee clearance, refund confirmation, or compliance proof.
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

        {mode === 'REASSIGN_BUREAU' && (
          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">
              Transfer Jurisdiction To Target Bureau / Cell
            </label>
            <select
              value={newBureau}
              onChange={e => setNewBureau(e.target.value as Bureau)}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="RB">Regulation Bureau (RB)</option>
              <option value="PGRC">Public Grievance Redressal Cell (PGRC)</option>
              <option value="AB">Approval Bureau (AB)</option>
              <option value="Finance">Finance Bureau</option>
              <option value="Vigilance">Vigilance Cell</option>
            </select>
          </div>
        )}

        {mode === 'LINK_CASE' && (
          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">
              Select Related Complaint to Cross-Reference
            </label>
            {linkableCases.length === 0 ? (
              <p className="text-[#737D8B] text-xs py-2">No other candidate cases available to link.</p>
            ) : (
              <select
                value={selectedCaseToLink}
                onChange={e => setSelectedCaseToLink(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
                required
              >
                <option value="">-- Choose Case to Link --</option>
                {linkableCases.map(c => (
                  <option key={c.caseId} value={c.caseId}>
                    {c.caseId} - [{c.bureau}] {c.institutionName} ({c.category})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Next Action input */}
        {(mode === 'STATUS_UPDATE' || mode === 'ADD_REMARKS') && (
          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">Next Required Action</label>
            <input
              type="text"
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
              placeholder="e.g. Standing Appellate Committee hearing on 25th March"
            />
          </div>
        )}

        {/* Officer name */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Authorizing Officer Name & Designation
          </label>
          <input
            type="text"
            value={officerName}
            onChange={e => setOfficerName(e.target.value)}
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            required
          />
        </div>

        {/* Remarks / Log */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Administrative Remarks / Hearing Order Summary <span className="text-[#F16D75]">*</span>
          </label>
          <textarea
            rows={4}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Document proceedings, inspection committee recommendations, directives, or reasons for status change..."
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            required
          />
        </div>

        {/* Modal Buttons */}
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
            Commit Action to Case Ledger
          </button>
        </div>
      </form>
    </Modal>
  );
};
