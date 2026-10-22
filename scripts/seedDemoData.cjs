const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Safely resolve Supabase credentials from environment or local .env file
function getEnvConfig() {
  const env = { ...process.env };
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!env[key]) env[key] = value;
      }
    }
  }
  return {
    url: env.VITE_SUPABASE_URL || env.SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY
  };
}

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getEnvConfig();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
  process.exit(1);
}

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function daysAgo(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

const DEMO_CASES = [
  // 1. SVCE (1-4328901) - Disposed within last 14 days
  {
    case_id: 'AICTE-RB-2026-0312',
    institution_id: '1-4328901',
    institution_name: 'Sri Venkateswara College of Engineering (SVCE)',
    category: 'Infrastructure Non-Compliance',
    description: '[DEMO SEED] Verification of renewable energy laboratory facility compliance with AICTE research grant allocation norms.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Disposed',
    priority: 'LOW',
    complainant_type: 'Regulatory Agency',
    received_at: daysAgo(35),
    last_action: 'Physical lab inspection confirmed compliance with all norms; completion certificate filed',
    next_action: 'Case Closed',
    last_action_at: daysAgo(3),
    expected_disposal_date: daysFromNow(25),
    related_case_ids: [],
    created_at: daysAgo(35),
    updated_at: daysAgo(3),
    completed_at: daysAgo(3),
    completed_by: 'Dr. Suresh Patil (Director RB)',
    completed_by_officer_id: 'aicte-officer-rb',
    resolution_summary: 'Physical lab inspection confirmed compliance with all norms; completion certificate filed successfully.',
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 2. Apex (1-4392811) - Pending scrutiny (Triggering Overlap with PGRC-0145 and RB-0112)
  {
    case_id: 'AICTE-PGRC-2026-0047',
    institution_id: '1-4392811',
    institution_name: 'Apex Institute of Technology & Engineering',
    category: 'Withholding Original Certificates',
    description: '[DEMO SEED] Final-year engineering graduates report management is withholding provisional certificates demanding unapproved development fee.',
    bureau: 'PGRC',
    assigned_officer: 'Smt. Sunita Mohanty (Director PGRC)',
    status: 'Pending',
    priority: 'HIGH',
    complainant_type: 'Student',
    received_at: daysAgo(14),
    last_action: 'Advisory letter issued seeking explanation within 7 working days',
    next_action: 'Summon management representative for conciliation hearing',
    last_action_at: daysAgo(4),
    expected_disposal_date: daysFromNow(16),
    related_case_ids: ['AICTE-RB-2026-0112'],
    created_at: daysAgo(14),
    updated_at: daysAgo(4),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 3. Vidyapeeth (1-8923412) - Under Process (RB side of overlap cluster)
  {
    case_id: 'AICTE-RB-2026-0088',
    institution_id: '1-8923412',
    institution_name: 'Vidyapeeth College of Engineering & Research',
    category: 'Infrastructure Non-Compliance',
    description: '[DEMO SEED] Surprise inspection found 42% faculty deficiency against mandatory Cadre Ratio (1:15) and phantom faculties listed on portal.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Under Process',
    priority: 'HIGH',
    complainant_type: 'Regulatory Agency',
    received_at: daysAgo(28),
    last_action: 'Deficiency report submitted by Surprise Inspection Committee',
    next_action: 'Convening Standing Appellate Committee (SAC) hearing',
    last_action_at: daysAgo(5),
    expected_disposal_date: daysFromNow(20),
    related_case_ids: ['AICTE-PGRC-2026-0029'],
    created_at: daysAgo(28),
    updated_at: daysAgo(5),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 4. Vidyapeeth (1-8923412) - Under Process (PGRC side of overlap cluster)
  {
    case_id: 'AICTE-PGRC-2026-0029',
    institution_id: '1-8923412',
    institution_name: 'Vidyapeeth College of Engineering & Research',
    category: 'Faculty Pay & Service Grievance',
    description: '[DEMO SEED] 18 Assistant Professors filed joint grievance regarding 6 months withheld salary arrears and unauthorized deductions without EPFO deposit.',
    bureau: 'PGRC',
    assigned_officer: 'Smt. Sunita Mohanty (Director PGRC)',
    status: 'Under Process',
    priority: 'CRITICAL',
    complainant_type: 'Faculty',
    received_at: daysAgo(21),
    last_action: 'Interim directive issued to management to deposit undisputed pay component immediately',
    next_action: 'Joint conciliation hearing with Regional Officer and EPFO Commissioner',
    last_action_at: daysAgo(2),
    expected_disposal_date: daysFromNow(12),
    related_case_ids: ['AICTE-RB-2026-0088'],
    created_at: daysAgo(21),
    updated_at: daysAgo(2),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 5. Kalinga (1-6712390) - RB side
  {
    case_id: 'AICTE-RB-2026-0121',
    institution_id: '1-6712390',
    institution_name: 'Kalinga Institute of Science & Applied Tech',
    category: 'Substandard Lab / Workshop Equipment',
    description: '[DEMO SEED] Inspection committee reported non-operational CAD/CAM and High Voltage laboratories in violation of curriculum guidelines.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Under Process',
    priority: 'MEDIUM',
    complainant_type: 'Student',
    received_at: daysAgo(20),
    last_action: 'Notice issued granting 30 calendar days for equipment procurement proof',
    next_action: 'Verification of GST purchase invoices and physical video feed',
    last_action_at: daysAgo(7),
    expected_disposal_date: daysFromNow(22),
    related_case_ids: ['AICTE-PGRC-2026-0063'],
    created_at: daysAgo(20),
    updated_at: daysAgo(7),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 6. Kalinga (1-6712390) - PGRC side (Pending scrutiny)
  {
    case_id: 'AICTE-PGRC-2026-0063',
    institution_id: '1-6712390',
    institution_name: 'Kalinga Institute of Science & Applied Tech',
    category: 'Capitation Fee Allegation',
    description: '[DEMO SEED] Parent association lodged complaint regarding compulsory ₹1,50,000 "Campus Infrastructure Cess" billed outside approved fee structure.',
    bureau: 'PGRC',
    assigned_officer: 'Smt. Sunita Mohanty (Director PGRC)',
    status: 'Pending',
    priority: 'HIGH',
    complainant_type: 'Parent',
    received_at: daysAgo(15),
    last_action: 'Sent notice seeking audited fee schedule and bank transaction records',
    next_action: 'Escalate to State Fee Regulatory Committee if reply not received',
    last_action_at: daysAgo(6),
    expected_disposal_date: daysFromNow(18),
    related_case_ids: ['AICTE-RB-2026-0121'],
    created_at: daysAgo(15),
    updated_at: daysAgo(6),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 7. Dravida (1-5521904) - OVERDUE SLA by 10 days!
  {
    case_id: 'AICTE-RB-2025-0742',
    institution_id: '1-5521904',
    institution_name: 'Dravida Polytechnic & Technical Campus',
    category: 'Affiliation & Land Discrepancy',
    description: '[DEMO SEED] Dispute regarding mortgaged institutional land parcel cited for obtaining initial AICTE approval in 2012.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Under Process',
    priority: 'CRITICAL',
    complainant_type: 'Anonymous',
    received_at: daysAgo(90),
    last_action: 'Revenue records requisitioned from District Collectorate; overdue for compliance',
    next_action: 'Final show-cause for withdrawal of approved intake',
    last_action_at: daysAgo(25),
    expected_disposal_date: daysAgo(10), // Overdue!
    related_case_ids: [],
    created_at: daysAgo(90),
    updated_at: daysAgo(25),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 8. Himalayan (1-3382910) - OVERDUE SLA by 5 days! (Pending)
  {
    case_id: 'AICTE-PGRC-2025-0819',
    institution_id: '1-3382910',
    institution_name: 'Himalayan Institute of Pharmaceutical Sciences',
    category: 'Harassment / Discriminatory Conduct',
    description: '[DEMO SEED] Postgraduate scholars report intimidation and refusal to allocate project thesis guides by Department Head.',
    bureau: 'PGRC',
    assigned_officer: 'Smt. Sunita Mohanty (Director PGRC)',
    status: 'Pending',
    priority: 'HIGH',
    complainant_type: 'Student',
    received_at: daysAgo(75),
    last_action: 'Internal Complaints Committee enquiry report awaited beyond statutory timeframe',
    next_action: 'Issue summons for personal appearance of HOD and Principal',
    last_action_at: daysAgo(20),
    expected_disposal_date: daysAgo(5), // Overdue!
    related_case_ids: [],
    created_at: daysAgo(75),
    updated_at: daysAgo(20),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 9. Deccan (1-8820194) - Disposed within last 14 days
  {
    case_id: 'AICTE-PGRC-2026-0501',
    institution_id: '1-8820194',
    institution_name: 'Deccan Institute of Pharmacy & Health Sciences',
    category: 'Withholding Original Certificates',
    description: '[DEMO SEED] B.Pharm student complained regarding withheld security deposit and migration certificate post degree completion.',
    bureau: 'PGRC',
    assigned_officer: 'Smt. Sunita Mohanty (Director PGRC)',
    status: 'Disposed',
    priority: 'LOW',
    complainant_type: 'Student',
    received_at: daysAgo(40),
    last_action: 'Full caution deposit refunded with interest and migration certificate dispatched',
    next_action: 'Case Closed',
    last_action_at: daysAgo(5),
    expected_disposal_date: daysFromNow(10),
    related_case_ids: [],
    created_at: daysAgo(40),
    updated_at: daysAgo(5),
    completed_at: daysAgo(5),
    completed_by: 'Smt. Sunita Mohanty (Director PGRC)',
    completed_by_officer_id: 'aicte-officer-pgrc',
    resolution_summary: 'Security deposit of ₹25,000 refunded to complainant via NEFT; migration NOC issued.',
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 10. Punjab (1-4472819) - Disposed within last 14 days
  {
    case_id: 'AICTE-PGRC-2026-0733',
    institution_id: '1-4472819',
    institution_name: 'Punjab Technical & Polytechnic Institute',
    category: 'Faculty Pay & Service Grievance',
    description: '[DEMO SEED] Non-payment of revised DA allowances and provident fund matching contribution for diploma faculty.',
    bureau: 'PGRC',
    assigned_officer: 'Smt. Sunita Mohanty (Director PGRC)',
    status: 'Disposed',
    priority: 'MEDIUM',
    complainant_type: 'Faculty',
    received_at: daysAgo(48),
    last_action: 'Management deposited arrears into institutional joint escrow account',
    next_action: 'Archived',
    last_action_at: daysAgo(9),
    expected_disposal_date: daysFromNow(15),
    related_case_ids: [],
    created_at: daysAgo(48),
    updated_at: daysAgo(9),
    completed_at: daysAgo(9),
    completed_by: 'Smt. Sunita Mohanty (Director PGRC)',
    completed_by_officer_id: 'aicte-officer-pgrc',
    resolution_summary: 'Management submitted bank reconciliation proof for ₹14.8 Lakhs salary arrears settlement.',
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 11. Malwa (1-9923841) - REOPENED CASE
  {
    case_id: 'AICTE-RB-2026-0402',
    institution_id: '1-9923841',
    institution_name: 'Malwa Institute of Technology and Management',
    category: 'Capitation Fee Allegation',
    description: '[DEMO SEED] Management quota donation complaints previously closed upon college affidavit, now reopened on new audit disclosures.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Under Process',
    priority: 'CRITICAL',
    complainant_type: 'Parent',
    received_at: daysAgo(60),
    last_action: 'Case reopened from Disposed status following bank whistle-blower disclosures',
    next_action: 'Convene Special Inquiry Committee for forensic financial audit',
    last_action_at: daysAgo(2),
    expected_disposal_date: daysFromNow(28),
    related_case_ids: [],
    created_at: daysAgo(60),
    updated_at: daysAgo(2),
    completed_at: daysAgo(20),
    completed_by: 'Dr. Suresh Patil (Director RB)',
    completed_by_officer_id: 'aicte-officer-rb',
    resolution_summary: 'Initial complaint dropped based on written management undertaking.',
    reopened_at: daysAgo(2),
    reopened_by: 'Dr. Suresh Patil (Director RB)',
    reopen_reason: 'Whistle-blower presented bank ledger showing cash transactions routed via trust subsidiary.',
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 12. Ramdeobaba (1-7782193) - MERGED PRIMARY LEAD CASE
  {
    case_id: 'AICTE-RB-2026-0201',
    institution_id: '1-7782193',
    institution_name: 'Shri Ramdeobaba Engineering Academy',
    category: 'Unlawful Fee Demands',
    description: '[DEMO SEED] Primary lead complaint regarding mandatory ₹40,000 campus placement fee charged in final semester.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Under Process',
    priority: 'HIGH',
    complainant_type: 'Student',
    received_at: daysAgo(22),
    last_action: 'Consolidated child case AICTE-RB-2026-0202 merged into this lead dossier',
    next_action: 'Issue joint show-cause directive covering all aggregated grievances',
    last_action_at: daysAgo(3),
    expected_disposal_date: daysFromNow(25),
    related_case_ids: ['AICTE-RB-2026-0202'],
    created_at: daysAgo(22),
    updated_at: daysAgo(3),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: ['AICTE-RB-2026-0202'],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 13. Ramdeobaba (1-7782193) - MERGED CHILD CASE
  {
    case_id: 'AICTE-RB-2026-0202',
    institution_id: '1-7782193',
    institution_name: 'Shri Ramdeobaba Engineering Academy',
    category: 'Unlawful Fee Demands',
    description: '[DEMO SEED] Secondary complaint by student council alleging identical placement training surcharge.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Under Process',
    priority: 'HIGH',
    complainant_type: 'Student',
    received_at: daysAgo(18),
    last_action: 'Consolidated & merged into primary complaint AICTE-RB-2026-0201',
    next_action: 'Governed under proceedings of primary case AICTE-RB-2026-0201',
    last_action_at: daysAgo(3),
    expected_disposal_date: daysFromNow(25),
    related_case_ids: ['AICTE-RB-2026-0201'],
    created_at: daysAgo(18),
    updated_at: daysAgo(3),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: true,
    merged_into_case_id: 'AICTE-RB-2026-0201',
    merged_case_ids: [],
    merged_at: daysAgo(3),
    merged_by: 'Dr. Suresh Patil (Director RB)',
    merge_reason: 'Identical subject matter and factual basis; consolidated to avoid concurrent proceedings.'
  },

  // 14. Brahmaputra (1-2291048) - ESCALATED CASE
  {
    case_id: 'AICTE-RB-2026-0099',
    institution_id: '1-2291048',
    institution_name: 'Brahmaputra Engineering & Management College',
    category: 'Affiliation & Land Discrepancy',
    description: '[DEMO SEED] Construction of unauthorized commercial complex on campus land approved exclusively for technical education.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Escalated',
    priority: 'CRITICAL',
    complainant_type: 'Anonymous',
    received_at: daysAgo(30),
    last_action: 'Case escalated for high-level regulatory intervention to Member Secretary AICTE',
    next_action: 'Coordinate with State Urban Development Authority for demolition / sealing notice',
    last_action_at: daysAgo(1),
    expected_disposal_date: daysFromNow(14),
    related_case_ids: [],
    created_at: daysAgo(30),
    updated_at: daysAgo(1),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 15. Marathwada (1-8841029) - TRANSFERRED CASE
  {
    case_id: 'AICTE-PGRC-2026-0188',
    institution_id: '1-8841029',
    institution_name: 'Marathwada Rural Polytechnic College',
    category: 'Substandard Lab / Workshop Equipment',
    description: '[DEMO SEED] Mechanical engineering students petition regarding obsolete CNC lathe machines and absent safety gear.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Transferred',
    priority: 'MEDIUM',
    complainant_type: 'Student',
    received_at: daysAgo(25),
    last_action: 'Jurisdiction transferred from PGRC to RB for technical infrastructure inspection',
    next_action: 'Constitute regional inspection committee',
    last_action_at: daysAgo(4),
    expected_disposal_date: daysFromNow(26),
    related_case_ids: [],
    created_at: daysAgo(25),
    updated_at: daysAgo(4),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 16. Sardar Vallabhbhai (1-1192847) - Under Process CRITICAL
  {
    case_id: 'AICTE-PGRC-2026-0230',
    institution_id: '1-1192847',
    institution_name: 'Sardar Vallabhbhai Institute of Applied Technology',
    category: 'Harassment / Discriminatory Conduct',
    description: '[DEMO SEED] Caste-based discriminatory grading allegations in postgraduate project evaluation.',
    bureau: 'PGRC',
    assigned_officer: 'Smt. Sunita Mohanty (Director PGRC)',
    status: 'Under Process',
    priority: 'CRITICAL',
    complainant_type: 'Student',
    received_at: daysAgo(12),
    last_action: 'Special inquiry officer appointed; principal requested to ensure student safety',
    next_action: 'Submission of interim report within 10 days',
    last_action_at: daysAgo(2),
    expected_disposal_date: daysFromNow(18),
    related_case_ids: [],
    created_at: daysAgo(12),
    updated_at: daysAgo(2),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  },

  // 17. Chola (1-6638291) - Pending Scrutiny HIGH
  {
    case_id: 'AICTE-RB-2026-0275',
    institution_id: '1-6638291',
    institution_name: 'Chola Institute of Management Studies',
    category: 'Capitation Fee Allegation',
    description: '[DEMO SEED] PGDM entrance batch reports mandatory ₹2,00,000 sponsorship fee for foreign immersion module.',
    bureau: 'RB',
    assigned_officer: 'Dr. Suresh Patil (Director RB)',
    status: 'Pending',
    priority: 'HIGH',
    complainant_type: 'Parent',
    received_at: daysAgo(8),
    last_action: 'Directive issued to suspend collection pending fee regulatory audit',
    next_action: 'Scrutinize brochure disclosures and bank slips',
    last_action_at: daysAgo(2),
    expected_disposal_date: daysFromNow(22),
    related_case_ids: [],
    created_at: daysAgo(8),
    updated_at: daysAgo(2),
    completed_at: null,
    completed_by: null,
    completed_by_officer_id: null,
    resolution_summary: null,
    reopened_at: null,
    reopened_by: null,
    reopen_reason: null,
    is_merged: false,
    merged_into_case_id: null,
    merged_case_ids: [],
    merged_at: null,
    merged_by: null,
    merge_reason: null
  }
];

const DEMO_ACTIONS = [
  { action_id: 'ACT-010', case_id: 'AICTE-RB-2026-0312', action_type: 'CASE_FILED', remarks: 'Verification of renewable energy grant facilities logged into RB portal.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(35) },
  { action_id: 'ACT-011', case_id: 'AICTE-RB-2026-0312', action_type: 'COMMITTEE_INSPECTION', remarks: 'Inspection team confirmed all equipment commissioned and operational.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(10) },
  { action_id: 'ACT-012', case_id: 'AICTE-RB-2026-0312', action_type: 'CASE_DISPOSED', remarks: 'Physical lab inspection confirmed compliance with all norms; completion certificate filed successfully.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(3) },

  { action_id: 'ACT-020', case_id: 'AICTE-PGRC-2026-0047', action_type: 'CASE_FILED', remarks: 'Certificate withholding petition registered by final-year students.', bureau: 'PGRC', officer: 'Smt. Sunita Mohanty', timestamp: daysAgo(14) },
  { action_id: 'ACT-021', case_id: 'AICTE-PGRC-2026-0047', action_type: 'NOTICE_ISSUED', remarks: 'Show-cause notice served on Apex Institute Registrar.', bureau: 'PGRC', officer: 'Smt. Sunita Mohanty', timestamp: daysAgo(4) },

  { action_id: 'ACT-030', case_id: 'AICTE-RB-2026-0088', action_type: 'CASE_FILED', remarks: 'Surprise EVC faculty deficiency report logged into Regulation Bureau.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(28) },
  { action_id: 'ACT-031', case_id: 'AICTE-RB-2026-0088', action_type: 'NOTICE_ISSUED', remarks: 'Deficiency notice served to Vidyapeeth College management.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(15) },
  { action_id: 'ACT-032', case_id: 'AICTE-RB-2026-0088', action_type: 'INTER_BUREAU_COORDINATED', remarks: 'Cross-bureau overlap linked with pending faculty salary grievance AICTE-PGRC-2026-0029.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(5) },

  { action_id: 'ACT-040', case_id: 'AICTE-PGRC-2026-0029', action_type: 'CASE_FILED', remarks: 'Joint petition from 18 faculty members logged under Urgent priority.', bureau: 'PGRC', officer: 'Smt. Sunita Mohanty', timestamp: daysAgo(21) },
  { action_id: 'ACT-041', case_id: 'AICTE-PGRC-2026-0029', action_type: 'NOTICE_ISSUED', remarks: 'Interim pay order issued to management.', bureau: 'PGRC', officer: 'Smt. Sunita Mohanty', timestamp: daysAgo(2) },

  { action_id: 'ACT-050', case_id: 'AICTE-RB-2025-0742', action_type: 'CASE_FILED', remarks: 'Land parcel mortgage inquiry logged into statutory intake.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(90) },
  { action_id: 'ACT-051', case_id: 'AICTE-RB-2025-0742', action_type: 'CASE_ESCALATED', remarks: 'Overdue inquiry escalated for final withdrawal show-cause.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(25) },

  { action_id: 'ACT-060', case_id: 'AICTE-PGRC-2026-0501', action_type: 'CASE_FILED', remarks: 'Student security deposit withholding grievance registered.', bureau: 'PGRC', officer: 'Smt. Sunita Mohanty', timestamp: daysAgo(40) },
  { action_id: 'ACT-061', case_id: 'AICTE-PGRC-2026-0501', action_type: 'CASE_DISPOSED', remarks: 'Full refund credited to complainant with interest; case disposed.', bureau: 'PGRC', officer: 'Smt. Sunita Mohanty', timestamp: daysAgo(5) },

  { action_id: 'ACT-070', case_id: 'AICTE-RB-2026-0402', action_type: 'CASE_FILED', remarks: 'Capitation fee petition registered.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(60) },
  { action_id: 'ACT-071', case_id: 'AICTE-RB-2026-0402', action_type: 'CASE_DISPOSED', remarks: 'Initially closed following management affidavit.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(20) },
  { action_id: 'ACT-072', case_id: 'AICTE-RB-2026-0402', action_type: 'CASE_REOPENED', remarks: 'Case reopened by Dr. Suresh Patil following whistle-blower bank disclosures.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(2) },

  { action_id: 'ACT-080', case_id: 'AICTE-RB-2026-0201', action_type: 'CASE_FILED', remarks: 'Lead placement surcharge complaint registered.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(22) },
  { action_id: 'ACT-081', case_id: 'AICTE-RB-2026-0201', action_type: 'CASES_MERGED', remarks: 'Consolidated child case AICTE-RB-2026-0202 merged into this dossier.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(3) },
  { action_id: 'ACT-082', case_id: 'AICTE-RB-2026-0202', action_type: 'CASE_FILED', remarks: 'Secondary placement surcharge petition logged.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(18) },
  { action_id: 'ACT-083', case_id: 'AICTE-RB-2026-0202', action_type: 'CASES_MERGED', remarks: 'Merged into primary case AICTE-RB-2026-0201.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(3) },

  { action_id: 'ACT-090', case_id: 'AICTE-RB-2026-0099', action_type: 'CASE_FILED', remarks: 'Commercial land encroachment complaint logged.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(30) },
  { action_id: 'ACT-091', case_id: 'AICTE-RB-2026-0099', action_type: 'CASE_ESCALATED', remarks: 'Escalated to Member Secretary AICTE for urgent regulatory injunction.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(1) },

  { action_id: 'ACT-100', case_id: 'AICTE-PGRC-2026-0188', action_type: 'CASE_FILED', remarks: 'Polytechnic lab machine non-compliance complaint logged.', bureau: 'PGRC', officer: 'Smt. Sunita Mohanty', timestamp: daysAgo(25) },
  { action_id: 'ACT-101', case_id: 'AICTE-PGRC-2026-0188', action_type: 'BUREAU_REASSIGNED', remarks: 'Transferred from PGRC to Regulation Bureau for EVC technical inspection.', bureau: 'RB', officer: 'Dr. Suresh Patil', timestamp: daysAgo(4) }
];

async function seed() {
  console.log('Authenticating as coordinator@aicte-india.org...');
  const { data: auth, error: authErr } = await client.auth.signInWithPassword({
    email: 'coordinator@aicte-india.org',
    password: '123456'
  });

  if (authErr) {
    console.error('Authentication failed:', authErr.message);
    process.exit(1);
  }
  console.log('Successfully authenticated as:', auth.user.email);

  // 1. Seed Cases
  console.log(`\nSeeding ${DEMO_CASES.length} demo cases...`);
  let casesAdded = 0;
  for (const c of DEMO_CASES) {
    const { data, error } = await client
      .from('cases')
      .upsert(c, { onConflict: 'case_id', ignoreDuplicates: true })
      .select('case_id');

    if (error) {
      console.error(`Error inserting case ${c.case_id}:`, error.message);
    } else {
      casesAdded++;
      console.log(`  ✓ Case ${c.case_id} [${c.bureau} | ${c.status} | ${c.priority}] -> ${c.institution_name}`);
    }
  }

  // 2. Seed Actions
  console.log(`\nSeeding ${DEMO_ACTIONS.length} chronological audit actions...`);
  let actionsAdded = 0;
  for (const act of DEMO_ACTIONS) {
    const { data, error } = await client
      .from('case_actions')
      .upsert(act, { onConflict: 'action_id', ignoreDuplicates: true })
      .select('action_id');

    if (error) {
      console.error(`Error inserting action ${act.action_id}:`, error.message);
    } else {
      actionsAdded++;
      console.log(`  ✓ Action ${act.action_id} [${act.action_type}] on ${act.case_id}`);
    }
  }

  // 3. Verification Query
  console.log('\n--- VERIFICATION QUERY ---');
  const { data: allCases, error: cErr } = await client.from('cases').select('case_id, status, priority, bureau');
  console.log(`Total Cases in Supabase: ${allCases ? allCases.length : 0}`);
  
  const statusCounts = {};
  if (allCases) {
    for (const c of allCases) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    }
  }
  console.log('Case Status Breakdown:', statusCounts);

  const { data: allActions } = await client.from('case_actions').select('action_id');
  console.log(`Total Actions in Supabase: ${allActions ? allActions.length : 0}`);

  console.log('\nSeeding complete.');
}

seed().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
