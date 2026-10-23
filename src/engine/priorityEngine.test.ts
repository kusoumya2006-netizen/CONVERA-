import { describe, it, expect } from 'vitest';
import { calculateExplainablePriority, sortCasesByPriorityScore, PRIORITY_THRESHOLDS } from './priorityEngine';
import { CaseRecord, OverlapAlert } from '../types';

describe('CONVERA — Explainable Priority & Escalation Engine', () => {
  const baseTime = new Date('2026-10-23T12:00:00.000Z');

  const createMockCase = (overrides: Partial<CaseRecord> = {}): CaseRecord => ({
    caseId: 'AICTE/RB/2026/001',
    institutionId: '1-1001',
    institutionName: 'Apex Institute of Technology',
    category: 'Infrastructure Non-Compliance',
    description: 'Substandard lab facilities reported.',
    bureau: 'RB',
    assignedOfficer: 'Dr. Suresh Patil',
    status: 'Under Process',
    priority: 'HIGH',
    complainantType: 'Faculty',
    receivedAt: '2026-10-01T10:00:00.000Z',
    lastAction: 'Explanation notice issued.',
    nextAction: 'Verify institutional compliance report',
    lastActionAt: '2026-10-20T10:00:00.000Z',
    expectedDisposalDate: '2026-10-31T10:00:00.000Z',
    relatedCaseIds: [],
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
    ...overrides
  });

  it('1. Returns score 0 and LOW level for Disposed cases', () => {
    const disposedCase = createMockCase({
      status: 'Disposed',
      expectedDisposalDate: '2026-10-15T10:00:00.000Z' // Past date should be ignored
    });

    const result = calculateExplainablePriority(disposedCase, [], baseTime);
    expect(result.score).toBe(0);
    expect(result.level).toBe('LOW');
    expect(result.isOverdue).toBe(false);
    expect(result.summaryExplanation).toContain('resolved and disposed');
  });

  it('2. Scores an overdue case as CRITICAL with explicit SLA breach factor', () => {
    const overdueCase = createMockCase({
      expectedDisposalDate: '2026-10-20T12:00:00.000Z', // 3 days overdue
      priority: 'CRITICAL',
      status: 'Under Process'
    });

    const result = calculateExplainablePriority(overdueCase, [], baseTime);
    expect(result.isOverdue).toBe(true);
    expect(result.daysOverdue).toBeGreaterThanOrEqual(3);
    expect(result.score).toBeGreaterThanOrEqual(PRIORITY_THRESHOLDS.CRITICAL_MIN);
    expect(result.level).toBe('CRITICAL');

    const deadlineFactor = result.factors.find(f => f.category === 'DEADLINE');
    expect(deadlineFactor).toBeDefined();
    expect(deadlineFactor?.label).toContain('Statutory SLA Breached');
    expect(result.recommendedNextAction).toContain('Immediate SLA escalation');
  });

  it('3. Elevated score when case is formally Escalated', () => {
    const normalCase = createMockCase({
      expectedDisposalDate: '2026-11-20T12:00:00.000Z', // 28 days left
      status: 'Under Process',
      priority: 'MEDIUM'
    });
    const escalatedCase = createMockCase({
      expectedDisposalDate: '2026-11-20T12:00:00.000Z',
      status: 'Escalated',
      priority: 'MEDIUM'
    });

    const normalResult = calculateExplainablePriority(normalCase, [], baseTime);
    const escalatedResult = calculateExplainablePriority(escalatedCase, [], baseTime);

    expect(escalatedResult.score).toBeGreaterThan(normalResult.score);
    expect(escalatedResult.isEscalated).toBe(true);
    const escFactor = escalatedResult.factors.find(f => f.category === 'ESCALATION');
    expect(escFactor).toBeDefined();
    expect(escFactor?.scoreContribution).toBe(15);
  });

  it('4. Incorporates active unreviewed cross-bureau overlap into priority and recommendations', () => {
    const caseRec = createMockCase({ caseId: 'CASE-ALPHA' });
    const mockAlerts: OverlapAlert[] = [
      {
        alertId: 'OVL-01',
        institutionId: '1-1001',
        institutionName: 'Apex Institute of Technology',
        caseIds: ['CASE-ALPHA', 'CASE-BETA'],
        involvedBureaus: ['RB', 'PGRC'],
        reason: 'Concurrent inspection and harassment grievances.',
        confidence: 'HIGH',
        reviewStatus: 'PENDING_REVIEW',
        detectedAt: '2026-10-22T10:00:00.000Z'
      }
    ];

    const result = calculateExplainablePriority(caseRec, mockAlerts, baseTime);
    expect(result.hasActiveOverlap).toBe(true);

    const overlapFactor = result.factors.find(f => f.category === 'OVERLAP');
    expect(overlapFactor).toBeDefined();
    expect(overlapFactor?.scoreContribution).toBe(18);
    expect(result.recommendedNextAction).toContain('PGRC');
  });

  it('5. Detects stalled next actions (> 7 days without action)', () => {
    const stalledCase = createMockCase({
      nextAction: 'Summon Institution Secretary',
      lastActionAt: '2026-10-10T10:00:00.000Z' // 13 days ago
    });

    const result = calculateExplainablePriority(stalledCase, [], baseTime);
    const nextActionFactor = result.factors.find(f => f.category === 'NEXT_ACTION');
    expect(nextActionFactor).toBeDefined();
    expect(nextActionFactor?.label).toContain('Stalled');
    expect(nextActionFactor?.scoreContribution).toBe(8);
  });

  it('6. Handles missing or malformed dates gracefully with 30-day SLA fallback', () => {
    const malformedCase = createMockCase({
      expectedDisposalDate: 'invalid-date-string',
      receivedAt: 'invalid-date-string'
    });

    const result = calculateExplainablePriority(malformedCase, [], baseTime);
    expect(result).toBeDefined();
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThan(0);
    expect(result.factors.length).toBeGreaterThan(0);
  });

  it('7. Recognizes unassigned scrutiny officer and adds assignment factor', () => {
    const unassignedCase = createMockCase({
      assignedOfficer: 'Unassigned Scrutiny Pool'
    });

    const result = calculateExplainablePriority(unassignedCase, [], baseTime);
    const assignFactor = result.factors.find(f => f.category === 'ASSIGNMENT');
    expect(assignFactor).toBeDefined();
    expect(assignFactor?.scoreContribution).toBe(4);
  });

  it('8. Sorts multiple cases deterministically with highest priority first', () => {
    const caseLow = createMockCase({
      caseId: 'CASE-LOW',
      expectedDisposalDate: '2026-11-25T12:00:00.000Z',
      priority: 'LOW',
      status: 'Pending'
    });
    const caseOverdue = createMockCase({
      caseId: 'CASE-OVERDUE',
      expectedDisposalDate: '2026-10-18T12:00:00.000Z', // 5 days overdue
      priority: 'CRITICAL',
      status: 'Under Process'
    });
    const caseMedium = createMockCase({
      caseId: 'CASE-MEDIUM',
      expectedDisposalDate: '2026-10-27T12:00:00.000Z', // 4 days left
      priority: 'MEDIUM',
      status: 'Under Process'
    });

    const sorted = sortCasesByPriorityScore([caseLow, caseOverdue, caseMedium], [], baseTime);
    expect(sorted[0].caseRecord.caseId).toBe('CASE-OVERDUE');
    expect(sorted[0].analysis.level).toBe('CRITICAL');
    expect(sorted[sorted.length - 1].caseRecord.caseId).toBe('CASE-LOW');
  });
});
