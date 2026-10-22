import React, { useState, useEffect } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Bureau, CaseStatus, Priority, ComplaintCategory, ComplainantType } from '../../types';
import svceEntranceImg from '../../assets/svce-entrance.jpg';
import { MapPin, AlertCircle } from 'lucide-react';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose }) => {
  const { institutions, addCase, cloudError } = useCaseWatch();
  const { user } = useAuth();

  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.institutionId || '');

  // Synchronize selectedInstId when institutions load from database
  useEffect(() => {
    if ((!selectedInstId || !institutions.some(i => i.institutionId === selectedInstId)) && institutions.length > 0) {
      setSelectedInstId(institutions[0].institutionId);
    }
  }, [institutions, selectedInstId]);
  const [bureau, setBureau] = useState<Bureau>(() => {
    if (user?.bureau && user.bureau !== 'ALL') {
      return user.bureau;
    }
    return 'RB';
  });
  const [category, setCategory] = useState<ComplaintCategory>('Faculty Pay & Service Grievance');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [complainantType, setComplainantType] = useState<ComplainantType>('Faculty');
  const [assignedOfficer, setAssignedOfficer] = useState(
    user?.displayName ? `${user.displayName} (${user.designation || 'Officer'})` : 'Dr. Suresh N. Patil (Regional Officer)'
  );
  const [description, setDescription] = useState('');
  const [expectedDays, setExpectedDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!description.trim()) {
      setSubmitError('Please enter a brief complaint description.');
      return;
    }

    const institution = institutions.find(i => i.institutionId === selectedInstId);
    if (!institution) {
      setSubmitError('Target technical institution not recognized.');
      return;
    }

    // Explicit client-side bureau authorization check to prevent silent RLS rejections
    if (user && user.role !== 'SUPER_ADMIN' && user.bureau !== 'ALL' && bureau !== user.bureau) {
      setSubmitError(
        `Permission Denied: You are authenticated as an official under [${user.bureau}]. Regulatory policies restrict registering complaints for [${bureau}]. Please switch the bureau to ${user.bureau} or coordinate through Central Administration.`
      );
      return;
    }

    const caseYear = 2026;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const caseId = `AICTE/${bureau}/${caseYear}/${randomNum}`;

    const now = new Date();
    const disposalDate = new Date(now.getTime() + expectedDays * 24 * 60 * 60 * 1000).toISOString();

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await addCase({
        caseId,
        institutionId: selectedInstId,
        institutionName: institution?.name || 'Selected Institution',
        category,
        description: description.trim(),
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

      if (!result.success) {
        setSubmitError(result.error || 'Failed to save complaint to database.');
        setIsSubmitting(false);
        return;
      }

      // Success: clear form and close modal
      setDescription('');
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'An unexpected error occurred while saving the complaint.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Register New Complaint / Regulatory Case"
      subtitle="AICTE Central Grievance Intake & Regulatory Referral Gateway"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Error Notification Banner */}
        {submitError && (
          <div className="p-3 bg-[#F16D75]/10 border border-[#F16D75]/30 rounded-md text-[#F16D75] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-[#F16D75]">Database Persistence Error</p>
              <p className="text-[11px] text-[#E8EAED]/90 leading-relaxed font-mono">{submitError}</p>
            </div>
          </div>
        )}

        {/* Cloud Missing Institutions Warning */}
        {institutions.length === 0 && (
          <div className="p-3 bg-[#F16D75]/10 border border-[#F16D75]/30 rounded-md text-[#F16D75] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-[#F16D75]">Technical Institutions Unavailable</p>
              <p className="text-[11px] text-[#E8EAED]/90 leading-relaxed">
                {cloudError || 'No technical institutions could be loaded from the database. Case registration is blocked to prevent foreign-key reference errors.'}
              </p>
            </div>
          </div>
        )}

        {/* Institution Select */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Target Technical Institution <span className="text-[#F16D75]">*</span>
          </label>
          <select
            value={selectedInstId}
            onChange={e => setSelectedInstId(e.target.value)}
            disabled={institutions.length === 0}
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C] disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            {institutions.map(inst => (
              <option key={inst.institutionId} value={inst.institutionId}>
                {inst.name} (PID: {inst.institutionId} - {inst.region})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#737D8B] mt-1">
            Tip: Selecting an institution with existing active cases in another bureau will automatically trigger deterministic cross-bureau overlap detection.
          </p>
        </div>

        {/* Institutional Campus Context Preview for SVCE */}
        {selectedInstId === '1-4328901' && (
          <div className="relative rounded-lg overflow-hidden border border-[#272D35] h-28 bg-[#0B0D10] shadow-md">
            <img
              src={svceEntranceImg}
              alt="Sri Venkateswara College of Engineering main entrance"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/70 to-transparent p-3 flex flex-col justify-end">
              <span className="text-[9px] font-mono text-[#A3B86C] font-bold uppercase tracking-wider">
                Institutional Campus Verification
              </span>
              <p className="text-xs font-bold text-[#E8EAED]">Sri Venkateswara College of Engineering (SVCE)</p>
              <div className="flex items-center gap-2 text-[10px] text-[#A0A7B2]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-[#A3B86C]" />
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
            <label className="block font-semibold text-[#A0A7B2] mb-1">
              Receiving Bureau / Cell <span className="text-[#F16D75]">*</span>
            </label>
            <select
              value={bureau}
              onChange={e => setBureau(e.target.value as Bureau)}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="RB">Regulation Bureau (RB)</option>
              <option value="PGRC">Public Grievance Redressal Cell (PGRC)</option>
              <option value="AB">Approval Bureau (AB)</option>
              <option value="Finance">Finance Bureau</option>
              <option value="Vigilance">Vigilance Cell</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">
              Complaint Category <span className="text-[#F16D75]">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ComplaintCategory)}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="Infrastructure Non-Compliance">Infrastructure Non-Compliance</option>
              <option value="Faculty Pay & Service Grievance">Faculty Pay & Service Grievance</option>
              <option value="Unlawful Fee Demands">Unlawful Fee Demands</option>
              <option value="Capitation Fee Allegation">Capitation Fee Allegation</option>
              <option value="Unauthorized Course / Intake">Unauthorized Course / Intake</option>
              <option value="Harassment / Discriminatory Conduct">Harassment / Discriminatory Conduct</option>
              <option value="Affiliation & Land Discrepancy">Affiliation & Land Discrepancy</option>
              <option value="Withholding Original Certificates">Withholding Original Certificates</option>
              <option value="Substandard Lab / Workshop Equipment">Substandard Lab / Workshop Equipment</option>
            </select>
          </div>
        </div>

        {/* Priority & Complainant Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">Priority / Urgency</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">Complainant Category</label>
            <select
              value={complainantType}
              onChange={e => setComplainantType(e.target.value as ComplainantType)}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Parent">Parent</option>
              <option value="Anonymous">Anonymous</option>
              <option value="Regulatory Agency">Regulatory Agency / EVC</option>
            </select>
          </div>
        </div>

        {/* Assigned Officer & SLA Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">Assigned Scrutiny Officer</label>
            <input
              type="text"
              value={assignedOfficer}
              onChange={e => setAssignedOfficer(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#A0A7B2] mb-1">Expected SLA Target (Days)</label>
            <input
              type="number"
              min={7}
              max={120}
              value={expectedDays}
              onChange={e => setExpectedDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-[#A0A7B2] mb-1">
            Grievance / Non-Compliance Narrative <span className="text-[#F16D75]">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide specific details of the complaint, clause violations, dates, or affected stakeholders..."
            className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            required
          />
        </div>

        {/* Form Actions */}
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
            disabled={isSubmitting || institutions.length === 0}
            className="px-3.5 py-1.5 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3 h-3 border-2 border-[#08090B] border-t-transparent rounded-full animate-spin" />
                <span>Registering & Persisting...</span>
              </>
            ) : (
              'Submit & Run Overlap Check'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
