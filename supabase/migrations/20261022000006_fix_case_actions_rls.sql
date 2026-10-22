-- =========================================================================
-- CONVERA Database Architecture — Migration 006: Fix case_actions RLS Policy
-- SIH26264: Integrated Institution Complaint Monitoring & Overlap Dashboard
-- =========================================================================
-- Purpose:
-- Enforce fine-grained, least-privilege append access on public.case_actions.
--
-- Authorization Rules:
-- 1. Super Admins / Central Coordinators (role='SUPER_ADMIN' or bureau='ALL'):
--    Authorized to append actions across all cases and bureaus.
-- 2. Permitted Jurisdiction:
--    Bureau officials can record actions on cases belonging to their bureau.
-- 3. Cross-Bureau Coordination (action_type = 'INTER_BUREAU_COORDINATED'):
--    Authorized if the official's bureau is part of an active overlap alert
--    involving the case, or if the case is mutually linked to a case in their bureau.
-- 4. Bureau Transfer (action_type = 'BUREAU_REASSIGNED'):
--    Authorized if the official's bureau is the origin or target bureau.
-- 5. Case Merging / Consolidation (action_type IN ('CASES_MERGED', 'CASE_UNMERGED')):
--    Authorized if either the primary or child case belongs to the official's bureau.
-- 6. Strictly Append-Only:
--    NO UPDATE and NO DELETE policies exist or are created.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.is_authorized_case_action(
  p_case_id TEXT,
  p_action_type TEXT,
  p_bureau TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    -- 1. Super Admins / Central Coordinators
    public.is_admin_or_coordinator()

    -- 2. Permitted Jurisdiction: Bureau officials acting on cases belonging to their bureau
    OR EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.case_id = p_case_id
        AND c.bureau = public.get_current_user_bureau()
    )

    -- 3. Cross-Bureau Coordination:
    -- Authorized if official's bureau is involved in an overlap for this case
    -- or if the case is linked with a case belonging to their bureau
    OR (
      p_action_type = 'INTER_BUREAU_COORDINATED'
      AND (
        p_bureau = public.get_current_user_bureau()
        OR EXISTS (
          SELECT 1 FROM public.overlap_alerts oa
          WHERE p_case_id = ANY(oa.case_ids)
            AND public.get_current_user_bureau() = ANY(oa.involved_bureaus)
        )
        OR EXISTS (
          SELECT 1 FROM public.cases c
          WHERE c.bureau = public.get_current_user_bureau()
            AND (
              p_case_id = ANY(c.related_case_ids)
              OR c.case_id = ANY(SELECT c2.related_case_ids FROM public.cases c2 WHERE c2.case_id = p_case_id)
            )
        )
      )
    )

    -- 4. Bureau Transfer / Reassignment
    OR (
      p_action_type = 'BUREAU_REASSIGNED'
      AND EXISTS (
        SELECT 1 FROM public.cases c
        WHERE c.case_id = p_case_id
          AND (c.bureau = public.get_current_user_bureau() OR p_bureau = public.get_current_user_bureau())
      )
    )

    -- 5. Case Merger & Unmerger
    OR (
      p_action_type IN ('CASES_MERGED', 'CASE_UNMERGED')
      AND EXISTS (
        SELECT 1 FROM public.cases c
        WHERE (c.case_id = p_case_id AND c.bureau = public.get_current_user_bureau())
           OR (c.merged_into_case_id = p_case_id AND c.bureau = public.get_current_user_bureau())
           OR (c.case_id = (SELECT c2.merged_into_case_id FROM public.cases c2 WHERE c2.case_id = p_case_id) AND c.bureau = public.get_current_user_bureau())
      )
    )
  );
$$;

-- Drop and replace the INSERT policy on public.case_actions
DROP POLICY IF EXISTS "case_actions_insert_policy" ON public.case_actions;

CREATE POLICY "case_actions_insert_policy"
ON public.case_actions
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_authorized_case_action(case_id, action_type, bureau)
);

-- Ensure authenticated role has necessary table privileges
GRANT SELECT, INSERT ON public.case_actions TO authenticated;
