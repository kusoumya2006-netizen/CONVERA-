# Contributing to CONVERA

Thanks for helping improve CONVERA. The priority is to improve reliability, clarity, and reviewability without destabilizing existing case-management workflows.

## Before making a change

1. Sync with the latest `main` and create a focused branch.
2. Read the relevant source, tests, migrations, and documentation.
3. Confirm whether a change affects local demo mode, Supabase cloud mode, or both.
4. Keep unrelated formatting and generated-file changes out of the diff.
5. Never include real complaint data, credentials, tokens, or private environment files.

## Development workflow

```bash
npm ci
npm test
npm run build
```

Use the package scripts defined by the repository. If a script is unavailable on your branch, report that rather than silently substituting a different command.

## Engineering expectations

- Keep React components focused and accessible.
- Prefer explicit TypeScript types over broad unsafe casts.
- Keep business rules testable outside the UI where practical.
- Add or update tests for overlap, priority, status, and persistence behavior.
- Preserve each case's identity and history when changing coordination flows.
- Do not let a candidate overlap automatically merge, dismiss, or dispose of cases.
- Treat database migrations as ordered, forward-moving changes; inspect RLS and grants carefully.
- Never put server-side secrets into frontend `VITE_*` variables.

## Documentation expectations

- Update README/docs when behavior, setup, environment variables, or limitations change.
- Use real screenshots of the current UI and synthetic records only.
- Keep links relative where possible so documentation works in GitHub and local clones.
- Label results as verified, reported, or pending; do not fabricate metrics or test outcomes.

## Pull request checklist

- [ ] Scope is focused and existing changes are preserved.
- [ ] Relevant tests were added or updated.
- [ ] `npm test` was run.
- [ ] `npm run build` was run.
- [ ] Database/RLS implications were reviewed where applicable.
- [ ] Screenshots and docs match actual behavior.
- [ ] No secrets or sensitive records are included.
- [ ] Known limitations are stated clearly.
