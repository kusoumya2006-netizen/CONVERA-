import React, { useState } from 'react';
import { useCaseWatch } from '../../context/CaseWatchContext';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  GitMerge,
  FileSpreadsheet,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';

interface SIHDemoGuideProps {
  onOpenNewCaseModal?: () => void;
}

export const SIHDemoGuide: React.FC<SIHDemoGuideProps> = ({ onOpenNewCaseModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const { setActiveTab } = useCaseWatch();
  const { user } = useAuth();

  const demoSteps = [
    {
      step: 1,
      title: 'Authenticated Bureau Session',
      desc: `Logged in as ${user?.displayName || 'Director (RB)'} (${user?.bureau || 'RB'}). Verifies RB-restricted write access and cross-bureau visibility.`,
      icon: Users,
      actionLabel: 'Switch/Inspect Session',
      badge: 'Auth & RLS'
    },
    {
      step: 2,
      title: 'Complaint Intake (SVCE Scenario)',
      desc: 'Register or observe a complaint for Sri Venkateswara College of Engineering (PID: 1-2814021) which already has an active PGRC complaint.',
      icon: Sparkles,
      actionLabel: 'Open Intake Modal',
      onAction: onOpenNewCaseModal,
      badge: 'Dual Intake'
    },
    {
      step: 3,
      title: 'Explainable Overlap Intelligence',
      desc: 'Inspect detected cross-bureau overlap. Review matching strategy (EXACT_PID), category correlation, and evidence logging without false positives.',
      icon: ShieldAlert,
      actionLabel: 'View Overlap Alerts',
      onAction: () => setActiveTab('overlaps'),
      badge: 'AICTE Match'
    },
    {
      step: 4,
      title: 'Joint Inter-Bureau Coordination',
      desc: 'Record a coordinated administrative decision. Assign lead bureau (RB/PGRC) and log statutory hearing instructions with officer accountability.',
      icon: ArrowRight,
      actionLabel: 'Review Alerts',
      onAction: () => setActiveTab('overlaps'),
      badge: 'Inter-Bureau'
    },
    {
      step: 5,
      title: 'Urgency Scoring & SLA Escalation',
      desc: 'Observe the deterministic urgency scoring engine prioritizing cases based on SLA time remaining, complainant vulnerability, and repeat violations.',
      icon: Clock,
      actionLabel: 'Examine Queue',
      onAction: () => setActiveTab('dashboard'),
      badge: 'Urgency Engine'
    },
    {
      step: 6,
      title: 'Consolidation & Case Merging',
      desc: 'Merge parallel proceedings into a consolidated primary dossier. Check the immutable audit ledger tracking before and after transitions.',
      icon: GitMerge,
      actionLabel: 'Merged Registry',
      onAction: () => setActiveTab('merged'),
      badge: 'Audit Trail'
    },
    {
      step: 7,
      title: 'Multi-User Cloud Synchronization',
      desc: 'Supabase PostgreSQL integration with Row-Level Security, preserving zero-loss local demo fallback with persistent data integrity.',
      icon: Users,
      actionLabel: 'View Registry',
      onAction: () => setActiveTab('registry'),
      badge: 'PostgreSQL Sync'
    },
    {
      step: 8,
      title: 'Statutory Reports & CSV Registers',
      desc: 'Generate real-time executive summaries, ageing analysis charts, and download compliance-ready statutory complaint and overlap registers.',
      icon: FileSpreadsheet,
      actionLabel: 'Download Reports',
      onAction: () => setActiveTab('reports'),
      badge: 'Statutory Audit'
    }
  ];

  return (
    <div className="bg-[#111419] border border-[#272D35] rounded-lg overflow-hidden shadow-sm transition-all duration-200">
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#161A20] transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#A3B86C]/10 text-[#A3B86C] border border-[#A3B86C]/30">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#E8EAED] tracking-wide uppercase font-mono">
                SIH Demonstration Walkthrough Guide
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#A3B86C]/15 text-[#A3B86C] border border-[#A3B86C]/30 font-semibold">
                SIH26264 Official Scenario
              </span>
            </div>
            <p className="text-[11px] text-[#A0A7B2] mt-0.5">
              Follow the 8-step evaluation flow demonstrating cross-bureau overlap detection, SLA prioritization, and statutory audit integrity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#737D8B] hidden sm:inline font-mono">
            Step {activeStep} of {demoSteps.length}
          </span>
          <button
            type="button"
            className="p-1 rounded text-[#A0A7B2] hover:text-[#E8EAED] transition-colors"
            aria-label={isOpen ? 'Collapse walkthrough' : 'Expand walkthrough'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Step Tray */}
      {isOpen && (
        <div className="border-t border-[#272D35] p-4 bg-[#0B0D10]/50 space-y-4">
          {/* Step Pill Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {demoSteps.map((s) => {
              const isActive = s.step === activeStep;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`p-2 rounded border text-left transition-all ${
                    isActive
                      ? 'bg-[#161A20] border-[#A3B86C] text-[#E8EAED] shadow-sm'
                      : 'bg-[#111419] border-[#272D35] text-[#737D8B] hover:text-[#A0A7B2] hover:border-[#38414D]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold">0{s.step}</span>
                    {isActive && <CheckCircle2 className="w-3 h-3 text-[#A3B86C]" />}
                  </div>
                  <p className="text-[10px] font-medium truncate mt-1">{s.badge}</p>
                </button>
              );
            })}
          </div>

          {/* Active Step Content */}
          {(() => {
            const current = demoSteps[activeStep - 1];
            const StepIcon = current.icon;
            return (
              <div className="bg-[#161A20] border border-[#272D35] rounded-md p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-[#0B0D10] border border-[#272D35] text-[#A3B86C] shrink-0 mt-0.5">
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#E8EAED]">
                        Step {current.step}: {current.title}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#272D35] text-[#A0A7B2]">
                        {current.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A7B2] mt-1 leading-relaxed max-w-2xl">
                      {current.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {current.onAction && (
                    <button
                      type="button"
                      onClick={current.onAction}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] text-xs font-semibold shadow-sm transition-colors"
                    >
                      <span>{current.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {activeStep < demoSteps.length && (
                    <button
                      type="button"
                      onClick={() => setActiveStep(prev => Math.min(demoSteps.length, prev + 1))}
                      className="px-2.5 py-1.5 rounded-md bg-[#111419] hover:bg-[#1E232B] text-[#A0A7B2] hover:text-[#E8EAED] border border-[#272D35] text-xs font-medium transition-colors"
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
