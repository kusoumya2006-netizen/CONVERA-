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
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Administrative Reports & Grievance Disposal Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated institutional performance, SLA compliance metrics, and downloadable statutory registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFiltered}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gov-olive hover:bg-gov-olive-light text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Cases Register (CSV)</span>
          </button>
          <button
            onClick={handleExportAllOverlaps}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Overlaps Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">National Disposal Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.disposalRate}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{stats.disposedCases} of {stats.totalComplaints} cases resolved</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Active Under Process</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.underProcessCases}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Formal inquiry or hearing in progress</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-rose-700 uppercase">SLA Overdue Ageing</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700">{stats.overdueCases}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Exceeded expected disposal cutoff</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Cross-Bureau Coordinated</span>
            <GitCompare className="w-4 h-4 text-gov-olive" />
          </div>
          <p className="text-2xl font-bold text-gov-olive">
            {stats.potentialOverlaps - stats.unresolvedOverlaps} / {stats.potentialOverlaps}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Alerts reviewed & coordinated</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Ageing Breakdown */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Overdue Case Ageing Analysis</h3>
            <p className="text-xs text-slate-500">Number of active cases exceeding SLA cutoff by duration bracket</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="Overdue Cases" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bureau Disposal Rates */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Disposal Efficiency by Bureau / Cell</h3>
            <p className="text-xs text-slate-500">Percentage of complaints resolved and closed by cell</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauDisposalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bureau" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="Disposal Rate (%)" fill="#4d7c0f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Region-wise Table & Chart */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">Regional Grievance Workload Comparison</h3>
          <p className="text-xs text-slate-500">Active vs resolved complaints across AICTE Regional Offices</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Active Cases" fill="#3b82f6" />
              <Bar dataKey="Disposed Cases" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
