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
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
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
          <tbody className="divide-y divide-slate-100">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
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
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedCaseId(c.caseId)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{c.caseId}</span>
                        {c.isMerged && (
                          <span
                            onClick={e => {
                              e.stopPropagation();
                              setActiveTab('merged');
                            }}
                            title={`Merged into primary case ${c.mergedIntoCaseId}`}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200"
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
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-gov-olive/20 text-gov-olive border border-gov-olive/30"
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
                        className="font-medium text-slate-900 truncate hover:text-gov-olive"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedInstitutionId(c.institutionId);
                          setActiveTab('institutions');
                        }}
                      >
                        {c.institutionName || 'Unknown Institution'}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        PID: {c.institutionId}
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[200px]">
                      <div className="text-slate-800 font-medium truncate">{c.category}</div>
                      <div className="text-[10px] text-slate-500">By {c.complainantType}</div>
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
                          <div className="text-[11px] font-semibold text-emerald-800 truncate" title={`Completed by ${c.completedBy || c.assignedOfficer}`}>
                            Completed by {c.completedBy || c.assignedOfficer}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">
                            Closed: {c.completedAt ? c.completedAt.split('T')[0] : c.lastActionAt?.split('T')[0]}
                          </div>
                        </div>
                      ) : (
                        <div className="truncate text-slate-600">{c.assignedOfficer}</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className={`font-mono text-[11px] ${isOverdue ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                        {c.expectedDisposalDate ? c.expectedDisposalDate.split('T')[0] : ''}
                      </div>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-rose-600 font-bold">
                          <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                      {hasOverlap ? (
                        <button
                          onClick={() => setActiveTab('overlaps')}
                          title="Concurrent active cases in other Bureaus. Click to view coordination alert."
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
                        >
                          <GitCompare className="w-3 h-3 text-rose-600" />
                          <span>Overlap</span>
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedCaseId(c.caseId)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gov-olive hover:text-gov-olive-light"
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
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {filteredCases.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-900">
            {Math.min(currentPage * pageSize, filteredCases.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-900">{filteredCases.length}</span> records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
