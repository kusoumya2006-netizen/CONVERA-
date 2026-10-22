import { CaseRecord, SemanticComparisonResult } from '../types';
import { normalizeInstitutionId, normalizeInstitutionName } from './overlapDetector';

/**
 * CONVERA Domain-Based Similarity Heuristic
 * 
 * Computes heuristic vector representations for complaint descriptions to estimate
 * thematic similarity across concurrent complaints using a predefined domain vocabulary.
 * 
 * IMPORTANT SAFETY CONSTRAINTS:
 * 1. Output is strictly labeled as "SEMANTIC_SIMILARITY" — NOT probability of duplication.
 * 2. Compares descriptions ONLY for candidate cases involving the same institution.
 * 3. Never compares a case with itself (caseId1 !== caseId2).
 * 4. Entirely isolated and optional: if this utility encounters an error or is unavailable,
 *    the rule-based overlap engine continues operating without disruption.
 * 5. Does NOT automatically merge, close, transfer, or dispose of complaints.
 */

export const SEMANTIC_MODEL_NAME = 'CONVERA Domain-Based Similarity Heuristic';
export const SEMANTIC_DISCLAIMER = 'Uses a predefined domain vocabulary to estimate thematic similarity. May miss differently worded complaints outside its vocabulary. Not a duplicate probability; human review required.';

const EMBEDDING_DIM = 32;

// Semantic feature indices in our 32-dimensional embedding space:
// D0 - D5:   Financial Extortion, Capitation Fees, Demands, Refunds, Overcharging
// D6 - D11:  Physical Infrastructure, Labs, Equipment, Safety, Ventilation, Hostels
// D12 - D17: Academic Compliance, Affiliation, Unapproved Courses, Degree Integrity, Faculty
// D18 - D23: Conduct, Harassment, Ragging, Mental Distress, Discrimination, Threat
// D24 - D29: Administrative, Records, Document/Marksheet Withholding, Examination, Compliance Notices
// D30 - D31: Regulatory Urgency & Injunction Markers

type DomainKey = 'FEE' | 'INFRA' | 'ACADEMIC' | 'CONDUCT' | 'ADMIN' | 'URGENCY';

const DOMAIN_SLICES: Record<DomainKey, [number, number]> = {
  FEE: [0, 5],
  INFRA: [6, 11],
  ACADEMIC: [12, 17],
  CONDUCT: [18, 23],
  ADMIN: [24, 29],
  URGENCY: [30, 31]
};

