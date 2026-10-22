import React, { useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Bureau } from '../../types';
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

export const BureauWorkloadChart: React.FC = () => {
  const { cases } = useCaseWatch();

  const chartData = useMemo(() => {
    const bureaus: Bureau[] = ['RB', 'PGRC', 'AB', 'Finance', 'Vigilance'];
    
    return bureaus.map(bureau => {
      const bureauCases = cases.filter(c => c.bureau === bureau);
      const pending = bureauCases.filter(c => c.status === 'Pending').length;
      const underProcess = bureauCases.filter(c => c.status === 'Under Process').length;
      const disposed = bureauCases.filter(c => c.status === 'Disposed').length;
      const other = bureauCases.filter(c => c.status === 'Transferred' || c.status === 'Escalated').length;

      return {
        name: bureau,
        'Pending': pending,
        'Under Process': underProcess,
        'Disposed': disposed,
        'Transferred/Escalated': other,
        total: bureauCases.length
      };
    });
  }, [cases]);

  return (
    <div className="bg-obsidian-850 p-5 rounded-xl border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Bureau-wise Workload Distribution</h3>
          <p className="text-xs text-slate-400">Active vs disposed cases across AICTE cells</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
          Stacked Overview
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid #334155',
                boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.5)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="Pending" stackId="a" fill="#d97706" />
            <Bar dataKey="Under Process" stackId="a" fill="#2563eb" />
            <Bar dataKey="Disposed" stackId="a" fill="#059669" />
            <Bar dataKey="Transferred/Escalated" stackId="a" fill="#64748b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
