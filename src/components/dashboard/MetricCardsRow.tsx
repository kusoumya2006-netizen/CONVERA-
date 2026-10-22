import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { StatCard } from '../common/StatCard';
import {
  FolderKanban,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  ArrowRightLeft,
  Flame
} from 'lucide-react';

export const MetricCardsRow: React.FC = () => {
  const { stats, setActiveTab, setFilters } = useCaseWatch();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      <StatCard
        title="Total Cases"
        value={stats.totalComplaints}
        subtitle={`${stats.totalActiveComplaints} active • ${stats.disposedCases} resolved`}
        icon={FolderKanban}
        variant="default"
        onClick={() => {
          setFilters({ status: 'ALL' });
          setActiveTab('registry');
        }}
      />
      <StatCard
        title="Overdue (SLA)"
        value={stats.overdueCases}
        subtitle={`${stats.overdueHighPriorityOverlap} high/critical overlap`}
        icon={AlertTriangle}
        variant="rose"
        badge={stats.overdueCases > 0 ? "URGENT" : undefined}
        onClick={() => {
          setFilters({ dateRange: 'OVERDUE' });
          setActiveTab('registry');
        }}
      />
      <StatCard
        title="Due Soon (<24h)"
        value={stats.dueWithin24Hours}
        subtitle="Expiring in ≤ 24h"
        icon={Clock}
        variant="amber"
        badge={stats.dueWithin24Hours > 0 ? "ACTION" : undefined}
        onClick={() => {
          setFilters({ dateRange: 'ALL' });
          setActiveTab('registry');
        }}
      />
      <StatCard
        title="High / Critical"
        value={stats.highCriticalActive}
        subtitle={`${stats.overdueHighPriorityOverlap} already overdue`}
        icon={Flame}
        variant={stats.highCriticalActive > 0 ? "amber" : "default"}
        onClick={() => {
          setFilters({ status: 'ALL' });
          setActiveTab('registry');
        }}
      />
      <StatCard
        title="Under Process"
        value={stats.underProcessCases}
        subtitle="Inquiry / Hearing active"
        icon={Activity}
        variant="blue"
        onClick={() => {
          setFilters({ status: 'Under Process' });
          setActiveTab('registry');
        }}
      />
      <StatCard
        title="Disposed"
        value={stats.disposedCases}
        subtitle={`${stats.disposalRate}% disposal rate`}
        icon={CheckCircle2}
        variant="olive"
        onClick={() => {
          setFilters({ status: 'Disposed' });
          setActiveTab('registry');
        }}
      />
      <StatCard
        title="Cross Overlaps"
        value={stats.potentialOverlaps}
        subtitle={`${stats.unresolvedOverlaps} pending review`}
        icon={GitCompare}
        variant={stats.unresolvedOverlaps > 0 ? "rose" : "olive"}
        badge={stats.unresolvedOverlaps > 0 ? "FLAGGED" : undefined}
        onClick={() => setActiveTab('overlaps')}
      />
    </div>
  );
};
