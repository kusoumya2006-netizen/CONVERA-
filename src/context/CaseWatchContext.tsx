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
import { loadInitialData, saveDataToStorage, resetStorage } from '../services/storageService';
import { detectCrossBureauOverlaps } from '../engine/overlapDetector';

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
  addCase: (caseData: Omit<CaseRecord, 'createdAt' | 'updatedAt'>) => void;
  updateCaseStatus: (caseId: string, status: CaseStatus, remarks: string, officer: string, resolutionSummary?: string, officerId?: string) => void;
  addCaseAction: (caseId: string, actionType: ActionType, remarks: string, officer: string, nextAction?: string) => void;
  reassignBureau: (caseId: string, newBureau: Bureau, remarks: string, officer: string) => void;
  recordEscalation: (caseId: string, remarks: string, officer: string) => void;
  linkRelatedCases: (caseId1: string, caseId2: string, remarks: string, officer: string) => void;
  reopenCase: (caseId: string, reopenReason: string, officer: string) => void;
  mergeCases: (primaryCaseId: string, childCaseId: string, mergeReason: string, officer: string) => boolean;
  unmergeCase: (childCaseId: string, officer: string, reason: string) => boolean;
  reviewOverlapAlert: (alertId: string, reviewStatus: ReviewStatus, remarks: string, leadBureau?: Bureau, reviewer?: string) => void;
  resetToSeedData: () => void;
  isDemoMode: boolean;
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
  const [initialData] = useState(() => loadInitialData());

  const [institutions, setInstitutions] = useState<Institution[]>(initialData.institutions);
  const [cases, setCases] = useState<CaseRecord[]>(initialData.cases);
  const [actions, setActions] = useState<CaseAction[]>(initialData.actions);
  const [alerts, setAlerts] = useState<OverlapAlert[]>(initialData.alerts);
  const [filters, setFilterState] = useState<FilterState>(defaultFilters);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => prev?.text === text ? null : prev);
    }, 4000);
  }, []);

  // Save changes to localStorage whenever data changes
  useEffect(() => {
    saveDataToStorage(institutions, cases, actions, alerts);
  }, [institutions, cases, actions, alerts]);

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
  const addCase = (caseData: Omit<CaseRecord, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecord: CaseRecord = {
      ...caseData,
      createdAt: now,
      updatedAt: now
    };

    const initialAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId: newRecord.caseId,
      actionType: 'CASE_FILED',
      remarks: `Complaint registered in ${newRecord.bureau} system by ${newRecord.assignedOfficer}.`,
      bureau: newRecord.bureau,
      officer: newRecord.assignedOfficer,
      timestamp: now
    };

    const updatedCases = [newRecord, ...cases];
    const updatedActions = [initialAction, ...actions];
    setCases(updatedCases);
    setActions(updatedActions);

    const newAlerts = refreshOverlaps(updatedCases, institutions, alerts);
    const triggeredAlert = newAlerts.find(a => a.caseIds.includes(newRecord.caseId));

    if (triggeredAlert) {
      showToast(
        `Case ${newRecord.caseId} registered. WARNING: Cross-bureau overlap detected with ${triggeredAlert.institutionName}!`,
        'warning'
      );
    } else {
      showToast(`Case ${newRecord.caseId} successfully registered.`, 'success');
    }
  };

  // Update Status
  const updateCaseStatus = (
    caseId: string,
    status: CaseStatus,
    remarks: string,
    officer: string,
    resolutionSummary?: string,
    officerId?: string
  ) => {
    const now = new Date().toISOString();
    let bureau: Bureau = 'RB';

    const updatedCases = cases.map(c => {
      if (c.caseId === caseId) {
        bureau = c.bureau;
        const isDisposing = status === 'Disposed';
        return {
          ...c,
          status,
          lastAction: isDisposing 
            ? `Disposed & Closed: ${resolutionSummary || remarks}`
            : `Status updated to ${status}. ${remarks}`,
          lastActionAt: now,
          updatedAt: now,
          ...(isDisposing ? {
            completedAt: now,
            completedBy: officer,
            completedByOfficerId: officerId,
            resolutionSummary: resolutionSummary || remarks
          } : {})
        };
      }
      return c;
    });

    const newAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId,
      actionType: status === 'Disposed' ? 'CASE_DISPOSED' : 'REMARKS_ADDED',
      remarks: status === 'Disposed'
        ? `Case Disposed & Closed by ${officer}. Resolution: ${resolutionSummary || remarks}`
        : `Status changed to [${status}]. Remarks: ${remarks}`,
      bureau,
      officer,
      timestamp: now
    };

    const updatedActions = [newAction, ...actions];
    setCases(updatedCases);
    setActions(updatedActions);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${caseId} status updated to ${status}.`, 'success');
  };

  // Reopen Case (P1 requirement)
  const reopenCase = (caseId: string, reopenReason: string, officer: string) => {
    const now = new Date().toISOString();
    let bureau: Bureau = 'RB';

    const updatedCases = cases.map(c => {
      if (c.caseId === caseId) {
        bureau = c.bureau;
        return {
          ...c,
          status: 'Under Process' as CaseStatus,
          reopenedAt: now,
          reopenedBy: officer,
          reopenReason,
          lastAction: `Case reopened from Disposed status. Reason: ${reopenReason}`,
          lastActionAt: now,
          updatedAt: now
        };
      }
      return c;
    });

    const newAction: CaseAction = {
      actionId: `ACT-REOPEN-${Date.now()}`,
      caseId,
      actionType: 'CASE_REOPENED',
      remarks: `Case reopened by ${officer}. Reopen Reason: ${reopenReason}`,
      bureau,
      officer,
      timestamp: now
    };

    const updatedActions = [newAction, ...actions];
    setCases(updatedCases);
    setActions(updatedActions);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${caseId} reopened and restored to Under Process.`, 'info');
  };

  // Merge Cases (P2 requirement)
  const mergeCases = (
    primaryCaseId: string,
    childCaseId: string,
    mergeReason: string,
    officer: string
  ): boolean => {
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

    const now = new Date().toISOString();

    const updatedCases = cases.map(c => {
      if (c.caseId === childCaseId) {
        return {
          ...c,
          isMerged: true,
          mergedIntoCaseId: primaryCaseId,
          mergedAt: now,
          mergedBy: officer,
          mergeReason,
          lastAction: `Consolidated & merged into primary complaint ${primaryCaseId}. Reason: ${mergeReason}`,
          lastActionAt: now,
          updatedAt: now,
          relatedCaseIds: Array.from(new Set([...c.relatedCaseIds, primaryCaseId]))
        };
      }
      if (c.caseId === primaryCaseId) {
        const mergedList = Array.from(new Set([...(c.mergedCaseIds || []), childCaseId]));
        const relatedList = Array.from(new Set([...c.relatedCaseIds, childCaseId]));
        return {
          ...c,
          mergedCaseIds: mergedList,
          relatedCaseIds: relatedList,
          lastAction: `Consolidated complaint ${childCaseId} merged into this dossier. Reason: ${mergeReason}`,
          lastActionAt: now,
          updatedAt: now
        };
      }
      return c;
    });

    const actionChild: CaseAction = {
      actionId: `ACT-MERGE-CHILD-${Date.now()}`,
      caseId: childCaseId,
      actionType: 'CASES_MERGED',
      remarks: `Merged into primary case ${primaryCaseId} by ${officer}. Reason: ${mergeReason}`,
      bureau: childCase.bureau,
      officer,
      timestamp: now
    };

    const actionPrimary: CaseAction = {
      actionId: `ACT-MERGE-PRIM-${Date.now()}`,
      caseId: primaryCaseId,
      actionType: 'CASES_MERGED',
      remarks: `Consolidated child case ${childCaseId} merged into this dossier by ${officer}. Reason: ${mergeReason}`,
      bureau: primaryCase.bureau,
      officer,
      timestamp: now
    };

    setCases(updatedCases);
    setActions([actionChild, actionPrimary, ...actions]);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${childCaseId} successfully merged into ${primaryCaseId}.`, 'success');
    return true;
  };

  // Unmerge Case (P2 requirement)
  const unmergeCase = (childCaseId: string, officer: string, reason: string): boolean => {
    const childCase = cases.find(c => c.caseId === childCaseId);
    if (!childCase || !childCase.isMerged || !childCase.mergedIntoCaseId) {
      showToast('Case is not currently merged.', 'warning');
      return false;
    }

    const primaryCaseId = childCase.mergedIntoCaseId;
    const now = new Date().toISOString();

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
      if (c.caseId === primaryCaseId) {
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

    const actionChild: CaseAction = {
      actionId: `ACT-UNMERGE-${Date.now()}`,
      caseId: childCaseId,
      actionType: 'CASE_UNMERGED',
      remarks: `Unmerged from ${primaryCaseId} by ${officer}. Reason: ${reason}`,
      bureau: childCase.bureau,
      officer,
      timestamp: now
    };

    setCases(updatedCases);
    setActions([actionChild, ...actions]);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${childCaseId} unmerged successfully.`, 'info');
    return true;
  };

  // Add Action
  const addCaseAction = (
    caseId: string,
    actionType: ActionType,
    remarks: string,
    officer: string,
    nextAction?: string
  ) => {
    const now = new Date().toISOString();
    let bureau: Bureau = 'RB';

    const updatedCases = cases.map(c => {
      if (c.caseId === caseId) {
        bureau = c.bureau;
        return {
          ...c,
          lastAction: remarks,
          nextAction: nextAction || c.nextAction,
          lastActionAt: now,
          updatedAt: now
        };
      }
      return c;
    });

    const newAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId,
      actionType,
      remarks,
      bureau,
      officer,
      timestamp: now
    };

    setCases(updatedCases);
    setActions([newAction, ...actions]);
    showToast(`Action recorded on Case ${caseId}.`, 'success');
  };

  // Reassign Bureau
  const reassignBureau = (caseId: string, newBureau: Bureau, remarks: string, officer: string) => {
    const now = new Date().toISOString();
    let oldBureau: Bureau = 'RB';

    const updatedCases = cases.map(c => {
      if (c.caseId === caseId) {
        oldBureau = c.bureau;
        return {
          ...c,
          bureau: newBureau,
          status: 'Transferred' as CaseStatus,
          lastAction: `Jurisdiction transferred from ${oldBureau} to ${newBureau}. ${remarks}`,
          lastActionAt: now,
          updatedAt: now
        };
      }
      return c;
    });

    const newAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId,
      actionType: 'BUREAU_REASSIGNED',
      remarks: `Transferred from ${oldBureau} to ${newBureau}. Remarks: ${remarks}`,
      bureau: newBureau,
      officer,
      timestamp: now
    };

    setCases(updatedCases);
    setActions([newAction, ...actions]);
    refreshOverlaps(updatedCases, institutions, alerts);
    showToast(`Case ${caseId} transferred to ${newBureau}.`, 'info');
  };

  // Record Escalation
  const recordEscalation = (caseId: string, remarks: string, officer: string) => {
    const now = new Date().toISOString();
    let bureau: Bureau = 'RB';

    const updatedCases = cases.map(c => {
      if (c.caseId === caseId) {
        bureau = c.bureau;
        return {
          ...c,
          status: 'Escalated' as CaseStatus,
          priority: 'CRITICAL' as const,
          lastAction: `Case escalated for high-level regulatory intervention. ${remarks}`,
          lastActionAt: now,
          updatedAt: now
        };
      }
      return c;
    });

    const newAction: CaseAction = {
      actionId: `ACT-${Date.now()}`,
      caseId,
      actionType: 'CASE_ESCALATED',
      remarks: `Escalated to Higher Authority. Remarks: ${remarks}`,
      bureau,
      officer,
      timestamp: now
    };

    setCases(updatedCases);
    setActions([newAction, ...actions]);
    showToast(`Case ${caseId} escalated to higher regulatory authority.`, 'warning');
  };

  // Link Related Cases
  const linkRelatedCases = (caseId1: string, caseId2: string, remarks: string, officer: string) => {
    const now = new Date().toISOString();

    const updatedCases = cases.map(c => {
      if (c.caseId === caseId1) {
        const related = Array.from(new Set([...c.relatedCaseIds, caseId2]));
        return { ...c, relatedCaseIds: related, updatedAt: now };
      }
      if (c.caseId === caseId2) {
        const related = Array.from(new Set([...c.relatedCaseIds, caseId1]));
        return { ...c, relatedCaseIds: related, updatedAt: now };
      }
      return c;
    });

    const newAction1: CaseAction = {
      actionId: `ACT-${Date.now()}-1`,
      caseId: caseId1,
      actionType: 'INTER_BUREAU_COORDINATED',
      remarks: `Linked with cross-reference case ${caseId2}. Remarks: ${remarks}`,
      bureau: 'RB',
      officer,
      timestamp: now
    };

    const newAction2: CaseAction = {
      actionId: `ACT-${Date.now()}-2`,
      caseId: caseId2,
      actionType: 'INTER_BUREAU_COORDINATED',
      remarks: `Linked with cross-reference case ${caseId1}. Remarks: ${remarks}`,
      bureau: 'PGRC',
      officer,
      timestamp: now
    };

    setCases(updatedCases);
    setActions([newAction1, newAction2, ...actions]);
    showToast(`Cases ${caseId1} and ${caseId2} cross-linked.`, 'success');
  };

  // Review Overlap Alert
  const reviewOverlapAlert = (
    alertId: string,
    reviewStatus: ReviewStatus,
    remarks: string,
    leadBureau?: Bureau,
    reviewer: string = 'Redressal Coordinator'
  ) => {
    const now = new Date().toISOString();

    const updatedAlerts = alerts.map(a => {
      if (a.alertId === alertId) {
        return {
          ...a,
          reviewStatus,
          coordinationRemarks: remarks,
          leadBureau,
          reviewedBy: reviewer,
          reviewedAt: now
        };
      }
      return a;
    });

    // Append coordination action to all cases associated with this alert
    const targetAlert = alerts.find(a => a.alertId === alertId);
    if (targetAlert) {
      const coordActions: CaseAction[] = targetAlert.caseIds.map((cid, idx) => ({
        actionId: `ACT-COORD-${Date.now()}-${idx}`,
        caseId: cid,
        actionType: 'INTER_BUREAU_COORDINATED',
        remarks: `[Overlap Coordination Decision]: Marked as ${reviewStatus}. Lead: ${leadBureau || 'Joint'}. Remarks: ${remarks}`,
        bureau: leadBureau || 'RB',
        officer: reviewer,
        timestamp: now
      }));
      setActions(prev => [...coordActions, ...prev]);
    }

    setAlerts(updatedAlerts);
    showToast(`Overlap alert reviewed. Coordination remarks recorded.`, 'success');
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
    const pending = cases.filter(c => c.status === 'Pending').length;
    const underProcess = cases.filter(c => c.status === 'Under Process').length;
    const disposed = cases.filter(c => c.status === 'Disposed').length;
    const transferredEscalated = cases.filter(c => c.status === 'Transferred' || c.status === 'Escalated').length;
    
    const nowMs = Date.now();
    const overdue = cases.filter(c => {
      if (c.status === 'Disposed') return false;
      return new Date(c.expectedDisposalDate).getTime() < nowMs;
    }).length;

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
      pendingCases: pending,
      underProcessCases: underProcess,
      disposedCases: disposed,
      transferredEscalatedCases: transferredEscalated,
      overdueCases: overdue,
      potentialOverlaps: potential,
      unresolvedOverlaps: unresolved,
      disposalRate: rate,
      completedLast14Days,
      mergedCasesCount
    };
  }, [cases, alerts]);

  // Filtered cases for registry and export
  const filteredCases = useMemo(() => {
    const now = new Date().getTime();

    // Institution map for region lookup
    const instRegionMap = new Map<string, string>();
    for (const inst of institutions) {
      instRegionMap.set(inst.institutionId, inst.region);
    }

    return cases.filter(c => {
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
  }, [cases, institutions, filters]);

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
        isDemoMode: true,
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
