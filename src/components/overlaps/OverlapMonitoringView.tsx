import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { OverlapAlertCard } from './OverlapAlertCard';
import { ReviewStatus, Bureau, Region } from '../../types';
import {
  Download,
  CheckCircle2,
  GitCompare,
  AlertOctagon,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  RotateCcw,
  Share2
} from 'lucide-react';
import { exportOverlapsToCsv } from '../../services/exportService';

export const OverlapMonitoringView: React.FC = () => {
  const { alerts, institutions, navigateToGraph } = useCaseWatch();

  // Filter States
  const [filterReview, setFilterReview] = useState<ReviewStatus | 'ALL'>('ALL');
  const [bureauFilter, setBureauFilter] = useState<Bureau | 'ALL'>('ALL');
  const [regionFilter, setRegionFilter] = useState<Region | 'ALL'>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_SOON' | 'HIGH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Lookup map for institution regions
  const institutionRegionMap = useMemo(() => {
    const map = new Map<string, Region>();
    for (const inst of institutions) {
      map.set(inst.institutionId, inst.region);
    }
    return map;
  }, [institutions]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Review Status
      if (filterReview !== 'ALL' && alert.reviewStatus !== filterReview) {
        return false;
      }

      // Bureau Filter
      if (bureauFilter !== 'ALL' && !alert.involvedBureaus.includes(bureauFilter)) {
        return false;
      }

      // Region Filter
      if (regionFilter !== 'ALL') {
        const region = institutionRegionMap.get(alert.institutionId);
        if (region !== regionFilter) return false;
      }

      // Urgency Filter
      if (urgencyFilter !== 'ALL') {
        if (alert.highestUrgency !== urgencyFilter) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = alert.institutionName.toLowerCase().includes(q);
        const matchesPid = alert.institutionId.toLowerCase().includes(q);
        const matchesId = alert.alertId.toLowerCase().includes(q);
        const matchesCase = alert.caseIds.some(cid => cid.toLowerCase().includes(q));
        if (!matchesName && !matchesPid && !matchesId && !matchesCase) {
          return false;
        }
      }

      return true;
    });
  }, [alerts, filterReview, bureauFilter, regionFilter, urgencyFilter, searchQuery, institutionRegionMap]);

  const stats = useMemo(() => {
    const total = alerts.length;
    const pending = alerts.filter(a => a.reviewStatus === 'PENDING_REVIEW').length;
    const coordinated = alerts.filter(a => a.reviewStatus === 'COORDINATED').length;
    const rbPgrc = alerts.filter(
      a => a.involvedBureaus.includes('RB') && a.involvedBureaus.includes('PGRC')
    ).length;

    return { total, pending, coordinated, rbPgrc };
  }, [alerts]);

  const hasActiveFilters =
    filterReview !== 'ALL' ||
    bureauFilter !== 'ALL' ||
    regionFilter !== 'ALL' ||
    urgencyFilter !== 'ALL' ||
    Boolean(searchQuery.trim());

  const resetAllFilters = () => {
    setFilterReview('ALL');
    setBureauFilter('ALL');
    setRegionFilter('ALL');
    setUrgencyFilter('ALL');
    setSearchQuery('');
  };

  const handleExport = () => {
    exportOverlapsToCsv(
      filteredAlerts,
      `convera_overlap_alerts_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Strip */}
      <div className="bg-[#111419] p-4 sm:p-5 rounded-lg border border-[#272D35] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#E8EAED]">
                Cross-Bureau Overlap Monitoring Console
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161A20] text-[#A0A7B2] border border-[#272D35]">
                Deterministic Engine Active
              </span>
            </div>
            <p className="text-xs text-[#A0A7B2] mt-1 max-w-3xl leading-relaxed">
              Automated detection of concurrent complaint proceedings across Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) to eliminate duplicated administrative friction.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigateToGraph()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] hover:border-[#38414D] text-[#A3B86C] text-xs font-semibold shadow-sm transition-colors"
              title="Explore all inter-bureau connections in Intelligence Graph"
            >
              <Share2 className="w-3.5 h-3.5 text-[#A3B86C]" />
              <span>Intelligence Graph View</span>
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] hover:border-[#38414D] text-[#E8EAED] text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#737D8B]" />
              <span>Export Overlaps CSV ({filteredAlerts.length})</span>
            </button>
          </div>
        </div>

        {/* Overlap Metrics: Dark graphite cards with subtle borders */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#272D35]">
          <div className="p-3 bg-[#161A20] rounded-lg border border-[#272D35]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#A0A7B2] uppercase font-mono">Total Overlaps</span>
              <GitCompare className="w-3.5 h-3.5 text-[#737D8B]" />
            </div>
            <p className="text-xl font-bold font-mono text-[#E8EAED] mt-1">{stats.total}</p>
          </div>

          <div className="p-3 bg-[#161A20] rounded-lg border border-[#272D35]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#A0A7B2] uppercase font-mono">RB + PGRC Overlaps</span>
              <AlertOctagon className="w-3.5 h-3.5 text-[#F16D75]" />
            </div>
            <p className="text-xl font-bold font-mono text-[#F16D75] mt-1">{stats.rbPgrc}</p>
          </div>

          <div className="p-3 bg-[#161A20] rounded-lg border border-[#272D35]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#A0A7B2] uppercase font-mono">Awaiting Coordination</span>
              <Clock className="w-3.5 h-3.5 text-[#E8B75C]" />
            </div>
            <p className="text-xl font-bold font-mono text-[#E8B75C] mt-1">{stats.pending}</p>
          </div>

          <div className="p-3 bg-[#161A20] rounded-lg border border-[#272D35]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#A0A7B2] uppercase font-mono">Coordinated Protocols</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#69C9A0]" />
            </div>
            <p className="text-xl font-bold font-mono text-[#69C9A0] mt-1">{stats.coordinated}</p>
          </div>
        </div>
      </div>

      {/* Conditional High-Priority Banner: Displayed ONLY when unreviewed pending alerts exist */}
      {stats.pending > 0 && (
        <div className="p-4 rounded-lg bg-[#F16D75]/10 border border-[#F16D75]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-[#F16D75]/20 text-[#F16D75] mt-0.5 shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#F16D75]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F16D75]">
                Potential Overlapping Cases — Coordination Required
              </h3>
              <p className="text-xs text-[#E8EAED] mt-0.5 leading-relaxed">
                {stats.pending} institution{stats.pending > 1 ? 's have' : ' has'} concurrent open proceedings across multiple bureaus. Authorized officials must convene joint coordination or designate a lead bureau before issuing directives.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterReview('PENDING_REVIEW')}
            className="px-3.5 py-1.5 rounded-md bg-[#F16D75] hover:bg-[#ff8088] text-[#08090B] font-semibold text-xs transition-colors shrink-0 whitespace-nowrap shadow-sm"
          >
            Review {stats.pending} Pending Conflict{stats.pending > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-3.5 bg-[#111419] rounded-lg border border-[#272D35] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737D8B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by institution name, PID, or case ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] placeholder-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
            />
          </div>

          {/* Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Bureau Filter */}
            <select
              value={bureauFilter}
              onChange={e => setBureauFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="ALL">All Bureaus</option>
              <option value="RB">Regulation Bureau (RB)</option>
              <option value="PGRC">Public Grievance (PGRC)</option>
              <option value="AB">Approval Bureau (AB)</option>
              <option value="Finance">Finance Bureau</option>
              <option value="Vigilance">Vigilance Cell</option>
            </select>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="ALL">All Regions</option>
              <option value="Northern">Northern</option>
              <option value="Western">Western</option>
              <option value="Southern">Southern</option>
              <option value="Eastern">Eastern</option>
              <option value="Central">Central</option>
              <option value="North-Western">North-Western</option>
              <option value="South-Western">South-Western</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#0B0D10] border border-[#272D35] rounded-md text-xs text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
            >
              <option value="ALL">All Urgencies</option>
              <option value="OVERDUE">Overdue Scenarios</option>
              <option value="DUE_SOON">Due Soon (≤ 48h)</option>
              <option value="HIGH">High Priority</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#272D35] text-xs text-[#737D8B] hover:text-[#E8EAED] hover:bg-[#161A20] transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Review Status Tabs */}
        <div className="flex items-center justify-between border-t border-[#272D35] pt-2.5">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Alerts' },
              { id: 'PENDING_REVIEW', label: 'Action Required' },
              { id: 'COORDINATED', label: 'Coordinated' },
              { id: 'DISMISSED', label: 'Dismissed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterReview(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterReview === tab.id
                    ? 'bg-[#161A20] text-[#E8EAED] border border-[#272D35] font-semibold'
                    : 'bg-transparent text-[#737D8B] hover:text-[#A0A7B2] hover:bg-[#161A20]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-[#737D8B] font-mono">
            {filteredAlerts.length} scenario{filteredAlerts.length !== 1 ? 's' : ''} shown
          </span>
        </div>
      </div>

      {/* Overlap Cards List */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#111419] p-12 text-center rounded-lg border border-[#272D35] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#69C9A0] mx-auto" />
            <h4 className="text-sm font-bold text-[#E8EAED]">No Overlap Scenarios Match Filter</h4>
            <p className="text-xs text-[#737D8B]">
              No active cross-bureau conflicts for the selected criteria.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => <OverlapAlertCard key={alert.alertId} alert={alert} />)
        )}
      </div>
    </div>
  );
};
