import { Institution, CaseRecord, CaseAction, OverlapAlert } from '../../types';
import { IStorageService, AppStorageData, StorageMode } from './types';
import { getSupabaseClient, isSupabaseConfigured } from '../supabaseClient';
import { LocalStorageService } from './localStorageService';
import { detectCrossBureauOverlaps } from '../../engine/overlapDetector';

export class SupabaseStorageService implements IStorageService {
  readonly mode: StorageMode = 'supabase';
  private fallbackService = new LocalStorageService();

  isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  async loadInitialData(): Promise<AppStorageData> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase is not configured; using local fallback.');
      return this.fallbackService.loadInitialData();
    }

    try {
      // 1. Fetch institutions
      const { data: instData, error: instError } = await supabase
        .from('institutions')
        .select('*')
        .order('name', { ascending: true });

      if (instError) throw instError;

      // 2. Fetch cases
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (casesError) throw casesError;

      // 3. Fetch actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('case_actions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (actionsError) throw actionsError;

      // 4. Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('overlap_alerts')
        .select('*')
        .order('detected_at', { ascending: false });

      if (alertsError) {
        console.warn('Could not fetch overlap_alerts from Supabase (may require table grant):', alertsError.message);
      }

      // If database has no institutions, fail loudly in cloud mode instead of falling back to synthetic seed
      if (!instData || instData.length === 0) {
        throw new Error('Supabase public.institutions table returned 0 rows. Target institutions must be present in the database.');
      }

      const institutions: Institution[] = instData.map(r => ({
        institutionId: r.institution_id,
        name: r.name,
        address: r.address,
        region: r.region,
        type: r.type,
        establishedYear: r.established_year,
        accreditationGrade: r.accreditation_grade,
        createdAt: r.created_at
      }));

      const cases: CaseRecord[] = (casesData || []).map(r => ({
        caseId: r.case_id,
        institutionId: r.institution_id,
        institutionName: r.institution_name,
        category: r.category,
        description: r.description,
        bureau: r.bureau,
        assignedOfficer: r.assigned_officer,
        status: r.status,
        priority: r.priority,
        complainantType: r.complainant_type,
        receivedAt: r.received_at,
        lastAction: r.last_action,
        nextAction: r.next_action,
        lastActionAt: r.last_action_at,
        expectedDisposalDate: r.expected_disposal_date,
        relatedCaseIds: r.related_case_ids || [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        completedAt: r.completed_at || undefined,
        completedBy: r.completed_by || undefined,
        completedByOfficerId: r.completed_by_officer_id || undefined,
        resolutionSummary: r.resolution_summary || undefined,
        reopenedAt: r.reopened_at || undefined,
        reopenedBy: r.reopened_by || undefined,
        reopenReason: r.reopen_reason || undefined,
        isMerged: r.is_merged || false,
        mergedIntoCaseId: r.merged_into_case_id || undefined,
        mergedCaseIds: r.merged_case_ids || [],
        mergedAt: r.merged_at || undefined,
        mergedBy: r.merged_by || undefined,
        mergeReason: r.merge_reason || undefined
      }));

      const actions: CaseAction[] = (actionsData || []).map(r => ({
        actionId: r.action_id,
        caseId: r.case_id,
        actionType: r.action_type,
        remarks: r.remarks,
        bureau: r.bureau,
        officer: r.officer,
        timestamp: r.timestamp
      }));

      let alerts: OverlapAlert[] = (alertsData || []).map(r => ({
        alertId: r.alert_id,
        institutionId: r.institution_id,
        institutionName: r.institution_name,
        caseIds: r.case_ids || [],
        involvedBureaus: r.involved_bureaus || [],
        reason: r.reason,
        confidence: r.confidence,
        reviewStatus: r.review_status,
        detectedAt: r.detected_at,
        coordinationRemarks: r.coordination_remarks || undefined,
        leadBureau: r.lead_bureau || undefined,
        reviewedBy: r.reviewed_by || undefined,
        reviewedAt: r.reviewed_at || undefined
      }));

      // If no persisted alerts exist in cloud database or table access is restricted,
      // dynamically compute authoritative cross-bureau overlap alerts using the detection engine
      if (alerts.length === 0 && cases.length > 0) {
        alerts = detectCrossBureauOverlaps(cases, institutions);
      }

      return {
        institutions,
        cases,
        actions,
        alerts,
        isDemoMode: false,
        storageMode: 'supabase'
      };
    } catch (err: any) {
      console.error('Error fetching data from Supabase:', err);
      throw new Error(`Failed to load cloud data from Supabase: ${err?.message || 'Unknown error'}`);
    }
  }

  async saveCase(record: CaseRecord): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.fallbackService.saveCase(record);
    }

    const payload = {
      case_id: record.caseId,
      institution_id: record.institutionId,
      institution_name: record.institutionName || null,
      category: record.category,
      description: record.description,
      bureau: record.bureau,
      assigned_officer: record.assignedOfficer,
      status: record.status,
      priority: record.priority,
      complainant_type: record.complainantType,
      received_at: record.receivedAt,
      last_action: record.lastAction,
      next_action: record.nextAction,
      last_action_at: record.lastActionAt,
      expected_disposal_date: record.expectedDisposalDate,
      related_case_ids: record.relatedCaseIds || [],
      created_at: record.createdAt,
      updated_at: record.updatedAt,
      completed_at: record.completedAt || null,
      completed_by: record.completedBy || null,
      completed_by_officer_id: record.completedByOfficerId || null,
      resolution_summary: record.resolutionSummary || null,
      reopened_at: record.reopenedAt || null,
      reopened_by: record.reopenedBy || null,
      reopen_reason: record.reopenReason || null,
      is_merged: record.isMerged || false,
      merged_into_case_id: record.mergedIntoCaseId || null,
      merged_case_ids: record.mergedCaseIds || [],
      merged_at: record.mergedAt || null,
      merged_by: record.mergedBy || null,
      merge_reason: record.mergeReason || null
    };

    const { error } = await supabase.from('cases').upsert(payload, { onConflict: 'case_id' });
    if (error) {
      console.error('Failed to upsert case in Supabase:', error.message);
      throw new Error(`Failed to save case [${record.caseId}] in Supabase: ${error.message}${error.code ? ` (Code: ${error.code})` : ''}`);
    }
  }

  async updateCase(caseId: string, updates: Partial<CaseRecord>): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.fallbackService.updateCase(caseId, updates);
    }

    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.status !== undefined) dbPayload.status = updates.status;
    if (updates.bureau !== undefined) dbPayload.bureau = updates.bureau;
    if (updates.priority !== undefined) dbPayload.priority = updates.priority;
    if (updates.lastAction !== undefined) dbPayload.last_action = updates.lastAction;
    if (updates.nextAction !== undefined) dbPayload.next_action = updates.nextAction;
    if (updates.lastActionAt !== undefined) dbPayload.last_action_at = updates.lastActionAt;
    if (updates.relatedCaseIds !== undefined) dbPayload.related_case_ids = updates.relatedCaseIds;
    if (updates.completedAt !== undefined) dbPayload.completed_at = updates.completedAt || null;
    if (updates.completedBy !== undefined) dbPayload.completed_by = updates.completedBy || null;
    if (updates.completedByOfficerId !== undefined) dbPayload.completed_by_officer_id = updates.completedByOfficerId || null;
    if (updates.resolutionSummary !== undefined) dbPayload.resolution_summary = updates.resolutionSummary || null;
    if (updates.reopenedAt !== undefined) dbPayload.reopened_at = updates.reopenedAt || null;
    if (updates.reopenedBy !== undefined) dbPayload.reopened_by = updates.reopenedBy || null;
    if (updates.reopenReason !== undefined) dbPayload.reopen_reason = updates.reopenReason || null;
    if (updates.isMerged !== undefined) dbPayload.is_merged = updates.isMerged;
    if (updates.mergedIntoCaseId !== undefined) dbPayload.merged_into_case_id = updates.mergedIntoCaseId || null;
    if (updates.mergedCaseIds !== undefined) dbPayload.merged_case_ids = updates.mergedCaseIds;
    if (updates.mergedAt !== undefined) dbPayload.merged_at = updates.mergedAt || null;
    if (updates.mergedBy !== undefined) dbPayload.merged_by = updates.mergedBy || null;
    if (updates.mergeReason !== undefined) dbPayload.merge_reason = updates.mergeReason || null;

    const { error } = await supabase.from('cases').update(dbPayload).eq('case_id', caseId);
    if (error) {
      console.error(`Failed to update case ${caseId} in Supabase:`, error.message);
      throw new Error(`Failed to update case [${caseId}] in Supabase: ${error.message}${error.code ? ` (Code: ${error.code})` : ''}`);
    }
  }

  async saveAction(action: CaseAction): Promise<void> {
    return this.saveActions([action]);
  }

  async saveActions(actions: CaseAction[]): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.fallbackService.saveActions(actions);
    }
    if (actions.length === 0) return;

    const payloads = actions.map(act => ({
      action_id: act.actionId,
      case_id: act.caseId,
      action_type: act.actionType,
      remarks: act.remarks,
      bureau: act.bureau,
      officer: act.officer,
      timestamp: act.timestamp
    }));

    const { error } = await supabase.from('case_actions').insert(payloads);
    if (error) {
      console.error('Failed to append actions in Supabase:', error.message);
      throw new Error(`Failed to append actions to Supabase: ${error.message}${error.code ? ` (Code: ${error.code})` : ''}`);
    }
  }

  async saveAlert(alert: OverlapAlert): Promise<void> {
    return this.saveAlerts([alert]);
  }

  async saveAlerts(alerts: OverlapAlert[]): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.fallbackService.saveAlerts(alerts);
    }
    if (alerts.length === 0) return;

    const payloads = alerts.map(alt => ({
      alert_id: alt.alertId,
      institution_id: alt.institutionId,
      institution_name: alt.institutionName,
      case_ids: alt.caseIds,
      involved_bureaus: alt.involvedBureaus,
      reason: alt.reason,
      confidence: alt.confidence,
      review_status: alt.reviewStatus,
      detected_at: alt.detectedAt,
      coordination_remarks: alt.coordinationRemarks || null,
      lead_bureau: alt.leadBureau || null,
      reviewed_by: alt.reviewedBy || null,
      reviewed_at: alt.reviewedAt || null
    }));

    const { error } = await supabase.from('overlap_alerts').upsert(payloads, { onConflict: 'alert_id' });
    if (error) {
      console.error('Failed to save overlap alerts in Supabase:', error.message);
      throw new Error(`Failed to save overlap alerts in Supabase: ${error.message}${error.code ? ` (Code: ${error.code})` : ''}`);
    }
  }

  async resetStorage(): Promise<AppStorageData> {
    // In multi-user Supabase mode, reset should only clear local demo caches, not wipe shared cloud tables!
    return this.fallbackService.resetStorage();
  }
}
