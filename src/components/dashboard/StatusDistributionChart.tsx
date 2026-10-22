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
      'Pending': '#E8B75C',
      'Under Process': '#86A9FF',
      'Disposed': '#69C9A0',
      'Transferred': '#737D8B',
      'Escalated': '#F16D75'
    };

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS]
    }));
  }, [cases]);

  return (
    <div className="bg-[#111419] p-4 sm:p-5 rounded-lg border border-[#272D35] shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-[#E8EAED]">Case Status Composition</h3>
          <p className="text-xs text-[#A0A7B2]">Proportion of complaint stages</p>
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
                backgroundColor: '#161A20',
                color: '#E8EAED',
                borderRadius: '6px',
                fontSize: '12px',
                border: '1px solid #272D35',
                boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.6)'
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value) => <span style={{ color: '#A0A7B2' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
