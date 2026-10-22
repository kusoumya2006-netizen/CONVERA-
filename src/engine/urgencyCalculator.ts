import { CaseRecord, Priority } from '../types';

export type UrgencyBadge = 'OVERDUE' | 'DUE_SOON' | 'ESCALATED' | 'HIGH_PRIORITY' | 'NORMAL';

export interface UrgencyAnalysis {
  urgencyScore: number;
  urgencyLevel: 'OVERDUE' | 'IMMINENT' | 'HIGH' | 'NORMAL';
  urgencyBadge: UrgencyBadge;
  indicatorText: string;
  deadlineCountdown: string;
  primaryReason: string;
  daysUntilDue: number;
  hoursUntilDue: number;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueWithin24h: boolean;
  isApproaching: boolean;
  isUnassigned: boolean;
  hasPendingOverlap: boolean;
  isEscalated: boolean;
  hasValidDeadline: boolean;
  isProvisionalDeadline: boolean;
}

/**
 * Deterministically calculates case urgency, explainable indicators, and priority ranking.
 *
 * Rules:
 * - Disposed cases are excluded from urgency scoring (score = 0).
 * - Overdue cases receive highest priority (1000 + days overdue).
 * - Cases due within 24 hours receive immediate attention (800-900).
 * - Cases due within 48 hours / approaching (<= 7 days) receive high attention (400-700).
 * - Priority severity (CRITICAL: +50, HIGH: +30, MEDIUM: +10) adds deterministic increments.
 * - Escalated status (+40), active overlap conflicts (+20), and missing assignments (+15) elevate score.
 * - Full backward compatibility with existing urgencyLevel and primaryReason.
 */
