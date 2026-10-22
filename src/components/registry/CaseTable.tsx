import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { StatusBadge, BureauBadge, PriorityBadge, UrgencyBadgeView } from '../common/StatusBadge';
import { calculateDeterministicUrgency } from '../../engine/urgencyCalculator';
import {
  ChevronLeft,
  ChevronRight,
  GitCompare,
  AlertTriangle
} from 'lucide-react';

export const CaseTable: React.FC = () => {
  const { filteredCases, setSelectedCaseId, setSelectedInstitutionId, alerts, setActiveTab } = useCaseWatch();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Build lookup of institutions that have active overlaps
  const overlapInstIdMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const alert of alerts) {
      if (alert.reviewStatus !== 'DISMISSED') {
        map.set(alert.institutionId, alert.alertId);
      }
    }
    return map;
  }, [alerts]);

  const activeOverlapCaseIds = useMemo(() => {
    const set = new Set<string>();
    alerts
      .filter(a => a.reviewStatus === 'PENDING_REVIEW')
      .forEach(a => a.caseIds.forEach(id => set.add(id)));
    return set;
  }, [alerts]);

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize));
  const currentRecords = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const nowMs = Date.now();

  return (
    <div className="bg-[#111419] rounded-lg border border-[#272D35] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B0D10] text-[#737D8B] font-semibold border-b border-[#272D35] font-mono text-[10px]">
            <tr>
              <th className="px-4 py-3">Case ID</th>
              <th className="px-4 py-3">Institution & Permanent ID</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Bureau</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Assigned Officer</th>
              <th className="px-3 py-3">Disposal Target</th>
              <th className="px-3 py-3 text-center">Overlap</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272D35]/70">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-[#737D8B]">
                  No complaint cases match your selected filter criteria.
                </td>
              </tr>
            ) : (
              currentRecords.map(c => {
                const hasOverlap = overlapInstIdMap.has(c.institutionId);
                const urgency = calculateDeterministicUrgency(c, activeOverlapCaseIds);
                const isOverdue = urgency.isOverdue;

                return (
                  <tr
                    key={c.caseId}
                    className="hover:bg-[#161A20] transition-colors cursor-pointer"
                    onClick={() => setSelectedCaseId(c.caseId)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#E8EAED]">{c.caseId}</span>
                        {c.isMerged && (
                          <span
                            onClick={e => {
                              e.stopPropagation();
                              setActiveTab('merged');
                            }}
                            title={`Merged into primary case ${c.mergedIntoCaseId}`}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#86A9FF]/10 text-[#86A9FF] border border-[#86A9FF]/30"
                          >
                            Merged
                          </span>
                        )}
                        {c.mergedCaseIds && c.mergedCaseIds.length > 0 && (
                          <span
                            onClick={e => {
                              e.stopPropagation();
                              setActiveTab('merged');
                            }}
                            title={`Primary case with ${c.mergedCaseIds.length} consolidated complaints`}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#161A20] text-[#E8EAED] border border-[#272D35]"
                          >
                            Lead ({c.mergedCaseIds.length})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#737D8B] font-mono mt-0.5">
                        {c.receivedAt ? c.receivedAt.split('T')[0] : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div
                        className="font-medium text-[#E8EAED] truncate hover:text-[#A3B86C] transition-colors"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedInstitutionId(c.institutionId);
                          setActiveTab('institutions');
                        }}
                      >
                        {c.institutionName || 'Unknown Institution'}
                      </div>
                      <div className="font-mono text-[10px] text-[#737D8B]">
                        PID: {c.institutionId}
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[200px]">
                      <div className="text-[#A0A7B2] font-medium truncate">{c.category}</div>
                      <div className="text-[10px] text-[#737D8B]">By {c.complainantType}</div>
                    </td>
                    <td className="px-3 py-3">
                      <BureauBadge bureau={c.bureau} size="sm" />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="px-3 py-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-3 py-3 max-w-[160px]">
                      {c.status === 'Disposed' ? (
                        <div>
                          <div className="text-[11px] font-medium text-[#69C9A0] truncate" title={`Completed by ${c.completedBy || c.assignedOfficer}`}>
                            Completed by {c.completedBy || c.assignedOfficer}
                          </div>
                          <div className="font-mono text-[10px] text-[#737D8B]">
                            Closed: {c.completedAt ? c.completedAt.split('T')[0] : c.lastActionAt?.split('T')[0]}
                          </div>
                        </div>
                      ) : (
                        <div className="truncate text-[#A0A7B2]">{c.assignedOfficer}</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`font-mono text-[11px] ${isOverdue ? 'text-[#F16D75] font-bold' : 'text-[#A0A7B2]'}`}>
                          {c.expectedDisposalDate ? c.expectedDisposalDate.split('T')[0] : 'N/A'}
                        </span>
                        {c.status !== 'Disposed' ? (
                          <UrgencyBadgeView analysis={urgency} size="sm" showCountdown />
                        ) : (
                          <span className="font-mono text-[9px] text-[#69C9A0]">Resolved</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                      {hasOverlap ? (
                        <button
                          onClick={() => setActiveTab('overlaps')}
                          title="Concurrent active cases in other Bureaus. Click to view coordination alert."
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F16D75]/15 text-[#F16D75] border border-[#F16D75]/35 hover:bg-[#F16D75]/25 transition-colors"
                        >
                          <GitCompare className="w-3 h-3 text-[#F16D75]" />
                          <span>Overlap</span>
                        </button>
                      ) : (
                        <span className="text-[#272D35]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedCaseId(c.caseId)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A3B86C] hover:text-[#B7CA82] transition-colors"
                      >
                        <span>Dossier</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="px-4 py-3 bg-[#0B0D10] border-t border-[#272D35] flex items-center justify-between text-xs text-[#737D8B]">
        <div>
          Showing{' '}
          <span className="font-semibold text-[#E8EAED]">
            {filteredCases.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-[#E8EAED]">
            {Math.min(currentPage * pageSize, filteredCases.length)}
          </span>{' '}
          of <span className="font-semibold text-[#E8EAED]">{filteredCases.length}</span> records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-[#272D35] disabled:opacity-30 disabled:cursor-not-allowed bg-[#161A20] hover:bg-[#1C2129] text-[#A0A7B2] hover:text-[#E8EAED] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-2 text-[#A0A7B2]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-[#272D35] disabled:opacity-30 disabled:cursor-not-allowed bg-[#161A20] hover:bg-[#1C2129] text-[#A0A7B2] hover:text-[#E8EAED] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
