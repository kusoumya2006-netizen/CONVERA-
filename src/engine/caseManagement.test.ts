import { describe, it, expect } from 'vitest';
import { CaseRecord, ActionType, CaseAction } from '../types';

describe('P1 — Core Case Management & 14-Day Completion Logic', () => {
  const now = Date.now();
  const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

  it('Scenario 1: Completed filter uses completion timestamp, strictly ignoring receivedAt / createdAt', () => {
    // Case A: Received 45 days ago, completed 3 days ago -> SHOULD MATCH 14-day filter
    const caseA: CaseRecord = {
      caseId: 'CASE-001',
      institutionId: '1-100',
      category: 'Unlawful Fee Demands',
      description: 'Fee grievance',
      bureau: 'PGRC',
      assignedOfficer: 'Smt. Sunita Mohanty',
      status: 'Disposed',
      priority: 'MEDIUM',
      complainantType: 'Student',
      receivedAt: daysAgo(45), // Old received date
      lastAction: 'Disposed',
      nextAction: 'Closed',
      lastActionAt: daysAgo(3),
      expectedDisposalDate: daysAgo(10),
      relatedCaseIds: [],
      createdAt: daysAgo(45),
      updatedAt: daysAgo(3),
      completedAt: daysAgo(3), // Completed 3 days ago (WITHIN 14 days)
      completedBy: 'Smt. Sunita Mohanty',
      resolutionSummary: 'Fee refund processed to student account'
    };

    // Case B: Received 5 days ago, but NOT completed -> SHOULD NOT MATCH
    const caseB: CaseRecord = {
      ...caseA,
      caseId: 'CASE-002',
      status: 'Under Process',
      receivedAt: daysAgo(5),
      completedAt: undefined
    };

    // Case C: Completed 25 days ago -> SHOULD NOT MATCH (Beyond 14 days)
    const caseC: CaseRecord = {
      ...caseA,
      caseId: 'CASE-003',
      completedAt: daysAgo(25)
    };

    const cases = [caseA, caseB, caseC];
    const fourteenDaysAgoMs = now - 14 * 24 * 60 * 60 * 1000;

    const completedInLast14Days = cases.filter(c => {
      if (c.status !== 'Disposed' || !c.completedAt) return false;
      return new Date(c.completedAt).getTime() >= fourteenDaysAgoMs;
    });

    expect(completedInLast14Days).toHaveLength(1);
    expect(completedInLast14Days[0].caseId).toBe('CASE-001');
    expect(completedInLast14Days[0].completedBy).toBe('Smt. Sunita Mohanty');
  });

  it('Scenario 2: Reopening a case preserves audit history and removes it from completed list', () => {
    const historicalCompletedAt = daysAgo(2);
    const caseDisposed: CaseRecord = {
      caseId: 'CASE-010',
      institutionId: '1-100',
      category: 'Infrastructure Non-Compliance',
      description: 'Lab equipment deficiency',
      bureau: 'RB',
      assignedOfficer: 'Dr. Suresh Patil',
      status: 'Disposed',
      priority: 'HIGH',
      complainantType: 'Regulatory Agency',
      receivedAt: daysAgo(20),
      lastAction: 'Disposed',
      nextAction: 'Closed',
      lastActionAt: historicalCompletedAt,
      expectedDisposalDate: daysAgo(5),
      relatedCaseIds: [],
      createdAt: daysAgo(20),
      updatedAt: historicalCompletedAt,
      completedAt: historicalCompletedAt,
      completedBy: 'Dr. Suresh Patil',
      resolutionSummary: 'Deficiencies rectified'
    };

    // Simulate reopening
    const reopenReason = 'Complainant submitted new evidence showing safety non-compliance';
    const reopenedOfficer = 'Dr. Amitabh Ghosh';
    const reopenTime = new Date().toISOString();

    const reopenedCase: CaseRecord = {
      ...caseDisposed,
      status: 'Under Process',
      reopenedAt: reopenTime,
      reopenedBy: reopenedOfficer,
      reopenReason: reopenReason,
      lastAction: `Case reopened: ${reopenReason}`,
      lastActionAt: reopenTime,
      updatedAt: reopenTime
    };

    // Check that it retains historical completedAt and resolutionSummary
    expect(reopenedCase.completedAt).toBe(historicalCompletedAt);
    expect(reopenedCase.resolutionSummary).toBe('Deficiencies rectified');
    expect(reopenedCase.reopenedBy).toBe(reopenedOfficer);
    expect(reopenedCase.reopenReason).toBe(reopenReason);

    // Verify it is no longer considered in the active completed list
    const fourteenDaysAgoMs = now - 14 * 24 * 60 * 60 * 1000;
    const isCompletedActive = reopenedCase.status === 'Disposed' && 
      reopenedCase.completedAt !== undefined && 
      new Date(reopenedCase.completedAt).getTime() >= fourteenDaysAgoMs;

    expect(isCompletedActive).toBe(false);
  });
});

