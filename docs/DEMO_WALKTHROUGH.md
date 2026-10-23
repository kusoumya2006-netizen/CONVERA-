# CONVERA Demo Walkthrough

**Audience:** SIH evaluators, reviewers, and project collaborators  
**Scenario:** show how institution-level visibility can help authorized officials review concurrent complaints.

Use synthetic/demo records only. Metrics and institution details shown in screenshots are illustrative unless independently verified.

## Suggested 5–7 minute walkthrough

### 01 · Landing page — establish the problem

Introduce the challenge: separate bureaus can have fragmented visibility into complaints concerning the same institution. Position CONVERA as a coordination and decision-support prototype, not an autonomous adjudication system.

![Landing page](assets/screenshots/01-convera-landing.jpg)

### 02 · Authentication — explain access boundaries

Show the sign-in/registration surface. Explain that actual access depends on the configured provider, provisioned accounts, and backend authorization. Do not show real credentials.

![Authentication](assets/screenshots/02-authentication.jpg)

### 03 · Overview dashboard — orient the evaluator

Explain the displayed workload, urgency indicators, case status, and action stream. Identify which values are seeded demonstration data.

![Overview dashboard](assets/screenshots/03-overview-dashboard.jpg)

### 04 · Case registry — locate a record

Demonstrate search and supported filters. Select a synthetic case and explain its institution, bureau, status, assigned officer, and deadline.

![Case registry](assets/screenshots/04-case-registry.jpg)

### 05 · Overlap monitoring — show the differentiator

Explain why active cases may be flagged and walk through the match rationale and coordination controls. An alert requests human review; it must not automatically merge, close, or dispose of either case.

![Overlap monitoring](assets/screenshots/05-overlap-monitoring.jpg)

### 06 · Completed proceedings — show outcomes

Show recently disposed cases and resolution summaries. If reopening is demonstrated, confirm its actual persistence behavior in the active environment.

![Completed proceedings](assets/screenshots/06-completed-proceedings.jpg)

### 07 · Institution profiles — connect the history

Show the consolidated institution view while preserving the independent identity of each complaint.

![Institution profiles](assets/screenshots/07-institution-profiles.jpg)

### 08 · Reports and analytics — close with visibility

Finish with workload/ageing summaries and exports. Explain which values are illustrative and which workflows have been validated.

![Reports and analytics](assets/screenshots/08-reports-analytics.jpg)

## Before presenting

- Run `npm test` and `npm run build` on the evaluation commit.
- Confirm the intended demo/cloud mode is active.
- Use synthetic records and keep secrets off-screen.
- Test one case workflow and one overlap-review workflow.
- Verify direct refresh and authentication redirects in the deployed environment.
- Disclose any outstanding database, RLS, multi-user, or end-to-end checks.
