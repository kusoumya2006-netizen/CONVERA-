# CONVERA — Project Master Documentation

> Smart India Hackathon 2026 · SIH26264 · Academic prototype

## 1. Executive overview

CONVERA is an institution complaint-monitoring and cross-bureau coordination prototype. Its objective is to give authorized users a consolidated view of cases, deadlines, institution records, potential overlaps, actions, and reporting across administrative bureaus/cells.

The central design principle is **connected visibility without erasing case independence**. A possible overlap should prompt authorized review; it must not automatically merge, close, or dismiss a complaint.

## 2. Problem context and objectives

Separate teams can work on cases concerning the same institution without an easy shared view. This may cause duplicated administrative effort, inconsistent follow-up, deadline slippage, and fragmented case history.

CONVERA aims to:
- consolidate supported complaint records into a searchable workspace;
- make status, urgency, and deadline information easier to review;
- surface potential cross-bureau overlaps with a review workflow;
- maintain institution-centric visibility across related cases;
- support traceable case actions and summary reporting.

This repository describes a prototype, not an officially endorsed AICTE service. Demonstration metrics and records may be synthetic.

## 3. User-facing modules

| Module | Purpose |
|---|---|
| Overview dashboard | Summary metrics, urgency queue, workload, and activity |
| Case registry | Search, filter, inspect, and register cases |
| Overlap monitoring | Review candidate cross-bureau conflicts and coordination state |
| Recent completions | Inspect recently disposed proceedings and resolutions |
| Institution profiles | View institution details and related case activity |
| Reports & analytics | Review supported workload/SLA summaries and export data |
| Authentication | Sign-in and access flow for configured environments |

Exact capabilities depend on the active branch and environment. Use the implementation and validation checklist as the source of truth.

## 4. Technical architecture

- **UI:** React 18, TypeScript, Vite, Tailwind CSS.
- **Application state:** authentication and case workflow contexts.
- **Decision-support logic:** urgency/deadline calculation and candidate overlap detection/comparison.
- **Persistence:** storage abstraction with local demo and Supabase-backed implementations.
- **Cloud services:** Supabase Auth and PostgreSQL, with RLS/grants required for authorization.
- **Tests:** Vitest.
- **Build/hosting:** Vite production build and Vercel configuration.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for source locations and data flow.

## 5. Data and decision flow

1. The user opens a view and interacts with a case, institution, or coordination control.
2. React components coordinate with the shared auth and case workflow contexts.
3. Application logic calculates urgency or identifies possible overlaps from available case/institution attributes.
4. The storage adapter routes operations to local demo storage or configured Supabase services.
5. The UI reports the outcome of supported operations; cloud authorization must be enforced by database policy, not only by hiding controls.
6. Relevant actions should remain reviewable in the case's history or audit-oriented records.

Overlap results should communicate their rationale and uncertainty where supported. Human review remains necessary to avoid false positives and preserve independent proceedings.

## 6. Data and privacy boundaries

- Use synthetic data in public demos and automated tests.
- Keep secrets out of source control and frontend bundles.
- Never place a Supabase service-role secret in a Vite `VITE_*` variable.
- Verify RLS policies and grants against the actual schema before cloud use.
- Test both allowed and denied access with separate accounts.
- Do not describe the prototype as production-secure without an appropriate security review.

## 7. Local development

```bash
npm ci
npm run dev
```

Useful checks:

```bash
npm test
npm run build
npm run preview
```

For cloud mode, copy `.env.example` to `.env.local` and configure only the required public Supabase URL/key. Apply migrations in order and provision appropriate test accounts before validating cloud workflows.

## 8. Evaluation walkthrough

1. Introduce the institution-level fragmentation problem.
2. Show the dashboard and explain how it summarizes work and urgency.
3. Search for a case in the registry.
4. Open overlap monitoring and explain why a candidate is flagged.
5. Demonstrate that an overlap requires review rather than automatic merging.
6. Show institution history and completed proceedings.
7. End with reports/exports and explain validation status and limitations.

See [docs/DEMO_WALKTHROUGH.md](docs/DEMO_WALKTHROUGH.md).

## 9. Quality and verification

Do not combine test results, successful compilation, deployment availability, and live authorization into a single claim. Record each separately in [VALIDATION_STATUS.md](VALIDATION_STATUS.md), and use [docs/VALIDATION_CHECKLIST.md](docs/VALIDATION_CHECKLIST.md) for repeatable evidence collection.

## 10. Known limitations to disclose

- This is an academic prototype; it is not an official AICTE product.
- Demo records and dashboard metrics may be illustrative.
- Overlap detection is decision support and can produce false positives/negatives.
- Cloud-mode correctness depends on environment setup, migrations, grants, RLS, auth configuration, and provisioned users.
- Live multi-user, security, and deployment checks must be verified in the intended environment.
