import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Institution } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge, BureauBadge, PriorityBadge } from '../common/StatusBadge';
import svceEntranceImg from '../../assets/svce-entrance.jpg';
import {
  Building2,
  MapPin,
  Calendar,
  Award,
  GitCompare,
  FileText,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface InstitutionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: Institution;
}

export const InstitutionDetailModal: React.FC<InstitutionDetailModalProps> = ({
  isOpen,
  onClose,
  institution
}) => {
  const { cases, alerts, setSelectedCaseId, setActiveTab } = useCaseWatch();

  const instCases = cases.filter(c => c.institutionId === institution.institutionId);
  const activeCases = instCases.filter(c => c.status !== 'Disposed');
  const disposedCases = instCases.filter(c => c.status === 'Disposed');

  const rbActiveCases = activeCases.filter(c => c.bureau === 'RB');
  const pgrcActiveCases = activeCases.filter(c => c.bureau === 'PGRC');
  const otherActiveCases = activeCases.filter(c => c.bureau !== 'RB' && c.bureau !== 'PGRC');

  const instAlerts = alerts.filter(a => a.institutionId === institution.institutionId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={institution.name}
      subtitle={`AICTE Permanent Institute ID: ${institution.institutionId} | ${institution.region} Region`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 bg-obsidian-950 rounded-lg border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Institution Type</span>
            <p className="text-xs font-bold text-slate-200 mt-0.5">{institution.type}</p>
          </div>
          <div className="p-3 bg-obsidian-950 rounded-lg border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Accreditation</span>
            <p className="text-xs font-bold text-slate-200 mt-0.5">{institution.accreditationGrade || 'AICTE Approved'}</p>
          </div>
          <div className="p-3 bg-obsidian-950 rounded-lg border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Active Matters</span>
            <p className="text-xs font-bold text-blue-300 mt-0.5">
              {activeCases.length} Open ({rbActiveCases.length} RB, {pgrcActiveCases.length} PGRC)
            </p>
          </div>
          <div className="p-3 bg-obsidian-950 rounded-lg border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Disposed Matters</span>
            <p className="text-xs font-bold text-emerald-400 mt-0.5">{disposedCases.length} Resolved</p>
          </div>
        </div>

        {/* Institution Entrance Photograph if SVCE */}
        {institution.institutionId === '1-4328901' && (
          <div className="relative rounded-xl overflow-hidden border border-slate-700/80 h-44 bg-slate-900 shadow-md">
            <img
              src={svceEntranceImg}
              alt="Sri Venkateswara College of Engineering main entrance"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                Official AICTE Campus Registry Photo
              </span>
              <p className="text-sm font-bold text-white">Sri Venkateswara College of Engineering (SVCE), Sriperumbudur</p>
              <p className="text-[10px] text-slate-300 font-mono">
                Photo: PlaneMad / Wikimedia Commons · CC BY-SA 3.0
              </p>
            </div>
          </div>
        )}

        {/* Address and Geographics */}
        <div className="p-3.5 bg-obsidian-950 rounded-lg border border-slate-800 text-xs flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Campus Location: </span>
            <span className="text-slate-400">{institution.address}</span>
          </div>
        </div>

        {/* Overlap Alerts if any */}
        {instAlerts.length > 0 && (
          <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <GitCompare className="w-4 h-4 text-rose-400" />
              <span>Cross-Bureau Coordination Overlap Alert Active</span>
            </div>
            {instAlerts.map(alert => (
              <div key={alert.alertId} className="text-xs text-rose-200 bg-obsidian-950 p-3 rounded border border-rose-900/60">
                <p className="font-medium">{alert.reason}</p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span>Review State: <strong className="uppercase text-white">{alert.reviewStatus}</strong></span>
                  <button
                    onClick={() => {
                      onClose();
                      setActiveTab('overlaps');
                    }}
                    className="text-rose-300 font-bold hover:underline"
                  >
                    View Coordination Console →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Consolidated Case History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-100">Consolidated Complaint & Regulatory History</h4>
            <span className="text-xs text-slate-400 font-mono">{instCases.length} Total Matters Logged</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {instCases.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No complaints recorded for this institution.</p>
            ) : (
              instCases.map(c => (
                <div
                  key={c.caseId}
                  onClick={() => {
                    onClose();
                    setSelectedCaseId(c.caseId);
                  }}
                  className="p-3 bg-obsidian-950 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100">{c.caseId}</span>
                      <BureauBadge bureau={c.bureau} size="sm" />
                      <StatusBadge status={c.status} size="sm" />
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="font-medium text-slate-200">{c.category}</p>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{c.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
