# SIH26264 Requirement Traceability

This table maps the intended problem outcomes to CONVERA's implementation areas and verification methods. It is not a claim of formal acceptance or endorsement by SIH or AICTE.

| Intended outcome | Relevant implementation area | Verification approach |
|---|---|---|
| Consolidated complaint visibility | Case registry, dashboard, case context, storage services | Inspect supported cases across bureaus in the active storage mode |
| Institution-level history | Institution profiles and institution/case relationships | Compare profile counts with active and completed case records |
| Detect potential cross-bureau overlaps | `src/engine/overlapDetector.ts`, comparison logic, overlap UI | Test shared canonical IDs, similar names with distinct IDs, and missing identifiers |
| Surface urgency and deadlines | Priority/deadline logic and dashboard views | Test past, near-term, future, and boundary deadlines |
| Coordinate overlap review | Overlap review and case workflow components | Record review action and reload; confirm independent cases remain separate |
| Preserve case actions | History helpers and storage/migration layer | Verify actor, timestamp, order, and persistence where implemented |
| Search and report | Registry filters and export/report services | Compare selected filters and CSV rows |
| Support multi-user access boundaries | Auth service/context, Supabase policies and grants | Test permitted and denied operations with separate accounts |
| Demonstrate release readiness | Package scripts and deployment configuration | Run tests/build and perform deployed smoke tests |

## Evidence rules

1. Link rows to exact source files, tests, migrations, or validation records when available.
2. A screenshot alone does not prove a backend workflow is complete.
3. Frontend route guards do not prove database authorization.
4. Keep implemented capabilities separate from planned enhancements.
5. Record the branch and commit SHA for every validation run.
