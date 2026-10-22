import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Institution,
  CaseRecord,
  CaseAction,
  OverlapAlert,
  FilterState,
  DashboardStats,
  CaseStatus,
  Bureau,
  ActionType,
  ReviewStatus,
  NavTab
} from '../types';
import { loadInitialData, saveDataToStorage, resetStorage, getStorageService, isSupabaseConfigured } from '../services/storageService';
import { getSupabaseClient } from '../services/supabaseClient';
import { detectCrossBureauOverlaps } from '../engine/overlapDetector';
import { calculateDeterministicUrgency, sortCasesByDeterministicUrgency } from '../engine/urgencyCalculator';
import { AuthContext } from './AuthContext';

interface CaseWatchContextType {
  institutions: Institution[];
  cases: CaseRecord[];
  actions: CaseAction[];
  alerts: OverlapAlert[];
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  selectedInstitutionId: string | null;
  setSelectedInstitutionId: (id: string | null) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  stats: DashboardStats;
  filteredCases: CaseRecord[];
  
  // Data modification actions
  addCase: (caseData: Omit<CaseRecord, 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateCaseStatus: (caseId: string, status: CaseStatus, remarks: string, officer: string, resolutionSummary?: string, officerId?: string) => Promise<{ success: boolean; error?: string }>;
  addCaseAction: (caseId: string, actionType: ActionType, remarks: string, officer: string, nextAction?: string) => Promise<{ success: boolean; error?: string }>;
  reassignBureau: (caseId: string, newBureau: Bureau, remarks: string, officer: string) => Promise<{ success: boolean; error?: string }>;
  recordEscalation: (caseId: string, remarks: string, officer: string) => Promise<{ success: boolean; error?: string }>;
  linkRelatedCases: (caseId1: string, caseId2: string, remarks: string, officer: string) => Promise<{ success: boolean; error?: string; alreadyLinked?: boolean }>;
  reopenCase: (caseId: string, reopenReason: string, officer: string) => Promise<{ success: boolean; error?: string }>;
  mergeCases: (primaryCaseId: string, childCaseId: string, mergeReason: string, officer: string) => Promise<boolean>;
  unmergeCase: (childCaseId: string, officer: string, reason: string) => Promise<boolean>;
  reviewOverlapAlert: (alertId: string, reviewStatus: ReviewStatus, remarks: string, leadBureau?: Bureau, reviewer?: string, dismissalReason?: string) => Promise<{ success: boolean; error?: string }>;
  resetToSeedData: () => void;
  isDemoMode: boolean;
  storageMode: 'supabase' | 'local';
  isLoadingCloudData: boolean;
  cloudError: string | null;
  syncCloudData: () => Promise<void>;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  bureau: 'ALL',
  region: 'ALL',
  category: 'ALL',
  status: 'ALL',
  dateRange: 'ALL'
};

const CaseWatchContext = createContext<CaseWatchContextType | undefined>(undefined);

export const CaseWatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const authUser = authContext?.user || null;
  const [initialData] = useState(() => loadInitialData());

