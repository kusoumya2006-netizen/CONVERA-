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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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
      `casewatch_cases_report_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleExportAllOverlaps = () => {
    exportOverlapsToCsv(
      alerts,
      `casewatch_overlaps_report_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-obsidian-850 p-5 rounded-lg border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Administrative Reports & Grievance Disposal Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated institutional performance, SLA compliance metrics, and downloadable statutory registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFiltered}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Cases Register (CSV)</span>
          </button>
          <button
            onClick={handleExportAllOverlaps}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Overlaps Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-obsidian-850 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">National Disposal Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">{stats.disposalRate}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{stats.disposedCases} of {stats.totalComplaints} cases resolved</p>
        </div>

        <div className="p-4 bg-obsidian-850 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Active Under Process</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-300">{stats.underProcessCases}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Formal inquiry or hearing in progress</p>
        </div>

        <div className="p-4 bg-obsidian-850 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-rose-300 uppercase">SLA Overdue Ageing</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-300">{stats.overdueCases}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Exceeded expected disposal cutoff</p>
        </div>

        <div className="p-4 bg-obsidian-850 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Cross-Bureau Coordinated</span>
            <GitCompare className="w-4 h-4 text-slate-300" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">
            {stats.potentialOverlaps - stats.unresolvedOverlaps} / {stats.potentialOverlaps}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Alerts reviewed & coordinated</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Ageing Breakdown */}
        <div className="bg-obsidian-850 p-5 rounded-lg border border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100">Overdue Case Ageing Analysis</h3>
            <p className="text-xs text-slate-400">Number of active cases exceeding SLA cutoff by duration bracket</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="Overdue Cases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bureau Disposal Rates */}
        <div className="bg-obsidian-850 p-5 rounded-lg border border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100">Disposal Efficiency by Bureau / Cell</h3>
            <p className="text-xs text-slate-400">Percentage of complaints resolved and closed by cell</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauDisposalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="bureau" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="Disposal Rate (%)" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Region-wise Table & Chart */}
      <div className="bg-obsidian-850 p-5 rounded-lg border border-slate-800 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-100">Regional Grievance Workload Comparison</h3>
          <p className="text-xs text-slate-400">Active vs resolved complaints across AICTE Regional Offices</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  color: '#F8FAFC',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Active Cases" fill="#38bdf8" />
              <Bar dataKey="Disposed Cases" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
