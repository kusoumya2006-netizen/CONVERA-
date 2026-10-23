# SIH26264 Requirement Traceability

This is an implementation-oriented mapping, not a claim of formal acceptance by SIH or AICTE.

| Intended outcome | Relevant implementation area | Verification approach |
|---|---|---|
| Consolidated complaint view | Case registry, dashboard, case context, storage services | Inspect cases from multiple supported bureaus |
| Institution-level visibility | Institution profiles and institution/case relationships | Compare profile with active/completed cases |
| Potential cross-bureau overlap | `src/engine/overlapDetector.ts`, semantic comparison, overlap UI | Test same canonical ID across bureaus and similar names with different IDs |
| Urgency and deadlines | Urgency calculator and dashboard views | Test past, near-term, and future deadlines |
| Coordination review | Overlap review and case workflow components | Record a decision and reload; ensure cases remain independent |
| Case action history | History helpers and storage/migration layer | Verify actor, timestamp, ordering, and persistence |
| Search and reporting | Registry filters and export/report services | Compare filtered results with exported rows |
| Multi-user access control | Auth service/context, Supabase policies and grants | Test allowed and denied actions using separate accounts |
| Deployment readiness | Vite build and hosting configuration | Build, deploy, refresh routes, smoke-test critical flows |

## Evidence rules
1. Link each requirement to exact source, test, migration, or captured run when available.
2. Do not mark a feature complete from a screenshot alone.
3. Frontend navigation checks do not prove database authorization.
4. Keep implemented capabilities separate from future proposals.
5. Update this table when requirements or implementation change.