// Distilled semantic anchor weights mapping root tokens to their continuous activation profile
const SEMANTIC_VOCABULARY: Record<string, { domain: DomainKey; weight: number; secondary?: DomainKey; secWeight?: number }> = {
  // Financial & Fee Extortion
  capitation: { domain: 'FEE', weight: 1.0 },
  fee: { domain: 'FEE', weight: 0.95 },
  fees: { domain: 'FEE', weight: 0.95 },
  donation: { domain: 'FEE', weight: 0.9 },
  donations: { domain: 'FEE', weight: 0.9 },
  extortion: { domain: 'FEE', weight: 0.85, secondary: 'CONDUCT', secWeight: 0.3 },
  bribe: { domain: 'FEE', weight: 0.85 },
  money: { domain: 'FEE', weight: 0.75 },
  tuition: { domain: 'FEE', weight: 0.85 },
  overcharging: { domain: 'FEE', weight: 0.9 },
  refund: { domain: 'FEE', weight: 0.9, secondary: 'ADMIN', secWeight: 0.2 },
  penalty: { domain: 'FEE', weight: 0.7 },
  unlawful: { domain: 'FEE', weight: 0.6, secondary: 'ACADEMIC', secWeight: 0.4 },
  illegal: { domain: 'FEE', weight: 0.6, secondary: 'ACADEMIC', secWeight: 0.4 },
  receipt: { domain: 'FEE', weight: 0.7, secondary: 'ADMIN', secWeight: 0.3 },
  cash: { domain: 'FEE', weight: 0.8 },
  cheque: { domain: 'FEE', weight: 0.7 },

  // Physical Infrastructure & Facilities
  infrastructure: { domain: 'INFRA', weight: 1.0 },
  lab: { domain: 'INFRA', weight: 0.95 },
  laboratory: { domain: 'INFRA', weight: 0.95 },
  equipment: { domain: 'INFRA', weight: 0.9 },
  workshop: { domain: 'INFRA', weight: 0.85 },
  hostel: { domain: 'INFRA', weight: 0.85 },
  building: { domain: 'INFRA', weight: 0.8 },
  lathe: { domain: 'INFRA', weight: 0.85 },
  machines: { domain: 'INFRA', weight: 0.8 },
  fire: { domain: 'INFRA', weight: 0.9, secondary: 'URGENCY', secWeight: 0.4 },
  exit: { domain: 'INFRA', weight: 0.75 },
  safety: { domain: 'INFRA', weight: 0.85, secondary: 'URGENCY', secWeight: 0.3 },
  structural: { domain: 'INFRA', weight: 0.85 },
  ventilation: { domain: 'INFRA', weight: 0.8 },
  library: { domain: 'INFRA', weight: 0.75 },
  substandard: { domain: 'INFRA', weight: 0.7, secondary: 'ACADEMIC', secWeight: 0.3 },
  maintenance: { domain: 'INFRA', weight: 0.7 },
  hygiene: { domain: 'INFRA', weight: 0.75 },
  mess: { domain: 'INFRA', weight: 0.75 },

  // Academic & Accreditation Compliance
  affiliation: { domain: 'ACADEMIC', weight: 1.0, secondary: 'ADMIN', secWeight: 0.3 },
  unauthorized: { domain: 'ACADEMIC', weight: 0.95 },
  intake: { domain: 'ACADEMIC', weight: 0.9 },
  approval: { domain: 'ACADEMIC', weight: 0.85 },
  approved: { domain: 'ACADEMIC', weight: 0.8 },
  accreditation: { domain: 'ACADEMIC', weight: 0.9 },
  curriculum: { domain: 'ACADEMIC', weight: 0.85 },
  syllabus: { domain: 'ACADEMIC', weight: 0.85 },
  degree: { domain: 'ACADEMIC', weight: 0.85 },
  diploma: { domain: 'ACADEMIC', weight: 0.85 },
  faculty: { domain: 'ACADEMIC', weight: 0.8 },
  teacher: { domain: 'ACADEMIC', weight: 0.75 },
  teachers: { domain: 'ACADEMIC', weight: 0.75 },
  qualification: { domain: 'ACADEMIC', weight: 0.8 },
  shortage: { domain: 'ACADEMIC', weight: 0.75, secondary: 'INFRA', secWeight: 0.3 },
  quota: { domain: 'ACADEMIC', weight: 0.8, secondary: 'FEE', secWeight: 0.3 },
  seats: { domain: 'ACADEMIC', weight: 0.8 },

  // Grievance, Harassment & Conduct
  harassment: { domain: 'CONDUCT', weight: 1.0, secondary: 'URGENCY', secWeight: 0.3 },
  ragging: { domain: 'CONDUCT', weight: 1.0, secondary: 'URGENCY', secWeight: 0.4 },
  discriminatory: { domain: 'CONDUCT', weight: 0.9 },
  discrimination: { domain: 'CONDUCT', weight: 0.9 },
  caste: { domain: 'CONDUCT', weight: 0.9 },
  gender: { domain: 'CONDUCT', weight: 0.85 },
  threat: { domain: 'CONDUCT', weight: 0.85, secondary: 'URGENCY', secWeight: 0.3 },
  mental: { domain: 'CONDUCT', weight: 0.8 },
  agony: { domain: 'CONDUCT', weight: 0.8 },
  abusive: { domain: 'CONDUCT', weight: 0.85 },
  victim: { domain: 'CONDUCT', weight: 0.8 },
  retaliation: { domain: 'CONDUCT', weight: 0.85 },

  // Administrative & Document Withholding
  withholding: { domain: 'ADMIN', weight: 1.0 },
  withheld: { domain: 'ADMIN', weight: 1.0 },
  certificate: { domain: 'ADMIN', weight: 0.95 },
  certificates: { domain: 'ADMIN', weight: 0.95 },
  marksheet: { domain: 'ADMIN', weight: 0.9 },
  marksheets: { domain: 'ADMIN', weight: 0.9 },
  original: { domain: 'ADMIN', weight: 0.85 },
  documents: { domain: 'ADMIN', weight: 0.8 },
  transfer: { domain: 'ADMIN', weight: 0.8 },
  notice: { domain: 'ADMIN', weight: 0.7, secondary: 'URGENCY', secWeight: 0.3 },
  compliance: { domain: 'ADMIN', weight: 0.75 },
  inspection: { domain: 'ADMIN', weight: 0.75, secondary: 'URGENCY', secWeight: 0.2 },
  hearing: { domain: 'ADMIN', weight: 0.7 }
};

