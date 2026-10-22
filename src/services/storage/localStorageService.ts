import { Institution, CaseRecord, CaseAction, OverlapAlert } from '../../types';
import { SEED_INSTITUTIONS, SEED_CASES, SEED_ACTIONS } from '../../data/syntheticSeed';
import { detectCrossBureauOverlaps } from '../../engine/overlapDetector';
import { IStorageService, AppStorageData, StorageMode } from './types';

export const LOCAL_STORAGE_KEYS = {
  INSTITUTIONS: 'casewatch_institutions_v1',
  CASES: 'casewatch_cases_v1',
  ACTIONS: 'casewatch_actions_v1',
  ALERTS: 'casewatch_alerts_v1',
  DEMO_MODE: 'casewatch_demo_mode_v1'
};

export class LocalStorageService implements IStorageService {
  readonly mode: StorageMode = 'local';

  isConfigured(): boolean {
    return true; // Always operational as local fallback
  }

  async loadInitialData(): Promise<AppStorageData> {
    try {
      if (typeof localStorage !== 'undefined') {
        const rawInst = localStorage.getItem(LOCAL_STORAGE_KEYS.INSTITUTIONS);
        const rawCases = localStorage.getItem(LOCAL_STORAGE_KEYS.CASES);
        const rawActions = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIONS);
        const rawAlerts = localStorage.getItem(LOCAL_STORAGE_KEYS.ALERTS);

        if (rawInst && rawCases && rawActions) {
          const institutions = JSON.parse(rawInst) as Institution[];
          const cases = JSON.parse(rawCases) as CaseRecord[];
          const actions = JSON.parse(rawActions) as CaseAction[];
          const existingAlerts = rawAlerts ? (JSON.parse(rawAlerts) as OverlapAlert[]) : [];

          // Re-run overlap detector to ensure alerts are up-to-date while preserving review remarks
          const alerts = detectCrossBureauOverlaps(cases, institutions, { existingAlerts });

          return {
            institutions,
            cases,
            actions,
            alerts,
            isDemoMode: true,
            storageMode: 'local'
          };
        }
      }
    } catch (err) {
      console.warn('Could not read from localStorage, using fresh seed data:', err);
    }

    // Fallback to fresh seed data
    const institutions = [...SEED_INSTITUTIONS];
    const cases = [...SEED_CASES];
    const actions = [...SEED_ACTIONS];
    const alerts = detectCrossBureauOverlaps(cases, institutions);

    await this.persistAll(institutions, cases, actions, alerts);

    return {
      institutions,
      cases,
      actions,
      alerts,
      isDemoMode: true,
      storageMode: 'local'
    };
  }

  private async persistAll(
    institutions: Institution[],
    cases: CaseRecord[],
    actions: CaseAction[],
    alerts: OverlapAlert[]
  ): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
      localStorage.setItem(LOCAL_STORAGE_KEYS.CASES, JSON.stringify(cases));
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
      localStorage.setItem(LOCAL_STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (err) {
      console.error('Failed to save data to localStorage:', err);
    }
  }

  async saveCase(record: CaseRecord): Promise<void> {
    const data = await this.loadInitialData();
    const existingIndex = data.cases.findIndex(c => c.caseId === record.caseId);
    let updatedCases: CaseRecord[];
    if (existingIndex >= 0) {
      updatedCases = [...data.cases];
      updatedCases[existingIndex] = record;
    } else {
      updatedCases = [record, ...data.cases];
    }
    const updatedAlerts = detectCrossBureauOverlaps(updatedCases, data.institutions, { existingAlerts: data.alerts });
    await this.persistAll(data.institutions, updatedCases, data.actions, updatedAlerts);
  }

  async updateCase(caseId: string, updates: Partial<CaseRecord>): Promise<void> {
    const data = await this.loadInitialData();
    const updatedCases = data.cases.map(c => c.caseId === caseId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
    const updatedAlerts = detectCrossBureauOverlaps(updatedCases, data.institutions, { existingAlerts: data.alerts });
    await this.persistAll(data.institutions, updatedCases, data.actions, updatedAlerts);
  }

  async saveAction(action: CaseAction): Promise<void> {
    const data = await this.loadInitialData();
    const updatedActions = [action, ...data.actions];
    await this.persistAll(data.institutions, data.cases, updatedActions, data.alerts);
  }

  async saveActions(newActions: CaseAction[]): Promise<void> {
    const data = await this.loadInitialData();
    const updatedActions = [...newActions, ...data.actions];
    await this.persistAll(data.institutions, data.cases, updatedActions, data.alerts);
  }

  async saveAlert(alert: OverlapAlert): Promise<void> {
    const data = await this.loadInitialData();
    const updatedAlerts = data.alerts.map(a => a.alertId === alert.alertId ? alert : a);
    if (!updatedAlerts.some(a => a.alertId === alert.alertId)) {
      updatedAlerts.push(alert);
    }
    await this.persistAll(data.institutions, data.cases, data.actions, updatedAlerts);
  }

  async saveAlerts(alerts: OverlapAlert[]): Promise<void> {
    const data = await this.loadInitialData();
    await this.persistAll(data.institutions, data.cases, data.actions, alerts);
  }

  async resetStorage(): Promise<AppStorageData> {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.INSTITUTIONS);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CASES);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ACTIONS);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ALERTS);
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
    }
    return this.loadInitialData();
  }
}
