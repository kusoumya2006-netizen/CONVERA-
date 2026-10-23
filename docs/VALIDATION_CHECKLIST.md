# CONVERA Validation Checklist

Use this checklist for a repeatable local and deployed smoke test. Record the date, commit SHA, environment (local/demo/cloud), tester, and evidence for each run. Check an item only after it has been exercised.

## 1. Repository and build

- [ ] Confirm the branch and commit SHA being evaluated.
- [ ] Install from the lockfile using `npm ci`.
- [ ] Run `npm test` and save the output.
- [ ] Run `npm run build` and save the output.
- [ ] Check browser console and terminal for runtime errors.

## 2. Landing and navigation

- [ ] Landing page renders at the intended viewport.
- [ ] Live demo and internal navigation links work.
- [ ] Direct URL refresh works for supported routes.
- [ ] Empty, loading, error, and no-result states are understandable.
- [ ] Layout remains usable at a smaller viewport.

## 3. Authentication and access

- [ ] Sign-in success and failure are handled correctly.
- [ ] Sign-out returns to the expected access boundary.
- [ ] Protected routes do not expose private views to signed-out users.
- [ ] Password/reset or registration behavior is checked if enabled.
- [ ] Cloud mode uses separate test accounts with different permissions.
- [ ] Unauthorized direct database requests are denied by policy.

## 4. Case lifecycle

- [ ] Register a synthetic case.
- [ ] Search and filter it in the registry.
- [ ] Change supported status/priority/assignment fields.
- [ ] Confirm values after reload in the intended storage mode.
- [ ] Verify invalid inputs and failed writes show useful feedback.
- [ ] Check that the case remains identifiable through history and exports.

## 5. Overlap and coordination

- [ ] Same institution identifier across bureaus produces the expected candidate result.
- [ ] Similar institution names with different identifiers are checked for false positives.
- [ ] Missing or malformed identifiers are handled safely.
- [ ] Resolved/closed cases follow the intended eligibility rules.
- [ ] Alert rationale is understandable to a reviewer.
- [ ] Review/coordination action is persisted where supported.
- [ ] No overlap signal automatically merges or disposes of independent cases.

## 6. Institution profiles and reporting

- [ ] Institution search/filter returns expected synthetic records.
- [ ] Profile case counts reconcile with visible case records.
- [ ] Completed proceedings display the intended resolution metadata.
- [ ] CSV exports open and match the selected filters.
- [ ] Charts and summary metrics reconcile with the underlying demo dataset.

## 7. Supabase cloud checks

- [ ] Required migrations are applied in order.
- [ ] Tables, indexes, foreign keys, grants, and RLS policies are inspected.
- [ ] Allowed reads/writes work with an authorized account.
- [ ] Disallowed reads/writes fail with a separate account.
- [ ] User role/profile mapping cannot be escalated from client-controlled data.
- [ ] Auth redirect URLs match the deployed environment.
- [ ] No service-role key or secret is included in the client bundle.

## 8. Release evidence

- [ ] All checks are recorded against the exact evaluation commit.
- [ ] Demo data is synthetic and identified.
- [ ] Screenshots match the current application.
- [ ] Deployment status and live smoke test are recorded separately from build results.
- [ ] Remaining limitations are disclosed to evaluators.

## Run record template

| Field | Value |
|---|---|
| Date / tester | |
| Branch / commit SHA | |
| Environment | Local demo / Supabase cloud / deployed |
| Commands and scenarios | |
| Result | Pass / Fail / Blocked |
| Evidence link or notes | |
| Follow-up owner | |

Do not convert unchecked or blocked items into a passing score.