/**
 * Generates an orthogonal 32D dense vector embedding for a vocabulary token
 */
function createTokenVector(tokenInfo: { domain: DomainKey; weight: number; secondary?: DomainKey; secWeight?: number }): number[] {
  const vec = new Array(EMBEDDING_DIM).fill(0);
  const [start, end] = DOMAIN_SLICES[tokenInfo.domain];
  const span = end - start + 1;
  const valPerDim = tokenInfo.weight / Math.sqrt(span);

  for (let i = start; i <= end; i++) {
    vec[i] = valPerDim;
  }

  if (tokenInfo.secondary && tokenInfo.secWeight) {
    const [secStart, secEnd] = DOMAIN_SLICES[tokenInfo.secondary];
    const secSpan = secEnd - secStart + 1;
    const secVal = tokenInfo.secWeight / Math.sqrt(secSpan);
    for (let i = secStart; i <= secEnd; i++) {
      vec[i] += secVal;
    }
  }

  // Normalize to unit vector
  let normSq = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) normSq += vec[i] * vec[i];
  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) vec[i] /= norm;
  }
  return vec;
}

// Pre-computed vector lookup table
const VECTOR_CACHE = new Map<string, number[]>();
for (const [token, info] of Object.entries(SEMANTIC_VOCABULARY)) {
  VECTOR_CACHE.set(token, createTokenVector(info));
}

/**
 * Clean & tokenize incoming complaint text into normalized tokens
 */
export function tokenizeComplaintText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Encodes complaint description text into a unit-normalized 32-dimensional dense embedding
 */
export function embedComplaintText(text: string): number[] {
  const tokens = tokenizeComplaintText(text);
  const aggregate = new Array(EMBEDDING_DIM).fill(0);
  let activeTokens = 0;

  for (const token of tokens) {
    let vec = VECTOR_CACHE.get(token);
    if (!vec) {
      // Substring/stem fallback (e.g., "extortions" -> "extortion")
      for (const [key, cachedVec] of VECTOR_CACHE.entries()) {
        if (token.startsWith(key) || key.startsWith(token)) {
          vec = cachedVec;
          break;
        }
      }
    }

    if (vec) {
      activeTokens++;
      for (let i = 0; i < EMBEDDING_DIM; i++) {
        aggregate[i] += vec[i];
      }
    }
  }

  if (activeTokens === 0) {
    // Return zero vector if no semantic anchor tokens found
    return aggregate;
  }

  // Normalize aggregate to unit sphere
  let normSq = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) normSq += aggregate[i] * aggregate[i];
  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      aggregate[i] /= norm;
    }
  }

  return aggregate;
}

/**
 * Computes cosine similarity between two unit vectors
 */
export function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}

/**
 * Compares two complaint descriptions and returns semantic similarity metrics
 */
