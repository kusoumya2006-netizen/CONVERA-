-- =========================================================================
-- CONVERA Database Architecture — Migration 003: Synthetic AICTE Seed Data
-- SIH26264: Integrated Institution Complaint Monitoring & Overlap Dashboard
-- (100% Synthetic Fictional Records for Evaluation & Testing)
-- =========================================================================

-- 1. Seed Technical Institutions
INSERT INTO public.institutions (institution_id, name, address, region, type, established_year, accreditation_grade, created_at)
VALUES
  ('1-4328901', 'Sri Venkateswara College of Engineering (SVCE)', 'Post Bag No. 1, Pennalur, Bengaluru-Chennai Highway, Sriperumbudur, Tamil Nadu 602117', 'Southern', 'Engineering & Technology (Autonomous)', 1985, 'NAAC A+ / NBA Tier I Accredited', '2019-04-12T08:00:00Z'),
  ('1-4392811', 'Apex Institute of Technology & Engineering', 'Plot 12, Institutional Area, Knowledge Park III, Greater Noida, Uttar Pradesh 201306', 'Northern', 'Engineering & Technology', 2008, 'NBA Accredited (Tier II)', '2020-01-15T08:00:00Z'),
  ('1-8923412', 'Vidyapeeth College of Engineering & Research', 'Survey No. 44/1, Paud Road, Kothrud, Pune, Maharashtra 411038', 'Western', 'Engineering & Technology', 1999, 'NAAC A+', '2019-06-10T08:00:00Z'),
  ('1-6712390', 'Kalinga Institute of Science & Applied Tech', 'Chandaka Industrial Estate, Patia, Bhubaneswar, Odisha 751024', 'Eastern', 'Engineering & Management', 2005, 'NAAC A', '2021-03-22T08:00:00Z'),
  ('1-5521904', 'Dravida Polytechnic & Technical Campus', 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004', 'Southern', 'Polytechnic Diploma', 2012, NULL, '2022-08-14T08:00:00Z'),
  ('1-9923841', 'Malwa Institute of Technology and Management', 'Sanwer Road, Sector B, Industrial Area, Indore, Madhya Pradesh 452015', 'Central', 'Engineering & Technology', 2003, 'NBA Accredited', '2018-11-05T08:00:00Z'),
  ('1-3382910', 'Himalayan Institute of Pharmaceutical Sciences', 'Kandoli Campus, PO Bidholi, Via Prem Nagar, Dehradun, Uttarakhand 248007', 'Northern', 'Pharmacy', 2011, 'PCI & AICTE Approved', '2020-07-19T08:00:00Z'),
  ('1-7782193', 'Shri Ramdeobaba Engineering Academy', 'Ramdeo Tekdi, Gittikhadan, Katol Road, Nagpur, Maharashtra 440013', 'Western', 'Engineering & Technology', 1984, 'NAAC A++', '2017-02-14T08:00:00Z'),
  ('1-2291048', 'Brahmaputra Engineering & Management College', 'Amingaon, North Guwahati, Kamrup, Assam 781031', 'Eastern', 'Engineering & Technology', 2014, NULL, '2022-01-10T08:00:00Z'),
  ('1-8841029', 'Marathwada Rural Polytechnic College', 'MIDC Area, Chhatrapati Sambhajinagar (Aurangabad), Maharashtra 431005', 'Western', 'Polytechnic Diploma', 2009, NULL, '2020-09-01T08:00:00Z'),
  ('1-1192847', 'Sardar Vallabhbhai Institute of Applied Technology', 'Near Reliance Cross Road, Kudasan, Gandhinagar, Gujarat 382421', 'Central', 'Engineering & Technology', 2007, 'NAAC A', '2019-10-30T08:00:00Z'),
  ('1-6638291', 'Chola Institute of Management Studies', 'Old Mahabalipuram Road (OMR), Navalur, Chennai, Tamil Nadu 603103', 'Southern', 'Management (PGDM/MBA)', 2010, 'AIU Equivalent', '2021-06-15T08:00:00Z'),
  ('1-4472819', 'Punjab Technical & Polytechnic Institute', 'GT Road, Bye-Pass, Near Jalandhar Cantt, Jalandhar, Punjab 144008', 'North-Western', 'Polytechnic Diploma', 2001, 'NBA Accredited', '2018-04-20T08:00:00Z'),
  ('1-9910283', 'Narmada Valley Institute of Technical Sciences', 'Hoshangabad Road, Misrod, Bhopal, Madhya Pradesh 462047', 'Central', 'Engineering & Technology', 2013, NULL, '2022-05-18T08:00:00Z'),
  ('1-7739102', 'Konkan Coastal Institute of Marine & Mechanical Studies', 'At Post Karad, Near National Highway 4, Satara, Maharashtra 415124', 'Western', 'Marine & Mechanical Engineering', 2006, 'DGS Approved', '2019-12-08T08:00:00Z'),
  ('1-5582910', 'Utkal Institute of Technology and Architecture', 'Infocity, Chandrasekharpur, Bhubaneswar, Odisha 751024', 'Eastern', 'Architecture & Planning', 2015, 'COA Approved', '2022-11-20T08:00:00Z'),
  ('1-3319028', 'Aryavarta Polytechnic & Skill Development College', 'Faizabad Road, Chinhat, Lucknow, Uttar Pradesh 226028', 'Northern', 'Polytechnic Diploma', 2016, NULL, '2023-02-11T08:00:00Z'),
  ('1-8820194', 'Deccan Institute of Pharmacy & Health Sciences', 'Bannerghatta Road, Near Meenakshi Temple, Bengaluru, Karnataka 560076', 'South-Western', 'Pharmacy', 2004, 'NAAC A / PCI Approved', '2018-08-05T08:00:00Z')
ON CONFLICT (institution_id) DO NOTHING;

-- 2. Seed Primary Demonstration Complaints (featuring deliberate cross-bureau overlap scenarios)
INSERT INTO public.cases (
  case_id, institution_id, institution_name, category, description, bureau, assigned_officer,
  status, priority, complainant_type, received_at, last_action, next_action, last_action_at,
  expected_disposal_date, related_case_ids, created_at, updated_at
)
VALUES
  (
    'AICTE-RB-2026-0041',
    '1-4328901',
    'Sri Venkateswara College of Engineering (SVCE)',
    'Capitation Fee Allegation',
    'Formal grievance regarding unauthorized development fee collection in autonomous quota admissions.',
    'RB',
    'Dr. Suresh Patil',
    'Under Process',
    'HIGH',
    'Parent',
    '2026-03-01T10:00:00Z',
    'Show Cause Notice issued to management. Hearing scheduled.',
    'Scrutiny of financial records & trust accounts.',
    '2026-03-10T14:30:00Z',
    '2026-04-15T00:00:00Z',
    ARRAY['AICTE-PGRC-2026-0089'],
    '2026-03-01T10:00:00Z',
    '2026-03-10T14:30:00Z'
  ),
  (
    'AICTE-PGRC-2026-0089',
    '1-4328901',
    'Sri Venkateswara College of Engineering (SVCE)',
    'Infrastructure Non-Compliance',
    'Student council petition regarding hostel fire safety non-compliance and laboratory ventilation.',
    'PGRC',
    'Smt. Sunita Mohanty',
    'Under Process',
    'HIGH',
    'Student',
    '2026-03-05T11:30:00Z',
    'Expert Inspection Committee constituted for campus site inspection.',
    'Physical inspection report submission.',
    '2026-03-12T09:15:00Z',
    '2026-04-20T00:00:00Z',
    ARRAY['AICTE-RB-2026-0041'],
    '2026-03-05T11:30:00Z',
    '2026-03-12T09:15:00Z'
  ),
  (
    'AICTE-RB-2026-0112',
    '1-4392811',
    'Apex Institute of Technology & Engineering',
    'Faculty Pay & Service Grievance',
    'Non-implementation of 7th CPC allowances and arbitrary termination of 12 associate professors.',
    'RB',
    'Dr. Amitabh Ghosh',
    'Under Process',
    'CRITICAL',
    'Faculty',
    '2026-02-15T09:00:00Z',
    'Show cause notice issued to Trust Chairman.',
    'Personal hearing of Trust Representatives.',
    '2026-03-02T16:00:00Z',
    '2026-04-01T00:00:00Z',
    ARRAY['AICTE-PGRC-2026-0145'],
    '2026-02-15T09:00:00Z',
    '2026-03-02T16:00:00Z'
  ),
  (
    'AICTE-PGRC-2026-0145',
    '1-4392811',
    'Apex Institute of Technology & Engineering',
    'Withholding Original Certificates',
    'Mass petition from 48 final-year B.Tech students alleging withholding of original degree certificates.',
    'PGRC',
    'Smt. Sunita Mohanty',
    'Under Process',
    'CRITICAL',
    'Student',
    '2026-02-20T14:15:00Z',
    'Direct warning notice issued. Non-compliance penalty initiated.',
    'Enforcement of immediate certificate release.',
    '2026-03-08T11:00:00Z',
    '2026-03-30T00:00:00Z',
    ARRAY['AICTE-RB-2026-0112'],
    '2026-02-20T14:15:00Z',
    '2026-03-08T11:00:00Z'
  )
ON CONFLICT (case_id) DO NOTHING;

-- 3. Seed Initial Action History
INSERT INTO public.case_actions (action_id, case_id, action_type, remarks, bureau, officer, timestamp)
VALUES
  ('ACT-001', 'AICTE-RB-2026-0041', 'CASE_FILED', 'Complaint logged into Regulation Bureau intake registry.', 'RB', 'Dr. Suresh Patil', '2026-03-01T10:00:00Z'),
  ('ACT-002', 'AICTE-RB-2026-0041', 'NOTICE_ISSUED', 'Show-cause notice served to SVCE management.', 'RB', 'Dr. Suresh Patil', '2026-03-06T12:00:00Z'),
  ('ACT-003', 'AICTE-PGRC-2026-0089', 'CASE_FILED', 'Hostel grievance logged into PGRC portal.', 'PGRC', 'Smt. Sunita Mohanty', '2026-03-05T11:30:00Z'),
  ('ACT-004', 'AICTE-PGRC-2026-0089', 'COMMITTEE_INSPECTION', 'Expert committee scheduled for physical verification on 2026-03-28.', 'PGRC', 'Smt. Sunita Mohanty', '2026-03-12T09:15:00Z'),
  ('ACT-005', 'AICTE-RB-2026-0112', 'CASE_FILED', 'Faculty pay petition formally admitted.', 'RB', 'Dr. Amitabh Ghosh', '2026-02-15T09:00:00Z'),
  ('ACT-006', 'AICTE-PGRC-2026-0145', 'CASE_FILED', 'Mass student petition logged under Urgent category.', 'PGRC', 'Smt. Sunita Mohanty', '2026-02-20T14:15:00Z')
ON CONFLICT (action_id) DO NOTHING;
