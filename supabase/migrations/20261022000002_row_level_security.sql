-- =========================================================================
-- CONVERA Database Architecture — Migration 002: Row Level Security (RLS)
-- SIH26264: Integrated Institution Complaint Monitoring & Overlap Dashboard
-- =========================================================================

-- Enable Row Level Security across all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overlap_alerts ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- Helper Functions for Trusted Role & Bureau Extraction
-- (Roles stored strictly in public.profiles, never trusted from client metadata)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_bureau()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT bureau FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_coordinator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (role = 'SUPER_ADMIN' OR bureau = 'ALL')
  );
$$;

-- -------------------------------------------------------------------------
-- 1. Profiles Table Policies
-- -------------------------------------------------------------------------
-- Authenticated users can view their own profile, and admins/coordinators can view all profiles
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR public.is_admin_or_coordinator()
);

-- Users can update their own display name, but CANNOT modify their role or bureau (prevents privilege escalation)
CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin_or_coordinator())
WITH CHECK (
  -- Ordinary users cannot elevate their role or change bureau
  (id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
                   AND bureau = (SELECT p.bureau FROM public.profiles p WHERE p.id = auth.uid()))
  OR public.is_admin_or_coordinator()
);

-- -------------------------------------------------------------------------
-- 2. Technical Institutions Table Policies
-- -------------------------------------------------------------------------
-- All authenticated officers can read technical institution profiles
CREATE POLICY "institutions_select_policy"
ON public.institutions
FOR SELECT
TO authenticated
USING (true);

-- Only Super Admins can insert or update institutions
CREATE POLICY "institutions_admin_insert"
ON public.institutions
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_coordinator());

CREATE POLICY "institutions_admin_update"
ON public.institutions
FOR UPDATE
TO authenticated
USING (public.is_admin_or_coordinator())
WITH CHECK (public.is_admin_or_coordinator());

-- -------------------------------------------------------------------------
-- 3. Complaints & Regulatory Cases Table Policies
-- -------------------------------------------------------------------------
-- Multi-bureau situational awareness: All authenticated AICTE officers can view
-- active case summaries to ensure cross-bureau overlap detection functions transparently
CREATE POLICY "cases_select_policy"
ON public.cases
FOR SELECT
TO authenticated
USING (true);

-- Officers can insert complaints assigned to their bureau, or coordinators/admins can insert for any bureau
CREATE POLICY "cases_insert_policy"
ON public.cases
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_coordinator()
  OR bureau = public.get_current_user_bureau()
);

-- Bureau officers can update cases belonging to their bureau; coordinators/super_admins can update any case
CREATE POLICY "cases_update_policy"
ON public.cases
FOR UPDATE
TO authenticated
USING (
  public.is_admin_or_coordinator()
  OR bureau = public.get_current_user_bureau()
)
WITH CHECK (
  public.is_admin_or_coordinator()
  OR bureau = public.get_current_user_bureau()
  -- If transferring bureau, only allowed if coordinator or target bureau
  OR public.is_admin_or_coordinator()
);

-- Regulatory records are immutable: HARD DELETE IS PROHIBITED FOR ALL USERS
-- (Cases must be closed / marked 'Disposed', never deleted)
-- No DELETE policy is defined, automatically denying all DELETE operations.

-- -------------------------------------------------------------------------
-- 4. Case Action History Policies (Strictly Append-Only Ledger)
-- -------------------------------------------------------------------------
-- All authenticated officers can inspect chronological action logs
CREATE POLICY "case_actions_select_policy"
ON public.case_actions
FOR SELECT
TO authenticated
USING (true);

-- Officers can record actions on cases within their jurisdiction, or coordinators on any case
CREATE POLICY "case_actions_insert_policy"
ON public.case_actions
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_coordinator()
  OR bureau = public.get_current_user_bureau()
  OR EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.case_id = case_actions.case_id
      AND c.bureau = public.get_current_user_bureau()
  )
);

-- STRICT APPEND-ONLY: No UPDATE and No DELETE policies exist on case_actions.
-- Once an action is recorded in the statutory ledger, it can never be altered or purged.

-- -------------------------------------------------------------------------
-- 5. Overlap Alerts Table Policies
-- -------------------------------------------------------------------------
-- All authenticated AICTE officers can inspect cross-bureau overlap alerts
CREATE POLICY "overlap_alerts_select_policy"
ON public.overlap_alerts
FOR SELECT
TO authenticated
USING (true);

-- Coordinators, admins, or officers from involved bureaus can insert or record review decisions
CREATE POLICY "overlap_alerts_insert_policy"
ON public.overlap_alerts
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_coordinator()
  OR public.get_current_user_bureau() = ANY(involved_bureaus)
);

CREATE POLICY "overlap_alerts_update_policy"
ON public.overlap_alerts
FOR UPDATE
TO authenticated
USING (
  public.is_admin_or_coordinator()
  OR public.get_current_user_bureau() = ANY(involved_bureaus)
)
WITH CHECK (
  public.is_admin_or_coordinator()
  OR public.get_current_user_bureau() = ANY(involved_bureaus)
);
