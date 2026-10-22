import React, { useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { exportCasesToCsv, exportOverlapsToCsv } from '../../services/exportService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Download, FileSpreadsheet, CheckCircle2, Clock, AlertTriangle, GitCompare } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { cases, institutions, alerts, stats, filteredCases } = useCaseWatch();

  // Overdue Ageing Analysis (0-15 days, 16-30 days, 31-60 days, >60 days)
  const ageingData = useMemo(() => {
    const nowMs = Date.now();
    const brackets = {
      '0-15 Days': 0,
      '16-30 Days': 0,
      '31-60 Days': 0,
      '>60 Days': 0
    };

    for (const c of cases) {
      if (c.status === 'Disposed') continue;
      const dueMs = new Date(c.expectedDisposalDate).getTime();
      if (dueMs < nowMs) {
        const diffDays = Math.ceil((nowMs - dueMs) / (1000 * 60 * 60 * 24));
        if (diffDays <= 15) brackets['0-15 Days']++;
        else if (diffDays <= 30) brackets['16-30 Days']++;
        else if (diffDays <= 60) brackets['31-60 Days']++;
        else brackets['>60 Days']++;
      }
    }

    return Object.entries(brackets).map(([bracket, count]) => ({
      bracket,
      'Overdue Cases': count
    }));
  }, [cases]);

  // Bureau Disposal Rate comparison
  const bureauDisposalData = useMemo(() => {
    const bureaus = ['RB', 'PGRC', 'AB', 'Finance', 'Vigilance'] as const;
    return bureaus.map(bureau => {
      const bCases = cases.filter(c => c.bureau === bureau);
      const total = bCases.length;
      const disposed = bCases.filter(c => c.status === 'Disposed').length;
      const active = total - disposed;
      const rate = total > 0 ? Math.round((disposed / total) * 100) : 0;

      return {
        bureau,
        Total: total,
        Disposed: disposed,
        Active: active,
        'Disposal Rate (%)': rate
      };
    });
  }, [cases]);

  // Region-wise Case Load
  const regionData = useMemo(() => {
    const instRegionMap = new Map<string, string>();
    for (const inst of institutions) {
      instRegionMap.set(inst.institutionId, inst.region);
    }

    const regCounts: Record<string, { active: number; disposed: number }> = {};

    for (const c of cases) {
      const reg = instRegionMap.get(c.institutionId) || 'Other';
      if (!regCounts[reg]) regCounts[reg] = { active: 0, disposed: 0 };
      if (c.status === 'Disposed') regCounts[reg].disposed++;
      else regCounts[reg].active++;
    }

    return Object.entries(regCounts).map(([region, counts]) => ({
      region,
      'Active Cases': counts.active,
      'Disposed Cases': counts.disposed
    }));
  }, [cases, institutions]);

  const handleExportFiltered = () => {
    exportCasesToCsv(
      filteredCases,
      `convera_cases_report_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleExportAllOverlaps = () => {
    exportOverlapsToCsv(
      alerts,
      `convera_overlaps_report_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[#111419] p-4 sm:p-5 rounded-lg border border-[#272D35] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#E8EAED]">
            Administrative Reports & Grievance Disposal Analytics
          </h2>
          <p className="text-xs text-[#A0A7B2] mt-1">
            Aggregated institutional performance, SLA compliance metrics, and downloadable statutory registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFiltered}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#E8EAED] text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#737D8B]" />
            <span>Cases Register (CSV)</span>
          </button>
          <button
            onClick={handleExportAllOverlaps}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] text-[#E8EAED] text-xs font-semibold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#737D8B]" />
            <span>Overlaps Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#111419] rounded-lg border border-[#272D35]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Disposal Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#69C9A0]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#E8EAED]">{stats.disposalRate}%</p>
          <p className="text-[10px] text-[#737D8B] mt-0.5">{stats.disposedCases} of {stats.totalComplaints} resolved</p>
        </div>

        <div className="p-3.5 bg-[#111419] rounded-lg border border-[#272D35]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Under Process</span>
            <Clock className="w-3.5 h-3.5 text-[#86A9FF]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#86A9FF]">{stats.underProcessCases}</p>
          <p className="text-[10px] text-[#737D8B] mt-0.5">Active inquiry or hearing</p>
        </div>

        <div className="p-3.5 bg-[#111419] rounded-lg border border-[#272D35]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">SLA Overdue</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#F16D75]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#F16D75]">{stats.overdueCases}</p>
          <p className="text-[10px] text-[#737D8B] mt-0.5">Exceeded disposal deadline</p>
        </div>

        <div className="p-3.5 bg-[#111419] rounded-lg border border-[#272D35]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-[#737D8B] uppercase font-mono">Coordinated Overlaps</span>
            <GitCompare className="w-3.5 h-3.5 text-[#A3B86C]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#E8EAED]">
            {stats.potentialOverlaps - stats.unresolvedOverlaps} / {stats.potentialOverlaps}
          </p>
          <p className="text-[10px] text-[#737D8B] mt-0.5">Alerts reviewed & resolved</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Overdue Ageing Breakdown */}
        <div className="bg-[#111419] p-4 sm:p-5 rounded-lg border border-[#272D35] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#E8EAED]">Overdue Case Ageing Analysis</h3>
            <p className="text-xs text-[#A0A7B2]">Number of active cases exceeding SLA cutoff by duration bracket</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#272D35" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#A0A7B2' }} axisLine={{ stroke: '#272D35' }} />
                <YAxis tick={{ fontSize: 11, fill: '#A0A7B2' }} axisLine={{ stroke: '#272D35' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161A20',
                    borderColor: '#272D35',
                    color: '#E8EAED',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="Overdue Cases" fill="#F16D75" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bureau Disposal Rates */}
        <div className="bg-[#111419] p-4 sm:p-5 rounded-lg border border-[#272D35] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#E8EAED]">Disposal Efficiency by Bureau / Cell</h3>
            <p className="text-xs text-[#A0A7B2]">Percentage of complaints resolved and closed by cell</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauDisposalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#272D35" />
                <XAxis dataKey="bureau" tick={{ fontSize: 11, fill: '#A0A7B2' }} axisLine={{ stroke: '#272D35' }} />
                <YAxis tick={{ fontSize: 11, fill: '#A0A7B2' }} axisLine={{ stroke: '#272D35' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161A20',
                    borderColor: '#272D35',
                    color: '#E8EAED',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="Disposal Rate (%)" fill="#A3B86C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Region-wise Table & Chart */}
      <div className="bg-[#111419] p-4 sm:p-5 rounded-lg border border-[#272D35] shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[#E8EAED]">Regional Grievance Workload Comparison</h3>
          <p className="text-xs text-[#A0A7B2]">Active vs resolved complaints across AICTE Regional Offices</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#272D35" />
              <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#A0A7B2' }} axisLine={{ stroke: '#272D35' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A0A7B2' }} axisLine={{ stroke: '#272D35' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161A20',
                  borderColor: '#272D35',
                  color: '#E8EAED',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Active Cases" fill="#86A9FF" />
              <Bar dataKey="Disposed Cases" fill="#69C9A0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
