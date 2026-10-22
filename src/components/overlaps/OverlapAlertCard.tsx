import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { OverlapAlert, SemanticComparisonResult } from '../../types';
import { BureauBadge, StatusBadge, OverlapReviewBadge, PriorityBadge } from '../common/StatusBadge';
import { CoordinateModal } from './CoordinateModal';
import { calculateDeterministicUrgency } from '../../engine/urgencyCalculator';
import {
  GitCompare,
  AlertOctagon,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Compass,
  Link2,
  Clock,
  XCircle,
  Activity,
  Sparkles
} from 'lucide-react';

interface OverlapAlertCardProps {
  alert: OverlapAlert;
}

export const OverlapAlertCard: React.FC<OverlapAlertCardProps> = ({ alert }) => {
  const { cases, setSelectedCaseId, setActiveTab } = useCaseWatch();
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

            {/* Matching Strategy & Confidence */}
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                alert.matchingStrategy === 'EXACT_PID'
                  ? 'bg-[#A3B86C]/10 text-[#A3B86C] border-[#A3B86C]/30'
                  : 'bg-[#E8B75C]/10 text-[#E8B75C] border-[#E8B75C]/30'
              }`}
            >
              {alert.matchingStrategy === 'EXACT_PID' ? 'MATCH: EXACT PID' : 'MATCH: NORMALIZED NAME'}
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

            {alert.categoryCorrelation && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161A20] text-[#E8EAED] border border-[#272D35]">
                {alert.categoryCorrelation.replace('_', ' ')}
              </span>
            )}

            {alert.isConfirmedRelated && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#69C9A0]/10 text-[#69C9A0] border border-[#69C9A0]/30 flex items-center gap-1">
                <Link2 className="w-2.5 h-2.5" />
                CONFIRMED RELATED DOSSIERS
              </span>
            )}

            {alert.highestUrgency && alert.highestUrgency !== 'NORMAL' && (
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${
                  alert.highestUrgency === 'OVERDUE'
                    ? 'bg-[#F16D75]/10 text-[#F16D75] border-[#F16D75]/30 animate-pulse'
                    : alert.highestUrgency === 'DUE_SOON'
                    ? 'bg-[#E8B75C]/10 text-[#E8B75C] border-[#E8B75C]/30'
                    : 'bg-[#86A9FF]/10 text-[#86A9FF] border-[#86A9FF]/30'
                }`}
              >
                <Clock className="w-2.5 h-2.5" />
                URGENCY: {alert.highestUrgency.replace('_', ' ')}
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

      {/* Detection Engine Analysis & Evidence */}
      <div className="px-4 py-3 bg-[#0B0D10] border-b border-[#272D35] text-xs space-y-1.5">
        <div className="flex items-start gap-2">
          <AlertOctagon className="w-4 h-4 text-[#F16D75] shrink-0 mt-0.5" />
          <div className="text-[#E8EAED] leading-relaxed">
            <span className="font-semibold text-[#A0A7B2]">Detection Analysis: </span>
            <span>{alert.reason}</span>
          </div>
        </div>

        {alert.matchingEvidence && (
          <div className="flex items-start gap-2 pl-6 text-[11px] text-[#A0A7B2]">
            <Layers className="w-3.5 h-3.5 text-[#A3B86C] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#E8EAED]">Matching Evidence:</strong> {alert.matchingEvidence}
            </span>
          </div>
        )}

        {alert.recommendedAction && (
          <div className="flex items-start gap-2 pl-6 text-[11px] text-[#A3B86C]">
            <Compass className="w-3.5 h-3.5 text-[#A3B86C] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#E8EAED]">Recommended Action:</strong> {alert.recommendedAction}
            </span>
          </div>
        )}

        {/* Experimental Description Similarity (Domain-Based Vocabulary Heuristic) */}
        {alert.semanticComparisons && alert.semanticComparisons.length > 0 && (
          <div className="flex flex-col gap-1.5 pl-6 pt-1 text-[11px] border-t border-[#1C2129] mt-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#86A9FF] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#86A9FF]" />
                Experimental Description Similarity:
              </span>
              {alert.semanticComparisons.map((sc: SemanticComparisonResult, idx: number) => (
                <span
                  key={idx}
                  className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                    sc.label === 'HIGH_SEMANTIC_SIMILARITY'
                      ? 'bg-[#86A9FF]/15 text-[#86A9FF] border-[#86A9FF]/30'
                      : sc.label === 'MODERATE_SEMANTIC_SIMILARITY'
                      ? 'bg-[#E8B75C]/15 text-[#E8B75C] border-[#E8B75C]/30'
                      : 'bg-[#272D35] text-[#A0A7B2] border-[#38414D]'
                  }`}
                  title={sc.interpretation}
                >
                  {sc.caseId1} ↔ {sc.caseId2}: {sc.similarityPercentage}% ({sc.label.replace(/_/g, ' ')})
                </span>
              ))}
            </div>
            <div className="text-[10px] text-[#A0A7B2] leading-relaxed">
              Uses a predefined domain vocabulary to estimate thematic similarity. May miss differently worded complaints outside its vocabulary. Not a duplicate probability; human review required.
            </div>
          </div>
        )}
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
          {involvedCaseRecords.map(c => {
            const urgency = calculateDeterministicUrgency(c);

            return (
              <div
                key={c.caseId}
                onClick={() => {
                  setSelectedCaseId(c.caseId);
                  setActiveTab('registry');
                }}
                className="p-3.5 rounded-md border border-[#272D35] bg-[#111419] hover:bg-[#161A20] hover:border-[#38414D] cursor-pointer transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#E8EAED]">{c.caseId}</span>
                    <BureauBadge bureau={c.bureau} size="sm" />
                    <PriorityBadge priority={c.priority} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                        urgency.isOverdue
                          ? 'bg-[#F16D75]/15 text-[#F16D75] border-[#F16D75]/30'
                          : urgency.isDueWithin24h || urgency.daysUntilDue <= 2
                          ? 'bg-[#E8B75C]/15 text-[#E8B75C] border-[#E8B75C]/30'
                          : 'bg-[#161A20] text-[#A0A7B2] border-[#272D35]'
                      }`}
                    >
                      {urgency.deadlineCountdown}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#E8EAED] truncate">{c.category}</p>
                  <p className="text-[11px] text-[#A0A7B2] line-clamp-2 mt-0.5 leading-relaxed">{c.description}</p>
                </div>

                {/* Progress & Next Step */}
                <div className="p-2 rounded bg-[#0B0D10] border border-[#272D35] text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-[#737D8B]">
                    <span>Last Action:</span>
                    <span className="text-[#A0A7B2] truncate max-w-[210px] font-mono">{c.lastAction}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#737D8B]">
                    <span>Next Action:</span>
                    <span className="text-[#A3B86C] truncate max-w-[210px] font-mono font-medium">{c.nextAction || 'Pending review'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-0.5 text-[#737D8B]">
                  <div>
                    <span>Received: </span>
                    <span className="text-[#A0A7B2]">{c.receivedAt.split('T')[0]}</span>
                  </div>
                  <div className="text-right">
                    <span>Target: </span>
                    <span className={urgency.isOverdue ? 'text-[#F16D75] font-bold' : 'text-[#E8EAED]'}>
                      {c.expectedDisposalDate.split('T')[0]}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#272D35] flex items-center justify-between text-[11px] text-[#737D8B]">
                  <span className="truncate max-w-[200px]">
                    Officer: <strong className="text-[#A0A7B2] font-medium">{c.assignedOfficer.split('(')[0]}</strong>
                  </span>
                  <span className="text-[#A3B86C] hover:text-[#B7CA82] font-semibold flex items-center gap-0.5 shrink-0">
                    Inspect Dossier <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coordination Status Footer if already reviewed */}
      {alert.reviewStatus !== 'PENDING_REVIEW' && (
        <div className="px-4 py-2.5 bg-[#111419] border-t border-[#272D35] text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#E8EAED]">
            {alert.reviewStatus === 'DISMISSED' ? (
              <XCircle className="w-4 h-4 text-[#737D8B]" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#69C9A0]" />
            )}
            <span>
              <strong className="text-[#A0A7B2]">
                {alert.reviewStatus === 'DISMISSED' ? 'Dismissal Rationale:' : 'Coordination Action:'}
              </strong>{' '}
              {alert.dismissalReason ? `${alert.dismissalReason} — ` : ''}
              {alert.coordinationRemarks}
            </span>
          </div>
          <div className="text-[11px] text-[#737D8B] font-mono">
            Lead Bureau: <strong className="text-[#E8EAED]">{alert.leadBureau || 'Joint'}</strong> • Reviewed by {alert.reviewedBy || 'Redressal Coordinator'}
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