  const [storageMode, setStorageMode] = useState<'supabase' | 'local'>(() => isSupabaseConfigured() ? 'supabase' : 'local');
  // In Supabase cloud mode, never initialize institutions with synthetic mock IDs to prevent foreign key errors.
  const [institutions, setInstitutions] = useState<Institution[]>(() => isSupabaseConfigured() ? [] : initialData.institutions);
  const [cases, setCases] = useState<CaseRecord[]>(() => isSupabaseConfigured() ? [] : initialData.cases);
  const [actions, setActions] = useState<CaseAction[]>(() => isSupabaseConfigured() ? [] : initialData.actions);
  const [alerts, setAlerts] = useState<OverlapAlert[]>(() => isSupabaseConfigured() ? [] : initialData.alerts);
  const [filters, setFilterState] = useState<FilterState>(defaultFilters);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [isLoadingCloudData, setIsLoadingCloudData] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const syncCloudData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setStorageMode('local');
      return;
    }

    setIsLoadingCloudData(true);
    setCloudError(null);
    try {
      const cloudData = await getStorageService().loadInitialData();
      if (cloudData.institutions && cloudData.institutions.length > 0) {
        setInstitutions(cloudData.institutions);
        setCases(cloudData.cases || []);
        setActions(cloudData.actions || []);
        setAlerts(cloudData.alerts || []);
        setStorageMode('supabase');
      } else {
        setCloudError('Supabase public.institutions table returned 0 rows. Cloud institutions must be seeded.');
      }
    } catch (err: any) {
      console.warn('Could not sync with Supabase cloud:', err);
      setCloudError(err?.message || 'Failed to load institutions from Supabase cloud database.');
    } finally {
      setIsLoadingCloudData(false);
    }
  }, []);

  // Sync on mount and subscribe to auth state changes so institutions re-fetch when authenticated
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    syncCloudData();

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (session && event === 'INITIAL_SESSION')) {
          syncCloudData();
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [syncCloudData]);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => prev?.text === text ? null : prev);
    }, 4000);
  }, []);

  // Save changes to localStorage whenever data changes (in local demo mode only)
  useEffect(() => {
    if (storageMode === 'local') {
      saveDataToStorage(institutions, cases, actions, alerts);
    }
  }, [institutions, cases, actions, alerts, storageMode]);

  // Recalculate overlaps whenever cases change
  const refreshOverlaps = useCallback((currentCases: CaseRecord[], currentInstitutions: Institution[], currentAlerts: OverlapAlert[]) => {
    const updatedAlerts = detectCrossBureauOverlaps(currentCases, currentInstitutions, {
      existingAlerts: currentAlerts
    });
    setAlerts(updatedAlerts);
    return updatedAlerts;
  }, []);

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilterState(defaultFilters);
  };

  // Add Case
  const addCase = async (
    caseData: Omit<CaseRecord, 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; error?: string }> => {
    const now = new Date().toISOString();
    const newRecord: CaseRecord = {
      ...caseData,
      createdAt: now,
      updatedAt: now
    };

    const actingBureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : newRecord.bureau;
    const actingOfficer = authUser?.displayName || newRecord.assignedOfficer;

    const initialAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId: newRecord.caseId,
      actionType: 'CASE_FILED',
      remarks: `Complaint registered in ${newRecord.bureau} system by ${actingOfficer}.`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now
    };

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      // 1. Await persistence of the case
      try {
        await storage.saveCase(newRecord);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to save case in Supabase database';
        showToast(`Cloud write failed: ${errorMsg}`, 'warning');
        return { success: false, error: errorMsg };
      }

      // 2. Await persistence of the initial action
      try {
        await storage.saveAction(initialAction);
      } catch (err: any) {
        // Case was persisted, but initial action failed.
        // Avoid retrying saveCase to prevent duplicates.
        const updatedCases = [newRecord, ...cases];
        setCases(updatedCases);
        refreshOverlaps(updatedCases, institutions, alerts);
        const actionErrMsg = `Case ${newRecord.caseId} registered, but initial action history could not be saved: ${err?.message || 'Unknown error'}`;
        showToast(actionErrMsg, 'warning');
        return { success: false, error: actionErrMsg };
      }
    } else {
      await storage.saveCase(newRecord);
      await storage.saveAction(initialAction);
    }

    const updatedCases = [newRecord, ...cases];
    const updatedActions = [initialAction, ...actions];
    setCases(updatedCases);
    setActions(updatedActions);

    const newAlerts = refreshOverlaps(updatedCases, institutions, alerts);
    if (isCloud && newAlerts.length > 0) {
      try {
        await storage.saveAlerts(newAlerts);
      } catch (alertErr) {
        console.warn('Could not persist updated overlap alerts to Supabase:', alertErr);
      }
    }

    const triggeredAlert = newAlerts.find(a => a.caseIds.includes(newRecord.caseId));
    if (triggeredAlert) {
      showToast(
        `Case ${newRecord.caseId} registered. WARNING: Cross-bureau overlap detected with ${triggeredAlert.institutionName}!`,
        'warning'
      );
    } else {
      showToast(`Case ${newRecord.caseId} successfully registered.`, 'success');
    }

    return { success: true };
  };

  // Update Status
  const updateCaseStatus = async (
    caseId: string,
    status: CaseStatus,
    remarks: string,
    officer: string,
    resolutionSummary?: string,
    officerId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetCase = cases.find(c => c.caseId === caseId);
    if (!targetCase) {
      return { success: false, error: `Case ${caseId} not found.` };
    }

    if (authUser && authUser.role !== 'SUPER_ADMIN' && authUser.bureau !== 'ALL' && authUser.bureau !== targetCase.bureau) {
      const errorMsg = `Jurisdiction Denied: Official (${authUser.displayName} - ${authUser.bureau}) cannot modify status of case ${caseId} under jurisdiction of ${targetCase.bureau}.`;
      showToast(errorMsg, 'warning');
      return { success: false, error: errorMsg };
    }

    const now = new Date().toISOString();
    const actingOfficer = authUser?.displayName || officer;
    const actingBureau: Bureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : targetCase.bureau;
    const oldStatus: CaseStatus = targetCase.status;
    const isDisposing = status === 'Disposed';

    const caseUpdates: Partial<CaseRecord> = {
      status,
      lastAction: isDisposing 
        ? `Disposed & Closed: ${resolutionSummary || remarks}`
        : `Status updated to ${status}. ${remarks}`,
      lastActionAt: now,
      updatedAt: now,
      ...(isDisposing ? {
        completedAt: now,
        completedBy: actingOfficer,
        completedByOfficerId: officerId,
        resolutionSummary: resolutionSummary || remarks
      } : {})
    };

    const newAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId,
      actionType: status === 'Disposed' ? 'CASE_DISPOSED' : 'REMARKS_ADDED',
      remarks: status === 'Disposed'
        ? `Case Disposed & Closed by ${actingOfficer}. Resolution: ${resolutionSummary || remarks}`
        : `Status changed to [${status}]. Remarks: ${remarks}`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now,
      previousValue: oldStatus,
      newValue: status,
      fieldChanged: 'status',
      justification: resolutionSummary || remarks
    };

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      try {
        await storage.updateCase(caseId, caseUpdates);
        await storage.saveAction(newAction);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to update case in Supabase';
        showToast(`Update failed: ${errorMsg}`, 'warning');
        return { success: false, error: errorMsg };
      }
    } else {
      await storage.updateCase(caseId, caseUpdates);
      await storage.saveAction(newAction);
    }

    const updatedCases = cases.map(c => (c.caseId === caseId ? { ...c, ...caseUpdates } : c));
    const updatedActions = [newAction, ...actions];
    setCases(updatedCases);
    setActions(updatedActions);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${caseId} status updated to ${status}.`, 'success');
    return { success: true };
  };

  // Reopen Case (P1 requirement)
  const reopenCase = async (
    caseId: string,
    reopenReason: string,
    officer: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetCase = cases.find(c => c.caseId === caseId);
    if (!targetCase) {
      return { success: false, error: `Case ${caseId} not found.` };
    }

    if (authUser && authUser.role !== 'SUPER_ADMIN' && authUser.bureau !== 'ALL' && authUser.bureau !== targetCase.bureau) {
      const errorMsg = `Jurisdiction Denied: Official (${authUser.displayName} - ${authUser.bureau}) cannot reopen case ${caseId} under jurisdiction of ${targetCase.bureau}.`;
      showToast(errorMsg, 'warning');
      return { success: false, error: errorMsg };
    }

    const now = new Date().toISOString();
    const actingOfficer = authUser?.displayName || officer;
    const actingBureau: Bureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : targetCase.bureau;

    const caseUpdates: Partial<CaseRecord> = {
      status: 'Under Process' as CaseStatus,
      reopenedAt: now,
      reopenedBy: actingOfficer,
      reopenReason,
      lastAction: `Case reopened from Disposed status. Reason: ${reopenReason}`,
      lastActionAt: now,
      updatedAt: now
    };

    const newAction: CaseAction = {
      actionId: `ACT-REOPEN-${Date.now()}`,
      caseId,
      actionType: 'CASE_REOPENED',
      remarks: `Case reopened by ${actingOfficer}. Reopen Reason: ${reopenReason}`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now,
      previousValue: 'Disposed',
      newValue: 'Under Process',
      fieldChanged: 'status',
      justification: reopenReason
    };

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      try {
        await storage.updateCase(caseId, caseUpdates);
        await storage.saveAction(newAction);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to reopen case in Supabase';
        showToast(`Reopen failed: ${errorMsg}`, 'warning');
        return { success: false, error: errorMsg };
      }
    } else {
      await storage.updateCase(caseId, caseUpdates);
      await storage.saveAction(newAction);
    }

    const updatedCases = cases.map(c => (c.caseId === caseId ? { ...c, ...caseUpdates } : c));
    const updatedActions = [newAction, ...actions];
    setCases(updatedCases);
    setActions(updatedActions);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${caseId} reopened and restored to Under Process.`, 'info');
    return { success: true };
  };

  // Merge Cases (P2 requirement)
  const mergeCases = async (
    primaryCaseId: string,
    childCaseId: string,
    mergeReason: string,
    officer: string
  ): Promise<boolean> => {
    if (primaryCaseId === childCaseId) {
      showToast('Cannot merge a case into itself.', 'warning');
      return false;
    }

    const primaryCase = cases.find(c => c.caseId === primaryCaseId);
    const childCase = cases.find(c => c.caseId === childCaseId);

    if (!primaryCase || !childCase) {
      showToast('One or both specified cases could not be found.', 'warning');
      return false;
    }

    if (childCase.isMerged) {
      showToast(`Case ${childCaseId} is already merged into ${childCase.mergedIntoCaseId}.`, 'warning');
      return false;
    }

    if (primaryCase.isMerged) {
      showToast(`Case ${primaryCaseId} is already a merged child case and cannot be a primary case.`, 'warning');
      return false;
    }

    // Circular check: childCase's merged list must not include primary
    if (childCase.mergedCaseIds?.includes(primaryCaseId)) {
      showToast('Circular merge relationship detected.', 'warning');
      return false;
    }

    const hasJurisdiction = !authUser || authUser.role === 'SUPER_ADMIN' || authUser.bureau === 'ALL' || authUser.bureau === primaryCase.bureau || authUser.bureau === childCase.bureau;
    if (!hasJurisdiction) {
      showToast(`Jurisdiction Denied: Official (${authUser.displayName} - ${authUser.bureau}) cannot merge cases outside their bureau.`, 'warning');
      return false;
    }

    const now = new Date().toISOString();
    const actingOfficer = authUser?.displayName || officer;
    const actingBureau: Bureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : childCase.bureau;

    const childUpdates: Partial<CaseRecord> = {
      isMerged: true,
      mergedIntoCaseId: primaryCaseId,
      mergedAt: now,
      mergedBy: actingOfficer,
      mergeReason,
      lastAction: `Consolidated & merged into primary complaint ${primaryCaseId}. Reason: ${mergeReason}`,
      lastActionAt: now,
      updatedAt: now,
      relatedCaseIds: Array.from(new Set([...childCase.relatedCaseIds, primaryCaseId]))
    };

    const mergedList = Array.from(new Set([...(primaryCase.mergedCaseIds || []), childCaseId]));
    const relatedList = Array.from(new Set([...primaryCase.relatedCaseIds, childCaseId]));
    const primaryUpdates: Partial<CaseRecord> = {
      mergedCaseIds: mergedList,
      relatedCaseIds: relatedList,
      lastAction: `Consolidated complaint ${childCaseId} merged into this dossier. Reason: ${mergeReason}`,
      lastActionAt: now,
      updatedAt: now
    };

    const actionChild: CaseAction = {
      actionId: `ACT-MERGE-CHILD-${Date.now()}`,
      caseId: childCaseId,
      actionType: 'CASES_MERGED',
      remarks: `Merged into primary case ${primaryCaseId} by ${actingOfficer}. Reason: ${mergeReason}`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now,
      previousValue: 'Standalone Case',
      newValue: `Merged into ${primaryCaseId}`,
      fieldChanged: 'isMerged',
      justification: mergeReason
    };

    const actionPrimary: CaseAction = {
      actionId: `ACT-MERGE-PRIM-${Date.now()}`,
      caseId: primaryCaseId,
      actionType: 'CASES_MERGED',
      remarks: `Consolidated child case ${childCaseId} merged into this dossier by ${actingOfficer}. Reason: ${mergeReason}`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now,
      previousValue: primaryCase.mergedCaseIds?.length ? `${primaryCase.mergedCaseIds.length} merged cases` : 'None',
      newValue: `${(primaryCase.mergedCaseIds || []).length + 1} merged cases (added ${childCaseId})`,
      fieldChanged: 'mergedCaseIds',
      justification: mergeReason
    };

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      try {
        await storage.updateCase(childCaseId, childUpdates);
        await storage.updateCase(primaryCaseId, primaryUpdates);
        await storage.saveActions([actionChild, actionPrimary]);
      } catch (err: any) {
        showToast(`Merge failed in database: ${err?.message || 'Unknown error'}`, 'warning');
        return false;
      }
    } else {
      await storage.updateCase(childCaseId, childUpdates);
      await storage.updateCase(primaryCaseId, primaryUpdates);
      await storage.saveActions([actionChild, actionPrimary]);
    }

    const updatedCases = cases.map(c => {
      if (c.caseId === childCaseId) return { ...c, ...childUpdates };
      if (c.caseId === primaryCaseId) return { ...c, ...primaryUpdates };
      return c;
    });

    setCases(updatedCases);
    setActions([actionChild, actionPrimary, ...actions]);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${childCaseId} successfully merged into ${primaryCaseId}.`, 'success');
    return true;
  };

  // Unmerge Case (P2 requirement)
  const unmergeCase = async (childCaseId: string, officer: string, reason: string): Promise<boolean> => {
    const childCase = cases.find(c => c.caseId === childCaseId);
    if (!childCase || !childCase.isMerged || !childCase.mergedIntoCaseId) {
      showToast('Case is not currently merged.', 'warning');
      return false;
    }

    const primaryCaseId = childCase.mergedIntoCaseId;
    const primaryCase = cases.find(c => c.caseId === primaryCaseId);

    const hasJurisdiction = !authUser || authUser.role === 'SUPER_ADMIN' || authUser.bureau === 'ALL' || authUser.bureau === childCase.bureau || (primaryCase && authUser.bureau === primaryCase.bureau);
    if (!hasJurisdiction) {
      showToast(`Jurisdiction Denied: Official (${authUser.displayName} - ${authUser.bureau}) cannot unmerge cases outside their bureau.`, 'warning');
      return false;
    }

    const now = new Date().toISOString();
    const actingOfficer = authUser?.displayName || officer;
    const actingBureau: Bureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : childCase.bureau;

    const childUpdates: Partial<CaseRecord> = {
      isMerged: false,
      mergedIntoCaseId: undefined,
      mergedAt: undefined,
      mergedBy: undefined,
      mergeReason: undefined,
      lastAction: `Separated / unmerged from primary complaint ${primaryCaseId}. Reason: ${reason}`,
      lastActionAt: now,
      updatedAt: now
    };

    const primaryUpdates: Partial<CaseRecord> = primaryCase ? {
      mergedCaseIds: (primaryCase.mergedCaseIds || []).filter(id => id !== childCaseId),
      lastAction: `Child complaint ${childCaseId} unmerged from this case. Reason: ${reason}`,
      lastActionAt: now,
      updatedAt: now
    } : { updatedAt: now };

    const actionChild: CaseAction = {
      actionId: `ACT-UNMERGE-${Date.now()}`,
      caseId: childCaseId,
      actionType: 'CASE_UNMERGED',
      remarks: `Unmerged from ${primaryCaseId} by ${actingOfficer}. Reason: ${reason}`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now,
      previousValue: `Merged into ${primaryCaseId}`,
      newValue: 'Standalone Case',
      fieldChanged: 'isMerged',
      justification: reason
    };

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      try {
        await storage.updateCase(childCaseId, childUpdates);
        if (primaryCase) {
          await storage.updateCase(primaryCaseId, primaryUpdates);
        }
        await storage.saveAction(actionChild);
      } catch (err: any) {
        showToast(`Unmerge failed in database: ${err?.message || 'Unknown error'}`, 'warning');
        return false;
      }
    } else {
      await storage.updateCase(childCaseId, childUpdates);
      if (primaryCase) {
        await storage.updateCase(primaryCaseId, primaryUpdates);
      }
      await storage.saveAction(actionChild);
    }

    const updatedCases = cases.map(c => {
      if (c.caseId === childCaseId) {
        const { isMerged, mergedIntoCaseId, mergedAt, mergedBy, mergeReason, ...rest } = c;
        return {
          ...rest,
          isMerged: false,
          lastAction: `Separated / unmerged from primary complaint ${primaryCaseId}. Reason: ${reason}`,
          lastActionAt: now,
          updatedAt: now
        };
      }
      if (c.caseId === primaryCaseId && primaryCase) {
        return {
          ...c,
          mergedCaseIds: (c.mergedCaseIds || []).filter(id => id !== childCaseId),
          lastAction: `Child complaint ${childCaseId} unmerged from this case. Reason: ${reason}`,
          lastActionAt: now,
          updatedAt: now
        };
      }
      return c;
    });

    setCases(updatedCases);
    setActions([actionChild, ...actions]);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${childCaseId} unmerged successfully.`, 'info');
    return true;
  };

  // Add Action
  const addCaseAction = async (
    caseId: string,
    actionType: ActionType,
    remarks: string,
    officer: string,
    nextAction?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetCase = cases.find(c => c.caseId === caseId);
    if (!targetCase) {
      return { success: false, error: `Case ${caseId} not found.` };
    }

    const isCoordinationAction = actionType === 'INTER_BUREAU_COORDINATED';
    if (!isCoordinationAction && authUser && authUser.role !== 'SUPER_ADMIN' && authUser.bureau !== 'ALL' && authUser.bureau !== targetCase.bureau) {
      const errorMsg = `Jurisdiction Denied: Official (${authUser.displayName} - ${authUser.bureau}) cannot record action on case ${caseId} under jurisdiction of ${targetCase.bureau}.`;
      showToast(errorMsg, 'warning');
      return { success: false, error: errorMsg };
    }

    const now = new Date().toISOString();
    const actingOfficer = authUser?.displayName || officer;
    const actingBureau: Bureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : targetCase.bureau;

    const caseUpdates: Partial<CaseRecord> = {
      lastAction: remarks,
      nextAction: nextAction || targetCase.nextAction,
      lastActionAt: now,
      updatedAt: now
    };

    const newAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId,
      actionType,
      remarks,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now
    };

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      try {
        await storage.updateCase(caseId, caseUpdates);
        await storage.saveAction(newAction);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to record action in database';
        showToast(`Action failed: ${errorMsg}`, 'warning');
        return { success: false, error: errorMsg };
      }
    } else {
      await storage.updateCase(caseId, caseUpdates);
      await storage.saveAction(newAction);
    }

    const updatedCases = cases.map(c => (c.caseId === caseId ? { ...c, ...caseUpdates } : c));
    setCases(updatedCases);
    setActions([newAction, ...actions]);
    showToast(`Action recorded on Case ${caseId}.`, 'success');
    return { success: true };
  };

  // Reassign Bureau
  const reassignBureau = async (
    caseId: string,
    newBureau: Bureau,
    remarks: string,
    officer: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetCase = cases.find(c => c.caseId === caseId);
    if (!targetCase) {
      return { success: false, error: `Case ${caseId} not found.` };
    }

    if (authUser && authUser.role !== 'SUPER_ADMIN' && authUser.bureau !== 'ALL' && authUser.bureau !== targetCase.bureau) {
      const errorMsg = `Jurisdiction Denied: Official (${authUser.displayName} - ${authUser.bureau}) cannot reassign case ${caseId} under jurisdiction of ${targetCase.bureau}.`;
      showToast(errorMsg, 'warning');
      return { success: false, error: errorMsg };
    }

    const now = new Date().toISOString();
    const actingOfficer = authUser?.displayName || officer;
    const actingBureau: Bureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : newBureau;
    const oldBureau: Bureau = targetCase.bureau;

    const caseUpdates: Partial<CaseRecord> = {
      bureau: newBureau,
      status: 'Transferred' as CaseStatus,
      lastAction: `Jurisdiction transferred from ${oldBureau} to ${newBureau}. ${remarks}`,
      lastActionAt: now,
      updatedAt: now
    };

    const newAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId,
      actionType: 'BUREAU_REASSIGNED',
      remarks: `Transferred from ${oldBureau} to ${newBureau}. Remarks: ${remarks}`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now,
      previousValue: oldBureau,
      newValue: newBureau,
      fieldChanged: 'bureau',
      justification: remarks
    };

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      try {
        await storage.updateCase(caseId, caseUpdates);
        await storage.saveAction(newAction);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to reassign bureau in database';
        showToast(`Transfer failed: ${errorMsg}`, 'warning');
        return { success: false, error: errorMsg };
      }
    } else {
      await storage.updateCase(caseId, caseUpdates);
      await storage.saveAction(newAction);
    }

    const updatedCases = cases.map(c => (c.caseId === caseId ? { ...c, ...caseUpdates } : c));
    setCases(updatedCases);
    setActions([newAction, ...actions]);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${caseId} transferred to ${newBureau}.`, 'info');
    return { success: true };
  };

  // Record Escalation
  const recordEscalation = async (
    caseId: string,
    remarks: string,
    officer: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetCase = cases.find(c => c.caseId === caseId);
    if (!targetCase) {
      return { success: false, error: `Case ${caseId} not found.` };
    }

    if (authUser && authUser.role !== 'SUPER_ADMIN' && authUser.bureau !== 'ALL' && authUser.bureau !== targetCase.bureau) {
      const errorMsg = `Jurisdiction Denied: Official (${authUser.displayName} - ${authUser.bureau}) cannot escalate case ${caseId} under jurisdiction of ${targetCase.bureau}.`;
      showToast(errorMsg, 'warning');
      return { success: false, error: errorMsg };
    }

    const now = new Date().toISOString();
    const actingOfficer = authUser?.displayName || officer;
    const actingBureau: Bureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : targetCase.bureau;
    const oldPriority = targetCase.priority;

    const caseUpdates: Partial<CaseRecord> = {
      status: 'Escalated' as CaseStatus,
      priority: 'CRITICAL' as const,
      lastAction: `Case escalated for high-level regulatory intervention. ${remarks}`,
      lastActionAt: now,
      updatedAt: now
    };

    const newAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId,
      actionType: 'CASE_ESCALATED',
      remarks: `Escalated to Higher Authority. Remarks: ${remarks}`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now,
      previousValue: oldPriority,
      newValue: 'CRITICAL',
      fieldChanged: 'priority',
      justification: remarks
    };

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      try {
        await storage.updateCase(caseId, caseUpdates);
        await storage.saveAction(newAction);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to record escalation in database';
        showToast(`Escalation failed: ${errorMsg}`, 'warning');
        return { success: false, error: errorMsg };
      }
    } else {
      await storage.updateCase(caseId, caseUpdates);
      await storage.saveAction(newAction);
    }

    const updatedCases = cases.map(c => (c.caseId === caseId ? { ...c, ...caseUpdates } : c));
    setCases(updatedCases);
    setActions([newAction, ...actions]);
    showToast(`Case ${caseId} escalated to higher regulatory authority.`, 'warning');
    return { success: true };
  };

  // Link Related Cases
  const linkRelatedCases = async (
    caseId1: string,
    caseId2: string,
    remarks: string,
    officer: string
  ): Promise<{ success: boolean; error?: string; alreadyLinked?: boolean }> => {
    const case1 = cases.find(c => c.caseId === caseId1);
    const case2 = cases.find(c => c.caseId === caseId2);
    if (!case1 || !case2) {
      return { success: false, error: 'One or both cases not found.' };
    }

    if (caseId1 === caseId2) {
      return { success: false, error: 'Cannot link a case to itself.' };
    }

    // Check if already bidirectionally linked
    const alreadyLinked1 = case1.relatedCaseIds?.includes(caseId2);
    const alreadyLinked2 = case2.relatedCaseIds?.includes(caseId1);

    if (alreadyLinked1 && alreadyLinked2) {
      return { success: true, alreadyLinked: true };
    }

    const now = new Date().toISOString();
    const related1 = Array.from(new Set([...(case1.relatedCaseIds || []), caseId2]));
    const related2 = Array.from(new Set([...(case2.relatedCaseIds || []), caseId1]));

    const actingOfficer = authUser?.displayName || officer;
    const actingBureau: Bureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : case1.bureau;

    const newAction1: CaseAction = {
      actionId: `ACT-${Date.now()}-1`,
      caseId: caseId1,
      actionType: 'INTER_BUREAU_COORDINATED',
      remarks: `Linked with cross-reference case ${caseId2}. Remarks: ${remarks}`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now
    };

    const newAction2: CaseAction = {
      actionId: `ACT-${Date.now()}-2`,
      caseId: caseId2,
      actionType: 'INTER_BUREAU_COORDINATED',
      remarks: `Linked with cross-reference case ${caseId1}. Remarks: ${remarks}`,
      bureau: actingBureau,
      officer: actingOfficer,
      timestamp: now
    };

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      try {
        await storage.updateCase(caseId1, { relatedCaseIds: related1, updatedAt: now });
        await storage.updateCase(caseId2, { relatedCaseIds: related2, updatedAt: now });
        await storage.saveActions([newAction1, newAction2]);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to cross-link cases in database';
        showToast(`Cross-link failed: ${errorMsg}`, 'warning');
        return { success: false, error: errorMsg };
      }
    } else {
      await storage.updateCase(caseId1, { relatedCaseIds: related1, updatedAt: now });
      await storage.updateCase(caseId2, { relatedCaseIds: related2, updatedAt: now });
      await storage.saveActions([newAction1, newAction2]);
    }

    const updatedCases = cases.map(c => {
      if (c.caseId === caseId1) return { ...c, relatedCaseIds: related1, updatedAt: now };
      if (c.caseId === caseId2) return { ...c, relatedCaseIds: related2, updatedAt: now };
      return c;
    });

    setCases(updatedCases);
    setActions([newAction1, newAction2, ...actions]);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Cases ${caseId1} and ${caseId2} cross-linked.`, 'success');
    return { success: true };
  };

  // Review Overlap Alert
  const reviewOverlapAlert = async (
    alertId: string,
    reviewStatus: ReviewStatus,
    remarks: string,
    leadBureau?: Bureau,
    reviewer: string = 'Redressal Coordinator',
    dismissalReason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetAlert = alerts.find(a => a.alertId === alertId);
    if (!targetAlert) {
      return { success: false, error: `Alert ${alertId} not found.` };
    }

    const now = new Date().toISOString();
    const actingReviewer = authUser?.displayName || reviewer;
    const actingBureau: Bureau = (authUser?.bureau && authUser.bureau !== 'ALL') ? authUser.bureau : (leadBureau || 'RB');

    const updatedAlert: OverlapAlert = {
      ...targetAlert,
      reviewStatus,
      coordinationRemarks: remarks,
      leadBureau,
      reviewedBy: actingReviewer,
      reviewedAt: now,
      dismissalReason: reviewStatus === 'DISMISSED' ? (dismissalReason || remarks) : undefined
    };

    const coordActions: CaseAction[] = targetAlert.caseIds.map((cid, idx) => ({
      actionId: `ACT-COORD-${Date.now()}-${idx}`,
      caseId: cid,
      actionType: 'INTER_BUREAU_COORDINATED',
      remarks: reviewStatus === 'DISMISSED'
        ? `[Overlap Review Decision]: Dismissed as false positive / distinct matters.${dismissalReason ? ` Reason: ${dismissalReason}.` : ''} Remarks: ${remarks}`
        : `[Overlap Coordination Decision]: Marked as ${reviewStatus}. Lead: ${leadBureau || 'Joint'}. Remarks: ${remarks}`,
      bureau: actingBureau,
      officer: actingReviewer,
      timestamp: now
    }));

    const storage = getStorageService();
    const isCloud = storage.mode === 'supabase' && isSupabaseConfigured();

    if (isCloud) {
      try {
        await storage.saveAlert(updatedAlert);
        if (coordActions.length > 0) {
          await storage.saveActions(coordActions);
        }
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to save alert review in database';
        showToast(`Coordination failed: ${errorMsg}`, 'warning');
        return { success: false, error: errorMsg };
      }
    } else {
      await storage.saveAlert(updatedAlert);
      if (coordActions.length > 0) {
        await storage.saveActions(coordActions);
      }
    }

    const updatedAlerts = alerts.map(a => (a.alertId === alertId ? updatedAlert : a));
    setAlerts(updatedAlerts);
    if (coordActions.length > 0) {
      setActions(prev => [...coordActions, ...prev]);
    }
    showToast(
      reviewStatus === 'DISMISSED'
        ? 'Overlap alert dismissed. False-positive record saved.'
        : 'Overlap alert reviewed. Coordination remarks recorded.',
      'success'
    );
    return { success: true };
  };

  // Reset Data to Clean Seed State
  const resetToSeedData = () => {
    const freshData = resetStorage();
    setInstitutions(freshData.institutions);
    setCases(freshData.cases);
    setActions(freshData.actions);
    setAlerts(freshData.alerts);
    setFilterState(defaultFilters);
    setSelectedCaseId(null);
    setSelectedInstitutionId(null);
    showToast('Demo data reset to clean initial seed dataset.', 'info');
  };

  // Calculate Dashboard Stats dynamically from current data
  const stats: DashboardStats = useMemo(() => {
    const total = cases.length;
    const activeCases = cases.filter(c => c.status !== 'Disposed');
    const totalActive = activeCases.length;
    const pending = cases.filter(c => c.status === 'Pending').length;
    const underProcess = cases.filter(c => c.status === 'Under Process').length;
    const disposed = cases.filter(c => c.status === 'Disposed').length;
    const transferredEscalated = cases.filter(c => c.status === 'Transferred' || c.status === 'Escalated').length;

    const nowMs = Date.now();
    const activeOverlapCaseIds = new Set(
      alerts.filter(a => a.reviewStatus === 'PENDING_REVIEW').flatMap(a => a.caseIds)
    );

    let overdueCount = 0;
    let dueWithin24HoursCount = 0;
    let highCriticalActiveCount = 0;
    let overdueHighPriorityOverlap = 0;

    for (const c of activeCases) {
      const urgency = calculateDeterministicUrgency(c, activeOverlapCaseIds);
      if (urgency.isOverdue) {
        overdueCount++;
      } else if (urgency.isDueWithin24h) {
        dueWithin24HoursCount++;
      }

      const isHighOrCritical = c.priority === 'CRITICAL' || c.priority === 'HIGH';
      if (isHighOrCritical) {
        highCriticalActiveCount++;
      }

      if (urgency.isOverdue && isHighOrCritical) {
        overdueHighPriorityOverlap++;
      }
    }

    // Bureau-wise workload distribution
    const bureaus: Bureau[] = ['RB', 'PGRC', 'AB', 'Finance', 'Vigilance'];
    const bureauWorkload: Record<string, { total: number; active: number; overdue: number; highPriority: number }> = {};
    for (const b of bureaus) {
      const bCases = cases.filter(c => c.bureau === b);
      const bActive = bCases.filter(c => c.status !== 'Disposed');
      let bOverdue = 0;
      let bHighPri = 0;
      for (const bc of bActive) {
        const u = calculateDeterministicUrgency(bc, activeOverlapCaseIds);
        if (u.isOverdue) bOverdue++;
        if (bc.priority === 'CRITICAL' || bc.priority === 'HIGH') bHighPri++;
      }
      bureauWorkload[b] = {
        total: bCases.length,
        active: bActive.length,
        overdue: bOverdue,
        highPriority: bHighPri
      };
    }

    const potential = alerts.length;
    const unresolved = alerts.filter(a => a.reviewStatus === 'PENDING_REVIEW').length;
    const rate = total > 0 ? Math.round((disposed / total) * 100) : 0;

    // Completed in last 14 days based strictly on completion timestamp
    const fourteenDaysAgoMs = nowMs - 14 * 24 * 60 * 60 * 1000;
    const completedLast14Days = cases.filter(c => {
      if (c.status !== 'Disposed' || !c.completedAt) return false;
      return new Date(c.completedAt).getTime() >= fourteenDaysAgoMs;
    }).length;

    // Merged cases count (cases that are merged into another or have children merged into them)
    const mergedCasesCount = cases.filter(c => c.isMerged || (c.mergedCaseIds && c.mergedCaseIds.length > 0)).length;

    return {
      totalComplaints: total,
      totalActiveComplaints: totalActive,
      pendingCases: pending,
      underProcessCases: underProcess,
      disposedCases: disposed,
      resolvedComplaints: disposed,
      transferredEscalatedCases: transferredEscalated,
      overdueCases: overdueCount,
      dueWithin24Hours: dueWithin24HoursCount,
      highCriticalActive: highCriticalActiveCount,
      overdueHighPriorityOverlap,
      bureauWorkload,
      potentialOverlaps: potential,
      unresolvedOverlaps: unresolved,
      disposalRate: rate,
      completedLast14Days,
      mergedCasesCount
    };
  }, [cases, alerts]);

  // Filtered cases for registry and export - prioritized by deterministic urgency hierarchy
  const filteredCases = useMemo(() => {
    const now = new Date().getTime();

    // Institution map for region lookup
    const instRegionMap = new Map<string, string>();
    for (const inst of institutions) {
      instRegionMap.set(inst.institutionId, inst.region);
    }

    const matched = cases.filter(c => {
      // Search query (case ID, institution name, institution ID, description)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesId = c.caseId.toLowerCase().includes(q);
        const matchesInstId = c.institutionId.toLowerCase().includes(q);
        const matchesInstName = (c.institutionName || '').toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        const matchesOfficer = c.assignedOfficer.toLowerCase().includes(q);
        const matchesCompletedBy = (c.completedBy || '').toLowerCase().includes(q);
        if (!matchesId && !matchesInstId && !matchesInstName && !matchesDesc && !matchesOfficer && !matchesCompletedBy) {
          return false;
        }
      }

      // Bureau filter
      if (filters.bureau !== 'ALL' && c.bureau !== filters.bureau) {
        return false;
      }

      // Status filter
      if (filters.status !== 'ALL' && c.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category !== 'ALL' && c.category !== filters.category) {
        return false;
      }

      // Region filter
      if (filters.region !== 'ALL') {
        const region = instRegionMap.get(c.institutionId);
        if (region !== filters.region) {
          return false;
        }
      }

      // Date range / SLA filter
      if (filters.dateRange === 'OVERDUE') {
        if (c.status === 'Disposed' || new Date(c.expectedDisposalDate).getTime() >= now) {
          return false;
        }
      } else if (filters.dateRange === 'COMPLETED_14_DAYS') {
        // Strict requirement: filter by completion timestamp, not received/created time
        if (c.status !== 'Disposed' || !c.completedAt) return false;
        const compMs = new Date(c.completedAt).getTime();
        const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
        if (compMs < fourteenDaysAgo) return false;
      } else if (filters.dateRange === '7_DAYS') {
        const recMs = new Date(c.receivedAt).getTime();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        if (recMs < sevenDaysAgo) return false;
      } else if (filters.dateRange === '30_DAYS') {
        const recMs = new Date(c.receivedAt).getTime();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        if (recMs < thirtyDaysAgo) return false;
      } else if (filters.dateRange === '90_DAYS') {
        const recMs = new Date(c.receivedAt).getTime();
        const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
        if (recMs < ninetyDaysAgo) return false;
      }

      return true;
    });

    const activeOverlapCaseIds = new Set(
      alerts.filter(a => a.reviewStatus === 'PENDING_REVIEW').flatMap(a => a.caseIds)
    );

    return sortCasesByDeterministicUrgency(matched, activeOverlapCaseIds);
  }, [cases, institutions, alerts, filters]);

  return (
    <CaseWatchContext.Provider
      value={{
        institutions,
        cases,
        actions,
        alerts,
        filters,
        setFilters,
        resetFilters,
        selectedCaseId,
        setSelectedCaseId,
        selectedInstitutionId,
        setSelectedInstitutionId,
        activeTab,
        setActiveTab,
        stats,
        filteredCases,
        addCase,
        updateCaseStatus,
        addCaseAction,
        reassignBureau,
        recordEscalation,
        linkRelatedCases,
        reopenCase,
        mergeCases,
        unmergeCase,
        reviewOverlapAlert,
        resetToSeedData,
        isDemoMode: storageMode === 'local',
        storageMode,
        isLoadingCloudData,
        cloudError,
        syncCloudData,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CaseWatchContext.Provider>
  );
};

export const useCaseWatch = () => {
  const context = useContext(CaseWatchContext);
  if (!context) {
    throw new Error('useCaseWatch must be used within a CaseWatchProvider');
  }
  return context;
};
