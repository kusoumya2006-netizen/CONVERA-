import React from 'react';
import { CampusHeroBanner } from './CampusHeroBanner';
import { Layers, Network, FileCheck2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 text-slate-100 antialiased selection:bg-gov-olive selection:text-white">
      {/* =========================================================================
          LEFT PANEL — Product Identity & Sri Venkateswara College (SVCE) Campus Hero
          ========================================================================= */}
      <div className="w-full lg:w-[52%] xl:w-[50%] p-8 lg:p-12 xl:p-16 flex flex-col justify-between bg-gov-dark border-r border-slate-800 relative overflow-hidden">
        {/* Subtle background ambient lighting */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-950/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-950/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Government header strip */}
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-slate-400">
            <span className="font-semibold text-slate-200">AICTE</span>
            <span className="text-slate-600">/</span>
            <span>REGULATION & PGRC DIVISION</span>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400">SIH 2026</span>
          </div>

          {/* SYNCHRA Brand Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Geometric Emblem: Interlocking Hexagon / Diamond Motif */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/80 p-2.5 flex items-center justify-center shadow-lg shadow-black/40">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-amber-400/90 rounded rotate-45 transform" />
                  <div className="absolute w-3.5 h-3.5 bg-gov-olive rounded-sm" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                    SYNCHRA
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gov-olive/40 text-emerald-300 border border-emerald-600/40">
                    v1.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Unified Institutional Grievance Intelligence & Coordination Platform
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-sm font-semibold text-amber-400/95 tracking-wide">
              One Institution. Connected Intelligence. Coordinated Action.
            </p>

            {/* Concise Mission Statement */}
            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
              SYNCHRA centralizes institution-related complaints across the Regulation Bureau (RB), Public Grievance Redressal Cell (PGRC), and Approval Bureau (AB). By identifying potential cross-bureau overlaps in real time, SYNCHRA prevents duplicated regulatory burden and accelerates grievance disposal.
            </p>
          </div>

          {/* College / Campus Hero Image (SVCE Entrance, Sriperumbudur) */}
          <CampusHeroBanner />

          {/* 3 Core Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-800/40">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-slate-100">Unified Records</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Single pane for technical college complaints, inspection history and directives.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <div className="w-7 h-7 rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center mb-2 border border-amber-800/40">
                <Network className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-slate-100">Overlap Intelligence</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Deterministic detection of concurrent proceedings across RB and PGRC cells.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <div className="w-7 h-7 rounded-lg bg-slate-700/80 text-slate-200 flex items-center justify-center mb-2 border border-slate-600/40">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-slate-100">Accountable Tracking</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Immutable action ledger with SLA ageing alerts and statutory exports.
              </p>
            </div>
          </div>
        </div>

        {/* Small Footer */}
        <div className="relative z-10 pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Smart India Hackathon 2026 Prototype</span>
          <span className="font-mono text-slate-400">Problem Statement: SIH26264</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL — Login Form & Authenticated Access
          ========================================================================= */}
      <div className="flex-1 bg-slate-50 flex flex-col justify-between p-6 sm:p-10 lg:p-16 text-slate-900">
        {/* Top Government Micro-strip */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gov-olive"></span>
            <span className="font-semibold text-slate-700">Official AICTE Administrative Gateway</span>
          </div>
          <span className="font-mono text-slate-500 hidden sm:inline">Portal Security Level: Tier-3 Gov</span>
        </div>

        {/* Centered Form */}
        <div className="my-auto py-8">
          {children}
        </div>

        {/* Bottom Compliance Strip */}
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>© 2026 All India Council for Technical Education (AICTE)</span>
          <div className="flex items-center gap-3">
            <span className="hover:text-slate-800 cursor-pointer">Security Protocol</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Terms of Use</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Cyber Cell</span>
          </div>
        </div>
      </div>
    </div>
  );
};