export function compareComplaintDescriptions(descA: string, descB: string): {
  similarity: number;
  similarityPercentage: number;
  label: 'HIGH_SEMANTIC_SIMILARITY' | 'MODERATE_SEMANTIC_SIMILARITY' | 'LOW_SEMANTIC_SIMILARITY';
  interpretation: string;
} {
  const vecA = embedComplaintText(descA);
  const vecB = embedComplaintText(descB);

  // If either text had zero recognizable semantic features, report low similarity
  const isNormAZero = vecA.every(v => v === 0);
  const isNormBZero = vecB.every(v => v === 0);

  if (isNormAZero || isNormBZero) {
    return {
      similarity: 0.0,
      similarityPercentage: 0,
      label: 'LOW_SEMANTIC_SIMILARITY',
      interpretation: 'Insufficient domain semantic vocabulary to establish thematic correlation.'
    };
  }

  const rawSim = computeCosineSimilarity(vecA, vecB);
  const roundedSim = Math.round(rawSim * 100) / 100;
  const percentage = Math.round(roundedSim * 100);

  let label: 'HIGH_SEMANTIC_SIMILARITY' | 'MODERATE_SEMANTIC_SIMILARITY' | 'LOW_SEMANTIC_SIMILARITY';
  let interpretation: string;

  if (roundedSim >= 0.70) {
    label = 'HIGH_SEMANTIC_SIMILARITY';
    interpretation = `Strong semantic thematic alignment (${percentage}%). Descriptions express closely related grievance themes in vector space.`;
  } else if (roundedSim >= 0.40) {
    label = 'MODERATE_SEMANTIC_SIMILARITY';
    interpretation = `Moderate semantic overlap (${percentage}%). Descriptions share common institutional themes but may involve distinct particulars.`;
  } else {
    label = 'LOW_SEMANTIC_SIMILARITY';
    interpretation = `Low semantic thematic correlation (${percentage}%). Descriptions point to substantively distinct grievance topics.`;
  }

  return {
    similarity: roundedSim,
    similarityPercentage: percentage,
    label,
    interpretation
  };
}

/**
 * Compares two candidate CaseRecords.
 * Strictly verifies:
 * 1. caseA.caseId !== caseB.caseId (never compares a case with itself)
 * 2. Cases involve the same institution (ID or normalized name)
 */
export function compareCandidateCases(caseA: CaseRecord, caseB: CaseRecord): SemanticComparisonResult {
  if (caseA.caseId === caseB.caseId) {
    throw new Error(`Self-comparison rejected: case [${caseA.caseId}] cannot be compared with itself.`);
  }

  const normIdA = normalizeInstitutionId(caseA.institutionId);
  const normIdB = normalizeInstitutionId(caseB.institutionId);
  const idMatches = normIdA && normIdB && normIdA === normIdB;

  const normNameA = normalizeInstitutionName(caseA.institutionName);
  const normNameB = normalizeInstitutionName(caseB.institutionName);
  const nameMatches = normNameA && normNameB && normNameA === normNameB;

  if (!idMatches && !nameMatches) {
    throw new Error(`Institution mismatch: cannot semantically compare complaints for differing institutions ([${caseA.institutionId || caseA.institutionName}] vs [${caseB.institutionId || caseB.institutionName}]).`);
  }

  const comparison = compareComplaintDescriptions(caseA.description, caseB.description);

  return {
    caseId1: caseA.caseId,
    caseId2: caseB.caseId,
    semanticSimilarity: comparison.similarity,
    similarityPercentage: comparison.similarityPercentage,
    label: comparison.label,
    interpretation: comparison.interpretation,
    scoreType: 'SEMANTIC_SIMILARITY',
    disclaimer: SEMANTIC_DISCLAIMER,
    modelName: SEMANTIC_MODEL_NAME
  };
}

/**
 * Computes semantic comparisons for all pairs of candidate cases in an overlap group
 */
export function computeAlertSemanticComparisons(cases: CaseRecord[]): SemanticComparisonResult[] {
  if (!cases || cases.length < 2) return [];

  const results: SemanticComparisonResult[] = [];

  for (let i = 0; i < cases.length; i++) {
    for (let j = i + 1; j < cases.length; j++) {
      try {
        const result = compareCandidateCases(cases[i], cases[j]);
        results.push(result);
      } catch (err) {
        // Individual pair failure is gracefully skipped
        console.warn('Semantic candidate comparison skipped:', err);
      }
    }
  }

  return results;
}

/**
 * Health check reporting model availability
 */
export function isSemanticComparatorAvailable(): boolean {
  return VECTOR_CACHE.size > 0;
}
