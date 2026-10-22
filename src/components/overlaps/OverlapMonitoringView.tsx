import React, { useState, useMemo } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { OverlapAlertCard } from './OverlapAlertCard';
import { ReviewStatus } from '../../types';
import { GitCompare, Download, Filter, AlertOctagon, CheckCircle2 } from 'lucide-react';
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
      `casewatch_overlap_alerts_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Strip */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Cross-Bureau Overlap Monitoring Console
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gov-olive-soft text-gov-olive border border-gov-olive/20">
                Deterministic Matching Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automatic identification of concurrent open proceedings across Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) to eliminate duplicated regulatory friction.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Overlaps CSV ({filteredAlerts.length})</span>
          </button>
        </div>

        {/* Overlap Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Flagged Overlaps</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
            <span className="text-[10px] font-semibold text-rose-700 uppercase">RB + PGRC Overlaps</span>
            <p className="text-xl font-bold text-rose-950 mt-0.5">{stats.rbPgrc}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-[10px] font-semibold text-amber-800 uppercase">Awaiting Coordination</span>
            <p className="text-xl font-bold text-amber-950 mt-0.5">{stats.pending}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase">Coordinated Protocols</span>
            <p className="text-xl font-bold text-emerald-950 mt-0.5">{stats.coordinated}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'PENDING_REVIEW', label: 'Action Required' },
            { id: 'COORDINATED', label: 'Coordinated' },
            { id: 'DISMISSED', label: 'Dismissed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterReview(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterReview === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">
          Showing {filteredAlerts.length} overlap scenarios
        </span>
      </div>

      {/* Overlap Cards List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Overlap Warnings Match Criteria</h4>
            <p className="text-xs text-slate-500">
              No unresolved cross-bureau conflicts for the selected review status.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => <OverlapAlertCard key={alert.alertId} alert={alert} />)
        )}
      </div>
    </div>
  );
};
