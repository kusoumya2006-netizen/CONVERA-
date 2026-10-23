import { CaseRecord, OverlapAlert } from '../types';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PriorityFactor {
  category: 'DEADLINE' | 'NEXT_ACTION' | 'OVERLAP' | 'ESCALATION' | 'SEVERITY' | 'ASSIGNMENT';
  impact: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  scoreContribution: number;
  label: string;
  detail: string;
}

export interface ExplainablePriority {
  caseId: string;
  score: number; // 0 to 100
  level: PriorityLevel;
  badgeClass: string;
  badgeBg: string;
  badgeText: string;
  factors: PriorityFactor[];
  summaryExplanation: string;
  recommendedNextAction: string;
  isOverdue: boolean;
  daysOverdue: number;
  daysUntilDue: number;
  hasActiveOverlap: boolean;
  isEscalated: boolean;
}

/**
 * Priority Scoring Thresholds (Explicitly Documented):
 * - CRITICAL (Score >= 75): Requires immediate executive/director attention.
 * - HIGH     (Score 55 - 74): Approaching deadline or active cross-bureau dependency.
 * - MEDIUM   (Score 35 - 54): Routine active inquiry within standard SLA window.
 * - LOW      (Score 0 - 34):  Ample timeline or resolved/disposed complaint.
 */
export const PRIORITY_THRESHOLDS = {
  CRITICAL_MIN: 70,
  HIGH_MIN: 50,
  MEDIUM_MIN: 30
} as const;

/**
 * Calculates a transparent, explainable priority score and ranking for a complaint case.
 * Derives concrete contributing factors from verified case records and active overlap alerts.
 *
 * @param caseRecord The complaint case to analyze.
 * @param activeAlerts Set of active overlap alerts in the system.
 * @param referenceTime Optional reference date for deterministic testing.
 */
