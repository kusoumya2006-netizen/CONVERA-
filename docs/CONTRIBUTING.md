# Contributing to CONVERA

The goal is to improve reliability and readability without destabilizing working case-management flows.

## Before making a change

1. Pull the latest `main` and create a focused branch.
2. Read the relevant component, engine/service and tests before editing.
3. Identify whether the change affects local demo mode, Supabase cloud mode or both.
4. Keep unrelated refactors out of the same change.
5. Never commit credentials, real complaint data or private user information.

## Branch naming

Use short, descriptive branch names:

- `docs/readme-and-architecture`
- `fix/case-history-persistence`
- `feat/deadline-notifications`
- `test/overlap-edge-cases`

## Commit message convention

Use a concise type and imperative description:

- `docs: clarify cloud setup and architecture`
- `fix: preserve case history after status update`
- `feat: add deadline escalation indicator`
- `test: cover duplicate institution identifiers`
- `refactor: isolate case persistence adapter`
- `chore: update development tooling`

Keep commits small enough to review. Prefer one logical change per commit; avoid messages such as `update`, `final`, `changes` or `working version`.

## Validation before sharing

Run the checks relevant to the change:

```bash
npm test
npm run build
```

For changes to case lifecycle, overlap review, auth, storage, RLS or migrations, also follow the applicable steps in [VALIDATION_CHECKLIST.md](./VALIDATION_CHECKLIST.md). Do not claim a check passed unless it was run.

## Pull request / review notes

A useful change description should explain:

- **Why:** the problem or user workflow being improved.
- **What changed:** the behavior and files affected.
- **Risk:** whether authentication, persistence, migrations or permissions are affected.
- **Validation:** exact commands and manual flows run, with results.
- **Evidence:** screenshots for UI changes and redacted logs where useful.
- **Limitations:** anything not tested or still incomplete.

Database migrations should be reviewed for existing-data impact and RLS behavior. Never disable security policies to make a demo pass.
