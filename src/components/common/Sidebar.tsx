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
  LucideIcon
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: LucideIcon;
  badge: string | null;
  badgeColor?: string;
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
      badgeColor: stats.unresolvedOverlaps > 0 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
    },
    {
      id: 'completed',
      label: 'Recent Completions (14d)',
      icon: CheckCircle2,
      badge: stats.completedLast14Days > 0 ? `${stats.completedLast14Days}` : null,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'merged',
      label: 'Merged Cases',
      icon: GitMerge,
      badge: stats.mergedCasesCount > 0 ? `${stats.mergedCasesCount}` : null,
      badgeColor: 'bg-blue-600 text-white'
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
    <aside className="w-64 bg-gov-sidebar border-r border-slate-700/60 flex flex-col shrink-0 min-h-[calc(100vh-80px)]">
      {/* Navigation menu */}
      <div className="p-4 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Administrative Portal
        </p>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gov-olive text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || (isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-300')
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
      <div className="px-4 py-3 mx-4 my-2 rounded-lg bg-slate-900/60 border border-slate-800">
        <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Monitored Bureaus</span>
        </p>
        <div className="space-y-1 text-xs text-slate-400">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-300">RB (Regulation)</span>
            <span className="font-mono text-[11px] text-emerald-400">Active</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-300">PGRC (Grievance)</span>
            <span className="font-mono text-[11px] text-emerald-400">Active</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-300">AB (Approval)</span>
            <span className="font-mono text-[11px] text-slate-400">Synced</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-300">Finance & Vigilance</span>
            <span className="font-mono text-[11px] text-slate-400">Synced</span>
          </div>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="mt-auto p-4 border-t border-slate-800 text-slate-400 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">SIH26264 Prototype</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">v1.0</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-tight">
          AICTE Centralized Case Intelligence System. Simulated government data for demonstration.
        </p>
      </div>
    </aside>
  );
};
