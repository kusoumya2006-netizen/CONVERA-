# Database Schema and Access-Control Review

The ordered SQL files in `supabase/migrations/` are the source of truth for the deployed schema. This document describes how to review that schema without guessing table definitions.

## Sources of truth

- `supabase/migrations/` — ordered schema, indexes, policies, grants, and data changes.
- `src/services/storage/` — persistence adapters and application data mapping.
- `src/types/` — TypeScript domain shapes.
- `.env.example` — public client configuration placeholders.

## Schema review process

1. Review migration files in lexical order.
2. Inventory tables, primary keys, foreign keys, indexes, checks, enums, and triggers.
3. Trace persisted objects to storage adapters and TypeScript types.
4. Identify client-accessible tables and list their RLS policies and grants.
5. Verify the intended mapping between authenticated users, profiles, and roles.
6. Apply migrations to a disposable Supabase project and inspect the resulting schema.
7. Test permitted and denied reads/writes with distinct accounts.
8. Check referential integrity and partial-failure behavior for multi-step writes.

## Minimum security checks

- RLS is enabled where required for client-accessible tables.
- Grants and policies are least-privilege and mutually consistent.
- Service-role secrets never reach the browser.
- Users cannot elevate their privileges by modifying client-controlled profile data.
- Case history and overlap records are protected by intended permissions.
- An overlap review cannot automatically merge or dispose of independent complaints.
- Seed records are synthetic.
- Failed writes are surfaced accurately instead of appearing successful.

## Schema inventory template

| Field | Record |
|---|---|
| Table | Exact SQL identifier |
| Purpose | Domain responsibility |
| Primary key | Exact constraint |
| Relationships | Foreign keys and delete/update behavior |
| RLS | Enabled state and policy names |
| Grants | Roles and permitted operations |
| Application mapping | Storage adapter/type file |
| Evidence | Migration, query, and test result |

Do not mark cloud readiness complete until the deployed schema, grants, and policies have been inspected and exercised.

## Related documents

- [Architecture](ARCHITECTURE.md)
- [Validation checklist](VALIDATION_CHECKLIST.md)
- [Validation status](../VALIDATION_STATUS.md)
