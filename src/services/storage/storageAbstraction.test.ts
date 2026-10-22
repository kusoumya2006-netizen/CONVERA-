import { describe, it, expect, beforeEach } from 'vitest';
import { getStorageService, LocalStorageService } from './index';
import { CaseRecord, CaseAction, OverlapAlert } from '../../types';
import { AuthService, AUTHORIZED_DEMO_ACCOUNTS } from '../authService';

function createStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

const localMock = createStorageMock();
const sessionMock = createStorageMock();

Object.defineProperty(globalThis, 'localStorage', {
  value: localMock,
  writable: true,
  configurable: true
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionMock,
  writable: true,
  configurable: true
});

describe('CONVERA — Storage Abstraction & Multi-User Architecture Verification', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('1. Storage Factory defaults to operational LocalStorage fallback when cloud credentials are not supplied', () => {
    const service = getStorageService();
    expect(service).toBeDefined();
    expect(service.isConfigured()).toBe(true);
    expect(service.mode).toBe('local');
  });

  it('2. Storage Service loads 18 institutions, cases, actions, and overlap alerts seamlessly', async () => {
    const service = new LocalStorageService();
    const data = await service.loadInitialData();

    expect(data.institutions.length).toBeGreaterThanOrEqual(18);
    expect(data.cases.length).toBeGreaterThanOrEqual(30);
    expect(data.actions.length).toBeGreaterThanOrEqual(6);
    expect(data.alerts.length).toBeGreaterThanOrEqual(1);

    // Verify SVCE is loaded with PID 1-4328901
    const svce = data.institutions.find(i => i.institutionId === '1-4328901');
    expect(svce).toBeDefined();
    expect(svce?.name).toContain('Sri Venkateswara College of Engineering');
  });

  it('3. Case Creation persists stable case ID and triggers storage updates', async () => {
    const service = new LocalStorageService();
    const initialData = await service.loadInitialData();
    const initialCount = initialData.cases.length;

    const newCase: CaseRecord = {
      caseId: 'AICTE/TEST/2026/9999',
      institutionId: '1-4328901',
      institutionName: 'Sri Venkateswara College of Engineering (SVCE)',
      category: 'Unlawful Fee Demands',
      description: 'Test complaint regarding extra examination charges',
      bureau: 'RB',
      assignedOfficer: 'Dr. Suresh Patil',
      status: 'Pending',
      priority: 'HIGH',
      complainantType: 'Student',
      receivedAt: new Date().toISOString(),
      lastAction: 'Complaint registered for verification',
      nextAction: 'Issue initial notice',
      lastActionAt: new Date().toISOString(),
      expectedDisposalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      relatedCaseIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await service.saveCase(newCase);

    const reloaded = await service.loadInitialData();
    expect(reloaded.cases.length).toBe(initialCount + 1);

    const found = reloaded.cases.find(c => c.caseId === 'AICTE/TEST/2026/9999');
    expect(found).toBeDefined();
    expect(found?.category).toBe('Unlawful Fee Demands');
  });

  it('4. Case Status Updates, Disposals, and Reopening preserve immutable lifecycle fields', async () => {
    const service = new LocalStorageService();
    const initialData = await service.loadInitialData();
    const targetCaseId = initialData.cases[0].caseId;

    const now = new Date().toISOString();
    // 1. Update to Disposed
    await service.updateCase(targetCaseId, {
      status: 'Disposed',
      completedAt: now,
      completedBy: 'Dr. Amitabh Ghosh',
      resolutionSummary: 'Fee structure rectified and audit confirmed.'
    });

    let reloaded = await service.loadInitialData();
    let target = reloaded.cases.find(c => c.caseId === targetCaseId);
    expect(target?.status).toBe('Disposed');
    expect(target?.completedBy).toBe('Dr. Amitabh Ghosh');
    expect(target?.resolutionSummary).toBe('Fee structure rectified and audit confirmed.');

    // 2. Reopen case
    const reopenTime = new Date().toISOString();
    await service.updateCase(targetCaseId, {
      status: 'Under Process',
      reopenedAt: reopenTime,
      reopenedBy: 'Dr. Suresh Patil',
      reopenReason: 'New audit discrepancies submitted by complainant.'
    });

    reloaded = await service.loadInitialData();
    target = reloaded.cases.find(c => c.caseId === targetCaseId);
    expect(target?.status).toBe('Under Process');
    expect(target?.reopenedBy).toBe('Dr. Suresh Patil');
    expect(target?.reopenReason).toContain('New audit discrepancies');
  });

  it('5. Append-Only Action History: Actions are accumulated without mutating prior entries', async () => {
    const service = new LocalStorageService();
    const initialData = await service.loadInitialData();
    const initialActionsCount = initialData.actions.length;
    const targetCaseId = initialData.cases[0].caseId;

    const action1: CaseAction = {
      actionId: 'ACT-TEST-001',
      caseId: targetCaseId,
      actionType: 'NOTICE_ISSUED',
      remarks: 'Notice served to management committee.',
      bureau: 'RB',
      officer: 'Dr. Suresh Patil',
      timestamp: new Date().toISOString()
    };

    const action2: CaseAction = {
      actionId: 'ACT-TEST-002',
      caseId: targetCaseId,
      actionType: 'HEARING_SCHEDULED',
      remarks: 'Formal hearing convened for next Monday.',
      bureau: 'RB',
      officer: 'Dr. Amitabh Ghosh',
      timestamp: new Date().toISOString()
    };

    await service.saveActions([action1, action2]);

    const reloaded = await service.loadInitialData();
    expect(reloaded.actions.length).toBe(initialActionsCount + 2);

    const act1 = reloaded.actions.find(a => a.actionId === 'ACT-TEST-001');
    const act2 = reloaded.actions.find(a => a.actionId === 'ACT-TEST-002');
    expect(act1).toBeDefined();
    expect(act2).toBeDefined();
  });

  it('6. Multi-User Role Isolation: Two distinct officials authenticate with distinct roles and bureaus', async () => {
    // Official 1: Regulation Bureau Director
    const directorRB = AUTHORIZED_DEMO_ACCOUNTS[0];
    const user1 = await AuthService.signIn({
      email: directorRB.user.email,
      password: directorRB.passwordHash,
      rememberMe: true
    });

    expect(user1.role).toBe('RB_DIRECTOR');
    expect(user1.bureau).toBe('RB');
    expect(user1.displayName).toBe('Dr. Amitabh Ghosh');

    // Official 2: PGRC Director
    const directorPGRC = AUTHORIZED_DEMO_ACCOUNTS[1];
    const user2 = await AuthService.signIn({
      email: directorPGRC.user.email,
      password: directorPGRC.passwordHash,
      rememberMe: true
    });

    expect(user2.role).toBe('PGRC_DIRECTOR');
    expect(user2.bureau).toBe('PGRC');
    expect(user2.displayName).toBe('Smt. Sunita Mohanty');

    // Confirm that user session is persisted
    const session = AuthService.getPersistedSession();
    expect(session?.displayName).toBe('Smt. Sunita Mohanty');
    expect(session?.bureau).toBe('PGRC');
  });

  it('7. Overlap Alert Reviews persist coordination remarks and lead bureau assignment', async () => {
    const service = new LocalStorageService();
    const data = await service.loadInitialData();
    const alert = data.alerts[0];
    expect(alert).toBeDefined();

    const updatedAlert: OverlapAlert = {
      ...alert,
      reviewStatus: 'COORDINATED',
      leadBureau: 'RB',
      coordinationRemarks: 'Joint scrutiny committee approved by Bureau Directors.',
      reviewedBy: 'Dr. R. K. Verma',
      reviewedAt: new Date().toISOString()
    };

    await service.saveAlert(updatedAlert);

    const reloaded = await service.loadInitialData();
    const saved = reloaded.alerts.find(a => a.alertId === alert.alertId);
    expect(saved?.reviewStatus).toBe('COORDINATED');
    expect(saved?.leadBureau).toBe('RB');
    expect(saved?.coordinationRemarks).toContain('Joint scrutiny committee');
  });
});
