import { CaseAction, ActionType, HistoryActivityType, CaseStatus, Bureau } from '../types';

/**
 * Format a rich case history entry into a database-compatible remarks string.
 * Tags are encoded in brackets to allow lossless round-trip persistence in Supabase
 * without requiring schema migrations or column additions.
 */
export function formatActionRemarks(
  activityType: HistoryActivityType,
  description: string,
  options?: {
    evidenceRef?: string;
    nextAction?: string;
    previousStatus?: string;
    newStatus?: string;
  }
): string {
  const parts: string[] = [];
  
  // Tag the category
  parts.push(`[${activityType}]`);
  
  // Main description
  parts.push(description.trim());

  // Optional evidence reference
  if (options?.evidenceRef && options.evidenceRef.trim()) {
    parts.push(`[Evidence: ${options.evidenceRef.trim()}]`);
  }

  // Optional next action
  if (options?.nextAction && options.nextAction.trim()) {
    parts.push(`[Next: ${options.nextAction.trim()}]`);
  }

  // Optional status transition tag
  if (options?.previousStatus && options?.newStatus && options.previousStatus !== options.newStatus) {
    parts.push(`[Status: ${options.previousStatus} -> ${options.newStatus}]`);
  }

  return parts.join(' ');
}

export interface ParsedCaseActionMetadata {
  activityCategory: HistoryActivityType;
  cleanRemarks: string;
  evidenceRef?: string;
  nextAction?: string;
  previousValue?: string;
  newValue?: string;
  officerName: string;
  officerRole?: string;
  bureau: Bureau;
  timestamp: string;
}

/**
 * Parse an action into clean display metadata, extracting any encoded tags
 * or falling back to intelligent defaults based on the actionType.
 */
export function parseActionMetadata(action: CaseAction): ParsedCaseActionMetadata {
  let remarks = action.remarks || '';
  let category: HistoryActivityType = action.activityCategory || inferCategoryFromActionType(action.actionType);
  let evidenceRef: string | undefined = action.evidenceRef;
  let nextAction: string | undefined = action.nextAction;
  let previousValue: string | undefined = action.previousValue;
  let newValue: string | undefined = action.newValue;

  // 1. Check for [Category] prefix
  const categoryMatch = remarks.match(/^\[(Progress Update|Investigation Note|Evidence Added|Communication|Status Change|Other)\]\s*/i);
  if (categoryMatch) {
    category = categoryMatch[1] as HistoryActivityType;
    remarks = remarks.substring(categoryMatch[0].length);
  }

  // 2. Extract [Evidence: ...]
  const evidenceMatch = remarks.match(/\[Evidence:\s*([^\]]+)\]/i);
  if (evidenceMatch) {
    if (!evidenceRef) evidenceRef = evidenceMatch[1].trim();
    remarks = remarks.replace(evidenceMatch[0], '').trim();
  }

  // 3. Extract [Next: ...]
  const nextMatch = remarks.match(/\[Next:\s*([^\]]+)\]/i);
  if (nextMatch) {
    if (!nextAction) nextAction = nextMatch[1].trim();
    remarks = remarks.replace(nextMatch[0], '').trim();
  }

  // 4. Extract [Status: Old -> New]
  const statusMatch = remarks.match(/\[Status:\s*([^\s-]+)\s*->\s*([^\]]+)\]/i);
  if (statusMatch) {
    if (!previousValue) previousValue = statusMatch[1].trim();
    if (!newValue) newValue = statusMatch[2].trim();
    remarks = remarks.replace(statusMatch[0], '').trim();
  }

  // Clean double spaces if any
  remarks = remarks.replace(/\s{2,}/g, ' ').trim();

  // Parse officer role if formatted as "Name (Designation)"
  let officerName = action.officer;
  let officerRole: string | undefined = undefined;
  const officerRoleMatch = action.officer?.match(/^(.*?)\s*\((.*?)\)$/);
  if (officerRoleMatch) {
    officerName = officerRoleMatch[1].trim();
    officerRole = officerRoleMatch[2].trim();
  }

  return {
    activityCategory: category,
    cleanRemarks: remarks || action.remarks,
    evidenceRef,
    nextAction,
    previousValue,
    newValue,
    officerName,
    officerRole,
    bureau: action.bureau,
    timestamp: action.timestamp
  };
}

/**
 * Infer human-readable activity type from legacy or system ActionType
 */
export function inferCategoryFromActionType(actionType: ActionType): HistoryActivityType {
  switch (actionType) {
    case 'COMMITTEE_INSPECTION':
      return 'Investigation Note';
    case 'EXPLANATION_RECEIVED':
      return 'Evidence Added';
    case 'NOTICE_ISSUED':
    case 'HEARING_SCHEDULED':
      return 'Communication';
    case 'CASE_DISPOSED':
    case 'CASE_REOPENED':
    case 'BUREAU_REASSIGNED':
    case 'CASES_MERGED':
    case 'CASE_UNMERGED':
      return 'Status Change';
    case 'CASE_FILED':
    case 'CASE_ESCALATED':
    case 'INTER_BUREAU_COORDINATED':
    case 'REMARKS_ADDED':
    default:
      return 'Progress Update';
  }
}

/**
 * Map user-facing HistoryActivityType to a Postgres check-constraint-safe ActionType.
 */
export function mapActivityTypeToDbAction(
  activityType: HistoryActivityType,
  newStatus?: CaseStatus
): ActionType {
  if (newStatus === 'Disposed') {
    return 'CASE_DISPOSED';
  }
  
  switch (activityType) {
    case 'Investigation Note':
      return 'COMMITTEE_INSPECTION';
    case 'Evidence Added':
      return 'EXPLANATION_RECEIVED';
    case 'Communication':
      return 'NOTICE_ISSUED';
    case 'Status Change':
      return 'REMARKS_ADDED';
    case 'Progress Update':
    case 'Other':
    default:
      return 'REMARKS_ADDED';
  }
}
