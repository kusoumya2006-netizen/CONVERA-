import { CaseRecord, Institution, OverlapAlert } from '../types';

function escapeCsvCell(cell: unknown): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  // If cell contains comma, newline or double quotes, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function exportCasesToCsv(cases: CaseRecord[], filename = 'casewatch_cases_registry.csv'): void {
  const headers = [
    'Case ID',
    'Permanent Institution ID',
    'Institution Name',
    'Bureau / Cell',
    'Category',
    'Current Status',
    'Priority',
    'Complainant Type',
    'Received Date',
    'Expected Disposal Date',
    'Assigned Officer',
    'Last Action Taken',
    'Next Required Action',
    'Related Cases Count'
  ];

  const rows = cases.map(c => [
    c.caseId,
    c.institutionId,
    c.institutionName || '',
    c.bureau,
    c.category,
    c.status,
    c.priority,
    c.complainantType,
    c.receivedAt ? c.receivedAt.split('T')[0] : '',
    c.expectedDisposalDate ? c.expectedDisposalDate.split('T')[0] : '',
    c.assignedOfficer,
    c.lastAction,
    c.nextAction,
    c.relatedCaseIds.length
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(','))
  ].join('\r\n');

  downloadCsvFile(csvContent, filename);
}

export function exportOverlapsToCsv(alerts: OverlapAlert[], filename = 'casewatch_overlap_alerts.csv'): void {
  const headers = [
    'Alert ID',
    'Institution ID',
    'Institution Name',
    'Involved Bureaus',
    'Confidence',
    'Review Status',
    'Detected Date',
    'Involved Case IDs',
    'Alert Reason',
    'Coordination Remarks'
  ];

  const rows = alerts.map(a => [
    a.alertId,
    a.institutionId,
    a.institutionName,
    a.involvedBureaus.join(' + '),
    a.confidence,
    a.reviewStatus,
    a.detectedAt ? a.detectedAt.split('T')[0] : '',
    a.caseIds.join('; '),
    a.reason,
    a.coordinationRemarks || 'Pending Review'
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(','))
  ].join('\r\n');

  downloadCsvFile(csvContent, filename);
}

function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
