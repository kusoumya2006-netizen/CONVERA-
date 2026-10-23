# CONVERA — Project Master Documentation

> Smart India Hackathon 2026 · SIH26264 · Academic prototype

## Executive overview
CONVERA is an institution complaint-monitoring and cross-bureau coordination prototype. It gives authorized users a consolidated view of cases, deadlines, institution records, potential overlaps, actions, and reporting across administrative bureaus/cells.

**Design principle:** connected visibility without erasing case independence. A potential overlap prompts human review; it must not automatically merge, close, or dismiss a complaint. This is not an officially endorsed or deployed AICTE service. Demo metrics and records may be synthetic.

## Problem and objectives
Separate teams can work on cases concerning the same institution without a shared view, causing duplicated effort, inconsistent follow-up, missed deadlines, and fragmented history. CONVERA aims to consolidate supported complaint records, surface urgency, identify potential cross-bureau overlaps for review, provide institution-centric visibility, and support traceable actions and reporting.

## Modules
| Module | Purpose |
|---|---|
| Overview dashboard | Summary metrics, urgency queue, workload, and activity |
| Case registry | Search, filter, inspect, and register cases |
| Overlap monitoring | Review potential cross-bureau conflicts and coordination state |
| Recent completions | Inspect recently disposed proceedings |
| Institution profiles | View institution details and related case activity |
| Reports & analytics | Review supported workload/SLA summaries and exports |
| Authentication | Sign-in and access flow for configured environments |

## Technical architecture
- **UI:** React 18, TypeScript, Vite, Tailwind CSS.
- **Application state:** authentication and case workflow contexts.
- **Decision support:** urgency/deadline calculations and candidate overlap detection/comparison.
- **Persistence:** storage abstraction with local demo and Supabase-backed implementations.
- **Cloud:** Supabase Auth and PostgreSQL; RLS and grants are required for authorization.
- **Tests/build:** Vitest, TypeScript, Vite; Vercel configuration.

See [Architecture](docs/ARCHITECTURE.md) for source locations and data flow.

## Data flow
1. The user interacts with a case, institution, or coordination control.
2. React components use shared auth and case workflow contexts.
3. Application logic calculates urgency or identifies possible overlaps.
4. Storage routes operations to local demo storage or configured Supabase.
5. Cloud access must be enforced by database policy, not only hidden UI controls.
6. Relevant actions should remain reviewable in case history or audit-oriented records.

## Privacy and security
- Use synthetic data in public demos.
- Never commit secrets or real sensitive complaint data.
- Never expose a Supabase service-role key through a frontend `VITE_*` variable.
- Verify RLS and grants using both allowed and denied access tests.
- Do not claim production security without a security review.

## Local development
```bash
npm ci
npm run dev
npm test
npm run build
```
For cloud mode, copy `.env.example` to `.env.local`, configure the public Supabase URL/key, apply migrations in order, and provision test accounts.

## Evaluation walkthrough
1. Explain fragmented institution-level complaint visibility.
2. Show the dashboard and urgency indicators.
3. Find a synthetic case in the registry.
4. Review a potential overlap and its rationale.
5. Show institution history and completed proceedings.
6. Finish with analytics and disclose what has and has not been validated.

See [Demo Walkthrough](docs/DEMO_WALKTHROUGH.md).

## Validation
Do not combine unit tests, build success, deployment availability, and live authorization into one claim. Record each separately in [VALIDATION_STATUS.md](VALIDATION_STATUS.md), and follow [the checklist](docs/VALIDATION_CHECKLIST.md).

## Known limitations
- Academic prototype, not an official AICTE product.
- Demo records and metrics may be illustrative.
- Overlap detection can produce false positives and false negatives.
- Cloud correctness depends on environment setup, migrations, grants, RLS, auth configuration, and provisioned users.
- Live multi-user, security, and end-to-end checks must be verified in the target environment.
