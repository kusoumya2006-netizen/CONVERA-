import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { NavTab } from '../../types';
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  GitCompare,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  GitMerge,
  Share2,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: LucideIcon;
  badge: string | null;
  badgeStyle?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, stats, setSelectedCaseId, setSelectedInstitutionId } = useCaseWatch();

  const handleNav = (tab: NavTab) => {
    setSelectedCaseId(null);
    setSelectedInstitutionId(null);
    setActiveTab(tab);
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'registry',
      label: 'Case Registry',
      icon: FolderKanban,
      badge: `${stats.totalComplaints}`
    },
    {
      id: 'overlaps',
      label: 'Overlap Monitoring',
      icon: GitCompare,
      badge: stats.potentialOverlaps > 0 ? `${stats.potentialOverlaps}` : null,
      badgeStyle: stats.unresolvedOverlaps > 0 ? 'bg-[#F16D75]/15 text-[#F16D75] border-[#F16D75]/35 font-bold' : undefined
    },
    {
      id: 'graph',
      label: 'Intelligence Graph',
      icon: Share2,
      badge: 'Interactive',
      badgeStyle: 'bg-[#A3B86C]/15 text-[#A3B86C] border-[#A3B86C]/35 font-mono text-[9px]'
    },
    {
      id: 'completed',
      label: 'Recent Completions',
      icon: CheckCircle2,
      badge: stats.completedLast14Days > 0 ? `${stats.completedLast14Days}` : null,
      badgeStyle: 'bg-[#69C9A0]/10 text-[#69C9A0] border-[#69C9A0]/30'
    },
    {
      id: 'merged',
      label: 'Merged Cases',
      icon: GitMerge,
      badge: stats.mergedCasesCount > 0 ? `${stats.mergedCasesCount}` : null,
      badgeStyle: 'bg-[#86A9FF]/10 text-[#86A9FF] border-[#86A9FF]/30'
    },
    {
      id: 'institutions',
      label: 'Institution Profiles',
      icon: Building2,
      badge: null
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-[#0B0D10] border-r border-[#272D35] flex flex-col shrink-0 min-h-[calc(100vh-57px)]">
      {/* Navigation menu */}
      <div className="p-3 space-y-1">
        <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#737D8B] uppercase font-mono">
          Intelligence Workspace
        </p>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors relative ${
                isActive
                  ? 'bg-[#161A20] text-[#E8EAED] border border-[#272D35]'
                  : 'text-[#A0A7B2] hover:text-[#E8EAED] hover:bg-[#111419] border border-transparent'
              }`}
            >
              {/* Active left indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#A3B86C] rounded-r" />
              )}

              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 stroke-[1.75] ${
                    isActive ? 'text-[#A3B86C]' : 'text-[#737D8B]'
                  }`}
                />
                <span className={isActive ? 'font-semibold text-[#E8EAED]' : ''}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    item.badgeStyle || (isActive ? 'bg-[#111419] text-[#E8EAED] border-[#272D35]' : 'bg-[#111419] text-[#737D8B] border-[#272D35]')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bureaus Quick Reference */}
      <div className="mt-auto p-3 m-3 rounded-lg bg-[#111419] border border-[#272D35]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-[#737D8B] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A3B86C]" />
            <span>Monitored Bureaus</span>
          </p>
          <span className="text-[9px] font-mono text-[#69C9A0] bg-[#69C9A0]/10 border border-[#69C9A0]/30 px-1 py-0.2 rounded">
            SYNCED
          </span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-[#A0A7B2] text-[11px]">RB (Regulation)</span>
            <span className="font-mono text-[9px] text-[#A3B86C] bg-[#A3B86C]/10 px-1.5 py-0.5 rounded border border-[#A3B86C]/30">Active</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-[#A0A7B2] text-[11px]">PGRC (Grievance)</span>
            <span className="font-mono text-[9px] text-[#86A9FF] bg-[#86A9FF]/10 px-1.5 py-0.5 rounded border border-[#86A9FF]/30">Active</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-[#A0A7B2] text-[11px]">AB (Approval)</span>
            <span className="font-mono text-[9px] text-[#737D8B] bg-[#161A20] px-1.5 py-0.5 rounded border border-[#272D35]">Linked</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
