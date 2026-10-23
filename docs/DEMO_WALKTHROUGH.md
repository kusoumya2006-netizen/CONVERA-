# CONVERA Demo Walkthrough

**Audience:** SIH evaluators and project collaborators. Use synthetic/demo records only; metrics and institution details are illustrative unless independently verified.

## Suggested 5–7 minute sequence

### 1. Landing page
Introduce fragmented institution-level complaint visibility and position CONVERA as a coordination and decision-support prototype, not an autonomous adjudication system.

![CONVERA landing page](assets/screenshots/01-convera-landing.png)

### 2. Authentication
Explain that access depends on the configured provider, provisioned accounts, and backend authorization. Never display real credentials.

![CONVERA authentication](assets/screenshots/02-authentication.png)

### 3. Overview dashboard
Explain visible workload, urgency, case status, and activity; identify seeded demo data.

![Overview dashboard](assets/screenshots/03-overview-dashboard.png)

### 4. Case registry
Demonstrate search/filter and inspect a synthetic case's institution, bureau, status, officer, and deadline.

![Case registry](assets/screenshots/04-case-registry.png)

### 5. Overlap monitoring
Explain the candidate match rationale and coordination controls. An alert requests human review; it must not automatically merge, close, or dispose of either case.

![Overlap monitoring](assets/screenshots/05-overlap-monitoring.png)

### 6. Completed proceedings
Show resolution records and clarify persistence behavior for any reopening demonstration.

![Completed proceedings](assets/screenshots/06-completed-proceedings.png)

### 7. Institution profiles
Show consolidated institution activity while preserving each case's independent identity.

![Institution profiles](assets/screenshots/07-institution-profiles.png)

### 8. Reports and analytics
Finish with workload/ageing summaries and exports. Identify illustrative metrics and validation gaps.

![Reports and analytics](assets/screenshots/08-reports-analytics.png)

## Before presenting
- Run `npm test` and `npm run build` on the demonstration commit.
- Confirm the intended demo/cloud mode is active.
- Use synthetic records and hide secrets.
- Test one case workflow and one overlap-review workflow.
- Verify direct refresh and auth redirects in the deployed environment.
- Disclose outstanding database, RLS, multi-user, and end-to-end checks.
