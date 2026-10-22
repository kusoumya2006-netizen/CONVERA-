import { CaseRecord, Priority } from '../types';

export interface UrgencyAnalysis {
  urgencyScore: number;
  urgencyLevel: 'OVERDUE' | 'IMMINENT' | 'HIGH' | 'NORMAL';
  primaryReason: string;
  daysUntilDue: number;
  isOverdue: boolean;
  isDueToday: boolean;
  isApproaching: boolean;
  isUnassigned: boolean;
  hasPendingOverlap: boolean;
}

/**
 * Deterministically calculates case urgency and priority ranking.
 * 
 * Rules:
 * - Disposed cases are excluded from urgency scoring (score = 0).
 * - Overdue cases are given highest priority (100 + days overdue).
 * - Due today / within 48h given immediate attention (80-90).
 * - Approaching deadlines within 7 days given high attention (60-70).
 * - Priority severity (CRITICAL / HIGH) adds deterministic increments.
 * - Active overlap conflicts add +15 urgency.
 * - Missing assignments add +10 urgency.
 * - Tie-breaker: Case ID ascending string compare.
 */
export function calculateDeterministicUrgency(
  caseRecord: CaseRecord,
  activeOverlapCaseIds: Set<string> = new Set()
): UrgencyAnalysis {
  // Disposed cases have zero active urgency
  if (caseRecord.status === 'Disposed') {
    return {
      urgencyScore: 0,
      urgencyLevel: 'NORMAL',
      primaryReason: 'Case resolved & disposed',
      daysUntilDue: 0,
      isOverdue: false,
      isDueToday: false,
      isApproaching: false,
      isUnassigned: false,
      hasPendingOverlap: false
    };
  }

  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];
  
  // Safe date parsing with 30-day fallback if missing or malformed
  let dueDate: Date;
  let isProvisionalDeadline = false;
  try {
    dueDate = new Date(caseRecord.expectedDisposalDate);
    if (isNaN(dueDate.getTime())) {
      throw new Error('Invalid date');
    }
  } catch {
    const received = new Date(caseRecord.receivedAt || now);
    dueDate = new Date(received.getTime() + 30 * 24 * 60 * 60 * 1000);
    isProvisionalDeadline = true;
  }

  const dueDateStr = dueDate.toISOString().split('T')[0];
  const isDueToday = dueDateStr === todayDateStr;
  
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isApproaching = diffDays > 0 && diffDays <= 7;
  const isImminent = diffDays >= 0 && diffDays <= 2;

  const isUnassigned = !caseRecord.assignedOfficer || 
                       caseRecord.assignedOfficer.trim() === '' || 
                       caseRecord.assignedOfficer.toLowerCase().includes('unassigned');

  const hasPendingOverlap = activeOverlapCaseIds.has(caseRecord.caseId);

  let score = 0;
  let level: 'OVERDUE' | 'IMMINENT' | 'HIGH' | 'NORMAL' = 'NORMAL';
  const reasons: string[] = [];

  if (isOverdue) {
    const daysOverdue = Math.abs(diffDays);
    score = 100 + Math.min(daysOverdue * 2, 50);
    level = 'OVERDUE';
    reasons.push(`Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} (Statutory SLA Breached)`);
  } else if (isDueToday) {
    score = 90;
    level = 'IMMINENT';
    reasons.push('Deadline expires today');
  } else if (isImminent) {
    score = 80;
    level = 'IMMINENT';
    reasons.push(`Deadline imminent (Due in ${diffDays} day${diffDays > 1 ? 's' : ''})`);
  } else if (isApproaching) {
    score = 60;
    level = 'HIGH';
    reasons.push(`Approaching target deadline (Due in ${diffDays} days)`);
  } else {
    score = 30;
    level = 'NORMAL';
  }

  // Severity adjustments
  if (caseRecord.priority === 'CRITICAL' || caseRecord.status === 'Escalated') {
    score += 25;
    if (level === 'NORMAL') level = 'HIGH';
    reasons.push('Critical regulatory escalation');
  } else if (caseRecord.priority === 'HIGH') {
    score += 15;
    if (level === 'NORMAL') level = 'HIGH';
    reasons.push('High-priority grievance category');
  }

  // Active cross-bureau overlap adjustment
  if (hasPendingOverlap) {
    score += 15;
    reasons.push('Concurrent cross-bureau proceeding active');
  }

  // Unassigned officer flag
  if (isUnassigned) {
    score += 10;
    reasons.push('Unassigned scrutiny officer');
  }

  if (isProvisionalDeadline) {
    reasons.push('Provisional 30-day demo SLA');
  }

  return {
    urgencyScore: score,
    urgencyLevel: level,
    primaryReason: reasons.join(' • ') || 'Standard monitoring queue',
    daysUntilDue: diffDays,
    isOverdue,
    isDueToday,
    isApproaching,
    isUnassigned,
    hasPendingOverlap
  };
}

/**
 * Sorts case records deterministically by urgency score descending,
 * with stable secondary tie-breaker on caseId ascending.
 */
export function sortCasesByDeterministicUrgency(
  cases: CaseRecord[],
  activeOverlapCaseIds: Set<string> = new Set()
): (CaseRecord & { urgency: UrgencyAnalysis })[] {
  return cases
    .map(c => ({
      ...c,
      urgency: calculateDeterministicUrgency(c, activeOverlapCaseIds)
    }))
    .sort((a, b) => {
      if (a.urgency.urgencyScore !== b.urgency.urgencyScore) {
        return b.urgency.urgencyScore - a.urgency.urgencyScore;
      }
      return a.caseId.localeCompare(b.caseId);
    });
}
