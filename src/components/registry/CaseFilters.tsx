import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Bureau, CaseStatus, Region, ComplaintCategory } from '../../types';
import { Search, RotateCcw, Download, Filter } from 'lucide-react';
import { exportCasesToCsv } from '../../services/exportService';

export const CaseFilters: React.FC = () => {
  const { filters, setFilters, resetFilters, filteredCases } = useCaseWatch();

  const handleExport = () => {
    exportCasesToCsv(filteredCases, `casewatch_filtered_cases_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const bureaus: (Bureau | 'ALL')[] = ['ALL', 'RB', 'PGRC', 'AB', 'Finance', 'Vigilance'];
  const statuses: (CaseStatus | 'ALL')[] = ['ALL', 'Pending', 'Under Process', 'Disposed', 'Transferred', 'Escalated'];
  const regions: (Region | 'ALL')[] = [
    'ALL',
    'Northern',
    'Western',
    'Southern',
    'Eastern',
    'Central',
    'North-Western',
    'South-Western'
  ];

  const categories: (ComplaintCategory | 'ALL')[] = [
    'ALL',
    'Infrastructure Non-Compliance',
    'Faculty Pay & Service Grievance',
    'Unlawful Fee Demands',
    'Capitation Fee Allegation',
    'Unauthorized Course / Intake',
    'Harassment / Discriminatory Conduct',
    'Affiliation & Land Discrepancy',
    'Withholding Original Certificates',
    'Substandard Lab / Workshop Equipment'
  ];

  return (
    <div className="bg-obsidian-850 p-4 rounded-lg border border-slate-800 shadow-sm space-y-3 mb-4">
      {/* Search Input Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters({ searchQuery: e.target.value })}
            placeholder="Search by Case ID, Permanent Inst. ID (e.g. 1-4392811), College Name, Officer..."
            className="w-full pl-9 pr-4 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({filteredCases.length})</span>
          </button>
        </div>
      </div>

      {/* Multi-Facet Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800">
        {/* Bureau */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Bureau / Cell</label>
          <select
            value={filters.bureau}
            onChange={e => setFilters({ bureau: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-obsidian-950 border border-slate-700/80 rounded-md text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
          >
            {bureaus.map(b => (
              <option key={b} value={b} className="bg-obsidian-900 text-slate-200">
                {b === 'ALL' ? 'All Bureaus' : b}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters({ status: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-obsidian-950 border border-slate-700/80 rounded-md text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
          >
            {statuses.map(s => (
              <option key={s} value={s} className="bg-obsidian-900 text-slate-200">
                {s === 'ALL' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">AICTE Region</label>
          <select
            value={filters.region}
            onChange={e => setFilters({ region: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-obsidian-950 border border-slate-700/80 rounded-md text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
          >
            {regions.map(r => (
              <option key={r} value={r} className="bg-obsidian-900 text-slate-200">
                {r === 'ALL' ? 'All Regions' : r}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Complaint Category</label>
          <select
            value={filters.category}
            onChange={e => setFilters({ category: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-obsidian-950 border border-slate-700/80 rounded-md text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
          >
            {categories.map(c => (
              <option key={c} value={c} className="bg-obsidian-900 text-slate-200">
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Date / SLA */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Timeline / SLA</label>
          <select
            value={filters.dateRange}
            onChange={e => setFilters({ dateRange: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-obsidian-950 border border-slate-700/80 rounded-md text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
          >
            <option value="ALL" className="bg-obsidian-900 text-slate-200">All Records</option>
            <option value="OVERDUE" className="bg-obsidian-900 text-slate-200">Overdue SLA Cases</option>
            <option value="COMPLETED_14_DAYS" className="bg-obsidian-900 text-slate-200">Completed — Last 14 Days</option>
            <option value="7_DAYS" className="bg-obsidian-900 text-slate-200">Received Past 7 Days</option>
            <option value="30_DAYS" className="bg-obsidian-900 text-slate-200">Received Past 30 Days</option>
            <option value="90_DAYS" className="bg-obsidian-900 text-slate-200">Received Past 90 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
};
