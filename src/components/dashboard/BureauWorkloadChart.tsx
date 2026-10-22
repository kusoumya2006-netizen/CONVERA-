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
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Bureau-wise Workload Distribution</h3>
          <p className="text-xs text-slate-500">Active vs disposed cases across AICTE cells</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
          Stacked Overview
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="Pending" stackId="a" fill="#f59e0b" />
            <Bar dataKey="Under Process" stackId="a" fill="#3b82f6" />
            <Bar dataKey="Disposed" stackId="a" fill="#10b981" />
            <Bar dataKey="Transferred/Escalated" stackId="a" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
