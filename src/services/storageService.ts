import { Institution, CaseRecord, CaseAction, OverlapAlert } from '../types';
import { SEED_INSTITUTIONS, SEED_CASES, SEED_ACTIONS } from '../data/syntheticSeed';
import { detectCrossBureauOverlaps } from '../engine/overlapDetector';
import { getStorageService, AppStorageData, LOCAL_STORAGE_KEYS } from './storage';
import { isSupabaseConfigured as checkSupabase } from './supabaseClient';

export * from './storage';

export { checkSupabase as isSupabaseConfigured };

export function loadInitialData(): AppStorageData {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const rawInst = localStorage.getItem(LOCAL_STORAGE_KEYS.INSTITUTIONS);
      const rawCases = localStorage.getItem(LOCAL_STORAGE_KEYS.CASES);
      const rawActions = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIONS);
      const rawAlerts = localStorage.getItem(LOCAL_STORAGE_KEYS.ALERTS);

      if (rawInst && rawCases && rawActions) {
        const institutions = JSON.parse(rawInst) as Institution[];
        const cases = JSON.parse(rawCases) as CaseRecord[];
        const actions = JSON.parse(rawActions) as CaseAction[];
        const existingAlerts = rawAlerts ? (JSON.parse(rawAlerts) as OverlapAlert[]) : [];

        const alerts = detectCrossBureauOverlaps(cases, institutions, { existingAlerts });

        return {
          institutions,
          cases,
          actions,
          alerts,
          isDemoMode: !checkSupabase(),
          storageMode: checkSupabase() ? 'supabase' : 'local'
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

  saveDataToStorage(institutions, cases, actions, alerts);

  return {
    institutions,
    cases,
    actions,
    alerts,
    isDemoMode: true,
    storageMode: 'local'
  };
}

export function saveDataToStorage(
  institutions: Institution[],
  cases: CaseRecord[],
  actions: CaseAction[],
  alerts: OverlapAlert[]
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
    localStorage.setItem(LOCAL_STORAGE_KEYS.CASES, JSON.stringify(cases));
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    localStorage.setItem(LOCAL_STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
}

export function resetStorage(): AppStorageData {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.INSTITUTIONS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CASES);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACTIONS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ALERTS);
    } catch (e) {
      console.error(e);
    }
  }
  return loadInitialData();
}

/**
 * Optional Firebase status detector:
 * Checks whether Firebase credentials are present in Vite env.
 */
export function isFirebaseConfigured(): boolean {
  if (typeof import.meta === 'undefined' || !import.meta.env) return false;
  const env = import.meta.env;
  return Boolean(
    env.VITE_FIREBASE_API_KEY &&
    env.VITE_FIREBASE_PROJECT_ID &&
    env.VITE_FIREBASE_API_KEY !== 'placeholder_api_key'
  );
}
