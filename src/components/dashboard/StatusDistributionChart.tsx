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
      'Pending': '#d97706',
      'Under Process': '#2563eb',
      'Disposed': '#059669',
      'Transferred': '#64748b',
      'Escalated': '#dc2626'
    };

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS]
    }));
  }, [cases]);

  return (
    <div className="bg-obsidian-850 p-5 rounded-xl border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Case Status Composition</h3>
          <p className="text-xs text-slate-400">Live proportion of complaint stages</p>
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
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid #334155',
                boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.5)'
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
