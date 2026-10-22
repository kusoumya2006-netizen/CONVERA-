import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Modal } from '../common/Modal';
import { Bureau, CaseStatus, Priority, ComplaintCategory, ComplainantType } from '../../types';
import svceEntranceImg from '../../assets/svce-entrance.jpg';
import { Building2, MapPin } from 'lucide-react';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose }) => {
  const { institutions, addCase } = useCaseWatch();

  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.institutionId || '');
  const [bureau, setBureau] = useState<Bureau>('PGRC');
  const [category, setCategory] = useState<ComplaintCategory>('Faculty Pay & Service Grievance');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [complainantType, setComplainantType] = useState<ComplainantType>('Faculty');
  const [assignedOfficer, setAssignedOfficer] = useState('Dr. Suresh N. Patil (Regional Officer)');
  const [description, setDescription] = useState('');
  const [expectedDays, setExpectedDays] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a brief complaint description.');
      return;
    }

    const institution = institutions.find(i => i.institutionId === selectedInstId);
    const caseYear = 2026;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const caseId = `AICTE/${bureau}/${caseYear}/${randomNum}`;

    const now = new Date();
    const disposalDate = new Date(now.getTime() + expectedDays * 24 * 60 * 60 * 1000).toISOString();

    addCase({
      caseId,
      institutionId: selectedInstId,
      institutionName: institution?.name || 'Selected Institution',
      category,
      description,
      bureau,
      assignedOfficer,
      status: 'Pending' as CaseStatus,
      priority,
      complainantType,
      receivedAt: now.toISOString(),
      lastAction: 'Complaint registered in intake portal and queued for preliminary scrutiny.',
      nextAction: 'Verify complainant credentials and dispatch institutional show-cause query.',
      lastActionAt: now.toISOString(),
      expectedDisposalDate: disposalDate,
      relatedCaseIds: []
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Complaint / Regulatory Case"
      subtitle="AICTE Central Grievance Intake & Regulatory Referral Gateway"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Institution Select */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">
            Target Technical Institution <span className="text-rose-400">*</span>
          </label>
          <select
            value={selectedInstId}
            onChange={e => setSelectedInstId(e.target.value)}
            className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-slate-500"
            required
          >
            {institutions.map(inst => (
              <option key={inst.institutionId} value={inst.institutionId} className="bg-obsidian-900 text-slate-200">
                {inst.name} (PID: {inst.institutionId} - {inst.region})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tip: Selecting an institution with existing active cases in another bureau will automatically trigger cross-bureau overlap detection.
          </p>
        </div>

        {/* Institutional Campus Context Preview for SVCE */}
        {selectedInstId === '1-4328901' && (
          <div className="relative rounded-lg overflow-hidden border border-slate-700/80 h-28 bg-slate-900 shadow-md">
            <img
              src={svceEntranceImg}
              alt="Sri Venkateswara College of Engineering main entrance"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent p-2.5 flex flex-col justify-end">
              <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                Institutional Campus Preview
              </span>
              <p className="text-xs font-bold text-white">Sri Venkateswara College of Engineering (SVCE)</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-amber-400" />
                  Sriperumbudur, Tamil Nadu
                </span>
                <span>•</span>
                <span>PID: 1-4328901</span>
              </div>
            </div>
          </div>
        )}

        {/* Bureau & Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Receiving Bureau / Cell <span className="text-rose-400">*</span>
            </label>
            <select
              value={bureau}
              onChange={e => setBureau(e.target.value as Bureau)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-slate-500"
            >
              <option value="RB" className="bg-obsidian-900 text-slate-200">Regulation Bureau (RB)</option>
              <option value="PGRC" className="bg-obsidian-900 text-slate-200">Public Grievance Redressal Cell (PGRC)</option>
              <option value="AB" className="bg-obsidian-900 text-slate-200">Approval Bureau (AB)</option>
              <option value="Finance" className="bg-obsidian-900 text-slate-200">Finance Bureau</option>
              <option value="Vigilance" className="bg-obsidian-900 text-slate-200">Vigilance Cell</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Complaint Category <span className="text-rose-400">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ComplaintCategory)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-slate-500"
            >
              <option value="Infrastructure Non-Compliance" className="bg-obsidian-900 text-slate-200">Infrastructure Non-Compliance</option>
              <option value="Faculty Pay & Service Grievance" className="bg-obsidian-900 text-slate-200">Faculty Pay & Service Grievance</option>
              <option value="Unlawful Fee Demands" className="bg-obsidian-900 text-slate-200">Unlawful Fee Demands</option>
              <option value="Capitation Fee Allegation" className="bg-obsidian-900 text-slate-200">Capitation Fee Allegation</option>
              <option value="Unauthorized Course / Intake" className="bg-obsidian-900 text-slate-200">Unauthorized Course / Intake</option>
              <option value="Harassment / Discriminatory Conduct" className="bg-obsidian-900 text-slate-200">Harassment / Discriminatory Conduct</option>
              <option value="Affiliation & Land Discrepancy" className="bg-obsidian-900 text-slate-200">Affiliation & Land Discrepancy</option>
              <option value="Withholding Original Certificates" className="bg-obsidian-900 text-slate-200">Withholding Original Certificates</option>
              <option value="Substandard Lab / Workshop Equipment" className="bg-obsidian-900 text-slate-200">Substandard Lab / Workshop Equipment</option>
            </select>
          </div>
        </div>

        {/* Priority & Complainant Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Priority / Urgency</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-slate-500"
            >
              <option value="LOW" className="bg-obsidian-900 text-slate-200">LOW</option>
              <option value="MEDIUM" className="bg-obsidian-900 text-slate-200">MEDIUM</option>
              <option value="HIGH" className="bg-obsidian-900 text-slate-200">HIGH</option>
              <option value="CRITICAL" className="bg-obsidian-900 text-slate-200">CRITICAL</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Complainant Category</label>
            <select
              value={complainantType}
              onChange={e => setComplainantType(e.target.value as ComplainantType)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-slate-500"
            >
              <option value="Student" className="bg-obsidian-900 text-slate-200">Student</option>
              <option value="Faculty" className="bg-obsidian-900 text-slate-200">Faculty</option>
              <option value="Parent" className="bg-obsidian-900 text-slate-200">Parent</option>
              <option value="Anonymous" className="bg-obsidian-900 text-slate-200">Anonymous</option>
              <option value="Regulatory Agency" className="bg-obsidian-900 text-slate-200">Regulatory Agency / EVC</option>
            </select>
          </div>
        </div>

        {/* Assigned Officer & SLA Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Assigned Scrutiny Officer</label>
            <input
              type="text"
              value={assignedOfficer}
              onChange={e => setAssignedOfficer(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-slate-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Expected SLA Target (Days)</label>
            <input
              type="number"
              min={7}
              max={120}
              value={expectedDays}
              onChange={e => setExpectedDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">
            Grievance / Non-Compliance Narrative <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide specific details of the complaint, clause violations, dates, or affected stakeholders..."
            className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
            required
          />
        </div>

        {/* Form Actions */}
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
            Submit & Run Overlap Check
          </button>
        </div>
      </form>
    </Modal>
  );
};
