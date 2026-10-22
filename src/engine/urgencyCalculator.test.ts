import { describe, it, expect } from 'vitest';
import {
  calculateDeterministicUrgency,
  sortCasesByDeterministicUrgency,
  compareCasesByUrgency
} from './urgencyCalculator';
import { CaseRecord } from '../types';

describe('Urgency Engine — Deterministic Urgency & Priority Calculations', () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const isoOffset = (days: number) => new Date(now + days * dayMs).toISOString();
  const isoHoursOffset = (hours: number) => new Date(now + hours * hourMs).toISOString();

  const baseCase: CaseRecord = {
    caseId: 'AICTE/RB/2026/0100',
    institutionId: '1-4328901',
    institutionName: 'Sri Venkateswara College of Engineering',
    category: 'Unlawful Fee Demands',
    description: 'Capitation fee inquiry',
    bureau: 'RB',
    assignedOfficer: 'Dr. Suresh Patil',
    status: 'Under Process',
    priority: 'MEDIUM',
    complainantType: 'Student',
    receivedAt: isoOffset(-15),
    lastAction: 'Notice issued',
    nextAction: 'Hearing',
    lastActionAt: isoOffset(-2),
    expectedDisposalDate: isoOffset(5),
    relatedCaseIds: [],
    createdAt: isoOffset(-15),
    updatedAt: isoOffset(-2)
  };

  it('1. Overdue cases receive highest urgency score and explicit breach reason', () => {
    const overdueCase: CaseRecord = {
      ...baseCase,
      expectedDisposalDate: isoOffset(-4) // 4 days overdue
    };

    const analysis = calculateDeterministicUrgency(overdueCase);
    expect(analysis.isOverdue).toBe(true);
    expect(analysis.urgencyLevel).toBe('OVERDUE');
    expect(analysis.urgencyBadge).toBe('OVERDUE');
    expect(analysis.urgencyScore).toBeGreaterThanOrEqual(1000);
    expect(analysis.primaryReason).toContain('Statutory SLA Breached');
    expect(analysis.indicatorText).toContain('OVERDUE — deadline passed');
    expect(analysis.deadlineCountdown).toContain('overdue');
  });

  it('2. Disposed cases are excluded from active urgency calculation', () => {
    const disposedCase: CaseRecord = {
      ...baseCase,
      status: 'Disposed',
      expectedDisposalDate: isoOffset(-10) // Was overdue in the past, but now resolved
    };

    const analysis = calculateDeterministicUrgency(disposedCase);
    expect(analysis.urgencyScore).toBe(0);
    expect(analysis.isOverdue).toBe(false);
    expect(analysis.urgencyBadge).toBe('NORMAL');
    expect(analysis.indicatorText).toContain('RESOLVED');
    expect(analysis.primaryReason).toContain('Case resolved & disposed');
  });

  it('3. Imminent deadlines (0-2 days) rank higher than standard cases', () => {
    const imminentCase: CaseRecord = {
      ...baseCase,
      caseId: 'AICTE/RB/2026/0101',
      expectedDisposalDate: isoOffset(1) // Due tomorrow
    };

    const standardCase: CaseRecord = {
      ...baseCase,
      caseId: 'AICTE/RB/2026/0102',
      expectedDisposalDate: isoOffset(20) // Due in 20 days
    };

    const imminentAnalysis = calculateDeterministicUrgency(imminentCase);
    const standardAnalysis = calculateDeterministicUrgency(standardCase);

    expect(imminentAnalysis.urgencyScore).toBeGreaterThan(standardAnalysis.urgencyScore);
    expect(imminentAnalysis.urgencyLevel).toBe('IMMINENT');
    expect(imminentAnalysis.primaryReason).toContain('Deadline imminent');
  });

  it('4. Critical priority and active overlap add deterministic priority increments', () => {
    const criticalCase: CaseRecord = {
      ...baseCase,
      priority: 'CRITICAL',
      expectedDisposalDate: isoOffset(10)
    };

    const standardCase: CaseRecord = {
      ...baseCase,
      priority: 'MEDIUM',
      expectedDisposalDate: isoOffset(10)
    };

    const overlapSet = new Set([criticalCase.caseId]);
    const criticalAnalysis = calculateDeterministicUrgency(criticalCase, overlapSet);
    const standardAnalysis = calculateDeterministicUrgency(standardCase);

    expect(criticalAnalysis.urgencyScore).toBeGreaterThan(standardAnalysis.urgencyScore);
    expect(criticalAnalysis.hasPendingOverlap).toBe(true);
    expect(criticalAnalysis.primaryReason).toContain('Critical regulatory escalation');
    expect(criticalAnalysis.primaryReason).toContain('Concurrent cross-bureau proceeding');
  });

  it('5. Safe date fallback handles missing or malformed expectedDisposalDate', () => {
    const malformedCase: CaseRecord = {
      ...baseCase,
      expectedDisposalDate: 'INVALID_DATE_STRING'
    };

    const analysis = calculateDeterministicUrgency(malformedCase);
    expect(analysis.urgencyScore).toBeGreaterThan(0);
    expect(analysis.hasValidDeadline).toBe(false);
    expect(analysis.isProvisionalDeadline).toBe(true);
    expect(analysis.primaryReason).toContain('Provisional 30-day demo SLA');
  });

  it('6. Sorting produces deterministic order with stable tie-breaker', () => {
    const caseA: CaseRecord = { ...baseCase, caseId: 'CASE-B', priority: 'HIGH', expectedDisposalDate: isoOffset(5) };
    const caseB: CaseRecord = { ...baseCase, caseId: 'CASE-A', priority: 'HIGH', expectedDisposalDate: isoOffset(5) };

    const sorted = sortCasesByDeterministicUrgency([caseA, caseB]);
    expect(sorted[0].caseId).toBe('CASE-A');
    expect(sorted[1].caseId).toBe('CASE-B');
  });

  it('7. Cases due within 24 hours receive DUE_SOON badge and higher urgency than multi-day cases', () => {
    const dueIn6Hours: CaseRecord = {
      ...baseCase,
      caseId: 'AICTE/RB/2026/0206',
      expectedDisposalDate: isoHoursOffset(6)
    };

    const dueIn3Days: CaseRecord = {
      ...baseCase,
      caseId: 'AICTE/RB/2026/0203',
      expectedDisposalDate: isoOffset(3)
    };

    const analysis6h = calculateDeterministicUrgency(dueIn6Hours);
    const analysis3d = calculateDeterministicUrgency(dueIn3Days);

    expect(analysis6h.isDueWithin24h).toBe(true);
    expect(analysis6h.urgencyBadge).toBe('DUE_SOON');
    expect(analysis6h.indicatorText).toContain('DUE SOON — deadline within 24 hours');
    expect(analysis6h.deadlineCountdown).toContain('h remaining');
    expect(analysis6h.urgencyScore).toBeGreaterThan(analysis3d.urgencyScore);
  });

  it('8. Priority hierarchy: Overdue > Due <= 24h > Critical > High > Medium', () => {
    const overdueCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-1-OVERDUE',
      priority: 'LOW',
      expectedDisposalDate: isoOffset(-2)
    };

    const dueSoonCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-2-DUESOON',
      priority: 'LOW',
      expectedDisposalDate: isoHoursOffset(12)
    };

    const criticalCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-3-CRITICAL',
      priority: 'CRITICAL',
      expectedDisposalDate: isoOffset(10)
    };

    const highCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-4-HIGH',
      priority: 'HIGH',
      expectedDisposalDate: isoOffset(10)
    };

    const mediumCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-5-MEDIUM',
      priority: 'MEDIUM',
      expectedDisposalDate: isoOffset(10)
    };

    const disposedCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-6-DISPOSED',
      status: 'Disposed',
      expectedDisposalDate: isoOffset(-5)
    };

    const sorted = sortCasesByDeterministicUrgency([
      mediumCase,
      disposedCase,
      criticalCase,
      overdueCase,
      highCase,
      dueSoonCase
    ]);

    expect(sorted.map(c => c.caseId)).toEqual([
      'CASE-1-OVERDUE',
      'CASE-2-DUESOON',
      'CASE-3-CRITICAL',
      'CASE-4-HIGH',
      'CASE-5-MEDIUM',
      'CASE-6-DISPOSED'
    ]);
  });

  it('9. Escalated cases rank above standard non-escalated cases of equal priority', () => {
    const escalatedCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-ESC',
      status: 'Escalated',
      priority: 'HIGH',
      expectedDisposalDate: isoOffset(10)
    };

    const normalHighCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-NORMAL',
      status: 'Under Process',
      priority: 'HIGH',
      expectedDisposalDate: isoOffset(10)
    };

    const sorted = sortCasesByDeterministicUrgency([normalHighCase, escalatedCase]);
    expect(sorted[0].caseId).toBe('CASE-ESC');
    expect(sorted[1].caseId).toBe('CASE-NORMAL');
  });

  it('10. Complaint age acts as a stable tie-breaker when deadlines and priority are identical', () => {
    const olderCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-ZZZ', // lexicographically later, but chronologically older
      priority: 'HIGH',
      receivedAt: isoOffset(-30),
      expectedDisposalDate: isoOffset(15)
    };

    const newerCase: CaseRecord = {
      ...baseCase,
      caseId: 'CASE-AAA', // lexicographically earlier, but newer
      priority: 'HIGH',
      receivedAt: isoOffset(-5),
      expectedDisposalDate: isoOffset(15)
    };

    const sorted = sortCasesByDeterministicUrgency([newerCase, olderCase]);
    expect(sorted[0].caseId).toBe('CASE-ZZZ'); // Older complaint ranks first!
    expect(sorted[1].caseId).toBe('CASE-AAA');
  });

  it('11. Input immutability: calculateDeterministicUrgency and sortCasesByDeterministicUrgency never mutate original case records', () => {
    const testCase: CaseRecord = { ...baseCase };
    const freezeOriginal = Object.freeze({ ...testCase });

    const analysis = calculateDeterministicUrgency(freezeOriginal);
    expect(analysis).toBeDefined();

    const sorted = sortCasesByDeterministicUrgency([freezeOriginal]);
    expect(sorted.length).toBe(1);
    expect(freezeOriginal.status).toBe(testCase.status);
    expect(freezeOriginal.expectedDisposalDate).toBe(testCase.expectedDisposalDate);
  });
});
