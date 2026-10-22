import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Institution, Region } from '../../types';
import { InstitutionDetailModal } from './InstitutionDetailModal';
import {
  Building2,
  Search,
  MapPin,
  Calendar,
  Award,
  GitCompare,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const InstitutionList: React.FC = () => {
  const { institutions, cases, alerts, selectedInstitutionId, setSelectedInstitutionId } = useCaseWatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | 'ALL'>('ALL');

  // Build institution statistics
  const institutionStats = useMemo(() => {
    const statsMap = new Map<
      string,
      {
        total: number;
        active: number;
        disposed: number;
        rbCount: number;
        pgrcCount: number;
        hasOverlap: boolean;
        overlapAlertId?: string;
      }
    >();

    const activeOverlaps = alerts.filter(a => a.reviewStatus !== 'DISMISSED');
    const overlapMap = new Map<string, string>();
    for (const a of activeOverlaps) {
      overlapMap.set(a.institutionId, a.alertId);
    }

    for (const inst of institutions) {
      const instCases = cases.filter(c => c.institutionId === inst.institutionId);
      const active = instCases.filter(c => c.status !== 'Disposed').length;
      const disposed = instCases.filter(c => c.status === 'Disposed').length;
      const rbCount = instCases.filter(c => c.bureau === 'RB' && c.status !== 'Disposed').length;
      const pgrcCount = instCases.filter(c => c.bureau === 'PGRC' && c.status !== 'Disposed').length;

      statsMap.set(inst.institutionId, {
        total: instCases.length,
        active,
        disposed,
        rbCount,
        pgrcCount,
        hasOverlap: overlapMap.has(inst.institutionId),
        overlapAlertId: overlapMap.get(inst.institutionId)
      });
    }

    return statsMap;
  }, [institutions, cases, alerts]);

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = inst.name.toLowerCase().includes(q);
        const matchId = inst.institutionId.toLowerCase().includes(q);
        const matchAddr = inst.address.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchAddr) return false;
      }
      if (selectedRegion !== 'ALL' && inst.region !== selectedRegion) {
        return false;
      }
      return true;
    });
  }, [institutions, searchQuery, selectedRegion]);

  const activeInstitution = institutions.find(i => i.institutionId === selectedInstitutionId);

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-obsidian-850 p-4 rounded-lg border border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search institutions by name, permanent AICTE ID, city..."
            className="w-full pl-9 pr-4 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value as any)}
            className="px-3 py-2 bg-obsidian-950 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200"
          >
            <option value="ALL" className="bg-obsidian-900 text-slate-200">All AICTE Regions</option>
            <option value="Northern" className="bg-obsidian-900 text-slate-200">Northern Region</option>
            <option value="Western" className="bg-obsidian-900 text-slate-200">Western Region</option>
            <option value="Southern" className="bg-obsidian-900 text-slate-200">Southern Region</option>
            <option value="Eastern" className="bg-obsidian-900 text-slate-200">Eastern Region</option>
            <option value="Central" className="bg-obsidian-900 text-slate-200">Central Region</option>
            <option value="North-Western" className="bg-obsidian-900 text-slate-200">North-Western Region</option>
            <option value="South-Western" className="bg-obsidian-900 text-slate-200">South-Western Region</option>
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Showing {filteredInstitutions.length} institutions
          </span>
        </div>
      </div>

      {/* Grid of Institution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstitutions.map(inst => {
          const stats = institutionStats.get(inst.institutionId) || {
            total: 0,
            active: 0,
            disposed: 0,
            rbCount: 0,
            pgrcCount: 0,
            hasOverlap: false
          };

          return (
            <div
              key={inst.institutionId}
              onClick={() => setSelectedInstitutionId(inst.institutionId)}
              className={`p-5 rounded-lg border transition-all duration-150 cursor-pointer bg-obsidian-850 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-600 ${
                stats.hasOverlap ? 'border-rose-800/80 ring-1 ring-rose-900/60' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-obsidian-950 text-slate-300 border border-slate-800">
                    PID: {inst.institutionId}
                  </span>
                  {stats.hasOverlap ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80">
                      <GitCompare className="w-3 h-3 text-rose-400" />
                      RB + PGRC Overlap
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">{inst.type}</span>
                  )}
                </div>

                {/* Institution Name */}
                <h4 className="text-sm font-bold text-slate-100 line-clamp-2 mb-2 hover:text-white">
                  {inst.name}
                </h4>

                {/* Location and Metadata */}
                <div className="space-y-1 text-xs text-slate-400 mb-4">
                  <div className="flex items-start gap-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] truncate">{inst.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" />
                      {inst.accreditationGrade || 'AICTE Approved'}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Est. {inst.establishedYear}
                    </span>
                  </div>
                </div>
              </div>

              {/* Case Counts Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/60">
                    {stats.active} Active
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                    {stats.disposed} Disposed
                  </span>
                </div>
                <button className="text-slate-300 font-semibold text-xs inline-flex items-center gap-0.5 hover:text-white">
                  <span>Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {activeInstitution && (
        <InstitutionDetailModal
          isOpen={Boolean(selectedInstitutionId)}
          onClose={() => setSelectedInstitutionId(null)}
          institution={activeInstitution}
        />
      )}
    </div>
  );
};
