import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { OverlapAlertCard } from './OverlapAlertCard';
import { ReviewStatus } from '../../types';
import { Download, CheckCircle2, GitCompare, AlertOctagon, Clock, ShieldCheck } from 'lucide-react';
import { exportOverlapsToCsv } from '../../services/exportService';

export const OverlapMonitoringView: React.FC = () => {
  const { alerts } = useCaseWatch();
  const [filterReview, setFilterReview] = useState<ReviewStatus | 'ALL'>('ALL');

  const filteredAlerts = useMemo(() => {
    if (filterReview === 'ALL') return alerts;
    return alerts.filter(a => a.reviewStatus === filterReview);
  }, [alerts, filterReview]);

  const stats = useMemo(() => {
    const total = alerts.length;
    const pending = alerts.filter(a => a.reviewStatus === 'PENDING_REVIEW').length;
    const coordinated = alerts.filter(a => a.reviewStatus === 'COORDINATED').length;
    const rbPgrc = alerts.filter(
      a => a.involvedBureaus.includes('RB') && a.involvedBureaus.includes('PGRC')
    ).length;

    return { total, pending, coordinated, rbPgrc };
  }, [alerts]);

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

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161A20] hover:bg-[#1C2129] border border-[#272D35] hover:border-[#38414D] text-[#E8EAED] text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-[#737D8B]" />
            <span>Export Overlaps CSV ({filteredAlerts.length})</span>
          </button>
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

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#272D35] pb-2.5">
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
                  : 'bg-transparent text-[#737D8B] hover:text-[#A0A7B2] hover:bg-[#111419]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#737D8B] font-mono">
          {filteredAlerts.length} scenario{filteredAlerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Overlap Cards List */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#111419] p-12 text-center rounded-lg border border-[#272D35] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#69C9A0] mx-auto" />
            <h4 className="text-sm font-bold text-[#E8EAED]">No Overlap Scenarios Match Filter</h4>
            <p className="text-xs text-[#737D8B]">
              No active cross-bureau conflicts for the selected review status.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => <OverlapAlertCard key={alert.alertId} alert={alert} />)
        )}
      </div>
    </div>
  );
};
