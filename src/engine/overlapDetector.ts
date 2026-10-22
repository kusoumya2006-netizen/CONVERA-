import { CaseRecord, Institution, OverlapAlert, Bureau, MatchingStrategy, CategoryCorrelation } from '../types';

/**
 * Normalizes an institution ID for deterministic matching.
 * Trims whitespace, removes non-alphanumeric characters, and uppercases.
 * e.g., "1-4392811 " -> "14392811"
 */
export function normalizeInstitutionId(id?: string | null): string {
  if (!id) return '';
  return id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Normalizes an institution name for deterministic conservative fallback matching.
 * Converts to lowercase, strips punctuation and multiple spaces.
 */
export function normalizeInstitutionName(name?: string | null): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether a case status represents an active, open case.
 * Disposed cases are excluded from active overlap warnings.
 */
export function isCaseActive(status: string): boolean {
  return status !== 'Disposed';
}

/**
 * Analyzes whether complaint categories share direct or thematic correlation.
 * Prevents treating the same institution alone as proof that two complaints concern the same issue.
 */
export function evaluateCategoryCorrelation(categories: string[]): {
  correlation: CategoryCorrelation;
  summary: string;
} {
  const unique = Array.from(new Set(categories));
  if (unique.length === 1) {
    return {
      correlation: 'IDENTICAL_CATEGORY',
      summary: `Identical complaint category across bureaus: "${unique[0]}". Direct procedural overlap.`
    };
  }

  const feeCategories = ['Unlawful Fee Demands', 'Capitation Fee Allegation'];
  const infraCategories = ['Infrastructure Non-Compliance', 'Substandard Lab / Workshop Equipment'];
  const academicCategories = ['Unauthorized Course / Intake', 'Affiliation & Land Discrepancy'];
  const studentCategories = ['Harassment / Discriminatory Conduct', 'Withholding Original Certificates'];

  const allFee = unique.every(c => feeCategories.includes(c));
  const allInfra = unique.every(c => infraCategories.includes(c));
  const allAcademic = unique.every(c => academicCategories.includes(c));
  const allStudent = unique.every(c => studentCategories.includes(c));

  if (allFee || allInfra || allAcademic || allStudent) {
    return {
      correlation: 'RELATED_THEME',
      summary: `Thematically related grievances (${unique.join(' & ')}). Potential shared factual basis.`
    };
  }

  return {
    correlation: 'DISTINCT_MATTERS',
    summary: `Distinct complaint matters (${unique.join(' vs. ')}). Independent proceedings sharing target institution.`
  };
}

export interface OverlapDetectionOptions {
  existingAlerts?: OverlapAlert[];
}

/**
 * Deterministic Overlap Detection Engine
 * 
 * Analyzes case records and identifies cross-bureau overlaps per institution.
 * Prioritizes normalized Institution IDs, falls back to normalized Institution Names,
 * evaluates category correlation, and highlights critical RB + PGRC overlaps.
 */
export function detectCrossBureauOverlaps(
  cases: CaseRecord[],
  institutions: Institution[],
  options: OverlapDetectionOptions = {}
): OverlapAlert[] {
  const existingAlerts = options.existingAlerts || [];
  const existingAlertMap = new Map<string, OverlapAlert>();
  for (const alert of existingAlerts) {
    existingAlertMap.set(alert.alertId, alert);
  }

  // Filter to active cases only (disposed cases are excluded from active alerts)
  const activeCases = cases.filter(c => isCaseActive(c.status));

  // Build lookup maps for institutions
  const institutionById = new Map<string, Institution>();
  const institutionByNormName = new Map<string, Institution>();

  for (const inst of institutions) {
    const normId = normalizeInstitutionId(inst.institutionId);
    if (normId) {
      institutionById.set(normId, inst);
    }
    const normName = normalizeInstitutionName(inst.name);
    if (normName) {
      institutionByNormName.set(normName, inst);
    }
  }

  // Group active cases by resolved institution key
  // Key format: "ID:{normId}" or "NAME:{normName}"
  interface GroupedCases {
    institutionId: string;
    institutionName: string;
    isNameMatchedFallback: boolean;
    cases: CaseRecord[];
  }

  const groups = new Map<string, GroupedCases>();

  for (const c of activeCases) {
    const normCaseInstId = normalizeInstitutionId(c.institutionId);
    
    if (normCaseInstId) {
      const groupKey = `ID:${normCaseInstId}`;
      const instObj = institutionById.get(normCaseInstId);
      const instName = instObj ? instObj.name : (c.institutionName || `Institution ${c.institutionId}`);

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          institutionId: instObj ? instObj.institutionId : c.institutionId,
          institutionName: instName,
          isNameMatchedFallback: false,
          cases: []
        });
      }
      groups.get(groupKey)!.cases.push(c);
    } else if (c.institutionName) {
      // Fallback matching when institution ID is missing
      const normName = normalizeInstitutionName(c.institutionName);
      if (normName) {
        const groupKey = `NAME:${normName}`;
        const instObj = institutionByNormName.get(normName);
        
        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            institutionId: instObj ? instObj.institutionId : 'UNKNOWN_ID',
            institutionName: c.institutionName,
            isNameMatchedFallback: true,
            cases: []
          });
        }
        groups.get(groupKey)!.cases.push(c);
      }
    }
  }

  const detectedAlerts: OverlapAlert[] = [];
  const processedAlertIds = new Set<string>();

  for (const [groupKey, group] of groups.entries()) {
    const groupCases = group.cases;
    
    // An overlap requires at least 2 active cases
    if (groupCases.length < 2) continue;

    // Collect distinct bureaus handling active cases for this institution
    const distinctBureaus = Array.from(new Set(groupCases.map(c => c.bureau))) as Bureau[];

    // Priority 3: Only flag when multiple distinct Bureaus/Cells are involved
    if (distinctBureaus.length < 2) {
      // Multiple cases exist, but handled solely by one bureau (e.g., all RB or all PGRC).
      // Not a cross-bureau overlap.
      continue;
    }

    const hasRbAndPgrc = distinctBureaus.includes('RB') && distinctBureaus.includes('PGRC');
    const sortedCaseIds = [...groupCases.map(c => c.caseId)].sort();
    
    // Deterministic Alert ID: prevents duplicate alerts for the same group of cases
    const alertId = `ALERT-${groupKey.replace(/[^a-zA-Z0-9]/g, '_')}-${sortedCaseIds.join('_')}`;

    if (processedAlertIds.has(alertId)) {
      continue;
    }
    processedAlertIds.add(alertId);

    // If alert already existed previously, preserve reviewStatus and user coordination remarks
    const previous = existingAlertMap.get(alertId);

    // Explainable category correlation analysis
    const categories = groupCases.map(c => c.category);
    const catAnalysis = evaluateCategoryCorrelation(categories);
    const matchingStrategy: MatchingStrategy = group.isNameMatchedFallback ? 'NORMALIZED_NAME' : 'EXACT_PID';
    const matchingEvidence = matchingStrategy === 'EXACT_PID'
      ? `Authoritative Permanent Institute ID (PID: ${group.institutionId}) verified across ${distinctBureaus.join(' & ')} intake records.`
      : `Normalized Institution Name match ("${group.institutionName}") applied due to missing Permanent Institute ID on intake.`;

    // Construct human-readable explainable reason
    let reason = '';
    if (hasRbAndPgrc) {
      reason = `Critical Cross-Bureau Overlap: Both Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) have concurrent open proceedings against ${group.institutionName} (${groupCases.length} active cases). High risk of uncoordinated regulatory directives.`;
    } else {
      reason = `Inter-Bureau Overlap: ${distinctBureaus.join(', ')} cells are concurrently processing ${groupCases.length} separate active matters for ${group.institutionName}.`;
    }

    if (group.isNameMatchedFallback) {
      reason += ' [Matched via normalized institution name due to missing Permanent ID - medium confidence].';
    }

    const alert: OverlapAlert = {
      alertId,
      institutionId: group.institutionId,
      institutionName: group.institutionName,
      caseIds: sortedCaseIds,
      involvedBureaus: distinctBureaus,
      reason,
      confidence: group.isNameMatchedFallback ? 'MEDIUM' : 'HIGH',
      matchingStrategy,
      categoryCorrelation: catAnalysis.correlation,
      matchingEvidence: `${matchingEvidence} ${catAnalysis.summary} Notice: Concurrent proceedings at the same institution require coordination, but are not automatically identical matters.`,
      reviewStatus: previous ? previous.reviewStatus : 'PENDING_REVIEW',
      detectedAt: previous ? previous.detectedAt : new Date().toISOString(),
      coordinationRemarks: previous?.coordinationRemarks,
      leadBureau: previous?.leadBureau,
      reviewedBy: previous?.reviewedBy,
      reviewedAt: previous?.reviewedAt
    };

    detectedAlerts.push(alert);
  }

  // Sort alerts: HIGH confidence and RB+PGRC first, then newest
  return detectedAlerts.sort((a, b) => {
    const aIsRbPgrc = a.involvedBureaus.includes('RB') && a.involvedBureaus.includes('PGRC') ? 1 : 0;
    const bIsRbPgrc = b.involvedBureaus.includes('RB') && b.involvedBureaus.includes('PGRC') ? 1 : 0;
    if (aIsRbPgrc !== bIsRbPgrc) return bIsRbPgrc - aIsRbPgrc;
    if (a.confidence !== b.confidence) return a.confidence === 'HIGH' ? -1 : 1;
    return b.detectedAt.localeCompare(a.detectedAt);
  });
}
