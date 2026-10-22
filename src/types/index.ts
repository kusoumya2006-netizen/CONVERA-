export type Bureau = 'RB' | 'PGRC' | 'AB' | 'Finance' | 'Vigilance';

export type CaseStatus = 'Pending' | 'Under Process' | 'Disposed' | 'Transferred' | 'Escalated';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Region = 
  | 'Northern' 
  | 'Western' 
  | 'Southern' 
  | 'Eastern' 
  | 'Central' 
  | 'North-Western' 
  | 'South-Western';

export type ComplaintCategory =
  | 'Infrastructure Non-Compliance'
  | 'Faculty Pay & Service Grievance'
  | 'Unlawful Fee Demands'
  | 'Capitation Fee Allegation'
  | 'Unauthorized Course / Intake'
  | 'Harassment / Discriminatory Conduct'
  | 'Affiliation & Land Discrepancy'
  | 'Withholding Original Certificates'
  | 'Substandard Lab / Workshop Equipment';

export type ComplainantType = 'Student' | 'Faculty' | 'Parent' | 'Anonymous' | 'Regulatory Agency';

export interface Institution {
  institutionId: string;
  name: string;
  address: string;
  region: Region;
  type: string;
  establishedYear: number;
  accreditationGrade?: string;
  createdAt: string;
}

export interface CaseRecord {
  caseId: string;
  institutionId: string;
  institutionName?: string; // Cache for display & fallback matching
  category: ComplaintCategory;
  description: string;
  bureau: Bureau;
  assignedOfficer: string;
  status: CaseStatus;
  priority: Priority;
  complainantType: ComplainantType;
  receivedAt: string;
  lastAction: string;
  nextAction: string;
  lastActionAt: string;
  expectedDisposalDate: string;
  relatedCaseIds: string[];
  createdAt: string;
  updatedAt: string;

  // P1 Completion & Resolution fields
  completedAt?: string;
  completedBy?: string;
  completedByOfficerId?: string;
  resolutionSummary?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;

  // P2 Case Merging fields
  isMerged?: boolean;
  mergedIntoCaseId?: string; // Set when this case has been merged into a primary case
  mergedCaseIds?: string[];  // List of child case IDs merged into this primary case
  mergedAt?: string;
  mergedBy?: string;
  mergeReason?: string;
}

export type ActionType = 
  | 'CASE_FILED'
  | 'NOTICE_ISSUED'
  | 'EXPLANATION_RECEIVED'
  | 'COMMITTEE_INSPECTION'
  | 'HEARING_SCHEDULED'
  | 'BUREAU_REASSIGNED'
  | 'CASE_ESCALATED'
  | 'INTER_BUREAU_COORDINATED'
  | 'CASE_DISPOSED'
  | 'CASE_REOPENED'
  | 'CASES_MERGED'
  | 'CASE_UNMERGED'
  | 'REMARKS_ADDED';

export interface CaseAction {
  actionId: string;
  caseId: string;
  actionType: ActionType;
  remarks: string;
  bureau: Bureau;
  officer: string;
  timestamp: string;
}

export type AlertConfidence = 'HIGH' | 'MEDIUM';
export type ReviewStatus = 'PENDING_REVIEW' | 'COORDINATED' | 'DISMISSED';

export interface OverlapAlert {
  alertId: string;
  institutionId: string;
  institutionName: string;
  caseIds: string[];
  involvedBureaus: Bureau[];
  reason: string;
  confidence: AlertConfidence;
  reviewStatus: ReviewStatus;
  detectedAt: string;
  coordinationRemarks?: string;
  leadBureau?: Bureau;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface FilterState {
  searchQuery: string;
  bureau: Bureau | 'ALL';
  region: Region | 'ALL';
  category: ComplaintCategory | 'ALL';
  status: CaseStatus | 'ALL';
  dateRange: 'ALL' | '7_DAYS' | '30_DAYS' | '90_DAYS' | 'OVERDUE' | 'COMPLETED_14_DAYS';
}

export type NavTab = 
  | 'dashboard' 
  | 'registry' 
  | 'completed' 
  | 'merged' 
  | 'institutions' 
  | 'overlaps' 
  | 'reports';

export interface DashboardStats {
  totalComplaints: number;
  pendingCases: number;
  underProcessCases: number;
  disposedCases: number;
  transferredEscalatedCases: number;
  overdueCases: number;
  potentialOverlaps: number;
  unresolvedOverlaps: number;
  disposalRate: number; // percentage
  completedLast14Days: number;
  mergedCasesCount: number;
}
