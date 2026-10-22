import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { OverlapAlert } from '../../types';
import { BureauBadge, StatusBadge, OverlapReviewBadge } from '../common/StatusBadge';
import { CoordinateModal } from './CoordinateModal';
import {
  GitCompare,
  AlertOctagon,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface OverlapAlertCardProps {
  alert: OverlapAlert;
}

export const OverlapAlertCard: React.FC<OverlapAlertCardProps> = ({ alert }) => {
  const { cases, setSelectedCaseId } = useCaseWatch();
  const [isCoordinateOpen, setIsCoordinateOpen] = useState(false);

  // Retrieve full case records involved in this overlap
  const involvedCaseRecords = cases.filter(c => alert.caseIds.includes(c.caseId));
  const hasRbAndPgrc = alert.involvedBureaus.includes('RB') && alert.involvedBureaus.includes('PGRC');
  const isActionRequired = alert.reviewStatus === 'PENDING_REVIEW';

  return (
    <div
      className={`bg-[#161A20] rounded-lg border border-[#272D35] transition-all overflow-hidden ${
        isActionRequired ? 'border-l-4 border-l-[#F16D75]' : ''
      }`}
    >
      {/* Top Header: ID, Badges, Institution, and Review Action */}
      <div className="p-4 bg-[#111419] border-b border-[#272D35] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E8EAED] px-2 py-0.5 rounded bg-[#161A20] border border-[#272D35]">
              {alert.alertId}
            </span>
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                alert.confidence === 'HIGH'
                  ? 'bg-[#86A9FF]/10 text-[#86A9FF] border-[#86A9FF]/30'
                  : 'bg-[#E8B75C]/10 text-[#E8B75C] border-[#E8B75C]/30'
              }`}
            >
              {alert.confidence} CONFIDENCE
            </span>
            {hasRbAndPgrc && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F16D75]/10 text-[#F16D75] border border-[#F16D75]/30">
                CRITICAL RB + PGRC
              </span>
            )}
            <OverlapReviewBadge status={alert.reviewStatus} />
          </div>

          <h3 className="text-sm font-bold text-[#E8EAED] pt-0.5">
            {alert.institutionName}{' '}
            <span className="font-mono text-xs font-normal text-[#A0A7B2]">
              (PID: {alert.institutionId})
            </span>
          </h3>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsCoordinateOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors shrink-0 ${
            isActionRequired
              ? 'bg-[#F16D75]/15 hover:bg-[#F16D75]/25 text-[#F16D75] border border-[#F16D75]/40'
              : 'bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] hover:border-[#38414D] text-[#E8EAED]'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>{isActionRequired ? 'Coordinate Matters' : 'Update Review'}</span>
        </button>
      </div>

      {/* Detection Engine Analysis: Crisp graphite subpanel */}
      <div className="px-4 py-2.5 bg-[#0B0D10] border-b border-[#272D35] text-xs flex items-start gap-2">
        <AlertOctagon className="w-4 h-4 text-[#F16D75] shrink-0 mt-0.5" />
        <div className="text-[#E8EAED] leading-relaxed">
          <span className="font-semibold text-[#A0A7B2]">Detection Engine Analysis: </span>
          <span>{alert.reason}</span>
        </div>
      </div>

      {/* Side-by-side Case Comparison */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-[10px] font-semibold text-[#737D8B] uppercase tracking-wider font-mono">
            Concurrent Case Proceedings ({involvedCaseRecords.length})
          </h4>
          <span className="text-[11px] text-[#A0A7B2] font-mono">
            Bureaus: {alert.involvedBureaus.join(' & ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {involvedCaseRecords.map(c => (
            <div
              key={c.caseId}
              onClick={() => setSelectedCaseId(c.caseId)}
              className="p-3.5 rounded-md border border-[#272D35] bg-[#111419] hover:bg-[#161A20] hover:border-[#38414D] cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#E8EAED]">{c.caseId}</span>
                  <BureauBadge bureau={c.bureau} size="sm" />
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#E8EAED] truncate">{c.category}</p>
                <p className="text-[11px] text-[#A0A7B2] line-clamp-2 mt-0.5 leading-relaxed">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-[#272D35] flex items-center justify-between text-[11px] text-[#737D8B]">
                <span>
                  Officer: <strong className="text-[#A0A7B2] font-medium">{c.assignedOfficer.split('(')[0]}</strong>
                </span>
                <span className="text-[#A3B86C] hover:text-[#B7CA82] font-semibold flex items-center gap-0.5">
                  Dossier <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coordination Status Footer if already reviewed */}
      {alert.reviewStatus !== 'PENDING_REVIEW' && (
        <div className="px-4 py-2.5 bg-[#111419] border-t border-[#272D35] text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#E8EAED]">
            <ShieldCheck className="w-4 h-4 text-[#69C9A0]" />
            <span>
              <strong className="text-[#A0A7B2]">Coordination Action:</strong> {alert.coordinationRemarks}
            </span>
          </div>
          <div className="text-[11px] text-[#737D8B] font-mono">
            Lead Bureau: <strong className="text-[#E8EAED]">{alert.leadBureau || 'Joint'}</strong> • Reviewed by {alert.reviewedBy}
          </div>
        </div>
      )}

      {/* Coordinate Modal */}
      <CoordinateModal
        isOpen={isCoordinateOpen}
        onClose={() => setIsCoordinateOpen(false)}
        alert={alert}
      />
    </div>
  );
};
