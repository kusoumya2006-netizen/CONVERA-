import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { CaseRecord } from '../../types';
import { StatusBadge, BureauBadge, PriorityBadge } from '../common/StatusBadge';
import {
  ChevronLeft,
  ChevronRight,
  GitCompare,
  AlertTriangle,
  ExternalLink,
  Clock
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

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize));
  const currentRecords = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const nowMs = Date.now();

  return (
    <div className="bg-obsidian-850 rounded-lg border border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-obsidian-950 text-slate-300 font-semibold border-b border-slate-800">
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
          <tbody className="divide-y divide-slate-800/60">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                  No complaint cases match your selected filter criteria.
                </td>
              </tr>
            ) : (
              currentRecords.map(c => {
                const hasOverlap = overlapInstIdMap.has(c.institutionId);
                const dueMs = new Date(c.expectedDisposalDate).getTime();
                const isOverdue = c.status !== 'Disposed' && dueMs < nowMs;

                return (
                  <tr
                    key={c.caseId}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedCaseId(c.caseId)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-100">{c.caseId}</span>
                        {c.isMerged && (
                          <span
                            onClick={e => {
                              e.stopPropagation();
                              setActiveTab('merged');
                            }}
                            title={`Merged into primary case ${c.mergedIntoCaseId}`}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950/70 text-blue-300 border border-blue-800/60"
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
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-200 border border-slate-700"
                          >
                            Lead ({c.mergedCaseIds.length})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.receivedAt ? c.receivedAt.split('T')[0] : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div
                        className="font-medium text-slate-100 truncate hover:text-slate-300"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedInstitutionId(c.institutionId);
                          setActiveTab('institutions');
                        }}
                      >
                        {c.institutionName || 'Unknown Institution'}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        PID: {c.institutionId}
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[200px]">
                      <div className="text-slate-200 font-medium truncate">{c.category}</div>
                      <div className="text-[10px] text-slate-400">By {c.complainantType}</div>
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
                          <div className="text-[11px] font-semibold text-emerald-400 truncate" title={`Completed by ${c.completedBy || c.assignedOfficer}`}>
                            Completed by {c.completedBy || c.assignedOfficer}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            Closed: {c.completedAt ? c.completedAt.split('T')[0] : c.lastActionAt?.split('T')[0]}
                          </div>
                        </div>
                      ) : (
                        <div className="truncate text-slate-300">{c.assignedOfficer}</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className={`font-mono text-[11px] ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                        {c.expectedDisposalDate ? c.expectedDisposalDate.split('T')[0] : ''}
                      </div>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-rose-400 font-bold">
                          <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                      {hasOverlap ? (
                        <button
                          onClick={() => setActiveTab('overlaps')}
                          title="Concurrent active cases in other Bureaus. Click to view coordination alert."
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900"
                        >
                          <GitCompare className="w-3 h-3 text-rose-400" />
                          <span>Overlap</span>
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedCaseId(c.caseId)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white"
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
      <div className="px-4 py-3 bg-obsidian-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-200">
            {filteredCases.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-200">
            {Math.min(currentPage * pageSize, filteredCases.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-200">{filteredCases.length}</span> records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-obsidian-800 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium px-2 text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-obsidian-800 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
