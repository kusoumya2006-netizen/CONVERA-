import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { MetricCardsRow } from './MetricCardsRow';
import { BureauWorkloadChart } from './BureauWorkloadChart';
import { StatusDistributionChart } from './StatusDistributionChart';
import { RegionSummaryTable } from './RegionSummaryTable';
import { ApproachingDeadlines } from './ApproachingDeadlines';
import { RecentActivityFeed } from './RecentActivityFeed';
import { SIHDemoGuide } from './SIHDemoGuide';
import { AlertOctagon, ArrowRight } from 'lucide-react';

interface OverviewDashboardProps {
  onOpenNewCaseModal?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onOpenNewCaseModal }) => {
  const { alerts, setActiveTab } = useCaseWatch();

  const unresolvedAlerts = alerts.filter(a => a.reviewStatus === 'PENDING_REVIEW');

  return (
    <div className="space-y-6">
      {/* SIH Demonstration Walkthrough Guide */}
      <SIHDemoGuide onOpenNewCaseModal={onOpenNewCaseModal} />

      {/* Critical Overlap Notification Banner if alerts exist */}
      {unresolvedAlerts.length > 0 && (
        <div className="bg-[#161A20] border-l-4 border-l-[#F16D75] border-y border-r border-[#272D35] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-[#F16D75]/10 text-[#F16D75] shrink-0 mt-0.5 border border-[#F16D75]/30">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#E8EAED]">
                Cross-Bureau Overlap Warnings Detected ({unresolvedAlerts.length} Action Required)
              </h4>
              <p className="text-xs text-[#A0A7B2] mt-0.5 leading-relaxed">
                Concurrent complaint proceedings active across Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) for identical institutions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('overlaps')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F16D75]/15 hover:bg-[#F16D75]/25 text-[#F16D75] text-xs font-semibold shrink-0 transition-colors border border-[#F16D75]/40"
          >
            <span>Review Overlaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <MetricCardsRow />

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <BureauWorkloadChart />
        </div>
        <div>
          <StatusDistributionChart />
        </div>
      </div>

      {/* Operational Matrix Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
