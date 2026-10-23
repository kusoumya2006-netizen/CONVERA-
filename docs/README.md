# CONVERA Documentation Hub

A guide to the implementation, validation evidence, and SIH demonstration materials.

## Project documents

| Document | What you'll find |
|---|---|
| [Project master documentation](../PROJECT_MASTER_DOCUMENTATION.md) | Purpose, modules, workflows, setup, and limitations |
| [Architecture](ARCHITECTURE.md) | System boundaries, source map, and data flow |
| [SIH26264 requirement traceability](SIH26264_REQUIREMENT_TRACEABILITY.md) | Intended outcomes mapped to implementation and verification |
| [Database schema review](DATABASE_SCHEMA.md) | Migration-led schema and access-control review |
| [Demo walkthrough](DEMO_WALKTHROUGH.md) | Eight-screen evaluator journey |
| [Validation status](../VALIDATION_STATUS.md) | Reported results and checks requiring fresh evidence |
| [Validation checklist](VALIDATION_CHECKLIST.md) | Repeatable local, workflow, and cloud checks |
| [Contributing](CONTRIBUTING.md) | Engineering and review conventions |
| [Dependency inventory](../DEPENDENCIES.md) | Package roles and reproducible install commands |

## Screenshot assets

The README and walkthrough reference these actual UI captures:

1. `assets/screenshots/01-convera-landing.jpg`
2. `assets/screenshots/02-authentication.jpg`
3. `assets/screenshots/03-overview-dashboard.jpg`
4. `assets/screenshots/04-case-registry.jpg`
5. `assets/screenshots/05-overlap-monitoring.jpg`
6. `assets/screenshots/06-completed-proceedings.jpg`
7. `assets/screenshots/07-institution-profiles.jpg`
8. `assets/screenshots/08-reports-analytics.jpg`

Commit these image files alongside the documentation for the GitHub gallery to render. Keep captures current, avoid sensitive data, and label illustrative metrics/sample records as demo data.

## Documentation conventions

- Prefer source-linked claims over assumptions.
- Separate implemented behavior from proposed work.
- Label tests as passed only when run on the relevant commit.
- Keep links relative so docs work in GitHub and local clones.
