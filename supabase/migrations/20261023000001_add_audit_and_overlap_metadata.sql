-- =========================================================================
-- CONVERA Database Architecture — Migration 007: Audit & Overlap Metadata
-- SIH26264: Integrated Institution Complaint Monitoring & Overlap Dashboard
-- =========================================================================
-- Purpose:
-- 1. Extend public.case_actions with structured audit fields for lossless round-trip persistence.
-- 2. Extend public.overlap_alerts with intelligence rationale, strategy, and semantic comparison metadata.
-- 3. Provide transactional RPC functions for multi-record operations (link, merge, unmerge).
-- =========================================================================

-- 1. Structured Audit Columns on public.case_actions
ALTER TABLE public.case_actions
  ADD COLUMN IF NOT EXISTS previous_value TEXT,
  ADD COLUMN IF NOT EXISTS new_value TEXT,
  ADD COLUMN IF NOT EXISTS field_changed TEXT,
  ADD COLUMN IF NOT EXISTS justification TEXT,
  ADD COLUMN IF NOT EXISTS related_case_id TEXT,
  ADD COLUMN IF NOT EXISTS evidence_ref TEXT,
  ADD COLUMN IF NOT EXISTS activity_category TEXT,
  ADD COLUMN IF NOT EXISTS next_action TEXT;

-- 2. Intelligence & Coordination Columns on public.overlap_alerts
ALTER TABLE public.overlap_alerts
  ADD COLUMN IF NOT EXISTS matching_strategy TEXT CHECK (matching_strategy IS NULL OR matching_strategy IN ('EXACT_PID', 'NORMALIZED_NAME')),
  ADD COLUMN IF NOT EXISTS category_correlation TEXT CHECK (category_correlation IS NULL OR category_correlation IN ('IDENTICAL_CATEGORY', 'RELATED_THEME', 'DISTINCT_MATTERS')),
  ADD COLUMN IF NOT EXISTS matching_evidence TEXT,
  ADD COLUMN IF NOT EXISTS dismissal_reason TEXT,
  ADD COLUMN IF NOT EXISTS recommended_action TEXT,
  ADD COLUMN IF NOT EXISTS semantic_comparisons JSONB DEFAULT '[]'::jsonb;

-- Indexes for efficient queries and audit filtering
CREATE INDEX IF NOT EXISTS idx_case_actions_activity_category ON public.case_actions(activity_category);
CREATE INDEX IF NOT EXISTS idx_case_actions_field_changed ON public.case_actions(field_changed);
CREATE INDEX IF NOT EXISTS idx_overlap_alerts_matching_strategy ON public.overlap_alerts(matching_strategy);
CREATE INDEX IF NOT EXISTS idx_overlap_alerts_review_status ON public.overlap_alerts(review_status);

-- -------------------------------------------------------------------------
-- 3. Transactional Multi-Record RPC Functions
-- -------------------------------------------------------------------------

