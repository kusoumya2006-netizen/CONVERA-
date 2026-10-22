import React from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, Mail, Phone, AlertCircle } from 'lucide-react';

interface AdminHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'FORGOT_PASSWORD' | 'CONTACT_ADMIN';
}

export const AdminHelpModal: React.FC<AdminHelpModalProps> = ({ isOpen, onClose, type }) => {
  const isForgotPassword = type === 'FORGOT_PASSWORD';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isForgotPassword ? "Credential Recovery & Security Assistance" : "Contact System Administrator"}
      subtitle="AICTE Central Cyber & Information Security Cell"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-[#A0A7B2]">
        <div className="p-3.5 bg-[#E8B75C]/10 border border-[#E8B75C]/30 text-[#E8B75C] rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#E8B75C] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#E8B75C]">
              Government Administrative Security Policy
            </p>
            <p className="text-[11px] text-[#A0A7B2] leading-relaxed">
              CONVERA is restricted to designated regulatory officials of the All India Council for Technical Education (AICTE). To safeguard sensitive institutional inspection records and student grievances, automated public password resets are disabled.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-[#E8EAED] uppercase text-[10px] tracking-wider font-mono">
            {isForgotPassword ? "Credential Reset Workflow" : "Authorized Support Desk"}
          </h4>

          <div className="p-3 rounded-lg border border-[#272D35] bg-[#0B0D10] space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#A3B86C]" />
              <span className="font-semibold text-[#E8EAED]">Official Helpdesk:</span>
              <span className="font-mono text-[#A0A7B2]">helpdesk.convera@aicte-india.org</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#A3B86C]" />
              <span className="font-semibold text-[#E8EAED]">Regulatory IT Cell:</span>
              <span className="font-mono text-[#A0A7B2]">011-2958-1000 / Ext 442</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A3B86C]" />
              <span className="font-semibold text-[#E8EAED]">Support Hours:</span>
              <span className="text-[#A0A7B2]">Mon – Fri, 09:30 AM – 06:00 PM IST</span>
            </div>
          </div>

          <div className="text-[11px] text-[#737D8B] leading-relaxed">
            Please include your Official Employee ID, Regional Office / Bureau division (RB, PGRC, AB, etc.), and contact your Bureau Nodal Officer for clearance.
          </div>
        </div>

        <div className="pt-3 border-t border-[#272D35] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] text-[#E8EAED] font-semibold text-xs shadow-sm transition-colors border border-[#272D35]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
