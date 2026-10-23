# CONVERA — Validation Status

**Purpose:** distinguish automated evidence from manual and deployment-dependent checks.

## Latest repository-reported status

The most recently documented release reports:
- commit: `7de1b393a6ff98fd8843b107c375442519e76036`;
- automated tests: 108/108 across 12 suites;
- TypeScript check and Vite production build: reported successful;
- Vercel deployment: reported completed.

These are historical/repository-reported results, not a fresh execution performed by this document update. Re-run the commands on the current commit before relying on them for evaluation.

## Evidence categories

| Check | Current documentation status | What counts as verification |
|---|---|---|
| Unit tests | Previously reported passing; re-run required | Current terminal output and commit SHA |
| TypeScript + production build | Previously reported passing; re-run required | Successful `npm run build` on the current commit |
| Vercel deployment | Previously reported completed; re-check required | Current deployment status and live smoke test |
| Supabase migrations | Environment-dependent | Migration history and resulting schema in the target project |
| RLS and grants | Not established by build success | Positive and negative access tests with distinct accounts |
| Case lifecycle persistence | Environment-dependent | Create/update/reload verification against the intended storage mode |
| Cross-bureau overlap behavior | Unit/UI tests plus manual scenarios needed | Same-ID, different-ID, false-positive, and review-action scenarios |
| End-to-end multi-user behavior | Not established by unit tests alone | Reproducible end-to-end run against configured cloud mode |

## Re-run locally

```bash
npm ci
npm test
npm run build
```

Record the branch, commit SHA, date, environment, command, result, and evidence. Follow the detailed [validation checklist](docs/VALIDATION_CHECKLIST.md).

## Release gate

Before a live evaluation, confirm:
- [ ] All checks above were re-run on the intended commit.
- [ ] Demo data is synthetic and clearly identified.
- [ ] Authentication and direct-route behavior work in the target environment.
- [ ] Case writes persist after refresh.
- [ ] Overlap review does not merge or dispose of cases automatically.
- [ ] Cloud RLS/grants are tested with both authorized and unauthorized accounts.
- [ ] No secrets are present in repository files or client bundles.
- [ ] Known limitations are disclosed to evaluators.

Do not publish a pass percentage unless the test set and the exact executed checks are stated.
