import { Institution, CaseRecord, CaseAction, OverlapAlert } from '../../types';

export type StorageMode = 'local' | 'supabase';

export interface AppStorageData {
  institutions: Institution[];
  cases: CaseRecord[];
  actions: CaseAction[];
  alerts: OverlapAlert[];
  isDemoMode: boolean;
  storageMode: StorageMode;
}

export interface IStorageService {
  readonly mode: StorageMode;
  isConfigured(): boolean;
  loadInitialData(): Promise<AppStorageData>;
  saveCase(record: CaseRecord): Promise<void>;
  updateCase(caseId: string, updates: Partial<CaseRecord>): Promise<void>;
  saveAction(action: CaseAction): Promise<void>;
  saveActions(actions: CaseAction[]): Promise<void>;
  saveAlert(alert: OverlapAlert): Promise<void>;
  saveAlerts(alerts: OverlapAlert[]): Promise<void>;
  resetStorage(): Promise<AppStorageData>;
  linkCases?(caseId1: string, caseId2: string, remarks: string, officer: string): Promise<{ usedRpc: boolean }>;
  mergeCases?(primaryCaseId: string, childCaseId: string, mergeReason: string, officer: string): Promise<{ usedRpc: boolean }>;
  unmergeCase?(childCaseId: string, reason: string, officer: string): Promise<{ usedRpc: boolean }>;
}
