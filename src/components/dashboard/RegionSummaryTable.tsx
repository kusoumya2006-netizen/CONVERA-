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
    <div className="bg-[#111419] rounded-lg border border-[#272D35] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#272D35] bg-[#161A20] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#E8EAED]">Regional Case Footprint</h3>
          <p className="text-xs text-[#A0A7B2]">Summary across 7 AICTE administrative regions</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B0D10] text-[#737D8B] font-semibold border-b border-[#272D35] font-mono text-[10px]">
            <tr>
              <th className="px-4 py-2.5">Region</th>
              <th className="px-3 py-2.5 text-center">Institutions</th>
              <th className="px-3 py-2.5 text-center">Active Cases</th>
              <th className="px-3 py-2.5 text-center">Overlaps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272D35]/70">
            {regionData.map(r => (
              <tr
                key={r.region}
                onClick={() => {
                  setFilters({ region: r.region });
                  setActiveTab('registry');
                }}
                className="hover:bg-[#161A20] cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5 font-medium text-[#E8EAED]">{r.region}</td>
                <td className="px-3 py-2.5 text-center font-mono text-[#A0A7B2]">{r.institutionsCount}</td>
                <td className="px-3 py-2.5 text-center font-mono font-semibold text-[#86A9FF]">
                  {r.activeCases}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {r.overlaps > 0 ? (
                    <span className="inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#F16D75]/15 text-[#F16D75] border border-[#F16D75]/35">
                      {r.overlaps}
                    </span>
                  ) : (
                    <span className="text-[#737D8B] font-mono text-[10px]">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