export function calculateDeterministicUrgency(
  caseRecord: CaseRecord,
  activeOverlapCaseIds: Set<string> = new Set(),
  referenceTime?: Date
): UrgencyAnalysis {
  // Disposed cases have zero active urgency
  if (caseRecord.status === 'Disposed') {
    return {
      urgencyScore: 0,
      urgencyLevel: 'NORMAL',
      urgencyBadge: 'NORMAL',
      indicatorText: 'RESOLVED — case closed & disposed',
      deadlineCountdown: 'Resolved',
      primaryReason: 'Case resolved & disposed',
      daysUntilDue: 0,
      hoursUntilDue: 0,
      isOverdue: false,
      isDueToday: false,
      isDueWithin24h: false,
      isApproaching: false,
      isUnassigned: false,
      hasPendingOverlap: false,
      isEscalated: false,
      hasValidDeadline: true,
      isProvisionalDeadline: false
    };
  }

  const now = referenceTime ? new Date(referenceTime) : new Date();
  const todayDateStr = now.toISOString().split('T')[0];

  // Safe date parsing with 30-day fallback if missing or malformed
  let dueDate: Date;
  let hasValidDeadline = true;
  let isProvisionalDeadline = false;

  if (caseRecord.expectedDisposalDate) {
    const parsed = new Date(caseRecord.expectedDisposalDate);
    if (!isNaN(parsed.getTime())) {
      dueDate = parsed;
    } else {
      hasValidDeadline = false;
      isProvisionalDeadline = true;
      const received = new Date(caseRecord.receivedAt || now);
      const recTime = isNaN(received.getTime()) ? now.getTime() : received.getTime();
      dueDate = new Date(recTime + 30 * 24 * 60 * 60 * 1000);
    }
  } else {
    hasValidDeadline = false;
    isProvisionalDeadline = true;
    const received = new Date(caseRecord.receivedAt || now);
    const recTime = isNaN(received.getTime()) ? now.getTime() : received.getTime();
    dueDate = new Date(recTime + 30 * 24 * 60 * 60 * 1000);
  }

  const dueDateStr = dueDate.toISOString().split('T')[0];
  const isDueToday = dueDateStr === todayDateStr;

  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isOverdue = diffMs < 0;
  const isDueWithin24h = !isOverdue && diffMs <= 24 * 60 * 60 * 1000;
  const isApproaching = !isOverdue && diffDays <= 7;
  const isImminent = !isOverdue && (isDueWithin24h || diffDays <= 2);

  const isUnassigned =
    !caseRecord.assignedOfficer ||
    caseRecord.assignedOfficer.trim() === '' ||
    caseRecord.assignedOfficer.toLowerCase().includes('unassigned');

  const hasPendingOverlap = activeOverlapCaseIds.has(caseRecord.caseId);
  const isEscalated = caseRecord.status === 'Escalated';

  // Feature 2: Explainable Urgency Badge & Concise Reason
  let urgencyBadge: UrgencyBadge = 'NORMAL';
  let indicatorText = 'NORMAL — no immediate deadline risk detected';
  let deadlineCountdown = '';

  if (isOverdue) {
    const daysOverdue = Math.max(1, Math.abs(diffDays));
    urgencyBadge = 'OVERDUE';
    indicatorText = `OVERDUE — deadline passed (${daysOverdue}d overdue)`;
    deadlineCountdown = `${daysOverdue}d overdue`;
  } else if (isDueWithin24h) {
    const hoursLeft = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
    urgencyBadge = 'DUE_SOON';
    indicatorText = `DUE SOON — deadline within 24 hours (${hoursLeft}h remaining)`;
    deadlineCountdown = `${hoursLeft}h remaining`;
  } else if (isEscalated) {
    urgencyBadge = 'ESCALATED';
    indicatorText = 'ESCALATED — follow-up required';
    deadlineCountdown = hasValidDeadline ? `Due in ${diffDays}d` : 'Provisional (30d SLA)';
  } else if (caseRecord.priority === 'CRITICAL' || caseRecord.priority === 'HIGH') {
    urgencyBadge = 'HIGH_PRIORITY';
    indicatorText = `HIGH PRIORITY — ${caseRecord.priority === 'CRITICAL' ? 'critical regulatory escalation' : 'high-priority grievance category'}`;
    deadlineCountdown = hasValidDeadline ? `Due in ${diffDays}d` : 'Provisional (30d SLA)';
  } else {
    urgencyBadge = 'NORMAL';
    indicatorText = 'NORMAL — no immediate deadline risk detected';
    deadlineCountdown = hasValidDeadline ? `Due in ${diffDays}d` : 'Provisional (30d SLA)';
  }

  // Feature 1: Deterministic Multi-Tier Urgency Scoring
  let score = 0;
  let level: 'OVERDUE' | 'IMMINENT' | 'HIGH' | 'NORMAL' = 'NORMAL';
  const reasons: string[] = [];

  if (isOverdue) {
    const daysOverdue = Math.max(1, Math.abs(diffDays));
    score = 1000 + Math.min(daysOverdue * 10, 500);
    level = 'OVERDUE';
    reasons.push(`Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} (Statutory SLA Breached)`);
  } else if (isDueToday) {
    score = 900;
    level = 'IMMINENT';
    reasons.push('Deadline imminent (Deadline expires today)');
  } else if (isDueWithin24h) {
    const hoursLeft = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
    score = 800 + Math.max(0, 24 - hoursLeft) * 4;
    level = 'IMMINENT';
    reasons.push(`Deadline imminent (Due within 24 hours: ${hoursLeft}h remaining)`);
  } else if (isImminent) {
    score = 650;
    level = 'IMMINENT';
    reasons.push(`Deadline imminent (Due in ${diffDays} day${diffDays > 1 ? 's' : ''})`);
  } else if (isApproaching) {
    score = 400 + Math.max(0, 7 - diffDays) * 15;
    level = 'HIGH';
    reasons.push(`Approaching target deadline (Due in ${diffDays} days)`);
  } else {
    score = 100 + Math.max(0, 30 - Math.min(diffDays, 30));
    level = 'NORMAL';
  }

  // Severity adjustments
  if (caseRecord.priority === 'CRITICAL' || isEscalated) {
    score += 50;
    if (level === 'NORMAL') level = 'HIGH';
    reasons.push('Critical regulatory escalation');
  } else if (caseRecord.priority === 'HIGH') {
    score += 30;
    if (level === 'NORMAL') level = 'HIGH';
    reasons.push('High-priority grievance category');
  } else if (caseRecord.priority === 'MEDIUM') {
    score += 10;
  }

  // Escalated status bonus
  if (isEscalated) {
    score += 40;
  }

  // Active cross-bureau overlap adjustment
  if (hasPendingOverlap) {
    score += 20;
    reasons.push('Concurrent cross-bureau proceeding active');
  }

  // Unassigned officer flag
  if (isUnassigned) {
    score += 15;
    reasons.push('Unassigned scrutiny officer');
  }

  if (isProvisionalDeadline) {
    reasons.push('Provisional 30-day demo SLA');
  }

  return {
    urgencyScore: score,
    urgencyLevel: level,
    urgencyBadge,
    indicatorText,
    deadlineCountdown,
    primaryReason: reasons.join(' • ') || 'Standard monitoring queue',
    daysUntilDue: diffDays,
    hoursUntilDue: diffHours,
    isOverdue,
    isDueToday,
    isDueWithin24h,
    isApproaching,
    isUnassigned,
    hasPendingOverlap,
    isEscalated,
    hasValidDeadline,
    isProvisionalDeadline
  };
}

