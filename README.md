# CONVERA — Integrated Institution Complaint Monitoring & Status Dashboard

> **One Institution. Connected Intelligence. Coordinated Action.**
>
> Developed for Smart India Hackathon 2026 · Problem Statement SIH26264

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest-6E9F18)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Live demo:** [Open CONVERA](https://convera-olvphbja7-kusoumya2006-netizens-projects.vercel.app/)  
**Repository:** [kusoumya2006-netizen/CONVERA-](https://github.com/kusoumya2006-netizen/CONVERA-)

---

## Overview

CONVERA is a centralized complaint-monitoring and cross-bureau coordination prototype designed around the AICTE problem statement. It gives authorized officials a consolidated view of institution-related cases handled by the Regulation Bureau (RB), Public Grievance Redressal Cell (PGRC), and other configured Bureaus/Cells.

The core objective is to help officials identify potentially overlapping actions, understand who is handling each case, coordinate next steps, track timelines, and preserve a clear history of decisions—without accidentally merging, disposing of, or dismissing independent complaints.

### The problem

When different Bureaus handle complaints about the same technical institution, separate workflows can lead to duplicated effort, conflicting action, delayed disposal, and uncertainty about case ownership. CONVERA provides a shared operational view to help surface these risks and support coordinated decisions.

### The proposed workflow

1. Register or load an institution-related complaint.
2. Associate it with the institution's canonical ID and receiving Bureau/Cell.
3. Detect potentially overlapping active cases across Bureaus.
4. Explain the match and allow authorized officials to review it.
5. Record coordination decisions, ownership, follow-up and escalation.
6. Track case history, deadlines, status and performance through the dashboard and reports.

## Key capabilities

### 1. Unified dashboard and urgency queue
- Consolidated case counts and status indicators based on loaded records.
- Deadline-aware prioritization for overdue, due-soon, high-priority and escalated cases.
- Explainable urgency indicators and countdowns when valid deadline data is available.
- Bureau and status views intended to help officials identify cases requiring attention.

### 2. Cross-bureau overlap intelligence
- Primary matching using normalized institution identifiers.
- Institution-name fallback where an ID is unavailable, with lower-confidence matching.
- Identification of active cases spanning multiple Bureaus, including RB and PGRC.
- Reviewable potential-overlap alerts and explanations.
- Case linking and coordination workflows designed to preserve each complaint's individual identity and history.

### 3. Institution profiles
- Institution directory using canonical institution IDs.
- Consolidated view of related complaints and cross-bureau activity.
- Institution-level context for reviewing concurrent cases and regulatory actions.

### 4. Case lifecycle and action history
- Case registration, status updates, reassignment, escalation and reopening workflows.
- Chronological action history and resolution information where recorded.
- Related-case references and merge/unmerge support where enabled.
- Persistence-first cloud writes with visible error handling rather than false success notifications.

### 5. Search, filters and reports
- Search and filter by case, institution, Bureau/Cell, region, category, status and supported date fields.
- Dashboard analytics for workload, status, ageing and deadlines.
- CSV export for supported reports.

### 6. Coordination and accountability
- Inter-Bureau Coordination Console for documenting review decisions and directives.
- Designated lead Bureau/Cell and coordination notes.
- Optional cross-reference links between involved cases.
- Coordination is intended to help officials decide the appropriate course of action; an overlap alert must not automatically dispose of, merge or dismiss a complaint.

### 7. Authentication and cloud persistence
- Supabase Auth for configured official accounts.
- Supabase PostgreSQL tables for institutions, cases, case actions, profiles and overlap alerts.
- Row-Level Security (RLS) intended to enforce authorized access.
- Local demo storage is supported for development/demo use; configured cloud mode should use Supabase as the source of truth.

> **Prototype note:** This project is an academic demonstration. Validate permissions and every database workflow in the target environment before using real or sensitive complaint data. A deployed frontend does not, by itself, prove that every Supabase write path or RLS policy is correctly configured.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Authentication & database | Supabase Auth, PostgreSQL, PostgREST |
| Persistence architecture | Storage abstraction with Supabase and local demo implementations |
| Testing | Vitest |
| Hosting | Vercel |

## Architecture at a glance

```text
Authorized Official
       |
       v
CONVERA React + TypeScript UI
       |
       v
Case Context / Workflow & Intelligence Engines
       |
       v
Storage Abstraction
       |                         |
       v                         v
Supabase Cloud Mode        Local Demo Mode
       |
       v
PostgreSQL + Auth + RLS
  - profiles
  - institutions
  - cases
  - case_actions
  - overlap_alerts
```

The overlap and urgency engines provide application-level decision support. Database permissions and RLS remain responsible for enforcing access to persisted records; hiding a UI control is not a security boundary.

## Live demo

**URL:** https://convera-olvphbja7-kusoumya2006-netizens-projects.vercel.app/

The deployed demo uses the environment variables configured in Vercel at build time. If the site is moved to another Vercel project or domain, configure the required variables and Supabase Auth redirect URLs for that environment.

### Demo walkthrough

1. Open the live demo and sign in with an account provisioned in the connected Supabase Auth project.
2. Review the dashboard and active urgency queue.
3. Open the overlap monitoring view and inspect cases associated with the same institution.
4. Review the match explanation and open the Inter-Bureau Coordination Console.
5. Record a coordination decision and, where appropriate, create case cross-references.
6. Open the case registry and inspect the individual case history.
7. Test an allowed status/action update and verify it persists after refreshing.
8. Verify saved records in Supabase when validating cloud persistence.

**Demo data:** Seed records are synthetic and intended for demonstration. Do not interpret sample cases, institutions, officers, deadlines or outcomes as actual AICTE records.

## Local development

### Prerequisites
- Node.js 18 or later
- npm 9 or later

### Install and run

```bash
git clone https://github.com/kusoumya2006-netizen/CONVERA-.git
cd CONVERA-
npm install
npm run dev
```

Vite prints the local development URL in the terminal, commonly http://localhost:5173.

### Environment variables

Create a local `.env` file in the project root for cloud mode:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use the Supabase **publishable key** (or legacy anon key if that is what the project is configured to use). These client keys are intended to be exposed to the browser; access must be restricted through appropriate RLS policies and database grants.

**Never put a Supabase secret key, service-role key, database password, or other server credential in a `VITE_*` variable or commit it to Git.** Vite embeds `VITE_*` values in the client bundle.

The repository's `.gitignore` excludes local environment files. Keep real values out of source control and use Vercel Project Settings → Environment Variables for deployed builds.

### Database setup

The repository includes SQL migrations under `supabase/migrations/`. Review the schema and policies, then apply migrations to the intended Supabase project in the documented order using the Supabase SQL Editor or Supabase CLI.

Before applying migrations to an existing project:
- Back up important data.
- Review each migration and its assumptions.
- Confirm that seed scripts use valid institution IDs.
- Preserve RLS; do not resolve permission errors by disabling policies or granting unrestricted access.
- Do not insert users directly into `auth.users` with ad hoc SQL. Provision accounts through supported Supabase Auth workflows and create the corresponding application profile as required.

## Tests and production build

Run the test suite:

```bash
npm test -- --run
```

Create the production build:

```bash
npm run build
```

The production assets are written to `dist/`.

Test results can change as the project evolves. Run the commands against the current checkout and inspect the output rather than relying on a previously reported result.

## Deploying to Vercel

The repository includes a root-level `vercel.json` for Vite SPA routing.

1. Import the GitHub repository into Vercel.
2. Confirm the Vite framework preset and root directory `./`.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the intended deployment environment.
5. Deploy, then test login, dashboard loading, direct route refresh, complaint creation, action history and coordination writes.
6. Configure the production site URL and allowed redirect URLs in Supabase Auth.

Changes to Vite environment variables require a new deployment/build.

## Security and operational considerations

- Supabase RLS and grants must be verified for every table and operation.
- Test with accounts representing each intended Bureau and role.
- Do not treat frontend role checks as a substitute for database authorization.
- Ensure that case actions and coordination decisions report success only after required database writes succeed.
- Check for partial-write conditions when a workflow performs multiple database operations.
- Use only synthetic data in public demos unless the deployment is explicitly approved for real data.
- Avoid publishing passwords or reusable demo credentials in this README. Provision demo accounts securely and share credentials only with intended evaluators through an appropriate channel.

## Roadmap

Potential future improvements, subject to problem-statement priorities and validation:

- More granular cross-bureau overlap review and false-positive feedback.
- Configurable SLA rules and notification delivery.
- Stronger transactional handling for multi-step coordination writes.
- Expanded region-wise and institution-wise reporting.
- Supporting-document handling and secure attachment access.
- Accessibility and responsive-layout refinements.
- Additional automated RLS and end-to-end tests.


## Attribution

The project has used an SVCE campus entrance image attributed to PlaneMad via Wikimedia Commons under the [Creative Commons Attribution-ShareAlike 3.0 license](https://creativecommons.org/licenses/by-sa/3.0/). See the [Wikimedia Commons file page](https://commons.wikimedia.org/wiki/File:SVCE_entrance_close_up.jpg) for the original attribution and license details.

## Disclaimer

CONVERA is an academic prototype developed for Smart India Hackathon 2026 Problem Statement SIH26264. It is not affiliated with, endorsed by, or an official system of the All India Council for Technical Education (AICTE) or the Ministry of Education, Government of India. Institution names, complaint descriptions, officer profiles and demo records may be synthetic or fictional. Do not use this prototype to make official regulatory decisions or store sensitive real-world complaints without appropriate authorization, security review and operational approval.

---

Built for coordinated institutional action: **One Institution. Connected Intelligence. Coordinated Action.**
