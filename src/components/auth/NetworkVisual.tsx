import React from 'react';
import { Building2, Shield, FolderGit2, CheckCircle2 } from 'lucide-react';

export const NetworkVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto py-4">
      {/* Container with subtle dark border and soft glow */}
      <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Header tag */}
        <div className="relative z-10 flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
              Inter-Bureau Telemetry Matrix
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
            SIH26264 Active
          </span>
        </div>

        {/* Visual Graph Layout */}
        <div className="relative z-10 space-y-4">
          {/* Top row: Government Bureaus */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-emerald-900/50 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">RB Bureau</span>
              </div>
              <p className="text-[10px] text-slate-400">Regulation & APH</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-amber-900/50 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">PGRC Cell</span>
              </div>
              <p className="text-[10px] text-slate-400">Public Grievances</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-sky-400 mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">AB Bureau</span>
              </div>
              <p className="text-[10px] text-slate-400">Approvals & EoA</p>
            </div>
          </div>

          {/* Central Convergence Engine */}
          <div className="relative py-3">
            {/* SVG Connecting lines */}
            <svg className="w-full h-16 text-slate-600" viewBox="0 0 300 60" fill="none">
              {/* Lines from top 3 bureaus down to center */}
              <path d="M 50 0 L 150 50" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              <path d="M 150 0 L 150 50" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              <path d="M 250 0 L 150 50" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              {/* Lines from center down to institutions */}
              <path d="M 150 50 L 50 60" stroke="#4d7c0f" strokeWidth="1.5" opacity="0.8" />
              <path d="M 150 50 L 150 60" stroke="#4d7c0f" strokeWidth="1.5" opacity="0.8" />
              <path d="M 150 50 L 250 60" stroke="#4d7c0f" strokeWidth="1.5" opacity="0.8" />
            </svg>

            {/* Central Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-gov-olive text-white border border-emerald-400/40 shadow-lg flex items-center gap-2">
              <FolderGit2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px] font-bold tracking-tight">SYNCHRA Overlap Engine</span>
            </div>
          </div>

          {/* Bottom row: Interconnected Institutions */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/80">
              <div className="flex items-center gap-1.5 text-slate-200 mb-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-semibold truncate">Apex Inst. Tech</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-400">PID: 1-4392811</span>
                <span className="text-rose-400 font-bold">2 Cases</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/80">
              <div className="flex items-center gap-1.5 text-slate-200 mb-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-semibold truncate">Vidyapeeth Eng</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-400">PID: 1-8923412</span>
                <span className="text-rose-400 font-bold">Overlap</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/80">
              <div className="flex items-center gap-1.5 text-slate-200 mb-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-semibold truncate">Kalinga Science</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-400">PID: 1-6712390</span>
                <span className="text-emerald-400 font-bold">Linked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live sync pulse line */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Deterministic Cross-Bureau Index Synced
          </span>
          <span className="text-slate-500">Latency: 12ms</span>
        </div>
      </div>
    </div>
  );
};
