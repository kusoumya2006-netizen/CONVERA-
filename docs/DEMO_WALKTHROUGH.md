# CONVERA Demo Walkthrough

**Audience:** SIH evaluators and project collaborators. Use synthetic/demo records only; metrics and institution details are illustrative unless independently verified.

## Suggested 5–7 minute sequence

### 1. Landing page
Introduce fragmented institution-level complaint visibility and position CONVERA as a coordination and decision-support prototype, not an autonomous adjudication system.

![CONVERA landing page](../public/assets/01-convera-landing.jpg)

### 2. Authentication
Explain that access depends on the configured provider, provisioned accounts, and backend authorization. Never display real credentials.

![CONVERA authentication](../public/assets/02-authentication.jpg)

### 3. Overview dashboard
Explain visible workload, urgency, case status, and activity; identify seeded demo data.

![Overview dashboard](../public/assets/03-overview-dashboard.jpg)

### 4. Case registry
Demonstrate search/filter and inspect a synthetic case's institution, bureau, status, officer, and deadline.

![Case registry](../public/assets/04-case-registry.jpg)

### 5. Overlap monitoring
Explain the candidate match rationale and coordination controls. An alert requests human review; it must not automatically merge, close, or dispose of either case.

![Overlap monitoring](../public/assets/05-overlap-monitoring.jpg)

### 6. Completed proceedings
Show resolution records and clarify persistence behavior for any reopening demonstration.

![Completed proceedings](../public/assets/06-completed-proceedings.jpg)

### 7. Institution profiles
Show consolidated institution activity while preserving each case's independent identity.

![Institution profiles](../public/assets/07-institution-profiles.jpg)

### 8. Reports and analytics
Finish with workload/ageing summaries and exports. Identify illustrative metrics and validation gaps.

![Reports and analytics](../public/assets/08-reports-analytics.jpg)

## Before presenting
- Run `npm test` and `npm run build` on the demonstration commit.
- Confirm the intended demo/cloud mode is active.
- Use synthetic records and hide secrets.
- Test one case workflow and one overlap-review workflow.
- Verify direct refresh and auth redirects in the deployed environment.
- Disclose outstanding database, RLS, multi-user, and end-to-end checks.
