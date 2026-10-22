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
    <div className="bg-[#111419] p-4 sm:p-5 rounded-lg border border-[#272D35] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#E8EAED]">Bureau-wise Workload Distribution</h3>
          <p className="text-xs text-[#A0A7B2]">Active vs disposed cases across AICTE cells</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161A20] text-[#A0A7B2] border border-[#272D35]">
          Stacked View
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#272D35" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A0A7B2' }} axisLine={{ stroke: '#272D35' }} />
            <YAxis tick={{ fontSize: 11, fill: '#A0A7B2' }} axisLine={{ stroke: '#272D35' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161A20',
                color: '#E8EAED',
                borderRadius: '6px',
                fontSize: '12px',
                border: '1px solid #272D35',
                boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.6)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="Pending" stackId="a" fill="#E8B75C" />
            <Bar dataKey="Under Process" stackId="a" fill="#86A9FF" />
            <Bar dataKey="Disposed" stackId="a" fill="#69C9A0" />
            <Bar dataKey="Transferred/Escalated" stackId="a" fill="#737D8B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
