import { describe, it, expect } from 'vitest';
import {
  formatActionRemarks,
  parseActionMetadata,
  inferCategoryFromActionType,
  mapActivityTypeToDbAction
} from './actionHistoryHelper';
import { CaseAction } from '../types';

describe('CONVERA — Case History & Activity Timeline Engine', () => {
  describe('formatActionRemarks', () => {
    it('formats a basic activity entry with category tag', () => {
      const result = formatActionRemarks('Progress Update', 'Scrutiny of complaint ongoing.');
      expect(result).toBe('[Progress Update] Scrutiny of complaint ongoing.');
    });

    it('encodes optional evidence reference, next action, and status transitions', () => {
      const result = formatActionRemarks('Investigation Note', 'Site inspection completed.', {
        evidenceRef: 'DOC-INSP-2026-001.pdf',
        nextAction: 'Review by Hearing Committee',
        previousStatus: 'Pending',
        newStatus: 'Under Process'
      });

      expect(result).toContain('[Investigation Note]');
      expect(result).toContain('Site inspection completed.');
      expect(result).toContain('[Evidence: DOC-INSP-2026-001.pdf]');
      expect(result).toContain('[Next: Review by Hearing Committee]');
      expect(result).toContain('[Status: Pending -> Under Process]');
    });

    it('does not append status tag if previous and new status are identical', () => {
      const result = formatActionRemarks('Communication', 'Dispatched reminder.', {
        previousStatus: 'Under Process',
        newStatus: 'Under Process'
      });

      expect(result).not.toContain('[Status:');
    });
  });

  describe('parseActionMetadata', () => {
    it('accurately parses encoded tags from remarks', () => {
      const action: CaseAction = {
        actionId: 'ACT-001',
        caseId: 'AICTE/RB/2026/101',
        actionType: 'COMMITTEE_INSPECTION',
        remarks: '[Investigation Note] Inspected physics lab. [Evidence: LAB-AUDIT.pdf] [Next: Order re-inspection] [Status: Pending -> Under Process]',
        bureau: 'RB',
        officer: 'Dr. Amitabh Ghosh (Director)',
        timestamp: '2026-10-23T10:00:00.000Z'
      };

      const meta = parseActionMetadata(action);
      expect(meta.activityCategory).toBe('Investigation Note');
      expect(meta.cleanRemarks).toBe('Inspected physics lab.');
      expect(meta.evidenceRef).toBe('LAB-AUDIT.pdf');
      expect(meta.nextAction).toBe('Order re-inspection');
      expect(meta.previousValue).toBe('Pending');
      expect(meta.newValue).toBe('Under Process');
      expect(meta.officerName).toBe('Dr. Amitabh Ghosh');
      expect(meta.officerRole).toBe('Director');
    });

    it('gracefully falls back to actionType inference for legacy seed data without bracket tags', () => {
      const action: CaseAction = {
        actionId: 'ACT-LEGACY',
        caseId: 'AICTE/PGRC/2026/202',
        actionType: 'NOTICE_ISSUED',
        remarks: 'Show cause notice dispatched via speed post to Registrar.',
        bureau: 'PGRC',
        officer: 'Smt. Sunita Mohanty',
        timestamp: '2026-10-20T10:00:00.000Z'
      };

      const meta = parseActionMetadata(action);
      expect(meta.activityCategory).toBe('Communication');
      expect(meta.cleanRemarks).toBe('Show cause notice dispatched via speed post to Registrar.');
      expect(meta.evidenceRef).toBeUndefined();
      expect(meta.officerName).toBe('Smt. Sunita Mohanty');
    });

    it('preserves existing action fields when already explicitly populated on CaseAction', () => {
      const action: CaseAction = {
        actionId: 'ACT-EXP',
        caseId: 'AICTE/RB/2026/303',
        actionType: 'REMARKS_ADDED',
        remarks: 'Affidavit submitted by principal.',
        bureau: 'RB',
        officer: 'Officer Sharma',
        timestamp: '2026-10-21T10:00:00.000Z',
        evidenceRef: 'AFFIDAVIT-01.pdf',
        activityCategory: 'Evidence Added'
      };

      const meta = parseActionMetadata(action);
      expect(meta.activityCategory).toBe('Evidence Added');
      expect(meta.evidenceRef).toBe('AFFIDAVIT-01.pdf');
    });
  });

  describe('mapActivityTypeToDbAction', () => {
    it('always maps to valid Postgres check-constraint values', () => {
      const validPgActionTypes = [
        'CASE_FILED',
        'NOTICE_ISSUED',
        'EXPLANATION_RECEIVED',
        'COMMITTEE_INSPECTION',
        'HEARING_SCHEDULED',
        'BUREAU_REASSIGNED',
        'CASE_ESCALATED',
        'INTER_BUREAU_COORDINATED',
        'CASE_DISPOSED',
        'CASE_REOPENED',
        'CASES_MERGED',
        'CASE_UNMERGED',
        'REMARKS_ADDED'
      ];

      const testCategories = [
        'Progress Update',
        'Investigation Note',
        'Evidence Added',
        'Communication',
        'Status Change',
        'Other'
      ] as const;

      for (const cat of testCategories) {
        const actionType = mapActivityTypeToDbAction(cat);
        expect(validPgActionTypes).toContain(actionType);
      }

      // Disposal
      const disposedActionType = mapActivityTypeToDbAction('Status Change', 'Disposed');
      expect(disposedActionType).toBe('CASE_DISPOSED');
      expect(validPgActionTypes).toContain(disposedActionType);
    });
  });

  describe('inferCategoryFromActionType', () => {
    it('correctly categorizes standard AICTE regulatory action types', () => {
      expect(inferCategoryFromActionType('COMMITTEE_INSPECTION')).toBe('Investigation Note');
      expect(inferCategoryFromActionType('NOTICE_ISSUED')).toBe('Communication');
      expect(inferCategoryFromActionType('EXPLANATION_RECEIVED')).toBe('Evidence Added');
      expect(inferCategoryFromActionType('CASE_DISPOSED')).toBe('Status Change');
      expect(inferCategoryFromActionType('CASE_REOPENED')).toBe('Status Change');
      expect(inferCategoryFromActionType('REMARKS_ADDED')).toBe('Progress Update');
    });
  });
});
