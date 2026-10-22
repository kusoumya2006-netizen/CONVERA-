import { describe, it, expect } from 'vitest';
import {
  detectCrossBureauOverlaps,
  normalizeInstitutionId,
  normalizeInstitutionName,
  evaluateCategoryCorrelation
} from './overlapDetector';
import { CaseRecord, Institution, OverlapAlert } from '../types';

describe('Deterministic Overlap Detection Engine', () => {
  const sampleInstitutions: Institution[] = [
    {
      institutionId: '1-1001',
      name: 'Delhi Institute of Engineering',
      address: 'Sector 5, Dwarka, New Delhi',
      region: 'Northern',
      type: 'Engineering',
      establishedYear: 2004,
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      institutionId: '1-1002',
      name: 'Mumbai Polytechnic College',
      address: 'Andheri West, Mumbai',
      region: 'Western',
      type: 'Polytechnic',
      establishedYear: 2010,
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  const baseCase: CaseRecord = {
    caseId: 'CASE-001',
    institutionId: '1-1001',
    institutionName: 'Delhi Institute of Engineering',
    category: 'Infrastructure Non-Compliance',
    description: 'Sample grievance',
    bureau: 'RB',
    assignedOfficer: 'Dr. Sharma',
    status: 'Under Process',
    priority: 'HIGH',
    complainantType: 'Faculty',
    receivedAt: '2026-02-10T10:00:00Z',
    lastAction: 'Notice issued',
    nextAction: 'Hearing',
    lastActionAt: '2026-02-15T10:00:00Z',
    expectedDisposalDate: '2026-03-30T10:00:00Z',
    relatedCaseIds: [],
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z'
  };

  it('Scenario 1: Detects active RB and PGRC overlap for the same institution with HIGH confidence', () => {
    const cases: CaseRecord[] = [
      {
        ...baseCase,
        caseId: 'AICTE-RB-01',
        bureau: 'RB',
        status: 'Under Process'
      },
      {
        ...baseCase,
        caseId: 'AICTE-PGRC-01',
        bureau: 'PGRC',
        status: 'Pending'
      }
    ];

    const alerts = detectCrossBureauOverlaps(cases, sampleInstitutions);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].confidence).toBe('HIGH');
    expect(alerts[0].institutionId).toBe('1-1001');
    expect(alerts[0].involvedBureaus).toEqual(expect.arrayContaining(['RB', 'PGRC']));
    expect(alerts[0].caseIds).toEqual(['AICTE-PGRC-01', 'AICTE-RB-01']);
    expect(alerts[0].reason).toContain('Critical Cross-Bureau Overlap');
  });

  it('Scenario 2: Does NOT flag an overlap when multiple cases belong to a single bureau only', () => {
    const cases: CaseRecord[] = [
      {
        ...baseCase,
        caseId: 'AICTE-RB-01',
        bureau: 'RB',
        status: 'Under Process'
      },
      {
        ...baseCase,
        caseId: 'AICTE-RB-02',
        bureau: 'RB',
        status: 'Pending'
      }
    ];

    const alerts = detectCrossBureauOverlaps(cases, sampleInstitutions);
    expect(alerts).toHaveLength(0);
  });

  it('Scenario 3: Excludes disposed cases from active cross-bureau overlap alerts', () => {
    const cases: CaseRecord[] = [
      {
        ...baseCase,
        caseId: 'AICTE-RB-01',
        bureau: 'RB',
        status: 'Disposed' // Closed
      },
      {
        ...baseCase,
        caseId: 'AICTE-PGRC-01',
        bureau: 'PGRC',
        status: 'Pending'
      }
    ];

    const alerts = detectCrossBureauOverlaps(cases, sampleInstitutions);
    // Since RB case is disposed, only 1 active case remains. No active overlap.
    expect(alerts).toHaveLength(0);
  });

  it('Scenario 4: Does NOT flag overlaps across different institutions', () => {
    const cases: CaseRecord[] = [
      {
        ...baseCase,
        caseId: 'AICTE-RB-01',
        institutionId: '1-1001',
        bureau: 'RB',
        status: 'Under Process'
      },
      {
        ...baseCase,
        caseId: 'AICTE-PGRC-02',
        institutionId: '1-1002',
        institutionName: 'Mumbai Polytechnic College',
        bureau: 'PGRC',
        status: 'Under Process'
      }
    ];

    const alerts = detectCrossBureauOverlaps(cases, sampleInstitutions);
    expect(alerts).toHaveLength(0);
  });

  it('Scenario 5: Handles missing institution IDs via normalized name comparison with MEDIUM confidence', () => {
    const cases: CaseRecord[] = [
      {
        ...baseCase,
        caseId: 'AICTE-RB-99',
        institutionId: '', // Missing ID
        institutionName: 'Delhi Institute of Engineering',
        bureau: 'RB',
        status: 'Under Process'
      },
      {
        ...baseCase,
        caseId: 'AICTE-PGRC-99',
        institutionId: '', // Missing ID
        institutionName: 'delhi institute of engineering', // slight case difference
        bureau: 'PGRC',
        status: 'Pending'
      }
    ];

    const alerts = detectCrossBureauOverlaps(cases, sampleInstitutions);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].confidence).toBe('MEDIUM');
    expect(alerts[0].reason).toContain('[Matched via normalized institution name');
  });

  it('Scenario 6: Prevents duplicate alerts and preserves existing review status and coordination remarks', () => {
    const cases: CaseRecord[] = [
      {
        ...baseCase,
        caseId: 'AICTE-RB-01',
        bureau: 'RB',
        status: 'Under Process'
      },
      {
        ...baseCase,
        caseId: 'AICTE-PGRC-01',
        bureau: 'PGRC',
        status: 'Pending'
      }
    ];

    // Initial detection
    const firstRunAlerts = detectCrossBureauOverlaps(cases, sampleInstitutions);
    expect(firstRunAlerts).toHaveLength(1);
    const alertId = firstRunAlerts[0].alertId;

    // Simulate user reviewing and adding coordination remarks
    const reviewedAlert: OverlapAlert = {
      ...firstRunAlerts[0],
      reviewStatus: 'COORDINATED',
      coordinationRemarks: 'Joint hearing scheduled for 25th March 2026 with RB and PGRC directors.',
      leadBureau: 'RB',
      reviewedBy: 'Dr. R. K. Verma (Advisor RB)',
      reviewedAt: '2026-03-01T14:30:00Z'
    };

    // Second detection run passing in the existing reviewed alert
    const secondRunAlerts = detectCrossBureauOverlaps(cases, sampleInstitutions, {
      existingAlerts: [reviewedAlert]
    });

    expect(secondRunAlerts).toHaveLength(1);
    expect(secondRunAlerts[0].alertId).toBe(alertId);
    expect(secondRunAlerts[0].reviewStatus).toBe('COORDINATED');
    expect(secondRunAlerts[0].coordinationRemarks).toBe(reviewedAlert.coordinationRemarks);
    expect(secondRunAlerts[0].leadBureau).toBe('RB');
  });

  it('Helper test: Normalization functions strip special chars and handle spaces properly', () => {
    expect(normalizeInstitutionId(' 1-439-2811 ')).toBe('14392811');
    expect(normalizeInstitutionName('Apex  Institute of Technology!! ')).toBe('apex institute of technology');
  });

  describe('Explainable Overlap Intelligence: Category Correlation & Matching Strategy', () => {
    it('evaluates IDENTICAL_CATEGORY when complaints share the exact same category', () => {
      const res = evaluateCategoryCorrelation([
        'Unlawful Fee Demands',
        'Unlawful Fee Demands'
      ]);
      expect(res.correlation).toBe('IDENTICAL_CATEGORY');
      expect(res.summary).toContain('Direct procedural overlap');
    });

    it('evaluates RELATED_THEME when complaints share a thematic regulatory domain', () => {
      const res = evaluateCategoryCorrelation([
        'Unlawful Fee Demands',
        'Capitation Fee Allegation'
      ]);
      expect(res.correlation).toBe('RELATED_THEME');
      expect(res.summary).toContain('Thematically related grievances');
    });

    it('evaluates DISTINCT_MATTERS when complaints involve unrelated matters', () => {
      const res = evaluateCategoryCorrelation([
        'Unlawful Fee Demands',
        'Unauthorized Course / Intake'
      ]);
      expect(res.correlation).toBe('DISTINCT_MATTERS');
      expect(res.summary).toContain('Independent proceedings sharing target institution');
    });

    it('sets EXACT_PID strategy and matching evidence on alert when matched via PID', () => {
      const cases: CaseRecord[] = [
        { ...baseCase, caseId: 'RB-PID-1', bureau: 'RB' },
        { ...baseCase, caseId: 'PGRC-PID-1', bureau: 'PGRC' }
      ];
      const alerts = detectCrossBureauOverlaps(cases, sampleInstitutions);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].matchingStrategy).toBe('EXACT_PID');
      expect(alerts[0].categoryCorrelation).toBe('IDENTICAL_CATEGORY');
      expect(alerts[0].matchingEvidence).toContain('PID: 1-1001');
    });

    it('sets NORMALIZED_NAME strategy on alert when PID is unavailable', () => {
      const cases: CaseRecord[] = [
        { ...baseCase, caseId: 'RB-NAM-1', institutionId: '', institutionName: 'Delhi Institute of Engineering', bureau: 'RB' },
        { ...baseCase, caseId: 'PGRC-NAM-1', institutionId: '', institutionName: 'Delhi Institute of Engineering', bureau: 'PGRC' }
      ];
      const alerts = detectCrossBureauOverlaps(cases, sampleInstitutions);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].matchingStrategy).toBe('NORMALIZED_NAME');
      expect(alerts[0].confidence).toBe('MEDIUM');
      expect(alerts[0].matchingEvidence).toContain('Normalized Institution Name match');
    });
  });
});
