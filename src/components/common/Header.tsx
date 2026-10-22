import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { RotateCcw, Plus, AlertOctagon, Database, LogOut, UserCheck } from 'lucide-react';

interface HeaderProps {
  onOpenNewCaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewCaseModal }) => {
  const { stats, resetToSeedData, isDemoMode, setActiveTab } = useCaseWatch();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      {/* Top micro-bar: Government Identity strip */}
      <div className="bg-gov-dark text-slate-300 text-[11px] px-6 py-1 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-100 tracking-wider">GOVERNMENT OF INDIA</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">All India Council for Technical Education (AICTE)</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-medium">Regulation Bureau & PGRC Integrated Coordination</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational Gateway Active
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-medium">SIH 2026 Problem SIH26264</span>
        </div>
      </div>

      {/* Main Header bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Emblem style badge */}
          <div className="w-10 h-10 rounded-lg bg-gov-dark flex items-center justify-center text-white font-bold text-lg shadow-inner border border-slate-700">
            <span className="text-amber-400 tracking-tighter">SY</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                SYNCHRA
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gov-olive-soft text-gov-olive border border-gov-olive/20 font-mono">
                AICTE CELL MONITOR
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Unified Institutional Grievance Intelligence & Coordination Platform
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Overlap alert quick badge */}
          {stats.unresolvedOverlaps > 0 && (
            <button
              onClick={() => setActiveTab('overlaps')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
            >
              <AlertOctagon className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>{stats.unresolvedOverlaps} Overlaps Require Review</span>
            </button>
          )}

          {/* Mode Pill */}
          <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700">
            <Database className="w-3.5 h-3.5 text-gov-olive" />
            <span className="font-medium">
              {isDemoMode ? 'Demo Mode (LocalStorage)' : 'Production Mode'}
            </span>
          </div>

          {/* Reset Demo Data button */}
          <button
            onClick={resetToSeedData}
            title="Restore original sample dataset of 18 institutions and 35 cases"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>

          {/* Register Complaint button */}
          <button
            onClick={onOpenNewCaseModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gov-olive hover:bg-gov-olive-light text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Register Complaint</span>
          </button>

          {/* Authenticated Officer Badge & Sign Out */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  {user.displayName}
                </span>
                <span className="block text-[10px] text-gov-olive font-medium">
                  {user.designation}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                title="Sign out of SYNCHRA workspace"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
