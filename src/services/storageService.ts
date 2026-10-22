import { Institution, CaseRecord, CaseAction, OverlapAlert } from '../types';
import { SEED_INSTITUTIONS, SEED_CASES, SEED_ACTIONS } from '../data/syntheticSeed';
import { detectCrossBureauOverlaps } from '../engine/overlapDetector';

const STORAGE_KEYS = {
  INSTITUTIONS: 'casewatch_institutions_v1',
  CASES: 'casewatch_cases_v1',
  ACTIONS: 'casewatch_actions_v1',
  ALERTS: 'casewatch_alerts_v1',
  DEMO_MODE: 'casewatch_demo_mode_v1'
};

export interface AppStorageData {
  institutions: Institution[];
  cases: CaseRecord[];
  actions: CaseAction[];
  alerts: OverlapAlert[];
  isDemoMode: boolean;
}

export function loadInitialData(): AppStorageData {
  try {
    const rawInst = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    const rawCases = localStorage.getItem(STORAGE_KEYS.CASES);
    const rawActions = localStorage.getItem(STORAGE_KEYS.ACTIONS);
    const rawAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);

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
        isDemoMode: true
      };
    }
  } catch (err) {
    console.warn('Could not read from localStorage, using fresh seed data:', err);
  }

  // Fallback to fresh seed data
  const institutions = [...SEED_INSTITUTIONS];
  const cases = [...SEED_CASES];
  const actions = [...SEED_ACTIONS];
  const alerts = detectCrossBureauOverlaps(cases, institutions);

  saveDataToStorage(institutions, cases, actions, alerts);

  return {
    institutions,
    cases,
    actions,
    alerts,
    isDemoMode: true
  };
}

export function saveDataToStorage(
  institutions: Institution[],
  cases: CaseRecord[],
  actions: CaseAction[],
  alerts: OverlapAlert[]
): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
}

export function resetStorage(): AppStorageData {
  try {
    localStorage.removeItem(STORAGE_KEYS.INSTITUTIONS);
    localStorage.removeItem(STORAGE_KEYS.CASES);
    localStorage.removeItem(STORAGE_KEYS.ACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
  } catch (e) {
    console.error(e);
  }
  return loadInitialData();
}

/**
 * Optional Firebase status detector:
 * Checks whether Firebase credentials are present in Vite env.
 */
export function isFirebaseConfigured(): boolean {
  const env = import.meta.env;
  return Boolean(
    env.VITE_FIREBASE_API_KEY &&
    env.VITE_FIREBASE_PROJECT_ID &&
    env.VITE_FIREBASE_API_KEY !== 'placeholder_api_key'
  );
}