-- 3A. Atomic Case Cross-Linking
CREATE OR REPLACE FUNCTION public.rpc_link_related_cases(
  p_case_id1 TEXT,
  p_case_id2 TEXT,
  p_remarks TEXT,
  p_officer TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case1 public.cases%ROWTYPE;
  v_case2 public.cases%ROWTYPE;
  v_user_bureau TEXT;
  v_is_admin BOOLEAN;
  v_now TIMESTAMPTZ := now();
  v_acting_officer TEXT;
BEGIN
  -- Authenticated user validation
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to link case records.' USING ERRCODE = '42501';
  END IF;

  v_user_bureau := public.get_current_user_bureau();
  v_is_admin := public.is_admin_or_coordinator();
  v_acting_officer := COALESCE((SELECT display_name FROM public.profiles WHERE id = auth.uid()), p_officer);

  -- Fetch cases
  SELECT * INTO v_case1 FROM public.cases WHERE case_id = p_case_id1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Case % not found.', p_case_id1 USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_case2 FROM public.cases WHERE case_id = p_case_id2 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Case % not found.', p_case_id2 USING ERRCODE = 'P0002';
  END IF;

  -- Jurisdiction Check: must be admin or belong to bureau of case1 or case2
  IF NOT v_is_admin AND v_user_bureau <> v_case1.bureau AND v_user_bureau <> v_case2.bureau THEN
    RAISE EXCEPTION 'Jurisdiction Denied: Official (%) cannot cross-link cases outside bureau authority.', v_user_bureau USING ERRCODE = '42501';
  END IF;

  -- Update case 1
  UPDATE public.cases
  SET related_case_ids = ARRAY(SELECT DISTINCT unnest(array_append(v_case1.related_case_ids, p_case_id2))),
      updated_at = v_now
  WHERE case_id = p_case_id1;

  -- Update case 2
  UPDATE public.cases
  SET related_case_ids = ARRAY(SELECT DISTINCT unnest(array_append(v_case2.related_case_ids, p_case_id1))),
      updated_at = v_now
  WHERE case_id = p_case_id2;

  -- Append audit action on case 1
  INSERT INTO public.case_actions (
    action_id, case_id, action_type, remarks, bureau, officer, timestamp, related_case_id, activity_category
  ) VALUES (
    'ACT-' || floor(extract(epoch from clock_timestamp()) * 1000)::text || '-1',
    p_case_id1,
    'INTER_BUREAU_COORDINATED',
    'Linked with cross-reference case ' || p_case_id2 || '. Remarks: ' || p_remarks,
    CASE WHEN v_is_admin THEN v_case1.bureau ELSE v_user_bureau END,
    v_acting_officer,
    v_now,
    p_case_id2,
    'Communication'
  );

  -- Append audit action on case 2
  INSERT INTO public.case_actions (
    action_id, case_id, action_type, remarks, bureau, officer, timestamp, related_case_id, activity_category
  ) VALUES (
    'ACT-' || floor(extract(epoch from clock_timestamp()) * 1000)::text || '-2',
    p_case_id2,
    'INTER_BUREAU_COORDINATED',
    'Linked with cross-reference case ' || p_case_id1 || '. Remarks: ' || p_remarks,
    CASE WHEN v_is_admin THEN v_case2.bureau ELSE v_user_bureau END,
    v_acting_officer,
    v_now,
    p_case_id1,
    'Communication'
  );

  RETURN jsonb_build_object(
    'success', true,
    'caseId1', p_case_id1,
    'caseId2', p_case_id2,
    'linkedAt', v_now
  );
END;
$$;

-- 3B. Atomic Case Merging
CREATE OR REPLACE FUNCTION public.rpc_merge_cases(
  p_primary_case_id TEXT,
  p_child_case_id TEXT,
  p_merge_reason TEXT,
  p_officer TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_primary public.cases%ROWTYPE;
  v_child public.cases%ROWTYPE;
  v_user_bureau TEXT;
  v_is_admin BOOLEAN;
  v_now TIMESTAMPTZ := now();
  v_acting_officer TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to merge case records.' USING ERRCODE = '42501';
  END IF;

  IF p_primary_case_id = p_child_case_id THEN
    RAISE EXCEPTION 'Cannot merge a case into itself.' USING ERRCODE = '22000';
  END IF;

  v_user_bureau := public.get_current_user_bureau();
  v_is_admin := public.is_admin_or_coordinator();
  v_acting_officer := COALESCE((SELECT display_name FROM public.profiles WHERE id = auth.uid()), p_officer);

  SELECT * INTO v_primary FROM public.cases WHERE case_id = p_primary_case_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Primary case % not found.', p_primary_case_id USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_child FROM public.cases WHERE case_id = p_child_case_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Child case % not found.', p_child_case_id USING ERRCODE = 'P0002';
  END IF;

  IF v_child.is_merged THEN
    RAISE EXCEPTION 'Case % is already merged into %.', p_child_case_id, v_child.merged_into_case_id USING ERRCODE = '22000';
  END IF;

  IF v_primary.is_merged THEN
    RAISE EXCEPTION 'Case % is already a child case and cannot be a primary case.', p_primary_case_id USING ERRCODE = '22000';
  END IF;

  IF p_primary_case_id = ANY(v_child.merged_case_ids) THEN
    RAISE EXCEPTION 'Circular merge relationship detected.' USING ERRCODE = '22000';
  END IF;

  IF NOT v_is_admin AND v_user_bureau <> v_primary.bureau AND v_user_bureau <> v_child.bureau THEN
    RAISE EXCEPTION 'Jurisdiction Denied: Official (%) cannot merge cases outside authorized bureau.', v_user_bureau USING ERRCODE = '42501';
  END IF;

  -- Update child case
  UPDATE public.cases
  SET is_merged = true,
      merged_into_case_id = p_primary_case_id,
      merged_at = v_now,
      merged_by = v_acting_officer,
      merge_reason = p_merge_reason,
      last_action = 'Consolidated & merged into primary complaint ' || p_primary_case_id || '. Reason: ' || p_merge_reason,
      last_action_at = v_now,
      updated_at = v_now,
      related_case_ids = ARRAY(SELECT DISTINCT unnest(array_append(v_child.related_case_ids, p_primary_case_id)))
  WHERE case_id = p_child_case_id;

  -- Update primary case
  UPDATE public.cases
  SET merged_case_ids = ARRAY(SELECT DISTINCT unnest(array_append(v_primary.merged_case_ids, p_child_case_id))),
      related_case_ids = ARRAY(SELECT DISTINCT unnest(array_append(v_primary.related_case_ids, p_child_case_id))),
      last_action = 'Consolidated complaint ' || p_child_case_id || ' merged into this dossier. Reason: ' || p_merge_reason,
      last_action_at = v_now,
      updated_at = v_now
  WHERE case_id = p_primary_case_id;

  -- Actions on both
  INSERT INTO public.case_actions (
    action_id, case_id, action_type, remarks, bureau, officer, timestamp, related_case_id, justification, activity_category
  ) VALUES (
    'ACT-MERGE-CHILD-' || floor(extract(epoch from clock_timestamp()) * 1000)::text,
    p_child_case_id,
    'CASES_MERGED',
    'Consolidated into primary case ' || p_primary_case_id || '. Reason: ' || p_merge_reason,
    v_child.bureau,
    v_acting_officer,
    v_now,
    p_primary_case_id,
    p_merge_reason,
    'Status Change'
  );

  INSERT INTO public.case_actions (
    action_id, case_id, action_type, remarks, bureau, officer, timestamp, related_case_id, justification, activity_category
  ) VALUES (
    'ACT-MERGE-PRIM-' || floor(extract(epoch from clock_timestamp()) * 1000)::text,
    p_primary_case_id,
    'CASES_MERGED',
    'Consolidated complaint ' || p_child_case_id || ' merged into this dossier. Reason: ' || p_merge_reason,
    v_primary.bureau,
    v_acting_officer,
    v_now,
    p_child_case_id,
    p_merge_reason,
    'Status Change'
  );

  RETURN jsonb_build_object(
    'success', true,
    'primaryCaseId', p_primary_case_id,
    'childCaseId', p_child_case_id,
    'mergedAt', v_now
  );
END;
$$;

-- 3C. Atomic Case Unmerging
CREATE OR REPLACE FUNCTION public.rpc_unmerge_case(
  p_child_case_id TEXT,
  p_reason TEXT,
  p_officer TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_child public.cases%ROWTYPE;
  v_primary public.cases%ROWTYPE;
  v_user_bureau TEXT;
  v_is_admin BOOLEAN;
  v_now TIMESTAMPTZ := now();
  v_acting_officer TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to unmerge case.' USING ERRCODE = '42501';
  END IF;

  v_user_bureau := public.get_current_user_bureau();
  v_is_admin := public.is_admin_or_coordinator();
  v_acting_officer := COALESCE((SELECT display_name FROM public.profiles WHERE id = auth.uid()), p_officer);

  SELECT * INTO v_child FROM public.cases WHERE case_id = p_child_case_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Child case % not found.', p_child_case_id USING ERRCODE = 'P0002';
  END IF;

  IF NOT v_child.is_merged OR v_child.merged_into_case_id IS NULL THEN
    RAISE EXCEPTION 'Case % is not currently merged into any primary case.', p_child_case_id USING ERRCODE = '22000';
  END IF;

  SELECT * INTO v_primary FROM public.cases WHERE case_id = v_child.merged_into_case_id FOR UPDATE;

  IF NOT v_is_admin AND v_user_bureau <> v_child.bureau AND (v_primary.case_id IS NULL OR v_user_bureau <> v_primary.bureau) THEN
    RAISE EXCEPTION 'Jurisdiction Denied: Official (%) cannot unmerge cases outside authorized bureau.', v_user_bureau USING ERRCODE = '42501';
  END IF;

  -- Restore child case
  UPDATE public.cases
  SET is_merged = false,
      merged_into_case_id = NULL,
      last_action = 'Separated from consolidated case ' || v_child.merged_into_case_id || '. Reason: ' || p_reason,
      last_action_at = v_now,
      updated_at = v_now
  WHERE case_id = p_child_case_id;

  -- Remove child from primary case
  IF v_primary.case_id IS NOT NULL THEN
    UPDATE public.cases
    SET merged_case_ids = array_remove(v_primary.merged_case_ids, p_child_case_id),
        last_action = 'Child complaint ' || p_child_case_id || ' unmerged from this case. Reason: ' || p_reason,
        last_action_at = v_now,
        updated_at = v_now
    WHERE case_id = v_primary.case_id;
  END IF;

  -- Log action on child
  INSERT INTO public.case_actions (
    action_id, case_id, action_type, remarks, bureau, officer, timestamp, related_case_id, justification, activity_category
  ) VALUES (
    'ACT-UNMERGE-CHILD-' || floor(extract(epoch from clock_timestamp()) * 1000)::text,
    p_child_case_id,
    'CASE_UNMERGED',
    'Separated from primary case ' || v_child.merged_into_case_id || '. Reason: ' || p_reason,
    v_child.bureau,
    v_acting_officer,
    v_now,
    v_child.merged_into_case_id,
    p_reason,
    'Status Change'
  );

  RETURN jsonb_build_object(
    'success', true,
    'childCaseId', p_child_case_id,
    'unmergedAt', v_now
  );
END;
$$;

-- Explicit RPC execution grants for authenticated officials
GRANT EXECUTE ON FUNCTION public.rpc_link_related_cases(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_merge_cases(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_unmerge_case(TEXT, TEXT, TEXT) TO authenticated;
