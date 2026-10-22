import React from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import { RotateCcw, Plus, AlertOctagon, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenNewCaseModal: () => void;
  onNavigateLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewCaseModal, onNavigateLanding }) => {
  const { stats, resetToSeedData, isDemoMode, setActiveTab, storageMode, isLoadingCloudData } = useCaseWatch();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#0B0D10] border-b border-[#272D35] px-5 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity: CONVERA wordmark & simple geometric symbol */}
        <div
          className={`flex items-center gap-3 ${onNavigateLanding ? 'cursor-pointer group' : ''}`}
          onClick={onNavigateLanding}
          title={onNavigateLanding ? 'View System Overview & Story' : undefined}
        >
          <div className="w-8 h-8 rounded-lg bg-[#161A20] border border-[#272D35] group-hover:border-[#A3B86C]/50 flex items-center justify-center text-white shadow-inner transition-colors">
            <svg
              className="w-4 h-4 text-[#A3B86C]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#E8EAED] group-hover:text-white transition-colors">
                CONVERA
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#161A20] text-[#A0A7B2] border border-[#272D35]">
                AICTE
              </span>
            </div>
            <p className="text-[11px] text-[#737D8B] font-medium leading-none mt-0.5 hidden sm:block">
              Integrated Complaint Intelligence & Overlap Monitor
            </p>
          </div>
        </div>

        {/* Operational status & Center controls */}
        <div className="hidden md:flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111419] border border-[#272D35] text-[11px] text-[#A0A7B2]">
            <span className={`w-1.5 h-1.5 rounded-full ${storageMode === 'supabase' ? 'bg-[#A3B86C]' : 'bg-[#69C9A0]'} animate-pulse`} />
            <span className="font-mono font-medium text-[#E8EAED]">
              {storageMode === 'supabase' ? 'PostgreSQL Cloud' : 'Demo Sandbox'}
            </span>
            <span className="text-[#272D35]">•</span>
            <span className="text-[#737D8B]">
              {storageMode === 'supabase' ? 'Multi-User Sync' : 'LocalStorage'}
            </span>
            {isLoadingCloudData && (
              <span className="text-[10px] text-[#E8B75C] font-mono animate-pulse">(Syncing...)</span>
            )}
          </div>

          <button
            onClick={resetToSeedData}
            title="Restore default test dataset (18 institutions, 35 cases)"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#111419] hover:bg-[#161A20] text-[#A0A7B2] hover:text-[#E8EAED] border border-[#272D35] hover:border-[#38414D] text-[11px] font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#737D8B]" />
            <span>Reset Data</span>
          </button>

          {onNavigateLanding && (
            <button
              onClick={onNavigateLanding}
              title="View the cinematic system overview & architecture story"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#161A20] hover:bg-[#1E232B] text-[#A3B86C] border border-[#A3B86C]/30 hover:border-[#A3B86C]/50 text-[11px] font-mono transition-colors"
            >
              <span>System Story</span>
            </button>
          )}
        </div>

        {/* Right side: Alerts, Action & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Restrained critical-overlap notification */}
          {stats.unresolvedOverlaps > 0 && (
            <button
              onClick={() => setActiveTab('overlaps')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F16D75]/10 hover:bg-[#F16D75]/20 text-[#F16D75] border border-[#F16D75]/30 text-xs font-medium transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-[#F16D75]" />
              <span className="font-mono font-bold">{stats.unresolvedOverlaps}</span>
              <span className="hidden sm:inline">Overlaps Actionable</span>
            </button>
          )}

          {/* Primary "Register Complaint" action */}
          <button
            onClick={onOpenNewCaseModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Complaint</span>
          </button>

          {/* Compact user profile & sign-out control */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#272D35]">
              <div className="hidden lg:block text-right">
                <span className="block text-xs font-semibold text-[#E8EAED] leading-tight">
                  {user.displayName}
                </span>
                <span className="block text-[10px] text-[#A0A7B2] font-mono leading-none">
                  {user.bureau} • {user.designation}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                title="Sign out of CONVERA"
                className="inline-flex items-center gap-1 p-1.5 lg:px-2.5 lg:py-1 rounded-md bg-[#111419] hover:bg-[#161A20] text-[#A0A7B2] hover:text-[#E8EAED] border border-[#272D35] hover:border-[#38414D] text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-[#737D8B]" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
