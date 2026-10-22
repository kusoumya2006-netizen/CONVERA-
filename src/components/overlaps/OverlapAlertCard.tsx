import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { OverlapAlert, CaseRecord } from '../../types';
import { BureauBadge, StatusBadge, OverlapReviewBadge } from '../common/StatusBadge';
import { CoordinateModal } from './CoordinateModal';
import {
  GitCompare,
  Building2,
  Calendar,
  AlertOctagon,
  ChevronRight,
  ShieldCheck,
  FileText
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

  return (
    <div
      className={`bg-obsidian-850 rounded-lg border transition-all duration-150 shadow-sm overflow-hidden ${
        alert.reviewStatus === 'PENDING_REVIEW'
          ? 'border-rose-800/80 ring-1 ring-rose-900/60'
          : 'border-slate-800'
      }`}
    >
      {/* Top Card Header */}
      <div className="p-4 bg-obsidian-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-200 px-2 py-0.5 rounded bg-obsidian-950 border border-slate-800">
              {alert.alertId}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                alert.confidence === 'HIGH'
                  ? 'bg-blue-950/70 text-blue-300 border-blue-800/60'
                  : 'bg-amber-950/70 text-amber-300 border-amber-800/60'
              }`}
            >
              {alert.confidence} CONFIDENCE
            </span>
            {hasRbAndPgrc && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80">
                CRITICAL RB + PGRC OVERLAP
              </span>
            )}
            <OverlapReviewBadge status={alert.reviewStatus} />
          </div>

          <h3 className="text-sm font-bold text-slate-100 pt-0.5">
            {alert.institutionName}{' '}
            <span className="font-mono text-xs font-normal text-slate-400">
              (Permanent ID: {alert.institutionId})
            </span>
          </h3>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsCoordinateOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0 ${
            alert.reviewStatus === 'PENDING_REVIEW'
              ? 'bg-rose-900 hover:bg-rose-800 border border-rose-700/80 text-white'
              : 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>{alert.reviewStatus === 'PENDING_REVIEW' ? 'Coordinate Matters' : 'Update Review'}</span>
        </button>
      </div>

      {/* Reason Box */}
      <div className="px-4 py-3 bg-rose-950/30 border-b border-rose-900/40 text-xs text-rose-200 flex items-start gap-2">
        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <strong className="font-semibold text-rose-100">Detection Engine Analysis: </strong>
          <span>{alert.reason}</span>
        </div>
      </div>

      {/* Side-by-side Case Comparison */}
      <div className="p-4">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Concurrently Active Complaint Matters ({involvedCaseRecords.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {involvedCaseRecords.map(c => (
            <div
              key={c.caseId}
              onClick={() => setSelectedCaseId(c.caseId)}
              className="p-3.5 rounded-lg border border-slate-800 bg-obsidian-900/40 hover:bg-obsidian-900/90 hover:border-slate-700 cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-100">{c.caseId}</span>
                  <BureauBadge bureau={c.bureau} size="sm" />
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-200">{c.category}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Officer: <strong className="text-slate-200">{c.assignedOfficer.split('(')[0]}</strong></span>
                <span className="text-slate-300 font-semibold flex items-center gap-0.5 hover:text-white">
                  Dossier <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Coordination Status Footer if reviewed */}
      {alert.reviewStatus !== 'PENDING_REVIEW' && (
        <div className="px-4 py-3 bg-emerald-950/30 border-t border-emerald-900/50 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Coordination Action Taken:</strong> {alert.coordinationRemarks}
            </span>
          </div>
          <div className="text-[11px] text-emerald-300/90">
            Lead: <strong>{alert.leadBureau || 'Joint'}</strong> • Reviewed by {alert.reviewedBy}
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
