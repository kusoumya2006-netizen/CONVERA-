# CONVERA Documentation

Technical documentation is grouped here so the repository root stays focused on the application, setup, and project entry point.

## Start here

1. **[Project master documentation](PROJECT_MASTER_DOCUMENTATION.md)** — purpose, modules, data flow, development setup, and limitations.
2. **[Architecture](ARCHITECTURE.md)** — how the UI, workflow logic, decision-support engines, and persistence fit together.
3. **[Demo walkthrough](DEMO_WALKTHROUGH.md)** — a repeatable evaluator journey using synthetic records.
4. **[Requirement traceability](SIH26264_REQUIREMENT_TRACEABILITY.md)** — SIH requirements mapped to implementation evidence.
5. **[Validation status](VALIDATION_STATUS.md)** and **[validation checklist](VALIDATION_CHECKLIST.md)** — recorded checks and what still needs environment-level verification.

## Technical references

| Document | Purpose |
|---|---|
| [Project master documentation](PROJECT_MASTER_DOCUMENTATION.md) | Product overview, modules, workflows, setup, and limitations |
| [Architecture](ARCHITECTURE.md) | Source map, application boundaries, data flow, and persistence modes |
| [Database schema](DATABASE_SCHEMA.md) | Migration-led schema and access-control review |
| [Requirement traceability](SIH26264_REQUIREMENT_TRACEABILITY.md) | Map the problem statement to implementation evidence |
| [Demo walkthrough](DEMO_WALKTHROUGH.md) | Prepare a consistent demonstration |
| [Validation status](VALIDATION_STATUS.md) | Separate recorded results from checks that must be re-run |
| [Validation checklist](VALIDATION_CHECKLIST.md) | Re-run build, workflow, and cloud checks |
| [Dependencies](DEPENDENCIES.md) | Runtime and development dependency inventory |
| [Contributing guide](CONTRIBUTING.md) | Change and review conventions |

## Repository map

```text
CONVERA/
├── README.md                  # Project landing page, screenshots, quick start
├── .env.example               # Safe environment-variable template
├── package.json / lockfile    # Scripts and pinned dependency graph
├── src/
│   ├── components/            # UI grouped by product domain
│   ├── context/               # Shared authentication and case workflow state
│   ├── engine/                # Priority, urgency, overlap, and history logic
│   ├── services/              # Auth, exports, and persistence adapters
│   ├── types/                 # Shared domain types
│   └── App.tsx / main.tsx     # Application entry points
├── public/assets/             # Static UI assets and canonical product screenshots
├── scripts/                   # Demo-data utilities
├── supabase/migrations/       # Schema, access policies, and synthetic seed migrations
└── docs/
    ├── README.md              # This documentation index
    ├── PROJECT_MASTER_DOCUMENTATION.md
    ├── VALIDATION_STATUS.md
    ├── DEPENDENCIES.md
    ├── ARCHITECTURE.md
    ├── DATABASE_SCHEMA.md
    ├── DEMO_WALKTHROUGH.md
    ├── SIH26264_REQUIREMENT_TRACEABILITY.md
    ├── VALIDATION_CHECKLIST.md
    └── CONTRIBUTING.md
```

This map is intentionally concise rather than exhaustive. Feature-level components live under `src/components/`; core decision-support logic and tests live under `src/engine/`; persistence implementations and their tests live under `src/services/storage/`.

## Screenshots and assets

The root README and demo walkthrough use the canonical screenshot files in `public/assets/`. Do not duplicate them under `docs/`; keeping one copy prevents stale screenshots and broken relative links. The campus image used by the interface is also kept in the asset locations currently referenced by the app.

## Validation boundary

A passing unit-test suite or production build does not prove deployed authentication, Supabase Row-Level Security (RLS), grants, multi-user workflows, or cloud persistence. Record results against the exact commit and verify environment-dependent behavior with the [validation checklist](VALIDATION_CHECKLIST.md).

## Safety and data handling

- Use synthetic complaint records in public demos.
- Never commit secrets, passwords, service-role keys, or sensitive complaint data.
- Treat overlap results as review signals, not final administrative decisions.
- Preserve case identity and history when changing workflow or storage code.
