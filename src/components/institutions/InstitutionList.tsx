import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { Region } from '../../types';
import { InstitutionDetailModal } from './InstitutionDetailModal';
import {
  Search,
  MapPin,
  Calendar,
  Award,
  GitCompare,
  ArrowRight
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
      <div className="bg-[#111419] p-4 rounded-lg border border-[#272D35] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#737D8B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search institutions by name, permanent AICTE ID, city..."
            className="w-full pl-9 pr-4 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value as any)}
            className="px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
          >
            <option value="ALL">All AICTE Regions</option>
            <option value="Northern">Northern Region</option>
            <option value="Western">Western Region</option>
            <option value="Southern">Southern Region</option>
            <option value="Eastern">Eastern Region</option>
            <option value="Central">Central Region</option>
            <option value="North-Western">North-Western Region</option>
            <option value="South-Western">South-Western Region</option>
          </select>
          <span className="text-xs text-[#737D8B] font-mono whitespace-nowrap">
            {filteredInstitutions.length} institutions
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
              className={`p-4 sm:p-5 rounded-lg border transition-all duration-150 cursor-pointer bg-[#111419] flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#38414D] hover:bg-[#161A20] ${
                stats.hasOverlap ? 'border-l-4 border-l-[#F16D75] border-y border-r border-[#272D35]' : 'border-[#272D35]'
              }`}
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B0D10] text-[#A0A7B2] border border-[#272D35]">
                    PID: {inst.institutionId}
                  </span>
                  {stats.hasOverlap ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#F16D75]/15 text-[#F16D75] border border-[#F16D75]/35">
                      <GitCompare className="w-3 h-3 text-[#F16D75]" />
                      RB + PGRC Overlap
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#737D8B]">{inst.type}</span>
                  )}
                </div>

                {/* Institution Name */}
                <h4 className="text-sm font-bold text-[#E8EAED] line-clamp-2 mb-2 hover:text-[#A3B86C] transition-colors">
                  {inst.name}
                </h4>

                {/* Location and Metadata */}
                <div className="space-y-1 text-xs text-[#A0A7B2] mb-4">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#737D8B] shrink-0" />
                    <span className="truncate">{inst.address}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#737D8B]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#737D8B]" />
                      Est. {inst.establishedYear}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#A3B86C]" />
                      {inst.accreditationGrade || 'Approved'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics Pill Strip */}
              <div className="pt-3 border-t border-[#272D35] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-[#737D8B] font-mono uppercase block">Active</span>
                    <span className="font-mono font-bold text-[#86A9FF]">{stats.active}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737D8B] font-mono uppercase block">Closed</span>
                    <span className="font-mono font-bold text-[#69C9A0]">{stats.disposed}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737D8B] font-mono uppercase block">Total</span>
                    <span className="font-mono font-bold text-[#E8EAED]">{stats.total}</span>
                  </div>
                </div>

                <span className="text-[#A3B86C] hover:text-[#B7CA82] font-semibold text-xs flex items-center gap-0.5">
                  View Profile <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Institution Detail Modal */}
      {activeInstitution && (
        <InstitutionDetailModal
          isOpen={Boolean(activeInstitution)}
          onClose={() => setSelectedInstitutionId(null)}
          institution={activeInstitution}
        />
      )}
    </div>
  );
};
