import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseStorageService } from './supabaseStorageService';
import { LocalStorageService } from './localStorageService';
import { CaseRecord, CaseAction } from '../../types';
import * as supabaseClientModule from '../supabaseClient';

function createStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorageMock(),
    writable: true,
    configurable: true
  });
}

describe('CONVERA — Cloud Persistence & Two-Write Safety Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const sampleCase: CaseRecord = {
    caseId: 'AICTE/RB/2026/7821',
    institutionId: '1-4328901',
    institutionName: 'Sri Venkateswara College of Engineering (SVCE)',
    category: 'Infrastructure Non-Compliance',
    description: 'Structural inspection non-compliance reported by local team.',
    bureau: 'RB',
    assignedOfficer: 'Dr. Suresh Patil',
    status: 'Pending',
    priority: 'HIGH',
    complainantType: 'Faculty',
    receivedAt: '2026-10-22T10:00:00.000Z',
    lastAction: 'Complaint registered in intake portal.',
    nextAction: 'Dispatch query.',
    lastActionAt: '2026-10-22T10:00:00.000Z',
    expectedDisposalDate: '2026-11-22T10:00:00.000Z',
    relatedCaseIds: [],
    createdAt: '2026-10-22T10:00:00.000Z',
    updatedAt: '2026-10-22T10:00:00.000Z'
  };

  const sampleAction: CaseAction = {
    actionId: 'ACT-999901',
    caseId: 'AICTE/RB/2026/7821',
    actionType: 'CASE_FILED',
    remarks: 'Complaint registered in RB system by Dr. Suresh Patil.',
    bureau: 'RB',
    officer: 'Dr. Suresh Patil',
    timestamp: '2026-10-22T10:00:00.000Z'
  };

  it('1. saveCase throws descriptive error when Supabase upsert fails without silent fallback', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'new row violates row-level security policy for table "cases"', code: '42501' }
        })
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    await expect(storage.saveCase(sampleCase)).rejects.toThrow(
      /Failed to save case \[AICTE\/RB\/2026\/7821\] in Supabase: new row violates row-level security policy.*42501/
    );
  });

  it('2. saveAction throws descriptive error when Supabase case_actions insert fails', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'violates foreign key constraint "case_actions_case_id_fkey"', code: '23503' }
        })
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    await expect(storage.saveAction(sampleAction)).rejects.toThrow(
      /Failed to append actions to Supabase: violates foreign key constraint.*23503/
    );
  });

  it('3. updateCase throws descriptive error when Supabase update fails', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'permission denied for table cases', code: '42501' }
          })
        })
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    await expect(storage.updateCase(sampleCase.caseId, { status: 'Disposed' })).rejects.toThrow(
      /Failed to update case \[AICTE\/RB\/2026\/7821\] in Supabase: permission denied/
    );
  });

  it('4. saveCase normalizes nullable database fields explicitly to null', async () => {
    let capturedPayload: any = null;
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockImplementation((payload: any) => {
          capturedPayload = payload;
          return Promise.resolve({ data: payload, error: null });
        })
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    await storage.saveCase(sampleCase);

    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.completed_at).toBeNull();
    expect(capturedPayload.completed_by).toBeNull();
    expect(capturedPayload.resolution_summary).toBeNull();
    expect(capturedPayload.reopened_at).toBeNull();
    expect(capturedPayload.merged_into_case_id).toBeNull();
    expect(capturedPayload.is_merged).toBe(false);
  });

  it('5. Fallback service operates cleanly when Supabase is not configured (Local demo mode)', async () => {
    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(null);

    const storage = new SupabaseStorageService();
    // In local mode, saveCase delegates to fallback service without throwing
    await expect(storage.saveCase(sampleCase)).resolves.not.toThrow();
  });

  it('6. saveCase passes selected institution_id unchanged into the Supabase upsert payload', async () => {
    let capturedPayload: any = null;
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockImplementation((payload: any) => {
          capturedPayload = payload;
          return Promise.resolve({ data: payload, error: null });
        })
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    const testInstId = '1-9923841'; // Malwa Institute of Technology and Management from migration 003
    await storage.saveCase({
      ...sampleCase,
      institutionId: testInstId,
      institutionName: 'Malwa Institute of Technology and Management'
    });

    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.institution_id).toBe(testInstId);
    expect(capturedPayload.institution_name).toBe('Malwa Institute of Technology and Management');
  });

  it('7. loadInitialData fails loudly without falling back to synthetic institutions if Supabase returns 0 institutions', async () => {
    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'institutions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        };
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    await expect(storage.loadInitialData()).rejects.toThrow(
      /Failed to load cloud data from Supabase: Supabase public\.institutions table returned 0 rows/
    );
  });

  it('8. loadInitialData maps all Supabase institution records directly into returned institutions array', async () => {
    const dbInstitutions = [
      {
        institution_id: '1-4328901',
        name: 'Sri Venkateswara College of Engineering (SVCE)',
        address: 'Sriperumbudur, TN',
        region: 'Southern',
        type: 'Engineering',
        established_year: 1985,
        accreditation_grade: 'NAAC A+',
        created_at: '2019-04-12T08:00:00Z'
      },
      {
        institution_id: '1-9923841',
        name: 'Malwa Institute of Technology and Management',
        address: 'Indore, MP',
        region: 'Central',
        type: 'Engineering & Technology',
        established_year: 2003,
        accreditation_grade: 'NBA Accredited',
        created_at: '2018-11-05T08:00:00Z'
      }
    ];

    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'institutions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: dbInstitutions, error: null })
            })
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        };
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    const data = await storage.loadInitialData();

    expect(data.storageMode).toBe('supabase');
    expect(data.isDemoMode).toBe(false);
    expect(data.institutions.length).toBe(2);
    expect(data.institutions[0].institutionId).toBe('1-4328901');
    expect(data.institutions[1].institutionId).toBe('1-9923841');
    expect(data.institutions[1].name).toBe('Malwa Institute of Technology and Management');
  });

  it('9. loadInitialData gracefully survives overlap_alerts query failure and dynamically computes cross-bureau overlap alerts', async () => {
    const dbInstitutions = [
      {
        institution_id: '1-4328901',
        name: 'Sri Venkateswara College of Engineering (SVCE)',
        address: 'Sriperumbudur, TN',
        region: 'Southern',
        type: 'Engineering',
        established_year: 1985,
        accreditation_grade: 'NAAC A+',
        created_at: '2019-04-12T08:00:00Z'
      }
    ];

    const dbCases = [
      {
        case_id: 'AICTE-RB-2026-0041',
        institution_id: '1-4328901',
        institution_name: 'Sri Venkateswara College of Engineering (SVCE)',
        category: 'Capitation Fee Allegation',
        description: 'Capitation fee investigation',
        bureau: 'RB',
        assigned_officer: 'Dr. Suresh Patil',
        status: 'Under Process',
        priority: 'HIGH',
        complainant_type: 'Student',
        received_at: '2026-01-15T00:00:00Z',
        last_action: 'Notice issued',
        next_action: 'Hearing',
        last_action_at: '2026-01-20T00:00:00Z',
        expected_disposal_date: '2026-04-15T00:00:00Z',
        related_case_ids: ['AICTE-PGRC-2026-0089'],
        created_at: '2026-01-15T00:00:00Z',
        updated_at: '2026-01-20T00:00:00Z'
      },
      {
        case_id: 'AICTE-PGRC-2026-0089',
        institution_id: '1-4328901',
        institution_name: 'Sri Venkateswara College of Engineering (SVCE)',
        category: 'Infrastructure Non-Compliance',
        description: 'Hostel non-compliance',
        bureau: 'PGRC',
        assigned_officer: 'Smt. Sunita Mohanty',
        status: 'Under Process',
        priority: 'MEDIUM',
        complainant_type: 'Student',
        received_at: '2026-01-20T00:00:00Z',
        last_action: 'Query sent',
        next_action: 'Inspection',
        last_action_at: '2026-01-25T00:00:00Z',
        expected_disposal_date: '2026-04-20T00:00:00Z',
        related_case_ids: ['AICTE-RB-2026-0041'],
        created_at: '2026-01-20T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z'
      }
    ];

    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'institutions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: dbInstitutions, error: null })
            })
          };
        }
        if (table === 'cases') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: dbCases, error: null })
            })
          };
        }
        if (table === 'case_actions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          };
        }
        if (table === 'overlap_alerts') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { code: '42501', message: 'permission denied for table overlap_alerts' }
              })
            })
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        };
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    const data = await storage.loadInitialData();

    // Verification: Data loading succeeds despite overlap_alerts query error
    expect(data.institutions.length).toBe(1);
    expect(data.cases.length).toBe(2);
    expect(data.alerts.length).toBe(1); // Algorithmic detector generates the overlap!
    expect(data.alerts[0].institutionId).toBe('1-4328901');
    expect(data.alerts[0].involvedBureaus).toContain('RB');
    expect(data.alerts[0].involvedBureaus).toContain('PGRC');
  });

  it('10. loadInitialData preserves explicitly persisted overlap alerts when present in cloud database', async () => {
    const dbInstitutions = [
      {
        institution_id: '1-4328901',
        name: 'Sri Venkateswara College of Engineering (SVCE)',
        address: 'Sriperumbudur, TN',
        region: 'Southern',
        type: 'Engineering',
        established_year: 1985,
        accreditation_grade: 'NAAC A+',
        created_at: '2019-04-12T08:00:00Z'
      }
    ];

    const dbAlerts = [
      {
        alert_id: 'ALERT-SVCE-MANUAL',
        institution_id: '1-4328901',
        institution_name: 'Sri Venkateswara College of Engineering (SVCE)',
        case_ids: ['AICTE-RB-2026-0041', 'AICTE-PGRC-2026-0089'],
        involved_bureaus: ['RB', 'PGRC'],
        reason: 'Manually logged cross-bureau conflict',
        confidence: 'HIGH',
        review_status: 'COORDINATED',
        detected_at: '2026-01-20T00:00:00Z',
        coordination_remarks: 'Resolved via joint review',
        lead_bureau: 'RB',
        reviewed_by: 'Advisor Verma',
        reviewed_at: '2026-01-22T00:00:00Z'
      }
    ];

    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'institutions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: dbInstitutions, error: null })
            })
          };
        }
        if (table === 'overlap_alerts') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: dbAlerts, error: null })
            })
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        };
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    const data = await storage.loadInitialData();

    expect(data.alerts.length).toBe(1);
    expect(data.alerts[0].alertId).toBe('ALERT-SVCE-MANUAL');
    expect(data.alerts[0].reviewStatus).toBe('COORDINATED');
    expect(data.alerts[0].reviewedBy).toBe('Advisor Verma');
  });

  it('11. saveActions successfully passes authorized actions within permitted jurisdiction to Supabase', async () => {
    let insertedRows: any[] = [];
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockImplementation((rows: any[]) => {
          insertedRows = rows;
          return Promise.resolve({ data: rows, error: null });
        })
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    const authorizedAction: CaseAction = {
      actionId: 'ACT-AUTH-1001',
      caseId: 'AICTE-RB-2026-0041',
      actionType: 'HEARING_SCHEDULED',
      remarks: 'Hearing scheduled by RB Bureau Director.',
      bureau: 'RB',
      officer: 'Dr. Suresh Patil',
      timestamp: '2026-10-22T12:00:00.000Z'
    };

    await expect(storage.saveAction(authorizedAction)).resolves.not.toThrow();
    expect(insertedRows.length).toBe(1);
    expect(insertedRows[0].action_id).toBe('ACT-AUTH-1001');
    expect(insertedRows[0].case_id).toBe('AICTE-RB-2026-0041');
    expect(insertedRows[0].bureau).toBe('RB');
    expect(insertedRows[0].action_type).toBe('HEARING_SCHEDULED');
  });

  it('12. saveActions throws Code 42501 when an unauthorized cross-bureau insert violates RLS policy', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'new row violates row-level security policy for table "case_actions"',
            code: '42501'
          }
        })
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    const unauthorizedAction: CaseAction = {
      actionId: 'ACT-UNAUTH-2002',
      caseId: 'AICTE-PGRC-2026-0089',
      actionType: 'HEARING_SCHEDULED',
      remarks: 'Attempted unauthorized status action across jurisdictional bureau boundary.',
      bureau: 'PGRC',
      officer: 'Dr. Suresh Patil', // RB Director attempting routine action on PGRC case
      timestamp: '2026-10-22T12:05:00.000Z'
    };

    await expect(storage.saveAction(unauthorizedAction)).rejects.toThrow(
      /Failed to append actions to Supabase: new row violates row-level security policy for table "case_actions".*42501/
    );
  });

  it('13. saveActions throws when user session / profile is absent and Supabase rejects with RLS 42501', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'new row violates row-level security policy for table "case_actions"',
            code: '42501'
          }
        })
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    const actionWithoutProfile: CaseAction = {
      actionId: 'ACT-NOPROFILE-3003',
      caseId: 'AICTE-RB-2026-0041',
      actionType: 'REMARKS_ADDED',
      remarks: 'Action attempted by anonymous or unprofiled caller.',
      bureau: 'RB',
      officer: 'Unknown Caller',
      timestamp: '2026-10-22T12:10:00.000Z'
    };

    await expect(storage.saveAction(actionWithoutProfile)).rejects.toThrow(
      /Failed to append actions to Supabase: new row violates row-level security policy.*42501/
    );
  });

  it('14. saveActions supports cross-bureau coordination action with multiple case actions in a single atomic batch', async () => {
    let capturedBatch: any[] = [];
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockImplementation((batch: any[]) => {
          capturedBatch = batch;
          return Promise.resolve({ data: batch, error: null });
        })
      })
    };

    vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockSupabase as any);

    const storage = new SupabaseStorageService();
    const coordActions: CaseAction[] = [
      {
        actionId: 'ACT-COORD-4001',
        caseId: 'AICTE-RB-2026-0041',
        actionType: 'INTER_BUREAU_COORDINATED',
        remarks: 'Cross-bureau coordination established between RB and PGRC.',
        bureau: 'RB',
        officer: 'Director RB',
        timestamp: '2026-10-22T12:15:00.000Z'
      },
      {
        actionId: 'ACT-COORD-4002',
        caseId: 'AICTE-PGRC-2026-0089',
        actionType: 'INTER_BUREAU_COORDINATED',
        remarks: 'Cross-bureau coordination linked with AICTE-RB-2026-0041.',
        bureau: 'RB',
        officer: 'Director RB',
        timestamp: '2026-10-22T12:15:00.000Z'
      }
    ];

    await expect(storage.saveActions(coordActions)).resolves.not.toThrow();
    expect(capturedBatch.length).toBe(2);
    expect(capturedBatch[0].case_id).toBe('AICTE-RB-2026-0041');
    expect(capturedBatch[1].case_id).toBe('AICTE-PGRC-2026-0089');
    expect(capturedBatch[0].action_type).toBe('INTER_BUREAU_COORDINATED');
    expect(capturedBatch[1].action_type).toBe('INTER_BUREAU_COORDINATED');
  });
});
