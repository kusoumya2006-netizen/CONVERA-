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
  ArrowRightLeft
} from 'lucide-react';

export const MetricCardsRow: React.FC = () => {
  const { stats, setActiveTab, setFilters } = useCaseWatch();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      <StatCard
        title="Total Cases"
        value={stats.totalComplaints}
        subtitle="All logged complaints"
        icon={FolderKanban}
        variant="default"
        onClick={() => {
          setFilters({ status: 'ALL' });
          setActiveTab('registry');
        }}
      />
      <StatCard
        title="Pending"
        value={stats.pendingCases}
        subtitle="Awaiting scrutiny"
        icon={Clock}
        variant="amber"
        onClick={() => {
          setFilters({ status: 'Pending' });
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
        title="Transferred / Esc."
        value={stats.transferredEscalatedCases}
        subtitle="Inter-agency referral"
        icon={ArrowRightLeft}
        variant="default"
        onClick={() => {
          setFilters({ status: 'Escalated' });
          setActiveTab('registry');
        }}
      />
      <StatCard
        title="Overdue (SLA)"
        value={stats.overdueCases}
        subtitle="Exceeded disposal date"
        icon={AlertTriangle}
        variant="rose"
        badge={stats.overdueCases > 0 ? "URGENT" : undefined}
        onClick={() => {
          setFilters({ dateRange: 'OVERDUE' });
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
