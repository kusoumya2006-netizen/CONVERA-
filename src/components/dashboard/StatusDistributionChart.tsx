import React, { useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const StatusDistributionChart: React.FC = () => {
  const { cases } = useCaseWatch();

  const data = useMemo(() => {
    const counts = {
      'Pending': 0,
      'Under Process': 0,
      'Disposed': 0,
      'Transferred': 0,
      'Escalated': 0
    };

    for (const c of cases) {
      if (counts[c.status] !== undefined) {
        counts[c.status]++;
      }
    }

    const COLORS = {
      'Pending': '#f59e0b',
      'Under Process': '#3b82f6',
      'Disposed': '#10b981',
      'Transferred': '#a855f7',
      'Escalated': '#f43f5e'
    };

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS]
    }));
  }, [cases]);

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Case Status Composition</h3>
          <p className="text-xs text-slate-500">Live proportion of complaint stages</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
                border: 'none'
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
