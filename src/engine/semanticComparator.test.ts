import { describe, it, expect } from 'vitest';
import {
  isSemanticComparatorAvailable,
  compareComplaintDescriptions,
  compareCandidateCases,
  computeAlertSemanticComparisons,
  SEMANTIC_MODEL_NAME,
  SEMANTIC_DISCLAIMER
} from './semanticComparator';
import { CaseRecord, Institution } from '../types';
import { detectCrossBureauOverlaps } from './overlapDetector';

describe('CONVERA — Domain-Based Complaint Similarity Heuristic', () => {
  const baseInstitution: Institution = {
    institutionId: '1-4328901',
    name: 'Sri Venkateswara College of Engineering (SVCE)',
    region: 'Southern',
    type: 'Engineering',
    address: 'Post Bag No. 1, Pennalur, Sriperumbudur, Tamil Nadu',
    establishedYear: 1985,
    createdAt: '2020-01-01T00:00:00Z'
  };

  const caseFee1: CaseRecord = {
    caseId: 'AICTE-RB-2026-FEE1',
    institutionId: '1-4328901',
    institutionName: 'Sri Venkateswara College of Engineering (SVCE)',
    category: 'Capitation Fee Allegation',
    description: 'Institution demanding mandatory ₹3,50,000 unreceipted capitation fee and illegal donation for direct B.Tech admissions.',
    bureau: 'RB',
    assignedOfficer: 'Dr. Suresh Patil',
    status: 'Under Process',
    priority: 'HIGH',
    complainantType: 'Parent',
    receivedAt: '2026-01-10T00:00:00Z',
    lastAction: 'Notice issued',
    nextAction: 'Hearing',
    lastActionAt: '2026-01-12T00:00:00Z',
    expectedDisposalDate: '2026-03-10T00:00:00Z',
    relatedCaseIds: [],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z'
  };

  const caseFee2: CaseRecord = {
    caseId: 'AICTE-PGRC-2026-FEE2',
    institutionId: '1-4328901',
    institutionName: 'Sri Venkateswara College of Engineering (SVCE)',
    category: 'Unlawful Fee Demands',
    description: 'Extortionate tuition fees and non-refundable cash donation demanded under the table during counseling round.',
    bureau: 'PGRC',
    assignedOfficer: 'Smt. Sunita Mohanty',
    status: 'Pending',
    priority: 'HIGH',
    complainantType: 'Student',
    receivedAt: '2026-01-15T00:00:00Z',
    lastAction: 'Grievance registered',
    nextAction: 'Inquiry',
    lastActionAt: '2026-01-15T00:00:00Z',
    expectedDisposalDate: '2026-03-15T00:00:00Z',
    relatedCaseIds: [],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  };

  const caseInfra: CaseRecord = {
    caseId: 'AICTE-RB-2026-INFRA',
    institutionId: '1-4328901',
    institutionName: 'Sri Venkateswara College of Engineering (SVCE)',
    category: 'Infrastructure Non-Compliance',
    description: 'Substandard computer laboratory equipment and non-functional lathe machines in mechanical engineering workshop.',
    bureau: 'RB',
    assignedOfficer: 'Dr. Suresh Patil',
    status: 'Under Process',
    priority: 'MEDIUM',
    complainantType: 'Faculty',
    receivedAt: '2026-01-18T00:00:00Z',
    lastAction: 'Inspection ordered',
    nextAction: 'Site visit',
    lastActionAt: '2026-01-20T00:00:00Z',
    expectedDisposalDate: '2026-03-18T00:00:00Z',
    relatedCaseIds: [],
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z'
  };

  const caseHarassment: CaseRecord = {
    caseId: 'AICTE-PGRC-2026-RAGGING',
    institutionId: '1-4328901',
    institutionName: 'Sri Venkateswara College of Engineering (SVCE)',
    category: 'Harassment / Discriminatory Conduct',
    description: 'Grave allegations of senior student ragging, mental threat, and hostile physical intimidation in campus hostel.',
    bureau: 'PGRC',
    assignedOfficer: 'Smt. Sunita Mohanty',
    status: 'Under Process',
    priority: 'CRITICAL',
    complainantType: 'Student',
    receivedAt: '2026-01-22T00:00:00Z',
    lastAction: 'Injunction issued',
    nextAction: 'Committee report',
    lastActionAt: '2026-01-23T00:00:00Z',
    expectedDisposalDate: '2026-02-22T00:00:00Z',
    relatedCaseIds: [],
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-23T00:00:00Z'
  };

  it('1. Domain-based similarity heuristic is initialized and available', () => {
    expect(isSemanticComparatorAvailable()).toBe(true);
  });

  it('2. Computes high semantic similarity for paraphrased complaints in the same financial domain', () => {
    const res = compareCandidateCases(caseFee1, caseFee2);

    expect(res.caseId1).toBe('AICTE-RB-2026-FEE1');
    expect(res.caseId2).toBe('AICTE-PGRC-2026-FEE2');
    expect(res.semanticSimilarity).toBeGreaterThanOrEqual(0.70);
    expect(res.label).toBe('HIGH_SEMANTIC_SIMILARITY');
    expect(res.scoreType).toBe('SEMANTIC_SIMILARITY');
    expect(res.modelName).toBe(SEMANTIC_MODEL_NAME);
    expect(res.disclaimer).toBe(SEMANTIC_DISCLAIMER);
    expect(res.interpretation).toContain('Strong semantic thematic alignment');
  });

  it('3. Computes low semantic similarity for complaints in fundamentally distinct domains', () => {
    const res = compareCandidateCases(caseInfra, caseHarassment);

    expect(res.semanticSimilarity).toBeLessThan(0.40);
    expect(res.label).toBe('LOW_SEMANTIC_SIMILARITY');
    expect(res.interpretation).toContain('Low semantic thematic correlation');
  });

  it('4. Rejects self-comparison when caseId1 === caseId2', () => {
    expect(() => compareCandidateCases(caseFee1, caseFee1)).toThrow(
      /Self-comparison rejected: case \[AICTE-RB-2026-FEE1\] cannot be compared with itself/
    );
  });

  it('5. Rejects comparison if candidate cases belong to differing institutions', () => {
    const differingInstCase: CaseRecord = {
      ...caseFee2,
      institutionId: '1-9999999',
      institutionName: 'Completely Different Institute of Technology'
    };

    expect(() => compareCandidateCases(caseFee1, differingInstCase)).toThrow(
      /Institution mismatch: cannot semantically compare complaints for differing institutions/
    );
  });

  it('6. Explicitly labels score as SEMANTIC_SIMILARITY and disclaims probability of duplication', () => {
    const res = compareCandidateCases(caseFee1, caseFee2);

    expect(res.scoreType).toBe('SEMANTIC_SIMILARITY');
    expect(res.disclaimer).toContain('Not a duplicate probability; human review required');
  });

  it('7. Handles descriptions with non-standard whitespace, punctuation, and casing gracefully', () => {
    const res = compareComplaintDescriptions(
      '  CAPITATION   fee demanded!! ₹50,000 cash donation...  ',
      'Tuition fees overcharging and illegal donation payment.'
    );

    expect(res.similarity).toBeGreaterThan(0.60);
    expect(res.similarityPercentage).toBeGreaterThan(60);
  });

  it('8. Handles empty or zero-vocabulary descriptions gracefully without throwing', () => {
    const res = compareComplaintDescriptions('', 'Random text with no regulatory anchors xyz123');

    expect(res.similarity).toBe(0);
    expect(res.similarityPercentage).toBe(0);
    expect(res.label).toBe('LOW_SEMANTIC_SIMILARITY');
    expect(res.interpretation).toContain('Insufficient domain semantic vocabulary');
  });

  it('9. computeAlertSemanticComparisons generates candidate pair combinations without self-comparisons', () => {
    const cases = [caseFee1, caseFee2, caseInfra];
    const comparisons = computeAlertSemanticComparisons(cases);

    // 3 cases -> 3 unique pairs: (0,1), (0,2), (1,2)
    expect(comparisons.length).toBe(3);
    
    for (const c of comparisons) {
      expect(c.caseId1).not.toBe(c.caseId2);
      expect(c.scoreType).toBe('SEMANTIC_SIMILARITY');
    }

    // Pair (caseFee1, caseFee2) should have high similarity
    const feePair = comparisons.find(c => c.caseId1 === caseFee1.caseId && c.caseId2 === caseFee2.caseId);
    expect(feePair).toBeDefined();
    expect(feePair!.label).toBe('HIGH_SEMANTIC_SIMILARITY');
  });

  it('10. Integrates seamlessly into detectCrossBureauOverlaps without breaking existing rule-based detection', () => {
    const activeCases = [caseFee1, caseFee2];
    const alerts = detectCrossBureauOverlaps(activeCases, [baseInstitution]);

    expect(alerts.length).toBe(1);
    const alert = alerts[0];
    expect(alert.institutionId).toBe('1-4328901');
    expect(alert.matchingStrategy).toBe('EXACT_PID');
    expect(alert.confidence).toBe('HIGH');
    
    // Semantic comparison result is attached
    expect(alert.semanticComparisons).toBeDefined();
    expect(alert.semanticComparisons!.length).toBe(1);
    expect(alert.semanticComparisons![0].similarityPercentage).toBeGreaterThanOrEqual(70);
    expect(alert.semanticComparisons![0].label).toBe('HIGH_SEMANTIC_SIMILARITY');
  });
});
