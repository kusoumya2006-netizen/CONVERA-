import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CinematicLandingPage } from './CinematicLandingPage';
import { AuthProvider } from '../../context/AuthContext';

describe('CONVERA — Cinematic Scroll Experience Verification', () => {
  const renderLanding = () => {
    return renderToString(
      React.createElement(
        AuthProvider,
        null,
        React.createElement(CinematicLandingPage, {
          onEnterWorkspace: () => {},
          onOpenLogin: () => {}
        })
      )
    );
  };

  it('1. Section 1 (System Awakening) renders institutional metadata, headline, and metrics ribbon', () => {
    const html = renderLanding();

    // Brand and Institutional Metadata
    expect(html).toContain('CONVERA');
    expect(html).toContain('AICTE INSTITUTIONAL INTELLIGENCE SYSTEM');
    expect(html).toContain('SIH26264');
    expect(html).toContain('DETERMINISTIC MONITOR READY');

    // Editorial Headline
    expect(html).toContain('ONE INSTITUTION.');
    expect(html).toContain('MULTIPLE CASES.');
    expect(html).toContain('ONE CONNECTED VIEW.');

    // Measurable Impact Metrics Ribbon
    expect(html).toContain('100%');
    expect(html).toContain('Deterministic PID Match');
    expect(html).toContain('-74%');
    expect(html).toContain('Duplicated Campus Inspections');
    expect(html).toContain('12 Days');
    expect(html).toContain('Average Grievance Speedup');
    expect(html).toContain('0');
    expect(html).toContain('Harmonized Regulatory Rulings');
  });

  it('2. Section 2 (The Fragmented Reality) renders SVCE silo scenario and isolated bureau viewpoints', () => {
    const html = renderLanding();

    // Section title & institution focus
    expect(html).toContain('01 // THE SYSTEMIC CRISIS');
    expect(html).toContain('The Fragmented Reality of AICTE Cells');
    expect(html).toContain('Sri Venkateswara College of Engineering');
    expect(html).toContain('1-4328901');

    // Isolated bureaus
    expect(html).toContain('Regulation Bureau');
    expect(html).toContain('AICTE-RB-2026-0041');
    expect(html).toContain('Capitation Fee Inquiry');

    expect(html).toContain('Grievance Cell');
    expect(html).toContain('AICTE-PGRC-2026-0089');
    expect(html).toContain('Hostel Facilities &amp; Safety');

    expect(html).toContain('Approval Bureau');
    expect(html).toContain('EOA-2026-7892');

    expect(html).toContain('Vigilance Cell');
    expect(html).toContain('CRITICAL CONFLICT DETECTED');
  });

  it('3. Section 3 (Convergence Engine) renders 4-stage pipeline and deterministic overlap verdict', () => {
    const html = renderLanding();

    // Ingestion pipeline stages
    expect(html).toContain('02 // THE CONVERGENCE ENGINE');
    expect(html).toContain('STAGE 01 // MULTI-BUREAU INGESTION');
    expect(html).toContain('STAGE 02 // ENTITY RESOLUTION');
    expect(html).toContain('STAGE 03 // OVERLAP MATRIX');
    expect(html).toContain('STAGE 04 // HARMONIZATION');

    // Overlap verdict
    expect(html).toContain('LIVE OVERLAP ENGINE EVALUATION');
    expect(html).toContain('VERDICT: OVERLAP CONFIRMED');
    expect(html).toContain('100% CONFIDENCE');
    expect(html).toContain('AUTOMATED SYSTEM ACTION');
  });

  it('4. Section 4 (Unified Resolution) renders governance features and comparative analysis', () => {
    const html = renderLanding();

    expect(html).toContain('03 // UNIFIED RESOLUTION');
    expect(html).toContain('From Disconnected Chaos to Synchronized Governance');
    expect(html).toContain('Unified Institutional Dossier');
    expect(html).toContain('Joint Calendar &amp; Inspection Harmonization');
    expect(html).toContain('Immutable Action Audit Stream');
    expect(html).toContain('With CONVERA');
    expect(html).toContain('Without CONVERA');
  });

  it('5. Section 5 (Administrative Gateway) renders 4 authorized officer personas and manual sign-in', () => {
    const html = renderLanding();

    expect(html).toContain('04 // ADMINISTRATIVE GATEWAY');
    expect(html).toContain('Enter the CONVERA Workspace');

    // Pre-configured personas
    expect(html).toContain('Dr. Amitabh Ghosh');
    expect(html).toContain('Director (Regulation Bureau)');

    expect(html).toContain('Smt. Sunita Mohanty');
    expect(html).toContain('Director (Public Grievance Redressal Cell)');

    expect(html).toContain('Dr. R. K. Verma');
    expect(html).toContain('Dr. Suresh N. Patil');

    // Manual login gateway
    expect(html).toContain('Manual Credential Sign In');
    expect(html).toContain('Go to Official Login Page');

    // Footer credentials & Hackathon attribution
    expect(html).toContain('Smart India Hackathon 2026');
    expect(html).toContain('SIH26264');
  });
});
