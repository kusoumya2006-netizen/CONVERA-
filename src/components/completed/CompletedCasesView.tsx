import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { CaseRecord } from '../../types';
import { StatusBadge, BureauBadge, PriorityBadge } from '../common/StatusBadge';
import { ReopenCaseModal } from '../cases/ReopenCaseModal';
import {
  CheckCircle2,
  Calendar,
  UserCheck,
  Search,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Building2,
  Download
} from 'lucide-react';
import { exportCasesToCsv } from '../../services/exportService';

export const CompletedCasesView: React.FC = () => {
  const { cases, setSelectedCaseId, setSelectedInstitutionId, setActiveTab } = useCaseWatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [bureauFilter, setBureauFilter] = useState<'ALL' | string>('ALL');
  const [reopenTargetCase, setReopenTargetCase] = useState<CaseRecord | null>(null);

  const nowMs = Date.now();
  const fourteenDaysAgoMs = nowMs - 14 * 24 * 60 * 60 * 1000;

  // Strict: filter by completedAt within last 14 days, regardless of received/created date
  const completedCases = useMemo(() => {
    return cases.filter(c => {
      if (c.status !== 'Disposed' || !c.completedAt) return false;
      const compMs = new Date(c.completedAt).getTime();
      return compMs >= fourteenDaysAgoMs;
    });
  }, [cases, fourteenDaysAgoMs]);

  // Facet filtering
  const filteredCompleted = useMemo(() => {
    return completedCases.filter(c => {
      if (bureauFilter !== 'ALL' && c.bureau !== bureauFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = c.caseId.toLowerCase().includes(q);
        const matchesInst = (c.institutionName || '').toLowerCase().includes(q);
        const matchesOfficer = (c.completedBy || c.assignedOfficer || '').toLowerCase().includes(q);
        const matchesSummary = (c.resolutionSummary || '').toLowerCase().includes(q);
        if (!matchesId && !matchesInst && !matchesOfficer && !matchesSummary) {
          return false;
        }
      }
      return true;
    });
  }, [completedCases, bureauFilter, searchQuery]);

  // Bureau breakdown for metrics
  const rbCompleted = completedCases.filter(c => c.bureau === 'RB').length;
  const pgrcCompleted = completedCases.filter(c => c.bureau === 'PGRC').length;

  const handleExport = () => {
    exportCasesToCsv(
      filteredCompleted,
      `casewatch_completed_14_days_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Completed Proceedings — Last 14 Days
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grievances and regulatory inquiries fully disposed and closed within the past two-week monitoring cycle.
            Filtered strictly by administrative disposal timestamp.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Completed Register ({filteredCompleted.length})</span>
        </button>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-obsidian-850 p-4 rounded-lg border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Recent Disposals (14d)</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {completedCases.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Total resolved matters across all cells</p>
        </div>

        <div className="bg-obsidian-850 p-4 rounded-lg border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Regulation Bureau (RB)</span>
            <ShieldCheck className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {rbCompleted}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Inspections & compliance orders completed</p>
        </div>

        <div className="bg-obsidian-850 p-4 rounded-lg border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Public Grievances (PGRC)</span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {pgrcCompleted}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Student & faculty grievances redressed</p>
        </div>
      </div>

      {/* Filter / Search Strip */}
      <div className="bg-obsidian-850 p-4 rounded-lg border border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search completed records by Case ID, College, Completing Officer, or Resolution..."
            className="w-full pl-9 pr-4 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] font-semibold text-slate-400 uppercase">Bureau:</label>
          <select
            value={bureauFilter}
            onChange={e => setBureauFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-obsidian-950 border border-slate-700/80 rounded-md text-xs font-medium text-slate-200 focus:outline-none"
          >
            <option value="ALL" className="bg-obsidian-900 text-slate-200">All Bureaus</option>
            <option value="RB" className="bg-obsidian-900 text-slate-200">Regulation Bureau (RB)</option>
            <option value="PGRC" className="bg-obsidian-900 text-slate-200">Public Grievance Redressal (PGRC)</option>
            <option value="AB" className="bg-obsidian-900 text-slate-200">Approval Bureau (AB)</option>
          </select>
        </div>
      </div>

      {/* Completed Cases Table */}
      <div className="bg-obsidian-850 rounded-lg border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-950 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Bureau</th>
                <th className="px-3 py-3">Completed On</th>
                <th className="px-3 py-3">Completed By</th>
                <th className="px-4 py-3">Resolution Summary</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCompleted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No cases have been completed within the past 14 days matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCompleted.map(c => {
                  const compDateFormatted = c.completedAt
                    ? new Date(c.completedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A';

                  return (
                    <tr
                      key={c.caseId}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCaseId(c.caseId);
                        setActiveTab('registry');
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-100">{c.caseId}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                          Disposed
                        </span>
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
                          {c.institutionName}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">PID: {c.institutionId}</div>
                      </td>
                      <td className="px-3 py-3 max-w-[160px] truncate font-medium text-slate-200">
                        {c.category}
                      </td>
                      <td className="px-3 py-3">
                        <BureauBadge bureau={c.bureau} size="sm" />
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-slate-300">
                        {compDateFormatted}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{c.completedBy || c.assignedOfficer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs text-slate-300 text-[11px]">
                        <p className="line-clamp-2 leading-relaxed">
                          {c.resolutionSummary || c.lastAction}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setReopenTargetCase(c)}
                            title="Reopen this case if new evidence or non-compliance is submitted"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-amber-800/80 text-amber-300 hover:bg-amber-950/50 text-[11px] font-semibold transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reopen</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCaseId(c.caseId);
                              setActiveTab('registry');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-[11px] font-semibold transition-colors"
                          >
                            <span>Dossier</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reopen Case Modal */}
      {reopenTargetCase && (
        <ReopenCaseModal
          isOpen={Boolean(reopenTargetCase)}
          onClose={() => setReopenTargetCase(null)}
          caseRecord={reopenTargetCase}
        />
      )}
    </div>
  );
};
