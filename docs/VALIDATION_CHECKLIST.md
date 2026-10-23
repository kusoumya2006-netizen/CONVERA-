# CONVERA Validation Checklist

Use this checklist for a repeatable local and deployed smoke test. Record the date, commit SHA, environment (local/demo/cloud), tester and evidence for each run. A checkbox should be marked complete only after the step has actually been executed.

## 1. Build and automated tests

- [ ] Record the current commit SHA.
- [ ] Install dependencies from the lockfile with `npm ci`.
- [ ] Run `npm test` and save the terminal result.
- [ ] Run `npm run build` and confirm TypeScript/Vite complete successfully.
- [ ] Inspect browser console and terminal output for unexpected errors.

## 2. Authentication and route protection

- [ ] A valid, provisioned account can sign in.
- [ ] Invalid credentials produce a clear error without exposing secrets.
- [ ] Sign-out clears the authenticated session as expected.
- [ ] Protected views do not become accessible by bypassing the UI.
- [ ] Role/Bureau behavior matches the configured account and permissions.
- [ ] Direct URL navigation and page refresh behave as expected.

## 3. Case lifecycle and history

- [ ] Create a synthetic case with a unique reference.
- [ ] Confirm institution, receiving Bureau/Cell, status and deadline are saved correctly.
- [ ] Update the case status and verify the persisted value after refresh.
- [ ] Record an officer action and inspect the chronological history.
- [ ] Verify actor identity, timestamp, action type and details are correct where supported.
- [ ] Test reassignment, escalation, reopening and resolution flows that are enabled.
- [ ] Simulate or safely test a failed write; the UI must not show false success.
- [ ] For multi-step writes, inspect behavior when one operation fails after another succeeds.

## 4. Overlap review and coordination

- [ ] Create two synthetic cases for the same canonical institution ID in different Bureaus.
- [ ] Confirm the expected potential-overlap candidate is surfaced.
- [ ] Test a similar institution name with a different canonical ID to check false-positive behavior.
- [ ] Inspect the match rationale/confidence information available in the UI.
- [ ] Record a coordination decision and verify it persists.
- [ ] Confirm an overlap alert alone does not merge, close or dispose of either case.
- [ ] Verify cross-references do not erase each case's independent identity or history.

## 5. Supabase authorization and persistence

Run these checks in a non-production/test project with synthetic data.

- [ ] Apply and review migrations in order against the intended schema.
- [ ] Confirm every required table has the expected RLS policies and grants.
- [ ] Test allowed reads/writes using an authorized account.
- [ ] Test denied reads/writes using a less-privileged or unrelated account.
- [ ] Confirm one Bureau cannot access records beyond its intended scope, if that restriction is part of the policy.
- [ ] Confirm auth identity/profile mapping works for provisioned users.
- [ ] Verify a successful write in the database and after a fresh page load.
- [ ] Confirm no service-role key, secret key, password or real complaint data is exposed in the browser bundle or Git history.

## 6. Deployment and demo readiness

- [ ] Required Vercel environment variables are set for the target environment.
- [ ] Supabase production site URL and allowed auth redirect URLs are configured.
- [ ] The deployed landing page and dashboard load without console errors.
- [ ] Direct route refresh works.
- [ ] Case creation, case history, overlap review and coordination write paths are smoke-tested against the deployed environment.
- [ ] The demonstration dataset is synthetic and labeled as such.
- [ ] Screenshots and demo instructions reflect the current UI.
- [ ] Known limitations are documented before presentation.

## Evidence log template

Copy this block for each validation run:

```text
Date/time:
Commit SHA:
Environment: local / demo / cloud
Tester:
Command or workflow:
Expected result:
Observed result:
Evidence link or file:
Status: PASS / FAIL / BLOCKED
Follow-up issue:
```

## Reporting rule

Do not publish a pass percentage without defining the test set and showing which checks were run. Unit tests, successful builds, UI walkthroughs, database authorization tests and end-to-end tests cover different failure modes; report them separately.
