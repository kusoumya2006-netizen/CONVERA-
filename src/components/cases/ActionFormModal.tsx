import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { CaseRecord, CaseStatus, Bureau, ActionType } from '../../types';
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

  // Filter other candidate cases from same institution to link
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
          <label className="block font-semibold text-slate-400 mb-1.5 uppercase text-[10px]">
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
                className={`py-2 px-2.5 rounded-lg border text-center font-semibold transition-colors ${
                  mode === m.id
                    ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                    : 'bg-obsidian-950 text-slate-400 border-slate-800 hover:bg-obsidian-800 hover:text-slate-200'
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
              <label className="block font-semibold text-slate-300 mb-1">Transition Status To</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as CaseStatus)}
                className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-slate-500"
              >
                <option value="Pending" className="bg-obsidian-900 text-slate-200">Pending (Awaiting Scrutiny)</option>
                <option value="Under Process" className="bg-obsidian-900 text-slate-200">Under Process (Active Inquiry / Hearing)</option>
                <option value="Disposed" className="bg-obsidian-900 text-slate-200">Disposed (Complaint Resolved & Closed)</option>
                <option value="Transferred" className="bg-obsidian-900 text-slate-200">Transferred (Reassigned jurisdiction)</option>
                <option value="Escalated" className="bg-obsidian-900 text-slate-200">Escalated (Referred to Executive Committee)</option>
              </select>
            </div>

            {newStatus === 'Disposed' && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Case Disposal & Final Resolution Summary</span>
                </div>
                <p className="text-[11px] text-emerald-400/90 leading-tight">
                  Document the final regulatory findings, inspection committee clearance, refund confirmation, or compliance proof.
                </p>
                <textarea
                  rows={3}
                  value={resolutionSummary}
                  onChange={e => setResolutionSummary(e.target.value)}
                  placeholder="e.g. Institution submitted compliance undertaking; all certificates released to students; verified by Regional Office..."
                  className="w-full px-3 py-2 bg-obsidian-950 border border-emerald-800 rounded-lg text-xs text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            )}
          </div>
        )}

        {mode === 'REASSIGN_BUREAU' && (
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Transfer Jurisdiction To Target Bureau / Cell
            </label>
            <select
              value={newBureau}
              onChange={e => setNewBureau(e.target.value as Bureau)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-slate-500"
            >
              <option value="RB" className="bg-obsidian-900 text-slate-200">Regulation Bureau (RB)</option>
              <option value="PGRC" className="bg-obsidian-900 text-slate-200">Public Grievance Redressal Cell (PGRC)</option>
              <option value="AB" className="bg-obsidian-900 text-slate-200">Approval Bureau (AB)</option>
              <option value="Finance" className="bg-obsidian-900 text-slate-200">Finance Bureau</option>
              <option value="Vigilance" className="bg-obsidian-900 text-slate-200">Vigilance Cell</option>
            </select>
          </div>
        )}

        {mode === 'LINK_CASE' && (
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Select Related Complaint to Cross-Reference
            </label>
            {linkableCases.length === 0 ? (
              <p className="text-slate-400 text-xs py-2">No other candidate cases available to link.</p>
            ) : (
              <select
                value={selectedCaseToLink}
                onChange={e => setSelectedCaseToLink(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-slate-500"
                required
              >
                <option value="" className="bg-obsidian-900 text-slate-200">-- Choose Case to Link --</option>
                {linkableCases.map(c => (
                  <option key={c.caseId} value={c.caseId} className="bg-obsidian-900 text-slate-200">
                    {c.caseId} - [{c.bureau}] {c.institutionName} ({c.category})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Next Action input (if adding remarks or updating status) */}
        {(mode === 'STATUS_UPDATE' || mode === 'ADD_REMARKS') && (
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Next Required Action</label>
            <input
              type="text"
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-slate-500"
              placeholder="e.g. Standing Appellate Committee hearing on 25th March"
            />
          </div>
        )}

        {/* Officer name */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">
            Authorizing Officer Name & Designation
          </label>
          <input
            type="text"
            value={officerName}
            onChange={e => setOfficerName(e.target.value)}
            className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-slate-500"
            required
          />
        </div>

        {/* Remarks / Log */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">
            Administrative Remarks / Hearing Order Summary <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Document proceedings, inspection committee recommendations, directives, or reasons for status change..."
            className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
            required
          />
        </div>

        {/* Modal Buttons */}
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
            Commit Action to Case Ledger
          </button>
        </div>
      </form>
    </Modal>
  );
};
