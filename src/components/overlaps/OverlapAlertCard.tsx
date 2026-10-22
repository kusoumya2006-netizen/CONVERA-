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
      className={`bg-white rounded-lg border transition-all duration-150 shadow-sm overflow-hidden ${
        alert.reviewStatus === 'PENDING_REVIEW'
          ? 'border-rose-300 ring-1 ring-rose-200'
          : 'border-slate-200'
      }`}
    >
      {/* Top Card Header */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              {alert.alertId}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                alert.confidence === 'HIGH'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {alert.confidence} CONFIDENCE
            </span>
            {hasRbAndPgrc && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                CRITICAL RB + PGRC OVERLAP
              </span>
            )}
            <OverlapReviewBadge status={alert.reviewStatus} />
          </div>

          <h3 className="text-sm font-bold text-slate-900 pt-0.5">
            {alert.institutionName}{' '}
            <span className="font-mono text-xs font-normal text-slate-500">
              (Permanent ID: {alert.institutionId})
            </span>
          </h3>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsCoordinateOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0 ${
            alert.reviewStatus === 'PENDING_REVIEW'
              ? 'bg-rose-700 hover:bg-rose-800 text-white'
              : 'bg-gov-olive hover:bg-gov-olive-light text-white'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>{alert.reviewStatus === 'PENDING_REVIEW' ? 'Coordinate Matters' : 'Update Review'}</span>
        </button>
      </div>

      {/* Reason Box */}
      <div className="px-4 py-3 bg-rose-50/40 border-b border-rose-100 text-xs text-rose-950 flex items-start gap-2">
        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <strong className="font-semibold">Detection Engine Analysis: </strong>
          <span>{alert.reason}</span>
        </div>
      </div>

      {/* Side-by-side Case Comparison */}
      <div className="p-4">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          Concurrently Active Complaint Matters ({involvedCaseRecords.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {involvedCaseRecords.map(c => (
            <div
              key={c.caseId}
              onClick={() => setSelectedCaseId(c.caseId)}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-gov-olive hover:shadow-sm cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{c.caseId}</span>
                  <BureauBadge bureau={c.bureau} size="sm" />
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">{c.category}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Officer: <strong>{c.assignedOfficer.split('(')[0]}</strong></span>
                <span className="text-gov-olive font-semibold flex items-center gap-0.5">
                  Dossier <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Coordination Status Footer if reviewed */}
      {alert.reviewStatus !== 'PENDING_REVIEW' && (
        <div className="px-4 py-3 bg-emerald-50/50 border-t border-emerald-100 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              <strong>Coordination Action Taken:</strong> {alert.coordinationRemarks}
            </span>
          </div>
          <div className="text-[11px] text-emerald-800">
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
