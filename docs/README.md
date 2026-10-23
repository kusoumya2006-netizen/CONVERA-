# CONVERA Documentation Hub

Use this page as the starting point for understanding, running, reviewing, and validating CONVERA. The root [README](../README.md) is the short project introduction; this page routes you to the deeper technical material.

## Read in this order

1. **[Project master documentation](../PROJECT_MASTER_DOCUMENTATION.md)** — purpose, modules, data flow, development setup, and limitations.
2. **[Architecture](ARCHITECTURE.md)** — source map, application boundaries, persistence modes, and safety rules.
3. **[Demo walkthrough](DEMO_WALKTHROUGH.md)** — a suggested evaluator journey through the product.
4. **[Requirement traceability](SIH26264_REQUIREMENT_TRACEABILITY.md)** — SIH requirements mapped to implementation and evidence.
5. **[Validation status](../VALIDATION_STATUS.md)** and **[validation checklist](VALIDATION_CHECKLIST.md)** — what has been reported, what remains environment-dependent, and how to verify it.

## Technical references

| Document | When to use it |
|---|---|
| [Architecture](ARCHITECTURE.md) | Understand how UI, workflow logic, engines, and persistence connect |
| [Database schema](DATABASE_SCHEMA.md) | Review migrations, tables, relationships, and access-control considerations |
| [Requirement traceability](SIH26264_REQUIREMENT_TRACEABILITY.md) | Map the problem statement to implementation evidence |
| [Demo walkthrough](DEMO_WALKTHROUGH.md) | Prepare a repeatable synthetic-data demonstration |
| [Validation checklist](VALIDATION_CHECKLIST.md) | Re-run build, workflow, and cloud checks |
| [Contributing guide](CONTRIBUTING.md) | Make changes without destabilising existing behavior |
| [Master documentation](../PROJECT_MASTER_DOCUMENTATION.md) | Read the full project overview |
| [Validation status](../VALIDATION_STATUS.md) | Distinguish recorded results from checks that still need to be run |
| [Dependencies](../DEPENDENCIES.md) | Review runtime and development dependencies |

## Repository layout

```text
CONVERA/
├── README.md                    # Project landing page and quick start
├── PROJECT_MASTER_DOCUMENTATION.md
├── VALIDATION_STATUS.md         # Evidence-based validation record
├── DEPENDENCIES.md
├── .env.example
├── src/
│   ├── components/              # UI grouped by product domain
│   ├── context/                 # Shared authentication and case workflow state
│   ├── engine/                  # Priority, urgency, overlap, and history logic
│   ├── services/                # Authentication, exports, and persistence adapters
│   ├── types/                   # Shared domain types
│   └── App.tsx / main.tsx       # Application entry points
├── public/assets/               # Static assets and README product screenshots
├── scripts/                     # Demo-data utilities
├── supabase/migrations/         # Database schema, policies, and synthetic seed data
└── docs/                        # Architecture, schema, demo, validation, and contributor guides
```

This map is intentionally logical rather than exhaustive. Use the actual source tree when locating a specific component or service.

## Product screenshots

The eight README/product-tour screenshots are maintained in `public/assets/` so the root README can render them using repository-relative paths. The same screenshots should not be copied into this folder; keeping one canonical copy avoids stale or mismatched duplicates.

## Validation boundary

A passing unit-test suite or production build does not prove that deployed authentication, Supabase Row-Level Security (RLS), grants, multi-user workflows, or cloud persistence are correct. Record current test results with the commit SHA and verify environment-dependent behavior using the [validation checklist](VALIDATION_CHECKLIST.md).

## Safety and data handling

- Use synthetic complaint records in public demos.
- Never commit secrets, passwords, service-role keys, or real sensitive complaint data.
- Treat overlap results as review signals, not final administrative decisions.
- Keep case identity and history intact when changing workflow or storage code.
