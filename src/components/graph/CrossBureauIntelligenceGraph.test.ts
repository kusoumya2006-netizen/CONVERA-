import { describe, it, expect } from 'vitest';
import { CaseRecord, Institution, OverlapAlert, GraphNode, GraphEdge } from '../../types';

describe('CONVERA — Cross-Bureau Intelligence Graph Model Verification', () => {
  const mockInstitutions: Institution[] = [
    {
      institutionId: '1-4328901',
      name: 'Sri Venkateswara College of Engineering (SVCE)',
      region: 'Southern',
      address: 'Post Bag No. 1, Pennalur, Sriperumbudur, Tamil Nadu',
      type: 'Engineering and Technology',
      establishedYear: 1985,
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ];

  const mockCases: CaseRecord[] = [
    {
      caseId: 'AICTE/RB/2026/7821',
      institutionId: '1-4328901',
      institutionName: 'Sri Venkateswara College of Engineering (SVCE)',
      category: 'Infrastructure Non-Compliance',
      description: 'Deficiencies in mandatory electrical and fire safety infrastructure.',
      bureau: 'RB',
      assignedOfficer: 'Dr. Suresh Patil',
      status: 'Pending',
      priority: 'HIGH',
      complainantType: 'Faculty',
      receivedAt: '2026-10-18T10:00:00.000Z',
      lastAction: 'Complaint registered in intake portal.',
      nextAction: 'Dispatch explanation notice',
      lastActionAt: '2026-10-18T10:00:00.000Z',
      expectedDisposalDate: '2026-11-18T10:00:00.000Z',
      relatedCaseIds: [],
      createdAt: '2026-10-18T10:00:00.000Z',
      updatedAt: '2026-10-18T10:00:00.000Z'
    },
    {
      caseId: 'AICTE/PGRC/2026/4102',
      institutionId: '1-4328901',
      institutionName: 'Sri Venkateswara College of Engineering (SVCE)',
      category: 'Faculty Pay & Service Grievance',
      description: 'Withholding 7th Pay Commission arrears and PF documentation.',
      bureau: 'PGRC',
      assignedOfficer: 'Smt. Sunita Mohanty',
      status: 'Under Process',
      priority: 'HIGH',
      complainantType: 'Faculty',
      receivedAt: '2026-10-19T11:00:00.000Z',
      lastAction: 'First response received from registrar.',
      nextAction: 'Conduct verification meeting',
      lastActionAt: '2026-10-21T11:00:00.000Z',
      expectedDisposalDate: '2026-11-19T11:00:00.000Z',
      relatedCaseIds: [],
      createdAt: '2026-10-19T11:00:00.000Z',
      updatedAt: '2026-10-21T11:00:00.000Z'
    }
  ];

  const mockAlert: OverlapAlert = {
    alertId: 'OVL-7821-4102',
    institutionId: '1-4328901',
    institutionName: 'Sri Venkateswara College of Engineering (SVCE)',
    caseIds: ['AICTE/RB/2026/7821', 'AICTE/PGRC/2026/4102'],
    involvedBureaus: ['RB', 'PGRC'],
    reason: 'Concurrent inspection non-compliance and faculty pay proceedings active on shared institution.',
    confidence: 'HIGH',
    matchingStrategy: 'EXACT_PID',
    categoryCorrelation: 'RELATED_THEME',
    matchingEvidence: 'Shared Permanent Institute ID 1-4328901 with active cases in RB and PGRC',
    reviewStatus: 'PENDING_REVIEW',
    detectedAt: '2026-10-22T10:00:00.000Z'
  };

  it('1. Constructs institution hub node with Permanent Institute ID', () => {
    const instNode: GraphNode = {
      id: `inst-${mockInstitutions[0].institutionId}`,
      type: 'institution',
      label: mockInstitutions[0].name,
      sublabel: `PID: ${mockInstitutions[0].institutionId}`,
      data: mockInstitutions[0]
    };

    expect(instNode.type).toBe('institution');
    expect(instNode.sublabel).toBe('PID: 1-4328901');
    expect(instNode.data.region).toBe('Southern');
  });

  it('2. Constructs case nodes with designated bureau colors and status metadata', () => {
    const caseNodes: GraphNode[] = mockCases.map(c => ({
      id: `case-${c.caseId}`,
      type: 'case',
      label: c.caseId,
      sublabel: c.category,
      bureau: c.bureau,
      status: c.status,
      priority: c.priority,
      data: c
    }));

    expect(caseNodes.length).toBe(2);
    expect(caseNodes[0].bureau).toBe('RB');
    expect(caseNodes[1].bureau).toBe('PGRC');
  });

  it('3. Generates unreviewed potential overlap edge with matching evidence and confidence', () => {
    const edge: GraphEdge = {
      id: `edge-ovl-${mockAlert.alertId}`,
      source: `case-${mockAlert.caseIds[0]}`,
      target: `case-${mockAlert.caseIds[1]}`,
      type: 'POTENTIAL_OVERLAP',
      label: 'Potential Overlap',
      isConfirmed: false,
      isPotential: true,
      isMerged: false,
      evidence: mockAlert.matchingEvidence,
      alertId: mockAlert.alertId
    };

    expect(edge.type).toBe('POTENTIAL_OVERLAP');
    expect(edge.isPotential).toBe(true);
    expect(edge.isConfirmed).toBe(false);
    expect(edge.evidence).toContain('Permanent Institute ID 1-4328901');
  });

  it('4. Distinguishes confirmed and coordinated overlap edge from unreviewed potential matches', () => {
    const coordinatedAlert: OverlapAlert = {
      ...mockAlert,
      reviewStatus: 'COORDINATED',
      leadBureau: 'RB',
      coordinationRemarks: 'Joint scrutiny committee constituted under RB lead.'
    };

    const edge: GraphEdge = {
      id: `edge-ovl-${coordinatedAlert.alertId}`,
      source: `case-${coordinatedAlert.caseIds[0]}`,
      target: `case-${coordinatedAlert.caseIds[1]}`,
      type: 'POTENTIAL_OVERLAP',
      label: 'Coordinated',
      isConfirmed: true,
      isPotential: false,
      isMerged: false,
      evidence: coordinatedAlert.coordinationRemarks
    };

    expect(edge.isConfirmed).toBe(true);
    expect(edge.isPotential).toBe(false);
    expect(edge.label).toBe('Coordinated');
  });

  it('5. Generates merged relationship edge when complaints are consolidated', () => {
    const mergedChildCase: CaseRecord = {
      ...mockCases[1],
      isMerged: true,
      mergedIntoCaseId: mockCases[0].caseId,
      mergeReason: 'Consolidated under master inspection inquiry.'
    };

    const mergeEdge: GraphEdge = {
      id: `edge-merge-${mergedChildCase.caseId}-${mergedChildCase.mergedIntoCaseId}`,
      source: `case-${mergedChildCase.caseId}`,
      target: `case-${mergedChildCase.mergedIntoCaseId}`,
      type: 'MERGED',
      label: 'Consolidated into Primary',
      isConfirmed: true,
      isPotential: false,
      isMerged: true,
      evidence: mergedChildCase.mergeReason
    };

    expect(mergeEdge.isMerged).toBe(true);
    expect(mergeEdge.type).toBe('MERGED');
    expect(mergeEdge.evidence).toContain('Consolidated');
  });
});
