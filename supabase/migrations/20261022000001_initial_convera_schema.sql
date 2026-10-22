-- =========================================================================
-- CONVERA Database Architecture — Migration 001: Initial Core Schema
-- SIH26264: Integrated Institution Complaint Monitoring & Overlap Dashboard
-- =========================================================================

-- 1. Profiles Table (Managed securely linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'SUPER_ADMIN',
    'RB_DIRECTOR',
    'PGRC_DIRECTOR',
    'REGIONAL_OFFICER',
    'CASE_SCRUTINY_OFFICER'
  )),
  bureau TEXT NOT NULL CHECK (bureau IN (
    'RB',
    'PGRC',
    'AB',
    'Finance',
    'Vigilance',
    'ALL'
  )),
  department TEXT NOT NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Technical Institutions Table
CREATE TABLE IF NOT EXISTS public.institutions (
  institution_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN (
    'Northern',
    'Western',
    'Southern',
    'Eastern',
    'Central',
    'North-Western',
    'South-Western'
  )),
  type TEXT NOT NULL,
  established_year INTEGER NOT NULL,
  accreditation_grade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Complaints & Regulatory Cases Table
CREATE TABLE IF NOT EXISTS public.cases (
  case_id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES public.institutions(institution_id) ON UPDATE CASCADE,
  institution_name TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  bureau TEXT NOT NULL CHECK (bureau IN ('RB', 'PGRC', 'AB', 'Finance', 'Vigilance')),
  assigned_officer TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'Pending',
    'Under Process',
    'Disposed',
    'Transferred',
    'Escalated'
  )),
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  complainant_type TEXT NOT NULL CHECK (complainant_type IN (
    'Student',
    'Faculty',
    'Parent',
    'Anonymous',
    'Regulatory Agency'
  )),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_action TEXT NOT NULL,
  next_action TEXT NOT NULL,
  last_action_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_disposal_date TIMESTAMPTZ NOT NULL,
  related_case_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- P1 Completion & Resolution Tracking
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  completed_by_officer_id TEXT,
  resolution_summary TEXT,
  reopened_at TIMESTAMPTZ,
  reopened_by TEXT,
  reopen_reason TEXT,

  -- P2 Case Consolidation & Merging
  is_merged BOOLEAN NOT NULL DEFAULT false,
  merged_into_case_id TEXT REFERENCES public.cases(case_id),
  merged_case_ids TEXT[] NOT NULL DEFAULT '{}',
  merged_at TIMESTAMPTZ,
  merged_by TEXT,
  merge_reason TEXT
);

-- 4. Case Action History Table (Strictly Append-Only Audit Ledger)
CREATE TABLE IF NOT EXISTS public.case_actions (
  action_id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES public.cases(case_id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'CASE_FILED',
    'NOTICE_ISSUED',
    'EXPLANATION_RECEIVED',
    'COMMITTEE_INSPECTION',
    'HEARING_SCHEDULED',
    'BUREAU_REASSIGNED',
    'CASE_ESCALATED',
    'INTER_BUREAU_COORDINATED',
    'CASE_DISPOSED',
    'CASE_REOPENED',
    'CASES_MERGED',
    'CASE_UNMERGED',
    'REMARKS_ADDED'
  )),
  remarks TEXT NOT NULL,
  bureau TEXT NOT NULL CHECK (bureau IN ('RB', 'PGRC', 'AB', 'Finance', 'Vigilance')),
  officer TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Overlap Alerts Table
CREATE TABLE IF NOT EXISTS public.overlap_alerts (
  alert_id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES public.institutions(institution_id) ON UPDATE CASCADE,
  institution_name TEXT NOT NULL,
  case_ids TEXT[] NOT NULL DEFAULT '{}',
  involved_bureaus TEXT[] NOT NULL DEFAULT '{}',
  reason TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM')),
  review_status TEXT NOT NULL CHECK (review_status IN ('PENDING_REVIEW', 'COORDINATED', 'DISMISSED')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  coordination_remarks TEXT,
  lead_bureau TEXT CHECK (lead_bureau IS NULL OR lead_bureau IN ('RB', 'PGRC', 'AB', 'Finance', 'Vigilance')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);

-- Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_cases_institution_id ON public.cases(institution_id);
CREATE INDEX IF NOT EXISTS idx_cases_bureau ON public.cases(bureau);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_completed_at ON public.cases(completed_at);
CREATE INDEX IF NOT EXISTS idx_case_actions_case_id ON public.case_actions(case_id);
CREATE INDEX IF NOT EXISTS idx_case_actions_timestamp ON public.case_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_overlap_alerts_institution_id ON public.overlap_alerts(institution_id);
