import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Bureau, CaseStatus, Region, ComplaintCategory } from '../../types';
import { Search, RotateCcw, Download } from 'lucide-react';
import { exportCasesToCsv } from '../../services/exportService';

export const CaseFilters: React.FC = () => {
  const { filters, setFilters, resetFilters, filteredCases } = useCaseWatch();

  const handleExport = () => {
    exportCasesToCsv(filteredCases, `convera_filtered_cases_${new Date().toISOString().split('T')[0]}.csv`);
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

  const dateRanges = [
    { label: 'All Time', value: 'ALL' },
    { label: 'Last 7 Days', value: '7_DAYS' },
    { label: 'Last 30 Days', value: '30_DAYS' },
    { label: 'Last 90 Days', value: '90_DAYS' },
    { label: 'Overdue SLA', value: 'OVERDUE' },
    { label: 'Completed (Last 14 Days)', value: 'COMPLETED_14_DAYS' }
  ] as const;

  return (
    <div className="bg-[#111419] p-4 rounded-lg border border-[#272D35] shadow-sm space-y-3 mb-4">
      {/* Search Input Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#737D8B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters({ searchQuery: e.target.value })}
            placeholder="Search by Case ID, Permanent Inst. ID (e.g. 1-4392811), College Name, Officer..."
            className="w-full pl-9 pr-4 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#272D35] text-[#A0A7B2] hover:bg-[#161A20] hover:text-[#E8EAED] text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#737D8B]" />
            <span>Reset Filters</span>
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#E8EAED] text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#737D8B]" />
            <span>Export CSV ({filteredCases.length})</span>
          </button>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-[#272D35]">
        <div>
          <label className="block text-[10px] font-mono uppercase text-[#737D8B] mb-1">Bureau / Cell</label>
          <select
            value={filters.bureau}
            onChange={e => setFilters({ bureau: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
          >
            {bureaus.map(b => (
              <option key={b} value={b}>{b === 'ALL' ? 'All Bureaus' : b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#737D8B] mb-1">Case Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters({ status: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#737D8B] mb-1">Region</label>
          <select
            value={filters.region}
            onChange={e => setFilters({ region: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
          >
            {regions.map(r => (
              <option key={r} value={r}>{r === 'ALL' ? 'All Regions' : r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#737D8B] mb-1">Grievance Category</label>
          <select
            value={filters.category}
            onChange={e => setFilters({ category: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C] truncate"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-[#737D8B] mb-1">Date Range / SLA</label>
          <select
            value={filters.dateRange}
            onChange={e => setFilters({ dateRange: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
          >
            {dateRanges.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
