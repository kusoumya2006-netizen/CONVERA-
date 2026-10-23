# Database Schema and Access-Control Review

The ordered SQL files in `supabase/migrations/` are the source of truth. This document is a review guide rather than a guessed schema inventory.

## Sources of truth
- `supabase/migrations/` — schema, indexes, policies, grants, and data changes.
- `src/services/storage/` — persistence adapters and data mapping.
- `src/types/` — TypeScript domain shapes.
- `.env.example` — public client configuration placeholders.

## Review workflow
1. Review migration files in order.
2. Record each table, key, foreign key, index, constraint, trigger, and enum.
3. Trace persisted objects to storage adapters and TypeScript types.
4. Identify client-accessible tables and document RLS policies and grants.
5. Verify identity/profile mapping and least-privilege behavior.
6. Apply migrations to a disposable Supabase project and inspect resulting schema.
7. Test allowed and denied reads/writes with separate accounts.
8. Check referential integrity and partial-failure behavior for multi-step writes.

## Minimum security checks
- RLS is enabled where required.
- Grants and policies are least-privilege and consistent.
- Service-role secrets never reach the browser.
- Users cannot elevate their privileges through client-controlled data.
- Case history and overlap records are protected by intended permissions.
- Overlap review never automatically merges or disposes of independent complaints.
- Seed records are synthetic and failed writes are surfaced accurately.

## Schema inventory template
| Field | Record |
|---|---|
| Table | Exact SQL identifier |
| Purpose | Domain responsibility |
| Primary key | Exact constraint |
| Relationships | Foreign keys and delete/update behavior |
| RLS | Enabled state and policy names |
| Grants | Roles and allowed operations |
| Application mapping | Storage adapter/type file |
| Evidence | Migration, query, and test results |

Do not mark cloud readiness complete until deployed schema, grants, and policies have been inspected and exercised.
