# CONVERA — Validation Status

## Previously reported release results
The latest release notes in this repository reported commit `7de1b393a6ff98fd8843b107c375442519e76036`, 108/108 automated tests across 12 suites, a successful TypeScript/Vite production build, and a completed Vercel deployment.

These are historical/repository-reported results, not a fresh execution performed during this documentation update. Re-run commands on the current commit before relying on them.

## Evidence categories
| Check | Status | Evidence required |
|---|---|---|
| Unit tests | Previously reported passing; re-run | Current terminal output and commit SHA |
| TypeScript + production build | Previously reported passing; re-run | Successful `npm run build` on current commit |
| Vercel deployment | Previously reported completed; re-check | Current deployment and live smoke test |
| Supabase migrations | Environment-dependent | Migration history and resulting schema |
| RLS and grants | Not established by build success | Allowed and denied tests with distinct accounts |
| Case lifecycle persistence | Environment-dependent | Create/update/reload verification |
| Overlap behavior | Unit/UI tests plus scenarios | Same ID, different ID, false-positive and review scenarios |
| Multi-user end-to-end | Not established by unit tests alone | Reproducible cloud-mode test |

## Re-run locally
```bash
npm ci
npm test
npm run build
```
Record branch, commit SHA, date, environment, command, result, and evidence. Follow [the validation checklist](VALIDATION_CHECKLIST.md).

## Release gate
- [ ] Checks re-run on intended commit.
- [ ] Demo data is synthetic and identified.
- [ ] Authentication and direct-route behavior verified.
- [ ] Case writes persist after refresh.
- [ ] Overlap review never merges/disposes cases automatically.
- [ ] Cloud RLS/grants tested with authorized and unauthorized accounts.
- [ ] No secrets in repository or client bundles.
- [ ] Limitations disclosed to evaluators.

Do not publish a pass percentage without defining the test set and listing executed checks.
