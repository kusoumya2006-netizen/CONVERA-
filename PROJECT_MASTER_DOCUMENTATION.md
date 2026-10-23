# CONVERA — Project Master Documentation

<div align="center">

**Smart India Hackathon 2026 · SIH26264**  
*Institution complaint monitoring and cross-bureau coordination prototype*

</div>

## 1. Executive overview

CONVERA brings case status, urgency, institution history, potential overlaps, and supported reporting into one administrative workspace. It is designed to improve visibility across supported bureaus/cells while preserving the independent identity of each complaint.

This is an academic prototype, not an officially endorsed or deployed AICTE service. Public demo records and dashboard metrics may be synthetic.

## 2. Problem and intended outcomes

Separate teams may investigate complaints concerning the same institution without a consolidated view. That can lead to duplicated effort, inconsistent follow-up, missed deadlines, and fragmented history.

CONVERA aims to:
- consolidate supported complaint records into a searchable workspace;
- make status, urgency, and deadline information easier to review;
- surface potential cross-bureau overlaps for human review;
- connect institution information with related case activity;
- support traceable actions and summary reporting.

## 3. Functional modules

| Module | Purpose |
|---|---|
| Overview dashboard | Workload, urgency, status summaries, and activity |
| Case registry | Search, filter, inspect, and register cases |
| Overlap monitoring | Review potential cross-bureau conflicts and coordination state |
| Recent completions | Inspect recently disposed proceedings |
| Institution profiles | View institution information and related case activity |
| Reports & analytics | Review supported workload/ageing summaries and exports |
| Authentication | Sign-in and access flow for configured environments |

See [the demo walkthrough](docs/DEMO_WALKTHROUGH.md) for the presentation sequence.

## 4. Technology and architecture

- **Frontend:** React, TypeScript, Vite, Tailwind CSS.
- **Charts and icons:** Recharts and Lucide React.
- **Application state:** authentication and case workflow contexts.
- **Decision support:** urgency/deadline calculations and candidate overlap detection.
- **Persistence:** storage abstraction with local demo and configured Supabase implementations.
- **Cloud services:** Supabase Auth and PostgreSQL, with RLS/grants required for authorization.
- **Quality tooling:** Vitest and the project's TypeScript/Vite build scripts.

The architecture diagram and source responsibilities are described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 5. Data flow and review boundary

1. The user opens a view or interacts with a case/institution.
2. UI components coordinate through shared application contexts and services.
3. Logic derives urgency or candidate overlap information from available records.
4. The storage abstraction routes operations to local demo or configured cloud storage.
5. The UI presents the outcome and any available error state.
6. Supported actions can be reviewed through the record's history.

A candidate overlap is a signal for authorized review. It must not automatically merge, dismiss, or dispose of independent cases.

## 6. Local development

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm test
npm run build
npm run preview
```

For Supabase cloud mode, copy `.env.example` to `.env.local`, configure the public client URL/key, apply migrations in order, and provision appropriate test accounts.

## 7. Security and privacy boundaries

- Use synthetic records in public demonstrations and automated tests.
- Never commit secrets or real sensitive complaint data.
- Never expose a service-role key through a frontend `VITE_*` variable.
- Verify RLS and grants with allowed and denied operations using separate accounts.
- Do not claim production security without an appropriate security review.

## 8. Validation and release evidence

A passing unit test suite, successful build, deployment availability, and live authorization are separate kinds of evidence. Record them separately in [VALIDATION_STATUS.md](VALIDATION_STATUS.md) and follow [docs/VALIDATION_CHECKLIST.md](docs/VALIDATION_CHECKLIST.md).

Previously reported results must be re-run on the exact commit used for evaluation.

## 9. Known limitations

- Academic prototype; not an official AICTE product.
- Demo records and metrics may be illustrative.
- Overlap detection can produce false positives and false negatives.
- Cloud behavior depends on configuration, migrations, RLS/grants, auth redirects, and provisioned users.
- Live multi-user, security, and end-to-end checks must be verified in the intended environment.
