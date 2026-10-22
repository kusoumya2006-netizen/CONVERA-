import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { MetricCardsRow } from './MetricCardsRow';
import { BureauWorkloadChart } from './BureauWorkloadChart';
import { StatusDistributionChart } from './StatusDistributionChart';
import { RegionSummaryTable } from './RegionSummaryTable';
import { ApproachingDeadlines } from './ApproachingDeadlines';
import { RecentActivityFeed } from './RecentActivityFeed';
import { AlertOctagon, ArrowRight, ShieldCheck } from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { stats, alerts, setActiveTab } = useCaseWatch();

  const unresolvedAlerts = alerts.filter(a => a.reviewStatus === 'PENDING_REVIEW');

  return (
    <div className="space-y-6">
      {/* Critical Overlap Notification Banner if alerts exist */}
      {unresolvedAlerts.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-900/60 text-rose-300 shrink-0 mt-0.5 border border-rose-700/50">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                Cross-Bureau Overlap Warnings Detected ({unresolvedAlerts.length} Action Required)
              </h4>
              <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">
                Multiple active complaint matters have been identified across the Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) for identical institutions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('overlaps')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 shadow-sm transition-colors border border-rose-600/50"
          >
            <span>Review Overlaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <MetricCardsRow />

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BureauWorkloadChart />
        </div>
        <div>
          <StatusDistributionChart />
        </div>
      </div>

      {/* Operational Matrix Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <RegionSummaryTable />
        </div>
        <div>
          <ApproachingDeadlines />
        </div>
        <div>
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
};
