# CONVERA — Validation Status

This report separates previously reported results from verification that must be performed on the exact commit intended for evaluation.

## Previously reported release results

Repository release notes reported the following for commit `7de1b393a6ff98fd8843b107c375442519e76036`:
- 108/108 automated tests across 12 suites;
- TypeScript check and Vite production build successful;
- Vercel deployment reported completed.

These are historical/repository-reported results. They were not freshly executed during this documentation update. Re-run the commands below on the evaluation commit before relying on them.

## Evidence matrix

| Area | Current status | Required evidence |
|---|---|---|
| Automated tests | Previously reported passing; re-run required | Current output and commit SHA |
| TypeScript + production build | Previously reported passing; re-run required | Successful `npm run build` on current commit |
| Hosted deployment | Previously reported completed; re-check required | Current deployment state and live smoke test |
| Supabase migrations | Environment-dependent | Migration history and resulting schema |
| RLS and database grants | Not proven by build success | Allowed/denied tests with separate accounts |
| Case persistence | Environment-dependent | Create/update/reload verification in target mode |
| Overlap workflow | Needs scenario validation | Matching, non-matching, false-positive, and review scenarios |
| Multi-user end-to-end | Not proven by unit tests alone | Reproducible cloud-mode test |

## Re-run locally

```bash
npm ci
npm test
npm run build
```

Record branch, commit SHA, date, environment, commands, results, and evidence. Use the [validation checklist](docs/VALIDATION_CHECKLIST.md).

## Release gate

- [ ] Tests and build re-run on the evaluation commit.
- [ ] Demo records are synthetic and clearly identified.
- [ ] Authentication and direct-route behavior verified.
- [ ] Case writes persist after refresh in the intended mode.
- [ ] Overlap review preserves independent case records.
- [ ] Cloud RLS/grants tested with authorized and unauthorized accounts.
- [ ] No secrets appear in repository files or client bundles.
- [ ] Remaining limitations disclosed to evaluators.

Do not publish a pass percentage without defining the test set and listing the checks executed.
