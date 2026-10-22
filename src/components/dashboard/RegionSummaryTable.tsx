import React, { useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Region } from '../../types';

export const RegionSummaryTable: React.FC = () => {
  const { institutions, cases, alerts, setFilters, setActiveTab } = useCaseWatch();

  const regionData = useMemo(() => {
    const regions: Region[] = [
      'Northern',
      'Western',
      'Southern',
      'Eastern',
      'Central',
      'North-Western',
      'South-Western'
    ];

    const instMap = new Map<string, Region>();
    for (const inst of institutions) {
      instMap.set(inst.institutionId, inst.region);
    }

    return regions.map(region => {
      const regionInsts = institutions.filter(i => i.region === region);
      const regionInstIds = new Set(regionInsts.map(i => i.institutionId));

      const regionCases = cases.filter(c => regionInstIds.has(c.institutionId));
      const activeCases = regionCases.filter(c => c.status !== 'Disposed');
      const disposedCases = regionCases.filter(c => c.status === 'Disposed');

      // Overlaps in this region
      const regionOverlaps = alerts.filter(a => regionInstIds.has(a.institutionId)).length;

      return {
        region,
        institutionsCount: regionInsts.length,
        totalCases: regionCases.length,
        activeCases: activeCases.length,
        disposedCases: disposedCases.length,
        overlaps: regionOverlaps
      };
    });
  }, [institutions, cases, alerts]);

  return (
    <div className="bg-obsidian-850 rounded-xl border border-slate-800 shadow-md overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-obsidian-900/60 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Regional Case Footprint</h3>
          <p className="text-xs text-slate-400">Summary across 7 AICTE administrative regions</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-obsidian-950 text-slate-400 font-semibold border-b border-slate-800 font-mono text-[10px]">
            <tr>
              <th className="px-4 py-2.5">Region</th>
              <th className="px-3 py-2.5 text-center">Institutions</th>
              <th className="px-3 py-2.5 text-center">Active Cases</th>
              <th className="px-3 py-2.5 text-center">Disposed</th>
              <th className="px-3 py-2.5 text-center">Overlaps</th>
              <th className="px-3 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {regionData.map(r => (
              <tr key={r.region} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-slate-200">{r.region}</td>
                <td className="px-3 py-2 text-center text-slate-400">{r.institutionsCount}</td>
                <td className="px-3 py-2 text-center">
                  <span className="font-semibold text-blue-400 font-mono">{r.activeCases}</span>
                </td>
                <td className="px-3 py-2 text-center text-emerald-400 font-medium font-mono">
                  {r.disposedCases}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.overlaps > 0 ? (
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                      {r.overlaps} Flagged
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => {
                      setFilters({ region: r.region });
                      setActiveTab('registry');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 hover:underline text-[11px] font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