describe('P2 — Merged Cases Validation & Integrity Rules', () => {
  it('Scenario 3: Prevents self-merge and duplicate merges', () => {
    const validateMerge = (
      primary: { caseId: string; isMerged?: boolean; mergedCaseIds?: string[] },
      child: { caseId: string; isMerged?: boolean; mergedCaseIds?: string[] }
    ) => {
      if (primary.caseId === child.caseId) {
        return { valid: false, error: 'Cannot merge a case into itself' };
      }
      if (child.isMerged) {
        return { valid: false, error: 'Child case is already merged' };
      }
      if (primary.isMerged) {
        return { valid: false, error: 'Primary case cannot be an already merged child' };
      }
      if (child.mergedCaseIds?.includes(primary.caseId)) {
        return { valid: false, error: 'Circular merge relationship detected' };
      }
      return { valid: true };
    };

    // Self-merge attempt
    expect(validateMerge({ caseId: 'CASE-1' }, { caseId: 'CASE-1' }).valid).toBe(false);

    // Child already merged
    expect(validateMerge({ caseId: 'CASE-1' }, { caseId: 'CASE-2', isMerged: true }).valid).toBe(false);

    // Primary is already merged into something else
    expect(validateMerge({ caseId: 'CASE-1', isMerged: true }, { caseId: 'CASE-2' }).valid).toBe(false);

    // Circular merge
    expect(validateMerge({ caseId: 'CASE-1' }, { caseId: 'CASE-2', mergedCaseIds: ['CASE-1'] }).valid).toBe(false);

    // Valid merge
    expect(validateMerge({ caseId: 'CASE-1' }, { caseId: 'CASE-2' }).valid).toBe(true);
  });

  it('Scenario 4: Case History Activity Entries with Status Transitions and Evidence References', () => {
    const initialCase: CaseRecord = {
      caseId: 'AICTE/RB/2026/7821',
      institutionId: '1-10029',
      category: 'Unauthorized Course / Intake',
      description: 'Campus operating engineering degrees without AICTE Council approval.',
      bureau: 'RB',
      assignedOfficer: 'Dr. Amitabh Ghosh',
      status: 'Pending',
      priority: 'CRITICAL',
      complainantType: 'Anonymous',
      receivedAt: '2026-10-15T10:00:00.000Z',
      lastAction: 'Initial scrutiny assigned',
      nextAction: 'Issue formal notice',
      lastActionAt: '2026-10-15T10:00:00.000Z',
      expectedDisposalDate: '2026-11-15T10:00:00.000Z',
      relatedCaseIds: [],
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z'
    };

    // Simulate recording an Investigation Note activity with status transition
    const recordHistoryEntry = (
      currentCase: CaseRecord,
      activity: {
        activityType: string;
        description: string;
        newStatus?: string;
        evidenceRef?: string;
        nextAction?: string;
        officer: string;
        bureau: string;
      }
    ) => {
      const isStatusChanged = activity.newStatus && activity.newStatus !== currentCase.status;
      const updatedCase: CaseRecord = {
        ...currentCase,
        status: (activity.newStatus as any) || currentCase.status,
        lastAction: activity.description,
        nextAction: activity.nextAction || currentCase.nextAction,
        lastActionAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newAction: CaseAction = {
        actionId: `ACT-HIST-${Date.now()}`,
        caseId: currentCase.caseId,
        actionType: activity.activityType === 'Investigation Note' ? 'COMMITTEE_INSPECTION' : 'REMARKS_ADDED',
        remarks: `[${activity.activityType}] ${activity.description}${activity.evidenceRef ? ` [Evidence: ${activity.evidenceRef}]` : ''}`,
        bureau: activity.bureau as any,
        officer: activity.officer,
        timestamp: new Date().toISOString(),
        previousValue: isStatusChanged ? currentCase.status : undefined,
        newValue: isStatusChanged ? activity.newStatus : undefined,
        fieldChanged: isStatusChanged ? 'status' : undefined,
        evidenceRef: activity.evidenceRef
      };

      return { updatedCase, newAction };
    };

    const result = recordHistoryEntry(initialCase, {
      activityType: 'Investigation Note',
      description: 'Site inspection completed by Expert Committee; verified unauthorized laboratories.',
      newStatus: 'Under Process',
      evidenceRef: 'EXPERT-COMMITTEE-INSP-2026.pdf',
      nextAction: 'Issue Standing Appellate Committee hearing summons',
      officer: 'Dr. Amitabh Ghosh',
      bureau: 'RB'
    });

    expect(result.updatedCase.status).toBe('Under Process');
    expect(result.updatedCase.nextAction).toBe('Issue Standing Appellate Committee hearing summons');
    expect(result.newAction.actionType).toBe('COMMITTEE_INSPECTION');
    expect(result.newAction.previousValue).toBe('Pending');
    expect(result.newAction.newValue).toBe('Under Process');
    expect(result.newAction.evidenceRef).toBe('EXPERT-COMMITTEE-INSP-2026.pdf');
    expect(result.newAction.officer).toBe('Dr. Amitabh Ghosh');
  });
});
