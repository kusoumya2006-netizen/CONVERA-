import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Institution } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge, BureauBadge, PriorityBadge } from '../common/StatusBadge';
import svceEntranceImg from '../../assets/svce-entrance.jpg';
import {
  MapPin,
  GitCompare,
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

  const instAlerts = alerts.filter(a => a.institutionId === institution.institutionId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={institution.name}
      subtitle={`AICTE Permanent Institute ID: ${institution.institutionId} | ${institution.region} Region`}
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Institution Type</span>
            <p className="text-xs font-bold text-[#E8EAED] mt-0.5">{institution.type}</p>
          </div>
          <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Accreditation</span>
            <p className="text-xs font-bold text-[#E8EAED] mt-0.5">{institution.accreditationGrade || 'AICTE Approved'}</p>
          </div>
          <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Active Matters</span>
            <p className="text-xs font-bold text-[#86A9FF] mt-0.5">
              {activeCases.length} Open ({rbActiveCases.length} RB, {pgrcActiveCases.length} PGRC)
            </p>
          </div>
          <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Disposed Matters</span>
            <p className="text-xs font-bold text-[#69C9A0] mt-0.5">{disposedCases.length} Resolved</p>
          </div>
        </div>

        {/* Institution Entrance Photograph if SVCE */}
        {institution.institutionId === '1-4328901' && (
          <div className="relative rounded-lg overflow-hidden border border-[#272D35] h-44 bg-[#0B0D10] shadow-md">
            <img
              src={svceEntranceImg}
              alt="Sri Venkateswara College of Engineering main entrance"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/60 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] font-mono text-[#A3B86C] font-bold uppercase tracking-wider">
                Official AICTE Campus Registry Photo
              </span>
              <p className="text-sm font-bold text-white">Sri Venkateswara College of Engineering (SVCE), Sriperumbudur</p>
              <p className="text-[10px] text-[#A0A7B2] font-mono">
                Photo: PlaneMad / Wikimedia Commons · CC BY-SA 3.0
              </p>
            </div>
          </div>
        )}

        {/* Address and Geographics */}
        <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35] text-xs flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#737D8B] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#E8EAED]">Campus Location: </span>
            <span className="text-[#A0A7B2]">{institution.address}</span>
          </div>
        </div>

        {/* Overlap Alerts if any */}
        {instAlerts.length > 0 && (
          <div className="p-4 rounded-lg bg-[#161A20] border-l-4 border-l-[#F16D75] border-y border-r border-[#272D35] space-y-2">
            <div className="flex items-center gap-2 text-[#F16D75] font-bold text-xs">
              <GitCompare className="w-4 h-4 text-[#F16D75]" />
              <span>Cross-Bureau Coordination Overlap Alert Active</span>
            </div>
            {instAlerts.map(alert => (
              <div key={alert.alertId} className="text-xs text-[#E8EAED] bg-[#0B0D10] p-3 rounded-md border border-[#272D35]">
                <p className="font-medium">{alert.reason}</p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-[#A0A7B2]">Review State: <strong className="uppercase text-[#E8EAED] font-mono">{alert.reviewStatus}</strong></span>
                  <button
                    onClick={() => {
                      onClose();
                      setActiveTab('overlaps');
                    }}
                    className="text-[#A3B86C] font-semibold hover:text-[#B7CA82]"
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
          <h4 className="text-xs font-bold text-[#E8EAED] uppercase tracking-wider mb-2 font-mono">
            Consolidated Case History ({instCases.length} Total Matters)
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {instCases.length === 0 ? (
              <p className="text-xs text-[#737D8B] py-4 text-center">No complaints on file for this institution.</p>
            ) : (
              instCases.map(c => (
                <div
                  key={c.caseId}
                  onClick={() => {
                    onClose();
                    setSelectedCaseId(c.caseId);
                    setActiveTab('registry');
                  }}
                  className="p-3 bg-[#0B0D10] border border-[#272D35] hover:border-[#38414D] hover:bg-[#161A20] rounded-md flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#E8EAED]">{c.caseId}</span>
                      <BureauBadge bureau={c.bureau} size="sm" />
                      <StatusBadge status={c.status} size="sm" />
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="text-xs font-medium text-[#E8EAED]">{c.category}</p>
                    <p className="text-[10px] text-[#737D8B]">Received: {c.receivedAt.split('T')[0]}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737D8B]" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