/**
 * Deterministic multi-tier comparator for ranking complaints by urgency.
 *
 * Ordered by importance:
 * 1. Active complaints rank above Disposed complaints.
 * 2. Overdue complaints rank first (more days overdue = higher rank).
 * 3. Complaints approaching deadline within 24 hours rank next (fewer hours remaining = higher rank).
 * 4. Explicit priority level: CRITICAL > HIGH > MEDIUM > LOW.
 * 5. Escalation status: Escalated > Under Process / Pending.
 * 6. Unresolved risk indicators: Pending overlap > Unassigned officer.
 * 7. Time remaining before deadline: closer deadline = higher rank.
 * 8. Tie-breaker 1: Age of complaint (older complaint received earlier = higher rank).
 * 9. Tie-breaker 2: Case ID ascending (stable, deterministic string comparison).
 */
export function compareCasesByUrgency(
  a: CaseRecord & { urgency: UrgencyAnalysis },
  b: CaseRecord & { urgency: UrgencyAnalysis }
): number {
  // 1. Active complaints rank above Disposed complaints
  const aDisposed = a.status === 'Disposed';
  const bDisposed = b.status === 'Disposed';
  if (aDisposed !== bDisposed) {
    return aDisposed ? 1 : -1;
  }
  if (aDisposed && bDisposed) {
    const aComp = new Date(a.completedAt || a.lastActionAt || 0).getTime();
    const bComp = new Date(b.completedAt || b.lastActionAt || 0).getTime();
    if (aComp !== bComp) return bComp - aComp;
    return a.caseId.localeCompare(b.caseId);
  }

  // 2. Overdue complaints rank first
  if (a.urgency.isOverdue !== b.urgency.isOverdue) {
    return a.urgency.isOverdue ? -1 : 1;
  }
  if (a.urgency.isOverdue && b.urgency.isOverdue) {
    if (a.urgency.daysUntilDue !== b.urgency.daysUntilDue) {
      // daysUntilDue is negative; smaller/more negative number = more overdue
      return a.urgency.daysUntilDue - b.urgency.daysUntilDue;
    }
  }

  // 3. Complaints due within 24 hours rank next
  if (a.urgency.isDueWithin24h !== b.urgency.isDueWithin24h) {
    return a.urgency.isDueWithin24h ? -1 : 1;
  }
  if (a.urgency.isDueWithin24h && b.urgency.isDueWithin24h) {
    if (a.urgency.hoursUntilDue !== b.urgency.hoursUntilDue) {
      return a.urgency.hoursUntilDue - b.urgency.hoursUntilDue;
    }
  }

  // 4. Explicit priority level: CRITICAL > HIGH > MEDIUM > LOW
  const priorityWeight: Record<Priority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };
  const aPri = priorityWeight[a.priority] || 1;
  const bPri = priorityWeight[b.priority] || 1;
  if (aPri !== bPri) {
    return bPri - aPri;
  }

  // 5. Escalation status
  const aEsc = a.status === 'Escalated' ? 1 : 0;
  const bEsc = b.status === 'Escalated' ? 1 : 0;
  if (aEsc !== bEsc) {
    return bEsc - aEsc;
  }

  // 6. Unresolved risk indicators (pending overlap, unassigned)
  const aRisk = (a.urgency.hasPendingOverlap ? 2 : 0) + (a.urgency.isUnassigned ? 1 : 0);
  const bRisk = (b.urgency.hasPendingOverlap ? 2 : 0) + (b.urgency.isUnassigned ? 1 : 0);
  if (aRisk !== bRisk) {
    return bRisk - aRisk;
  }

  // 7. Time remaining before deadline (fewer days until due ranks first)
  if (a.urgency.daysUntilDue !== b.urgency.daysUntilDue) {
    return a.urgency.daysUntilDue - b.urgency.daysUntilDue;
  }

  // 8. Age of complaint tie-breaker (older receivedAt ranks first)
  const aReceived = new Date(a.receivedAt || a.createdAt || 0).getTime();
  const bReceived = new Date(b.receivedAt || b.createdAt || 0).getTime();
  if (aReceived !== bReceived) {
    return aReceived - bReceived;
  }

  // 9. Stable deterministic tie-breaker on caseId
  return a.caseId.localeCompare(b.caseId);
}

/**
 * Sorts case records deterministically by the intelligent urgency hierarchy,
 * non-mutating and guaranteed stable.
 */
export function sortCasesByDeterministicUrgency(
  cases: CaseRecord[],
  activeOverlapCaseIds: Set<string> = new Set(),
  referenceTime?: Date
): (CaseRecord & { urgency: UrgencyAnalysis })[] {
  return cases
    .map(c => ({
      ...c,
      urgency: calculateDeterministicUrgency(c, activeOverlapCaseIds, referenceTime)
    }))
    .sort(compareCasesByUrgency);
}
