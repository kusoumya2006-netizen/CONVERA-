import { describe, it, expect } from 'vitest';
import { calculateDeterministicUrgency, sortCasesByDeterministicUrgency } from './urgencyCalculator';
import { CaseRecord } from '../types';

describe('Urgency Engine — Deterministic Urgency & Priority Calculations', () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const isoOffset = (days: number) => new Date(now + days * dayMs).toISOString();

  const baseCase: CaseRecord = {
    caseId: 'AICTE/RB/2026/0100',
    institutionId: '1-4328901',
    institutionName: 'Sri Venkateswara College of Engineering',
    category: 'Unlawful Fee Demands',
    description: 'Capitation fee inquiry',
    bureau: 'RB',
    assignedOfficer: 'Dr. Amitabh Ghosh',
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
    expect(analysis.urgencyScore).toBeGreaterThanOrEqual(100);
    expect(analysis.primaryReason).toContain('Statutory SLA Breached');
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
    expect(analysis.primaryReason).toContain('Provisional 30-day demo SLA');
  });

  it('6. Sorting produces deterministic order with stable tie-breaker', () => {
    const caseA: CaseRecord = { ...baseCase, caseId: 'CASE-B', priority: 'HIGH', expectedDisposalDate: isoOffset(5) };
    const caseB: CaseRecord = { ...baseCase, caseId: 'CASE-A', priority: 'HIGH', expectedDisposalDate: isoOffset(5) };

    const sorted = sortCasesByDeterministicUrgency([caseA, caseB]);
    expect(sorted[0].caseId).toBe('CASE-A');
    expect(sorted[1].caseId).toBe('CASE-B');
  });
});
