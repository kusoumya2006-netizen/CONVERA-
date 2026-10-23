import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Institution, OverlapAlert } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge, BureauBadge, PriorityBadge, OverlapReviewBadge } from '../common/StatusBadge';
import { CoordinateModal } from '../overlaps/CoordinateModal';
import { calculateDeterministicUrgency } from '../../engine/urgencyCalculator';
import svceEntranceImg from '../../assets/svce-entrance.jpg';
import {
  MapPin,
  GitCompare,
  ChevronRight,
  ShieldCheck,
  Clock,
  Layers,
  Calendar,
  AlertTriangle,
  History,
  Building2,
  FileText,
  UserCheck,
  Share2
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
  const { cases, actions, alerts, setSelectedCaseId, setActiveTab, navigateToGraph } = useCaseWatch();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'cases' | 'overlaps' | 'history'>('overview');
  const [selectedCoordAlert, setSelectedCoordAlert] = useState<OverlapAlert | null>(null);

  // Cases for this institution
  const instCases = useMemo(
    () => cases.filter(c => c.institutionId === institution.institutionId),
    [cases, institution.institutionId]
  );
  const instCaseIds = useMemo(() => new Set(instCases.map(c => c.caseId)), [instCases]);
  const activeCases = useMemo(() => instCases.filter(c => c.status !== 'Disposed'), [instCases]);
  const disposedCases = useMemo(() => instCases.filter(c => c.status === 'Disposed'), [instCases]);

  const rbActiveCases = useMemo(() => activeCases.filter(c => c.bureau === 'RB'), [activeCases]);
  const pgrcActiveCases = useMemo(() => activeCases.filter(c => c.bureau === 'PGRC'), [activeCases]);

  // Overlap alerts for this institution
  const instAlerts = useMemo(
    () => alerts.filter(a => a.institutionId === institution.institutionId),
    [alerts, institution.institutionId]
  );

  // Chronological action history across all complaints for this institution
  const instActions = useMemo(
    () =>
      actions
        .filter(a => instCaseIds.has(a.caseId))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [actions, instCaseIds]
  );

  // Urgent / Overdue counts
  const overdueCount = useMemo(() => {
    return activeCases.filter(c => calculateDeterministicUrgency(c).isOverdue).length;
  }, [activeCases]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={institution.name}
      subtitle={`AICTE Permanent Institute ID: ${institution.institutionId} | ${institution.region} Region`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Navigation Sub-Tabs & Graph Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#272D35] pb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'overview', label: '360° Overview', icon: Building2 },
              { id: 'cases', label: `Cross-Bureau Complaints (${instCases.length})`, icon: FileText },
              { id: 'overlaps', label: `Overlap Intelligence (${instAlerts.length})`, icon: GitCompare },
              { id: 'history', label: `Institutional Audit Trail (${instActions.length})`, icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#161A20] text-[#E8EAED] border border-[#272D35]'
                      : 'text-[#737D8B] hover:text-[#A0A7B2] hover:bg-[#111419]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A3B86C]' : 'text-[#737D8B]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              onClose();
              navigateToGraph({ type: 'institution', id: institution.institutionId });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#A3B86C] text-xs font-semibold transition-colors shrink-0"
            title="View institution in Cross-Bureau Intelligence Graph"
          >
            <Share2 className="w-3.5 h-3.5 text-[#A3B86C]" />
            <span>View in Graph</span>
          </button>
        </div>

        {/* TAB 1: 360° OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="space-y-4">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
                <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Active Complaints</span>
                <p className="text-base font-bold text-[#E8EAED] mt-0.5">
                  {activeCases.length} <span className="text-xs font-normal text-[#A0A7B2]">({rbActiveCases.length} RB, {pgrcActiveCases.length} PGRC)</span>
                </p>
              </div>

              <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
                <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Disposed Matters</span>
                <p className="text-base font-bold text-[#69C9A0] mt-0.5">
                  {disposedCases.length} <span className="text-xs font-normal text-[#A0A7B2]">Resolved</span>
                </p>
              </div>

              <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
                <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Overlap Conflicts</span>
                <p className={`text-base font-bold mt-0.5 ${instAlerts.length > 0 ? 'text-[#F16D75]' : 'text-[#69C9A0]'}`}>
                  {instAlerts.length} <span className="text-xs font-normal text-[#A0A7B2]">Scenario{instAlerts.length !== 1 ? 's' : ''}</span>
                </p>
              </div>

              <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
                <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Overdue Deadlines</span>
                <p className={`text-base font-bold mt-0.5 ${overdueCount > 0 ? 'text-[#F16D75]' : 'text-[#E8EAED]'}`}>
                  {overdueCount} <span className="text-xs font-normal text-[#A0A7B2]">Critical</span>
                </p>
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

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
                <span className="text-[#737D8B] text-[10px] uppercase font-mono font-semibold block">Campus Category & Type</span>
                <span className="text-[#E8EAED] font-semibold">{institution.type}</span>
              </div>
              <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
                <span className="text-[#737D8B] text-[10px] uppercase font-mono font-semibold block">Accreditation Grade</span>
                <span className="text-[#A3B86C] font-semibold">{institution.accreditationGrade || 'AICTE Approved'}</span>
              </div>
              <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35]">
                <span className="text-[#737D8B] text-[10px] uppercase font-mono font-semibold block">Established Year</span>
                <span className="text-[#E8EAED] font-semibold">{institution.establishedYear}</span>
              </div>
            </div>

            {/* Address and Geographics */}
            <div className="p-3 bg-[#0B0D10] rounded-lg border border-[#272D35] text-xs flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#737D8B] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#E8EAED]">Campus Location: </span>
                <span className="text-[#A0A7B2]">{institution.address}</span>
              </div>
            </div>

            {/* Active Overlap Alert Callout */}
            {instAlerts.length > 0 && (
              <div className="p-3.5 bg-[#F16D75]/10 border border-[#F16D75]/30 rounded-lg flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#F16D75]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">
                    {instAlerts.length} Cross-Bureau Overlap Conflict{instAlerts.length > 1 ? 's' : ''} Active
                  </span>
                </div>
                <button
                  onClick={() => setActiveSubTab('overlaps')}
                  className="px-2.5 py-1 rounded bg-[#F16D75] text-[#08090B] font-semibold text-[11px] hover:bg-[#ff8088] transition-colors"
                >
                  View Coordination Details →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CROSS-BUREAU COMPLAINTS */}
        {activeSubTab === 'cases' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#737D8B] font-mono">
              <span>{instCases.length} Total Matters ({activeCases.length} Active, {disposedCases.length} Disposed)</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {instCases.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#737D8B] bg-[#0B0D10] rounded-lg border border-[#272D35]">
                  No complaints registered for this institution.
                </div>
              ) : (
                instCases.map(c => {
                  const urgency = calculateDeterministicUrgency(c);

                  return (
                    <div
                      key={c.caseId}
                      onClick={() => {
                        onClose();
                        setSelectedCaseId(c.caseId);
                        setActiveTab('registry');
                      }}
                      className="p-3.5 bg-[#0B0D10] border border-[#272D35] hover:border-[#38414D] hover:bg-[#161A20] rounded-md cursor-pointer transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#E8EAED]">{c.caseId}</span>
                          <BureauBadge bureau={c.bureau} size="sm" />
                          <PriorityBadge priority={c.priority} size="sm" />
                          <StatusBadge status={c.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              urgency.isOverdue
                                ? 'bg-[#F16D75]/15 text-[#F16D75] border-[#F16D75]/30'
                                : urgency.isDueWithin24h || urgency.daysUntilDue <= 2
                                ? 'bg-[#E8B75C]/15 text-[#E8B75C] border-[#E8B75C]/30'
                                : 'bg-[#161A20] text-[#A0A7B2] border-[#272D35]'
                            }`}
                          >
                            {urgency.deadlineCountdown}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#737D8B]" />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#E8EAED]">{c.category}</p>
                        <p className="text-[11px] text-[#A0A7B2] line-clamp-1 mt-0.5 leading-relaxed">{c.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-[#737D8B] pt-1 border-t border-[#272D35]/50">
                        <div>
                          <span>Assigned Officer: </span>
                          <span className="text-[#A0A7B2]">{c.assignedOfficer.split('(')[0]}</span>
                        </div>
                        <div className="sm:text-right">
                          <span>Target Disposal: </span>
                          <span className={urgency.isOverdue ? 'text-[#F16D75] font-bold' : 'text-[#E8EAED]'}>
                            {c.expectedDisposalDate.split('T')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: OVERLAP INTELLIGENCE */}
        {activeSubTab === 'overlaps' && (
          <div className="space-y-3">
            {instAlerts.length === 0 ? (
              <div className="p-8 text-center bg-[#0B0D10] rounded-lg border border-[#272D35] space-y-2">
                <ShieldCheck className="w-8 h-8 text-[#69C9A0] mx-auto" />
                <h4 className="text-xs font-bold text-[#E8EAED]">No Concurrent Overlaps Detected</h4>
                <p className="text-[11px] text-[#737D8B] max-w-md mx-auto">
                  Regulatory proceedings for this campus are operating without cross-bureau scheduling conflicts.
                </p>
              </div>
            ) : (
              instAlerts.map(alert => (
                <div
                  key={alert.alertId}
                  className="p-4 bg-[#0B0D10] border border-[#272D35] rounded-lg space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#E8EAED]">{alert.alertId}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161A20] text-[#A3B86C] border border-[#272D35]">
                        {alert.matchingStrategy === 'EXACT_PID' ? 'MATCH: EXACT PID' : 'MATCH: NORMALIZED NAME'}
                      </span>
                      <OverlapReviewBadge status={alert.reviewStatus} />
                    </div>

                    <button
                      onClick={() => setSelectedCoordAlert(alert)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#A3B86C] text-[#08090B] font-semibold text-xs hover:bg-[#B7CA82] transition-colors"
                    >
                      <GitCompare className="w-3 h-3" />
                      <span>Coordinate Matters</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#E8EAED] leading-relaxed">{alert.reason}</p>

                  {alert.matchingEvidence && (
                    <div className="p-2.5 rounded bg-[#111419] border border-[#272D35] text-[11px] text-[#A0A7B2]">
                      <strong className="text-[#E8EAED]">Matching Evidence:</strong> {alert.matchingEvidence}
                    </div>
                  )}

                  {alert.reviewStatus !== 'PENDING_REVIEW' && (
                    <div className="p-2.5 rounded bg-[#111419] border border-[#272D35] text-[11px] text-[#A0A7B2] flex items-center justify-between">
                      <div>
                        <strong className="text-[#E8EAED]">Coordinated Decision:</strong> {alert.coordinationRemarks}
                      </div>
                      <span className="font-mono text-[10px] text-[#737D8B]">Lead: {alert.leadBureau || 'Joint'}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: INSTITUTIONAL AUDIT TRAIL */}
        {activeSubTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#737D8B] font-mono">
              <span>{instActions.length} Recorded Regulatory Action{instActions.length !== 1 ? 's' : ''} Across All Files</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {instActions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#737D8B] bg-[#0B0D10] rounded-lg border border-[#272D35]">
                  No formal regulatory actions recorded yet.
                </div>
              ) : (
                instActions.map(action => (
                  <div
                    key={action.actionId}
                    className="p-3 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#E8EAED]">{action.caseId}</span>
                        <BureauBadge bureau={action.bureau} size="sm" />
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161A20] text-[#A0A7B2] border border-[#272D35]">
                          {action.actionType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#737D8B]">
                        {new Date(action.timestamp).toLocaleDateString()} {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-[#E8EAED] leading-relaxed">{action.remarks}</p>

                    <div className="flex items-center justify-between text-[10px] text-[#737D8B] font-mono pt-1">
                      <span>Authorized Official: <strong className="text-[#A0A7B2] font-medium">{action.officer}</strong></span>
                      <button
                        onClick={() => {
                          onClose();
                          setSelectedCaseId(action.caseId);
                          setActiveTab('registry');
                        }}
                        className="text-[#A3B86C] hover:text-[#B7CA82] font-semibold"
                      >
                        Open Case File →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Embedded Coordination Modal if triggered from 360° View */}
        {selectedCoordAlert && (
          <CoordinateModal
            isOpen={Boolean(selectedCoordAlert)}
            onClose={() => setSelectedCoordAlert(null)}
            alert={selectedCoordAlert}
          />
        )}
      </div>
    </Modal>
  );
};
