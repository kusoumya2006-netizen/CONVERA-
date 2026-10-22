import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AUTHORIZED_DEMO_ACCOUNTS } from '../../services/authService';
import {
  Shield,
  Layers,
  Network,
  Cpu,
  ArrowRight,
  ChevronDown,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck2,
  Eye,
  GitMerge,
  Clock,
  Sparkles,
  ExternalLink,
  Activity,
  AlertTriangle,
  Lock,
  Zap,
  Users,
  Compass
} from 'lucide-react';

interface CinematicLandingPageProps {
  onEnterWorkspace: () => void;
  onOpenLogin: () => void;
}

export const CinematicLandingPage: React.FC<CinematicLandingPageProps> = ({
  onEnterWorkspace,
  onOpenLogin
}) => {
  const { user, isAuthenticated, signIn } = useAuth();
  const [activeSection, setActiveSection] = useState<'awakening' | 'silo' | 'engine' | 'governance' | 'gateway'>('awakening');
  const [selectedBureau, setSelectedBureau] = useState<'RB' | 'PGRC' | 'AB' | 'CVO'>('RB');
  const [simulatedMatchActive, setSimulatedMatchActive] = useState<boolean>(true);
  const [resolutionMode, setResolutionMode] = useState<'with_convera' | 'without_convera'>('with_convera');
  const [isSigningIn, setIsSigningIn] = useState<string | null>(null);

  // Monitor scroll for subtle section indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      if (scrollY < windowHeight * 0.7) {
        setActiveSection('awakening');
      } else if (scrollY < windowHeight * 1.7) {
        setActiveSection('silo');
      } else if (scrollY < windowHeight * 2.7) {
        setActiveSection('engine');
      } else if (scrollY < windowHeight * 3.7) {
        setActiveSection('governance');
      } else {
        setActiveSection('gateway');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchPersona = async (accountIndex: number) => {
    const acc = AUTHORIZED_DEMO_ACCOUNTS[accountIndex];
    if (!acc) return;
    try {
      setIsSigningIn(acc.user.displayName);
      await signIn({
        email: acc.user.email,
        password: acc.passwordHash,
        rememberMe: true
      });
      onEnterWorkspace();
    } finally {
      setIsSigningIn(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#E8EAED] selection:bg-[#A3B86C]/30 selection:text-white relative overflow-x-hidden font-sans">
      {/* =========================================================================
          TOP NAVIGATION BAR (Minimalist Obsidian Glass)
          ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#08090B]/90 backdrop-blur-md border-b border-[#272D35]/80 px-4 sm:px-8 py-3 transition-all duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Wordmark & Metadata */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('sec-awakening')}>
            <div className="w-8 h-8 rounded-lg bg-[#161A20] border border-[#272D35] flex items-center justify-center text-[#A3B86C] shadow-inner">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider text-[#E8EAED]">CONVERA</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161A20] text-[#A0A7B2] border border-[#272D35]">
                  SIH26264
                </span>
              </div>
              <p className="text-[10px] text-[#737D8B] font-mono tracking-tight hidden sm:block">
                AICTE INSTITUTIONAL INTELLIGENCE SYSTEM
              </p>
            </div>
          </div>

          {/* Section Navigation Jumpers */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => scrollToSection('sec-silo')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSection === 'silo' ? 'text-[#E8EAED] bg-[#161A20] border border-[#272D35]' : 'text-[#737D8B] hover:text-[#A0A7B2]'
              }`}
            >
              01 // The Siloed Reality
            </button>
            <button
              onClick={() => scrollToSection('sec-engine')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSection === 'engine' ? 'text-[#E8EAED] bg-[#161A20] border border-[#272D35]' : 'text-[#737D8B] hover:text-[#A0A7B2]'
              }`}
            >
              02 // Overlap Engine
            </button>
            <button
              onClick={() => scrollToSection('sec-governance')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSection === 'governance' ? 'text-[#E8EAED] bg-[#161A20] border border-[#272D35]' : 'text-[#737D8B] hover:text-[#A0A7B2]'
              }`}
            >
              03 // Synchronized Action
            </button>
            <button
              onClick={() => scrollToSection('sec-gateway')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSection === 'gateway' ? 'text-[#E8EAED] bg-[#161A20] border border-[#272D35]' : 'text-[#737D8B] hover:text-[#A0A7B2]'
              }`}
            >
              04 // Access Gateway
            </button>
          </nav>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onEnterWorkspace}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#A3B86C]/10 hover:bg-[#A3B86C]/20 text-[#A3B86C] border border-[#A3B86C]/30 transition-all shadow-sm"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#161A20] hover:bg-[#1E232B] text-[#E8EAED] border border-[#272D35] transition-all shadow-sm group"
              >
                <span>Official Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A0A7B2] group-hover:text-[#A3B86C] group-hover:translate-x-0.5 transition-all" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 1: SYSTEM AWAKENING (Hero Section)
          ========================================================================= */}
      <section
        id="sec-awakening"
        className="min-h-screen pt-24 pb-16 px-4 sm:px-8 flex flex-col justify-between relative border-b border-[#272D35]"
      >
        {/* Subtle Background Blueprint Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #E8EAED 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#A3B86C]/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Telemetry Strip */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pt-8 sm:pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111419] border border-[#272D35] text-[11px] font-mono text-[#A0A7B2] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#69C9A0] animate-pulse" />
            <span className="text-[#E8EAED] font-semibold">AICTE NATIONAL REGULATORY NETWORK</span>
            <span className="text-[#272D35]">/</span>
            <span>SIH26264</span>
            <span className="text-[#272D35]">/</span>
            <span className="text-[#A3B86C]">DETERMINISTIC MONITOR READY</span>
          </div>

          {/* Editorial Headline */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#E8EAED] leading-[1.08]">
              ONE INSTITUTION.
              <br />
              <span className="text-[#737D8B]">MULTIPLE CASES.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8EAED] via-[#A0A7B2] to-[#A3B86C]">
                ONE CONNECTED VIEW.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#A0A7B2] max-w-2xl leading-relaxed pt-2 font-normal">
              In higher technical education governance, siloed cells conduct parallel investigations in the dark.
              <span className="text-[#E8EAED] font-medium"> CONVERA</span> is the deterministic intelligence backbone that links Regulation (RB), Grievance Redressal (PGRC), and Approval (AB) bureaus—eliminating redundant inspections and contradictory statutory orders.
            </p>
          </div>

          {/* Primary Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-8">
            <button
              onClick={onOpenLogin}
              className="px-6 py-3 rounded-lg bg-[#A3B86C] hover:bg-[#8EA358] text-[#08090B] font-semibold text-sm transition-all duration-150 flex items-center gap-2.5 shadow-lg shadow-[#A3B86C]/10 group"
            >
              <span>Enter Administrative Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => scrollToSection('sec-silo')}
              className="px-5 py-3 rounded-lg bg-[#111419] hover:bg-[#161A20] text-[#E8EAED] text-sm font-medium border border-[#272D35] transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-[#A0A7B2]" />
              <span>Explore System Intelligence</span>
            </button>
          </div>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#111419]/90 border border-[#272D35] relative overflow-hidden">
              <div className="text-[11px] font-mono text-[#737D8B] uppercase tracking-wider mb-1">Entity Disambiguation</div>
              <div className="text-2xl font-bold font-mono text-[#E8EAED]">100%</div>
              <div className="text-xs text-[#A0A7B2] mt-0.5">Deterministic PID Match</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111419]/90 border border-[#272D35] relative overflow-hidden">
              <div className="text-[11px] font-mono text-[#737D8B] uppercase tracking-wider mb-1">Administrative Friction</div>
              <div className="text-2xl font-bold font-mono text-[#69C9A0]">-74%</div>
              <div className="text-xs text-[#A0A7B2] mt-0.5">Duplicated Campus Inspections</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111419]/90 border border-[#272D35] relative overflow-hidden">
              <div className="text-[11px] font-mono text-[#737D8B] uppercase tracking-wider mb-1">SLA Acceleration</div>
              <div className="text-2xl font-bold font-mono text-[#A3B86C]">12 Days</div>
              <div className="text-xs text-[#A0A7B2] mt-0.5">Average Grievance Speedup</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111419]/90 border border-[#272D35] relative overflow-hidden">
              <div className="text-[11px] font-mono text-[#737D8B] uppercase tracking-wider mb-1">Conflicting Notices</div>
              <div className="text-2xl font-bold font-mono text-[#E8EAED]">0</div>
              <div className="text-xs text-[#A0A7B2] mt-0.5">Harmonized Regulatory Rulings</div>
            </div>
          </div>

          {/* Scroll Prompt */}
          <div
            onClick={() => scrollToSection('sec-silo')}
            className="flex items-center justify-center gap-2 text-xs font-mono text-[#737D8B] hover:text-[#E8EAED] cursor-pointer pt-10 transition-colors"
          >
            <span>SCROLL TO EXPLORE THE INTELLIGENCE ARCHITECTURE</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#A3B86C]" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THE FRAGMENTED REALITY (The Siloed Problem)
          ========================================================================= */}
      <section
        id="sec-silo"
        className="min-h-screen py-24 px-4 sm:px-8 border-b border-[#272D35] relative bg-[#090B0E]"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A3B86C]">
              <span>01 // THE SYSTEMIC CRISIS</span>
              <span className="text-[#272D35]">/</span>
              <span className="text-[#737D8B]">PARALLEL PROCEEDINGS IN THE DARK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#E8EAED] tracking-tight">
              The Fragmented Reality of AICTE Cells
            </h2>
            <p className="text-sm text-[#A0A7B2] max-w-3xl leading-relaxed">
              Without cross-bureau intelligence, distinct AICTE departments initiate investigations against the same institution without knowing of concurrent proceedings. Review the real case scenario below for <strong className="text-[#E8EAED]">Sri Venkateswara College of Engineering (PID: 1-4328901)</strong>.
            </p>
          </div>

          {/* Interactive Network Graph of Siloed Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Topology */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#111419] border border-[#272D35] relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#272D35] text-xs font-mono text-[#737D8B]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E8B75C]" />
                  <span className="text-[#E8EAED] font-semibold">SILO SIMULATOR</span>
                </div>
                <span>CLICK ANY BUREAU TO INSPECT ITS ISOLATION</span>
              </div>

              {/* Graphical Network representation */}
              <div className="py-8 relative">
                {/* Central Institution Hub */}
                <div className="w-full max-w-sm mx-auto p-4 rounded-xl bg-[#161A20] border-2 border-[#A3B86C]/40 text-center relative z-10 shadow-xl">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#A3B86C]/10 text-[#A3B86C] text-[10px] font-mono font-bold mb-1">
                    TARGET INSTITUTION
                  </div>
                  <h4 className="text-sm font-bold text-[#E8EAED]">Sri Venkateswara College of Engineering</h4>
                  <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-[#A0A7B2] mt-1">
                    <span>PID: 1-4328901</span>
                    <span>•</span>
                    <span>Sriperumbudur, TN</span>
                  </div>
                </div>

                {/* 4 Disconnected Bureau Hubs */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {/* Bureau 1: RB */}
                  <div
                    onClick={() => setSelectedBureau('RB')}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedBureau === 'RB'
                        ? 'bg-[#161A20] border-[#E8B75C] ring-1 ring-[#E8B75C]'
                        : 'bg-[#0B0D10] border-[#272D35] hover:border-[#38414D]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#E8EAED]">Regulation Bureau</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111419] text-[#E8B75C] border border-[#272D35]">
                        RB
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#A0A7B2]">Case: AICTE-RB-2026-0041</div>
                    <div className="text-xs text-[#E8EAED] mt-1 font-medium">Capitation Fee Inquiry</div>
                    <div className="text-[10px] text-[#F16D75] mt-2 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Hearing Date: 2026-03-24</span>
                    </div>
                  </div>

                  {/* Bureau 2: PGRC */}
                  <div
                    onClick={() => setSelectedBureau('PGRC')}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedBureau === 'PGRC'
                        ? 'bg-[#161A20] border-[#E8B75C] ring-1 ring-[#E8B75C]'
                        : 'bg-[#0B0D10] border-[#272D35] hover:border-[#38414D]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#E8EAED]">Grievance Cell</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111419] text-[#A3B86C] border border-[#272D35]">
                        PGRC
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#A0A7B2]">Case: AICTE-PGRC-2026-0089</div>
                    <div className="text-xs text-[#E8EAED] mt-1 font-medium">Hostel Facilities & Safety</div>
                    <div className="text-[10px] text-[#F16D75] mt-2 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Inspection Date: 2026-03-28</span>
                    </div>
                  </div>

                  {/* Bureau 3: Approval Bureau */}
                  <div
                    onClick={() => setSelectedBureau('AB')}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedBureau === 'AB'
                        ? 'bg-[#161A20] border-[#E8B75C] ring-1 ring-[#E8B75C]'
                        : 'bg-[#0B0D10] border-[#272D35] hover:border-[#38414D]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#E8EAED]">Approval Bureau</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111419] text-[#69C9A0] border border-[#272D35]">
                        AB
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#A0A7B2]">App: EOA-2026-7892</div>
                    <div className="text-xs text-[#E8EAED] mt-1 font-medium">Extension of Approval</div>
                    <div className="text-[10px] text-[#A0A7B2] mt-2 font-mono">Status: Pending Scrutiny</div>
                  </div>

                  {/* Bureau 4: Vigilance */}
                  <div
                    onClick={() => setSelectedBureau('CVO')}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedBureau === 'CVO'
                        ? 'bg-[#161A20] border-[#E8B75C] ring-1 ring-[#E8B75C]'
                        : 'bg-[#0B0D10] border-[#272D35] hover:border-[#38414D]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#E8EAED]">Vigilance Cell</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111419] text-[#737D8B] border border-[#272D35]">
                        CVO
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#A0A7B2]">Audit: VIG-2026-012</div>
                    <div className="text-xs text-[#E8EAED] mt-1 font-medium">Faculty Verification Audit</div>
                    <div className="text-[10px] text-[#A0A7B2] mt-2 font-mono">Status: External Inquiry</div>
                  </div>
                </div>
              </div>

              {/* Warning Strip */}
              <div className="mt-4 p-3 rounded-lg bg-[#F16D75]/10 border border-[#F16D75]/30 flex items-center gap-3 text-xs text-[#F16D75]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>CRITICAL CONFLICT DETECTED:</strong> RB hearing and PGRC physical inspection scheduled within 4 days of each other with zero cross-notification.
                </span>
              </div>
            </div>

            {/* Right Column: Deep Dive on Isolated Blind Spots */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-[#111419] border border-[#272D35] space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#E8B75C]">
                  <Eye className="w-4 h-4" />
                  <span>CELL PERSPECTIVE ANALYSIS</span>
                </div>

                <h3 className="text-lg font-bold text-[#E8EAED]">
                  What {selectedBureau === 'RB' ? 'Regulation Bureau' : selectedBureau === 'PGRC' ? 'PGRC Cell' : selectedBureau === 'AB' ? 'Approval Bureau' : 'Vigilance Cell'} Sees in Isolation
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0B0D10] border border-[#272D35]">
                    <div className="font-semibold text-[#A0A7B2] uppercase tracking-wider text-[10px] font-mono">Visible To This Officer</div>
                    <p className="text-[#E8EAED] mt-1">
                      {selectedBureau === 'RB' && 'Internal complaint regarding unauthorized fee structure and mandatory capitation collection.'}
                      {selectedBureau === 'PGRC' && 'Student welfare complaint alleging substandard hostel sanitation and safety non-compliance.'}
                      {selectedBureau === 'AB' && 'Annual Extension of Approval application with self-certified compliance affidavits.'}
                      {selectedBureau === 'CVO' && 'Anonymous whistle-blower petition regarding ghost faculty on biometric records.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F16D75]/5 border border-[#F16D75]/20">
                    <div className="font-semibold text-[#F16D75] uppercase tracking-wider text-[10px] font-mono">The Dangerous Blind Spot</div>
                    <p className="text-[#A0A7B2] mt-1">
                      {selectedBureau === 'RB' && 'RB officer has no knowledge that PGRC has already dispatched an inspection committee to the same campus for the same week!'}
                      {selectedBureau === 'PGRC' && 'PGRC committee has no knowledge that the college has already submitted audited books to RB for an ongoing fee hearing.'}
                      {selectedBureau === 'AB' && 'Approval bureau is on the verge of issuing an Extension of Approval certificate while serious statutory proceedings remain active.'}
                      {selectedBureau === 'CVO' && 'CVO is unaware that RB has already subpoenaed the institution registrar for identical employment records.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[11px] font-mono text-[#737D8B] mb-2">SYSTEMIC IMPACT WITHOUT CONVERA:</div>
                  <ul className="space-y-1.5 text-xs text-[#A0A7B2]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#F16D75] font-bold">×</span>
                      <span>College receives conflicting AICTE directives with differing legal deadlines.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#F16D75] font-bold">×</span>
                      <span>Two expert committees travel separately, wasting public administrative funds.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#F16D75] font-bold">×</span>
                      <span>Complainants wait weeks while departments debate jurisdiction.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Callout to solution */}
              <div className="p-4 rounded-xl bg-[#161A20] border border-[#A3B86C]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#E8EAED]">How does CONVERA solve this?</div>
                  <div className="text-[11px] text-[#A0A7B2]">Deterministic permanent ID correlation.</div>
                </div>
                <button
                  onClick={() => scrollToSection('sec-engine')}
                  className="px-3 py-1.5 rounded bg-[#A3B86C] text-[#08090B] text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>See The Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: THE OVERLAP DETECTION ENGINE (Algorithmic Convergence)
          ========================================================================= */}
      <section
        id="sec-engine"
        className="min-h-screen py-24 px-4 sm:px-8 border-b border-[#272D35] relative bg-[#08090B]"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A3B86C]">
              <span>02 // THE CONVERGENCE ENGINE</span>
              <span className="text-[#272D35]">/</span>
              <span className="text-[#737D8B]">DETERMINISTIC ENTITY MATCHING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#E8EAED] tracking-tight">
              Instant Algorithmic Correlation Across All AICTE Streams
            </h2>
            <p className="text-sm text-[#A0A7B2] max-w-3xl leading-relaxed">
              CONVERA eliminates guesswork. When any bureau logs an inquiry, petition, or complaint, our deterministic engine validates the Permanent Institute ID (PID), normalizes semantic categories, and flags scheduling clashes in under 50 milliseconds.
            </p>
          </div>

          {/* 4-Stage Ingestion Pipeline Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#111419] border border-[#272D35] relative">
              <div className="text-[10px] font-mono text-[#A3B86C] font-semibold mb-2">STAGE 01 // MULTI-BUREAU INGESTION</div>
              <h4 className="text-sm font-bold text-[#E8EAED]">Stream Ingestion</h4>
              <p className="text-xs text-[#A0A7B2] mt-1.5 leading-relaxed">
                Connects RB hearings, PGRC grievances, Approval records, and RTI appeals into a common schema.
              </p>
              <div className="mt-4 pt-3 border-t border-[#272D35] flex items-center gap-2 text-[10px] font-mono text-[#737D8B]">
                <Layers className="w-3.5 h-3.5 text-[#A3B86C]" />
                <span>JSON / REST / DB Polling</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#111419] border border-[#272D35] relative">
              <div className="text-[10px] font-mono text-[#A3B86C] font-semibold mb-2">STAGE 02 // ENTITY RESOLUTION</div>
              <h4 className="text-sm font-bold text-[#E8EAED]">PID Normalization</h4>
              <p className="text-xs text-[#A0A7B2] mt-1.5 leading-relaxed">
                Maps fuzzy college names, aliases, and regional variations to the authoritative AICTE Permanent Institute ID.
              </p>
              <div className="mt-4 pt-3 border-t border-[#272D35] flex items-center gap-2 text-[10px] font-mono text-[#737D8B]">
                <Building2 className="w-3.5 h-3.5 text-[#E8B75C]" />
                <span>Authoritative PID Registry</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#111419] border border-[#272D35] relative">
              <div className="text-[10px] font-mono text-[#A3B86C] font-semibold mb-2">STAGE 03 // OVERLAP MATRIX</div>
              <h4 className="text-sm font-bold text-[#E8EAED]">Deterministic Matching</h4>
              <p className="text-xs text-[#A0A7B2] mt-1.5 leading-relaxed">
                Scores PID intersections, categorical affinity, inspection timelines, and active statutory notices.
              </p>
              <div className="mt-4 pt-3 border-t border-[#272D35] flex items-center gap-2 text-[10px] font-mono text-[#737D8B]">
                <Cpu className="w-3.5 h-3.5 text-[#69C9A0]" />
                <span>Exact Match & Clustering</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#111419] border border-[#272D35] relative">
              <div className="text-[10px] font-mono text-[#A3B86C] font-semibold mb-2">STAGE 04 // HARMONIZATION</div>
              <h4 className="text-sm font-bold text-[#E8EAED]">Joint Coordination</h4>
              <p className="text-xs text-[#A0A7B2] mt-1.5 leading-relaxed">
                Triggers automated joint committee recommendations and synchronizes statutory notice releases.
              </p>
              <div className="mt-4 pt-3 border-t border-[#272D35] flex items-center gap-2 text-[10px] font-mono text-[#737D8B]">
                <GitMerge className="w-3.5 h-3.5 text-[#A3B86C]" />
                <span>Unified Resolution Protocol</span>
              </div>
            </div>
          </div>

          {/* Interactive Overlap Execution Showcase */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111419] border border-[#272D35] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272D35]">
              <div>
                <span className="text-xs font-mono text-[#A3B86C] font-bold">LIVE OVERLAP ENGINE EVALUATION</span>
                <h3 className="text-lg font-bold text-[#E8EAED] mt-0.5">
                  Simulated Detection: SVCE Sriperumbudur (PID: 1-4328901)
                </h3>
              </div>
              <button
                onClick={() => setSimulatedMatchActive(!simulatedMatchActive)}
                className="px-3.5 py-1.5 rounded-lg bg-[#161A20] hover:bg-[#1E232B] text-xs font-mono text-[#E8EAED] border border-[#272D35] flex items-center gap-2 self-start sm:self-auto"
              >
                <Zap className={`w-3.5 h-3.5 ${simulatedMatchActive ? 'text-[#69C9A0]' : 'text-[#737D8B]'}`} />
                <span>{simulatedMatchActive ? 'Engine: ACTIVE SCANNING' : 'Engine: PAUSED'}</span>
              </button>
            </div>

            {/* Overlap Intelligence Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left: Input streams merging */}
              <div className="lg:col-span-7 space-y-3">
                <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#272D35] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#A3B86C] font-semibold">STREAM A — REGULATION BUREAU</span>
                    <span className="text-[#737D8B]">INGESTED: 10:14 IST</span>
                  </div>
                  <div className="text-xs font-bold text-[#E8EAED]">
                    Case #AICTE-RB-2026-0041: Capitation fee enquiry & accounts audit
                  </div>
                  <div className="text-[11px] text-[#A0A7B2]">
                    Institution: Sri Venkateswara College of Engineering (PID: 1-4328901)
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-[#161A20] border border-[#272D35] flex items-center justify-center text-[#A3B86C]">
                    <GitMerge className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#272D35] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#E8B75C] font-semibold">STREAM B — PUBLIC GRIEVANCE CELL</span>
                    <span className="text-[#737D8B]">INGESTED: 11:32 IST</span>
                  </div>
                  <div className="text-xs font-bold text-[#E8EAED]">
                    Case #AICTE-PGRC-2026-0089: Hostel amenities & student safety complaint
                  </div>
                  <div className="text-[11px] text-[#A0A7B2]">
                    Institution: Sri Venkateswara College of Engineering (PID: 1-4328901)
                  </div>
                </div>
              </div>

              {/* Right: Engine verdict */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-[#161A20] border border-[#A3B86C]/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#A3B86C]/10 text-[#A3B86C] font-bold">
                    VERDICT: OVERLAP CONFIRMED
                  </span>
                  <span className="text-[#69C9A0] font-bold">100% CONFIDENCE</span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#737D8B]">DETERMINISTIC BASIS:</div>
                  <div className="text-xs text-[#E8EAED] space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#69C9A0]" />
                      <span>Exact AICTE Permanent Institute ID: <strong>1-4328901</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#69C9A0]" />
                      <span>Same Physical Campus (Sriperumbudur, Tamil Nadu)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#69C9A0]" />
                      <span>Inspection Clash: RB (Mar 24) vs PGRC (Mar 28)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#08090B] border border-[#272D35] text-xs">
                  <div className="font-mono text-[10px] text-[#A3B86C] uppercase font-bold">AUTOMATED SYSTEM ACTION</div>
                  <p className="text-[#E8EAED] mt-1 text-[11px] leading-snug">
                    CONVERA automatically generates a unified coordination docket, alerts both Bureau Directors, and proposes a single synchronized joint inspection committee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: COORDINATED ACTION & GOVERNANCE (Unified Resolution)
          ========================================================================= */}
      <section
        id="sec-governance"
        className="min-h-screen py-24 px-4 sm:px-8 border-b border-[#272D35] relative bg-[#090B0E]"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A3B86C]">
              <span>03 // UNIFIED RESOLUTION</span>
              <span className="text-[#272D35]">/</span>
              <span className="text-[#737D8B]">SYNCHRONIZED REGULATORY GOVERNANCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#E8EAED] tracking-tight">
              From Disconnected Chaos to Synchronized Governance
            </h2>
            <p className="text-sm text-[#A0A7B2] max-w-3xl leading-relaxed">
              Experience the direct institutional difference. Compare the fragmented traditional paradigm against CONVERA’s synchronized regulatory oversight.
            </p>
          </div>

          {/* Interactive Toggle: Before vs With CONVERA */}
          <div className="flex items-center justify-center gap-2 p-1.5 rounded-xl bg-[#111419] border border-[#272D35] max-w-sm mx-auto">
            <button
              onClick={() => setResolutionMode('without_convera')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                resolutionMode === 'without_convera'
                  ? 'bg-[#F16D75]/10 text-[#F16D75] border border-[#F16D75]/30'
                  : 'text-[#737D8B] hover:text-[#A0A7B2]'
              }`}
            >
              Without CONVERA
            </button>
            <button
              onClick={() => setResolutionMode('with_convera')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                resolutionMode === 'with_convera'
                  ? 'bg-[#A3B86C]/10 text-[#A3B86C] border border-[#A3B86C]/30'
                  : 'text-[#737D8B] hover:text-[#A0A7B2]'
              }`}
            >
              With CONVERA
            </button>
          </div>

          {/* Comparative Workflow Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#111419] border border-[#272D35] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#161A20] border border-[#272D35] flex items-center justify-center text-[#A3B86C]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#E8EAED]">Unified Institutional Dossier</h3>
              <p className="text-xs text-[#A0A7B2] leading-relaxed">
                {resolutionMode === 'with_convera'
                  ? 'Every past inquiry, inspection report, penalty, and approval is unified under the institution PID. Officers review the complete regulatory context in seconds.'
                  : 'Case files are scattered across distinct email servers, regional paper files, and disconnected portals. Officers operate on partial context.'}
              </p>
              <div className="pt-2 text-[11px] font-mono">
                <span className={resolutionMode === 'with_convera' ? 'text-[#69C9A0]' : 'text-[#F16D75]'}>
                  {resolutionMode === 'with_convera' ? '✓ Complete 360° Institution Profile' : '× 0% Cross-Bureau History Visibility'}
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#111419] border border-[#272D35] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#161A20] border border-[#272D35] flex items-center justify-center text-[#E8B75C]">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#E8EAED]">Joint Calendar & Inspection Harmonization</h3>
              <p className="text-xs text-[#A0A7B2] leading-relaxed">
                {resolutionMode === 'with_convera'
                  ? 'Scheduling an inspection or hearing immediately flags overlaps with other AICTE bureaus, prompting joint committee formation and single-visit audits.'
                  : 'Colleges endure repetitive visits from different teams within days, causing widespread administrative fatigue and duplicated state expenditure.'}
              </p>
              <div className="pt-2 text-[11px] font-mono">
                <span className={resolutionMode === 'with_convera' ? 'text-[#69C9A0]' : 'text-[#F16D75]'}>
                  {resolutionMode === 'with_convera' ? '✓ Automated Schedule De-confliction' : '× Overlapping Hearings & Audits'}
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#111419] border border-[#272D35] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#161A20] border border-[#272D35] flex items-center justify-center text-[#69C9A0]">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#E8EAED]">Immutable Action Audit Stream</h3>
              <p className="text-xs text-[#A0A7B2] leading-relaxed">
                {resolutionMode === 'with_convera'
                  ? 'Every decision, note, hearing adjournment, and closure directive is authenticated with officer identity, timestamp, and bureau designation.'
                  : 'Action trails depend on manual physical files, allowing missed statutory deadlines and unaccountable delays.'}
              </p>
              <div className="pt-2 text-[11px] font-mono">
                <span className={resolutionMode === 'with_convera' ? 'text-[#69C9A0]' : 'text-[#F16D75]'}>
                  {resolutionMode === 'with_convera' ? '✓ Tamper-evident Regulatory Ledger' : '× Untracked Delays & Lost Files'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: GATEWAY ACCESS & QUICK DEMO PATHWAY
          ========================================================================= */}
      <section
        id="sec-gateway"
        className="min-h-screen py-24 px-4 sm:px-8 relative bg-[#08090B] flex flex-col justify-between"
      >
        <div className="max-w-7xl mx-auto w-full space-y-12">
          {/* Section Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A3B86C]">
              <span>04 // ADMINISTRATIVE GATEWAY</span>
              <span className="text-[#272D35]">/</span>
              <span className="text-[#737D8B]">OFFICIAL ACCESS PORTAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#E8EAED] tracking-tight">
              Enter the CONVERA Workspace
            </h2>
            <p className="text-sm text-[#A0A7B2] max-w-3xl leading-relaxed">
              Launch into the live SIH26264 prototype environment. Evaluate the complaint registry, test deterministic overlap alerts, examine technical college profiles, and inspect the regulatory action stream.
            </p>
          </div>

          {/* Quick Access Matrix: 4 Pre-Configured Personas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#A0A7B2] uppercase tracking-wider font-semibold">
                Instant Evaluation Launchers — 1-Click Persona Sign-In:
              </span>
              <span className="text-[11px] font-mono text-[#737D8B] hidden sm:block">
                No credentials required for SIH review
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AUTHORIZED_DEMO_ACCOUNTS.map((account, idx) => (
                <div
                  key={account.user.uid}
                  className="p-5 rounded-2xl bg-[#111419] border border-[#272D35] hover:border-[#A3B86C]/50 hover:bg-[#161A20] transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => handleLaunchPersona(idx)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-lg bg-[#161A20] group-hover:bg-[#A3B86C]/10 border border-[#272D35] flex items-center justify-center text-[#A3B86C] font-mono text-xs font-bold transition-colors">
                        {account.user.bureau === 'ALL' ? 'ALL' : account.user.bureau}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0D10] text-[#737D8B] border border-[#272D35]">
                        {account.user.role}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#E8EAED] group-hover:text-white transition-colors">
                        {account.user.displayName}
                      </h4>
                      <p className="text-xs text-[#A0A7B2] mt-0.5 line-clamp-1">
                        {account.user.designation}
                      </p>
                    </div>

                    <p className="text-[11px] text-[#737D8B] leading-snug">
                      {account.user.department}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#272D35] flex items-center justify-between text-xs font-medium text-[#A3B86C]">
                    <span>
                      {isSigningIn === account.user.displayName ? 'Authenticating...' : 'Launch Persona'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Credentials Card for Manual Login */}
          <div className="p-6 rounded-2xl bg-[#111419] border border-[#272D35] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-base font-bold text-[#E8EAED]">Manual Credential Sign In</h3>
              <p className="text-xs text-[#A0A7B2]">
                Want to test standard password authentication, remember-me persistence, or registration flows?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenLogin}
                className="px-6 py-2.5 rounded-lg bg-[#E8EAED] hover:bg-white text-[#08090B] font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Go to Official Login Page</span>
              </button>
            </div>
          </div>
        </div>

        {/* SIH Submission Footer & Copyright */}
        <footer className="max-w-7xl mx-auto w-full pt-16 border-t border-[#272D35] mt-16 text-xs text-[#737D8B]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#161A20] border border-[#272D35] flex items-center justify-center text-[#A3B86C]">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-[#E8EAED]">CONVERA</span>
              <span>—</span>
              <span>Smart India Hackathon 2026</span>
              <span>•</span>
              <span className="font-mono text-[#A0A7B2]">Problem Statement: SIH26264</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span>All India Council for Technical Education</span>
              <span>•</span>
              <span className="text-[#A3B86C]">Prototype v1.0</span>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
};
