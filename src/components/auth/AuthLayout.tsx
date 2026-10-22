import React from 'react';
import { CampusHeroBanner } from './CampusHeroBanner';
import { Layers, Network, FileCheck2, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  onBackToLanding?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, onBackToLanding }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#08090B] text-[#E8EAED] antialiased selection:bg-[#A3B86C]/30 selection:text-white">
      {/* =========================================================================
          LEFT PANEL — Product Identity & Sri Venkateswara College (SVCE) Campus Hero
          ========================================================================= */}
      <div className="w-full lg:w-[52%] xl:w-[50%] p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between bg-[#0B0D10] border-r border-[#272D35] relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          {/* Government header strip */}
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-[#737D8B]">
            <span className="font-semibold text-[#E8EAED]">AICTE</span>
            <span className="text-[#272D35]">/</span>
            <span>REGULATION & PGRC DIVISION</span>
            <span className="text-[#272D35]">/</span>
            <span className="text-[#A3B86C]">SIH 2026</span>
          </div>

          {/* CONVERA Brand Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Geometric Emblem */}
              <div className="w-10 h-10 rounded-lg bg-[#161A20] border border-[#272D35] p-2 flex items-center justify-center shadow-inner">
                <svg
                  className="w-5 h-5 text-[#A3B86C]"
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
                  <h1 className="text-2xl font-bold tracking-tight text-[#E8EAED] font-sans">
                    CONVERA
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#161A20] text-[#A3B86C] border border-[#272D35]">
                    v1.0
                  </span>
                </div>
                <p className="text-xs text-[#A0A7B2] font-medium">
                  Integrated Institution Complaint Monitoring & Overlap Dashboard
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-sm font-semibold text-[#A3B86C] tracking-wide">
              One Institution. Connected Intelligence. Coordinated Action.
            </p>

            {/* Concise Mission Statement */}
            <p className="text-xs text-[#A0A7B2] leading-relaxed max-w-lg">
              CONVERA centralizes institution complaints across the Regulation Bureau (RB), Public Grievance Redressal Cell (PGRC), and Approval Bureau (AB). By identifying cross-bureau overlaps deterministically, CONVERA eliminates duplicated administrative friction and accelerates grievance disposal.
            </p>
          </div>

          {/* College / Campus Hero Image (SVCE Entrance, Sriperumbudur) */}
          <CampusHeroBanner />

          {/* 3 Core Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-[#111419] border border-[#272D35]">
              <div className="w-6 h-6 rounded bg-[#161A20] text-[#A3B86C] flex items-center justify-center mb-2 border border-[#272D35]">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-[#E8EAED]">Unified Records</h4>
              <p className="text-[11px] text-[#737D8B] mt-1 leading-snug">
                Single pane for technical college complaints, inspection history and directives.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111419] border border-[#272D35]">
              <div className="w-6 h-6 rounded bg-[#161A20] text-[#E8B75C] flex items-center justify-center mb-2 border border-[#272D35]">
                <Network className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-[#E8EAED]">Overlap Engine</h4>
              <p className="text-[11px] text-[#737D8B] mt-1 leading-snug">
                Deterministic detection of concurrent proceedings across RB and PGRC cells.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111419] border border-[#272D35]">
              <div className="w-6 h-6 rounded bg-[#161A20] text-[#69C9A0] flex items-center justify-center mb-2 border border-[#272D35]">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-[#E8EAED]">Accountable SLA</h4>
              <p className="text-[11px] text-[#737D8B] mt-1 leading-snug">
                Immutable action ledger with SLA ageing alerts and statutory exports.
              </p>
            </div>
          </div>
        </div>

        {/* Small Footer */}
        <div className="relative z-10 pt-6 mt-4 border-t border-[#272D35] flex items-center justify-between text-[11px] text-[#737D8B]">
          <span>Smart India Hackathon 2026 Prototype</span>
          <span className="font-mono text-[#A0A7B2]">Problem Statement: SIH26264</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL — Login Form & Authenticated Access
          ========================================================================= */}
      <div className="flex-1 bg-[#08090B] flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-[#E8EAED]">
        {/* Top Government Micro-strip */}
        <div className="flex items-center justify-between pb-3 border-b border-[#272D35] text-[11px] text-[#737D8B] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#69C9A0] animate-pulse"></span>
            <span className="font-semibold text-[#A0A7B2]">AICTE Central Administrative Gateway</span>
          </div>
          {onBackToLanding ? (
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-[#A0A7B2] hover:text-[#A3B86C] transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>System Overview</span>
            </button>
          ) : (
            <span className="text-[#737D8B] hidden sm:inline">Tier-3 Security Directives</span>
          )}
        </div>

        {/* Centered Form */}
        <div className="my-auto py-6">
          {children}
        </div>

        {/* Bottom Compliance Strip */}
        <div className="pt-3 border-t border-[#272D35] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#737D8B] font-mono">
          <span>© 2026 All India Council for Technical Education</span>
          <div className="flex items-center gap-3">
            <span className="hover:text-[#E8EAED] cursor-pointer">Security Protocol</span>
            <span>•</span>
            <span className="hover:text-[#E8EAED] cursor-pointer">Terms of Use</span>
          </div>
        </div>
      </div>
    </div>
  );
};
