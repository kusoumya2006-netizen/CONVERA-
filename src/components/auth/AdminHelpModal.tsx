import React from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, Mail, Phone, Lock, AlertCircle, FileText } from 'lucide-react';

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
      <div className="space-y-4 text-xs text-slate-300">
        <div className="p-3.5 bg-amber-950/40 border border-amber-800 text-amber-300 rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">
              Government Administrative Security Policy
            </p>
            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              SYNCHRA is restricted to designated regulatory officials of the All India Council for Technical Education (AICTE). To safeguard sensitive institutional inspection records and student grievances, automated public password resets are disabled.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider font-mono">
            {isForgotPassword ? "Credential Reset Workflow" : "Authorized Support Desk"}
          </h4>

          <div className="p-3 rounded-lg border border-slate-800 bg-obsidian-950 space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Official Helpdesk:</span>
              <span className="font-mono text-slate-400">helpdesk.synchra@aicte-india.org</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Regulatory IT Cell:</span>
              <span className="font-mono text-slate-400">011-2958-1000 / Ext 442</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Support Hours:</span>
              <span className="text-slate-400">Mon – Fri, 09:30 AM – 06:00 PM IST</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed">
            Please include your Official Employee ID, Regional Office / Bureau division (RB, PGRC, AB, etc.), and contact your Bureau Nodal Officer for authorization.
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs shadow-sm transition-colors border border-slate-700"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