export function calculateExplainablePriority(
  caseRecord: CaseRecord,
  activeAlerts: OverlapAlert[] = [],
  referenceTime?: Date
): ExplainablePriority {
  const now = referenceTime ? new Date(referenceTime) : new Date();
  const factors: PriorityFactor[] = [];

  // Disposed cases receive 0 priority score
  if (caseRecord.status === 'Disposed') {
    return {
      caseId: caseRecord.caseId,
      score: 0,
      level: 'LOW',
      badgeClass: 'border-[#272D35] bg-[#161A20] text-[#737D8B]',
      badgeBg: '#161A20',
      badgeText: 'text-[#737D8B]',
      factors: [
        {
          category: 'DEADLINE',
          impact: 'LOW',
          scoreContribution: 0,
          label: 'Matter Disposed',
          detail: 'Complaint has been formally resolved and closed. SLA clock stopped.'
        }
      ],
      summaryExplanation: 'Low Priority: Case is formally resolved and disposed with no outstanding regulatory actions.',
      recommendedNextAction: 'Archive case record & preserve audit trail.',
      isOverdue: false,
      daysOverdue: 0,
      daysUntilDue: 0,
      hasActiveOverlap: false,
      isEscalated: false
    };
  }

  // 1. Calculate SLA / Deadline metrics
  let dueDate: Date;
  let hasValidDeadline = true;

  if (caseRecord.expectedDisposalDate) {
    const parsed = new Date(caseRecord.expectedDisposalDate);
    if (!isNaN(parsed.getTime())) {
      dueDate = parsed;
    } else {
      hasValidDeadline = false;
      const rec = new Date(caseRecord.receivedAt || now);
      dueDate = new Date((isNaN(rec.getTime()) ? now.getTime() : rec.getTime()) + 30 * 24 * 60 * 60 * 1000);
    }
  } else {
    hasValidDeadline = false;
    const rec = new Date(caseRecord.receivedAt || now);
    dueDate = new Date((isNaN(rec.getTime()) ? now.getTime() : rec.getTime()) + 30 * 24 * 60 * 60 * 1000);
  }

  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = diffMs < 0;
  const daysOverdue = isOverdue ? Math.max(1, Math.abs(diffDays)) : 0;
  const daysUntilDue = isOverdue ? 0 : Math.max(0, diffDays);

  let deadlineScore = 0;
  if (isOverdue) {
    deadlineScore = 50 + Math.min(15, daysOverdue * 2);
    factors.push({
      category: 'DEADLINE',
      impact: 'CRITICAL',
      scoreContribution: deadlineScore,
      label: 'Statutory SLA Breached',
      detail: `Case is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} past its expected disposal date (${dueDate.toISOString().split('T')[0]}).`
    });
  } else if (diffDays <= 1) {
    deadlineScore = 40;
    factors.push({
      category: 'DEADLINE',
      impact: 'CRITICAL',
      scoreContribution: deadlineScore,
      label: 'SLA Expiration Imminent',
      detail: 'Target disposal date expires within 24 hours. Immediate scrutiny required.'
    });
  } else if (diffDays <= 2) {
    deadlineScore = 32;
    factors.push({
      category: 'DEADLINE',
      impact: 'HIGH',
      scoreContribution: deadlineScore,
      label: 'Deadline Approaching (< 48 Hours)',
      detail: `Due in ${diffDays} days (${dueDate.toISOString().split('T')[0]}). Priority review window.`
    });
  } else if (diffDays <= 7) {
    deadlineScore = 20;
    factors.push({
      category: 'DEADLINE',
      impact: 'MODERATE',
      scoreContribution: deadlineScore,
      label: 'SLA Window Closing (Within 7 Days)',
      detail: `Due in ${diffDays} days. Pre-hearing preparations should be finalized.`
    });
  } else if (diffDays <= 14) {
    deadlineScore = 10;
    factors.push({
      category: 'DEADLINE',
      impact: 'LOW',
      scoreContribution: deadlineScore,
      label: 'Active Timeline (< 14 Days)',
      detail: `Standard inquiry active with ${diffDays} days remaining.`
    });
  } else {
    deadlineScore = 2;
    factors.push({
      category: 'DEADLINE',
      impact: 'LOW',
      scoreContribution: deadlineScore,
      label: 'Ample SLA Buffer',
      detail: `${diffDays} days remaining before statutory review deadline.`
    });
  }

  // 2. Escalation & Priority Severity Factor
  let escalationScore = 0;
  const isEscalated = caseRecord.status === 'Escalated';

  if (isEscalated) {
    escalationScore += 15;
    factors.push({
      category: 'ESCALATION',
      impact: 'CRITICAL',
      scoreContribution: 15,
      label: 'Regulatory Escalation',
      detail: 'Matter has been formally escalated for higher administrative intervention.'
    });
  }

  if (caseRecord.priority === 'CRITICAL') {
    escalationScore += 10;
    factors.push({
      category: 'SEVERITY',
      impact: 'CRITICAL',
      scoreContribution: 10,
      label: 'Critical Severity Classification',
      detail: 'Grievance involves high-risk non-compliance under central vigilance oversight.'
    });
  } else if (caseRecord.priority === 'HIGH') {
    escalationScore += 6;
    factors.push({
      category: 'SEVERITY',
      impact: 'HIGH',
      scoreContribution: 6,
      label: 'High Severity Classification',
      detail: 'Substantive grievance impacting institutional integrity or faculty rights.'
    });
  } else if (caseRecord.priority === 'MEDIUM') {
    escalationScore += 2;
  }

  // 3. Cross-Bureau Overlap Factor
  let overlapScore = 0;
  const relevantAlerts = activeAlerts.filter(a => a.caseIds.includes(caseRecord.caseId));
  const pendingOverlap = relevantAlerts.find(a => a.reviewStatus === 'PENDING_REVIEW');
  const coordinatedOverlap = relevantAlerts.find(a => a.reviewStatus === 'COORDINATED');

  if (pendingOverlap) {
    overlapScore = 18;
    const otherBureaus = pendingOverlap.involvedBureaus.filter(b => b !== caseRecord.bureau);
    factors.push({
      category: 'OVERLAP',
      impact: 'HIGH',
      scoreContribution: 18,
      label: 'Unreviewed Cross-Bureau Overlap',
      detail: `Concurrent proceedings detected with ${otherBureaus.length > 0 ? otherBureaus.join(', ') : 'other bureaus'} on shared institution. Joint review required.`
    });
  } else if (coordinatedOverlap) {
    overlapScore = 6;
    factors.push({
      category: 'OVERLAP',
      impact: 'MODERATE',
      scoreContribution: 6,
      label: 'Coordinated Inter-Bureau Proceeding',
      detail: `Active coordination protocol in effect under ${coordinatedOverlap.leadBureau || 'Joint'} lead.`
    });
  }

  // 4. Next Action & Officer Assignment
  let actionScore = 0;
  const isUnassigned =
    !caseRecord.assignedOfficer ||
    caseRecord.assignedOfficer.trim() === '' ||
    caseRecord.assignedOfficer.toLowerCase().includes('unassigned');

  if (isUnassigned) {
    actionScore += 4;
    factors.push({
      category: 'ASSIGNMENT',
      impact: 'HIGH',
      scoreContribution: 4,
      label: 'Unassigned Scrutiny Officer',
      detail: 'No specific bureau official has been assigned responsibility for case execution.'
    });
  }

  if (caseRecord.nextAction && caseRecord.nextAction.trim()) {
    // Check if next action appears overdue based on lastActionAt
    const lastActionMs = caseRecord.lastActionAt ? new Date(caseRecord.lastActionAt).getTime() : 0;
    const daysSinceAction = lastActionMs > 0 ? Math.floor((now.getTime() - lastActionMs) / (1000 * 60 * 60 * 24)) : 0;

    if (daysSinceAction >= 7) {
      actionScore += 8;
      factors.push({
        category: 'NEXT_ACTION',
        impact: 'HIGH',
        scoreContribution: 8,
        label: 'Next Action Stalled (> 7 Days)',
        detail: `Next scheduled action "${caseRecord.nextAction}" pending without updates for ${daysSinceAction} days.`
      });
    } else {
      actionScore += 4;
      factors.push({
        category: 'NEXT_ACTION',
        impact: 'MODERATE',
        scoreContribution: 4,
        label: 'Scheduled Next Action Pending',
        detail: `Action scheduled: "${caseRecord.nextAction}".`
      });
    }
  }

  // Total Score Calculation (capped at 100)
  const totalRaw = deadlineScore + escalationScore + overlapScore + actionScore;
  const score = Math.min(100, Math.max(0, totalRaw));

  // Determine Priority Level based on explicit thresholds
  let level: PriorityLevel = 'LOW';
  let badgeClass = 'border-[#272D35] bg-[#161A20] text-[#737D8B]';
  let badgeBg = '#161A20';
  let badgeText = 'text-[#737D8B]';

  if (score >= PRIORITY_THRESHOLDS.CRITICAL_MIN) {
    level = 'CRITICAL';
    badgeClass = 'border-[#F16D75]/40 bg-[#F16D75]/15 text-[#F16D75] font-bold';
    badgeBg = '#F16D75]/15';
    badgeText = 'text-[#F16D75]';
  } else if (score >= PRIORITY_THRESHOLDS.HIGH_MIN) {
    level = 'HIGH';
    badgeClass = 'border-[#FFC759]/40 bg-[#FFC759]/15 text-[#FFC759] font-semibold';
    badgeBg = '#FFC759]/15';
    badgeText = 'text-[#FFC759]';
  } else if (score >= PRIORITY_THRESHOLDS.MEDIUM_MIN) {
    level = 'MEDIUM';
    badgeClass = 'border-[#86A9FF]/40 bg-[#86A9FF]/15 text-[#86A9FF]';
    badgeBg = '#86A9FF]/15';
    badgeText = 'text-[#86A9FF]';
  } else {
    level = 'LOW';
    badgeClass = 'border-[#272D35] bg-[#161A20] text-[#A0A7B2]';
    badgeBg = '#161A20';
    badgeText = 'text-[#A0A7B2]';
  }

  // Generate Recommended Next Action derived from verified state
  let recommendedNextAction = 'Continue standard regulatory scrutiny and document findings.';
  if (isOverdue) {
    recommendedNextAction = 'Immediate SLA escalation: dispatch expedited hearing notice or showcause order to institution.';
  } else if (pendingOverlap) {
    const otherB = pendingOverlap.involvedBureaus.filter(b => b !== caseRecord.bureau).join(', ');
    recommendedNextAction = `Convene joint inter-bureau coordination review with ${otherB || 'sister cells'} to consolidate proceedings.`;
  } else if (isEscalated) {
    recommendedNextAction = 'Submit formal status dossier to Member Secretary / Regional Committee for decision.';
  } else if (isUnassigned) {
    recommendedNextAction = `Designate assigned scrutiny officer in ${caseRecord.bureau} bureau to lead investigation.`;
  } else if (caseRecord.nextAction) {
    recommendedNextAction = `Execute scheduled protocol: "${caseRecord.nextAction}".`;
  }

  // Generate Concise Human-Readable Summary
  const topReasons = factors
    .filter(f => f.scoreContribution > 0)
    .slice(0, 3)
    .map(f => f.label.toLowerCase());

  const summaryExplanation = topReasons.length > 0
    ? `${level} Priority (Score: ${score}/100) — Driven by ${topReasons.join(', ')}.`
    : `${level} Priority (Score: ${score}/100) — Normal regulatory processing.`;

  return {
    caseId: caseRecord.caseId,
    score,
    level,
    badgeClass,
    badgeBg,
    badgeText,
    factors,
    summaryExplanation,
    recommendedNextAction,
    isOverdue,
    daysOverdue,
    daysUntilDue,
    hasActiveOverlap: !!pendingOverlap,
    isEscalated
  };
}

/**
 * Sorts an array of cases by calculated priority score in descending order (highest urgency first).
 */
export function sortCasesByPriorityScore(
  cases: CaseRecord[],
  activeAlerts: OverlapAlert[] = [],
  referenceTime?: Date
): { caseRecord: CaseRecord; analysis: ExplainablePriority }[] {
  const analyzed = cases.map(c => ({
    caseRecord: c,
    analysis: calculateExplainablePriority(c, activeAlerts, referenceTime)
  }));

  return analyzed.sort((a, b) => {
    // 1. Higher score first
    if (b.analysis.score !== a.analysis.score) {
      return b.analysis.score - a.analysis.score;
    }
    // 2. Overdue first
    if (a.analysis.isOverdue !== b.analysis.isOverdue) {
      return a.analysis.isOverdue ? -1 : 1;
    }
    // 3. Earliest deadline first
    const dateA = new Date(a.caseRecord.expectedDisposalDate || '').getTime() || Number.MAX_SAFE_INTEGER;
    const dateB = new Date(b.caseRecord.expectedDisposalDate || '').getTime() || Number.MAX_SAFE_INTEGER;
    return dateA - dateB;
  });
}
