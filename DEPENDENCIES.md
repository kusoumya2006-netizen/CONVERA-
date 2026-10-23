# CONVERA — Dependency Inventory

This inventory is summarized from the repository's `package.json`. The lockfile is the source of exact resolved versions; this document does not replace it.

## Runtime dependencies

| Package | Role |
|---|---|
| `react`, `react-dom` | UI rendering and browser application |
| `@supabase/supabase-js` | Supabase client for configured cloud auth/data operations |
| `recharts` | Dashboard charts |
| `lucide-react` | Interface icons |
| `clsx` | Conditional class composition |
| `tailwind-merge` | Utility-class conflict resolution |

## Development dependencies

| Package | Role |
|---|---|
| `vite`, `@vitejs/plugin-react` | Development server and production bundling |
| `typescript`, `@types/react`, `@types/react-dom` | Type checking and React type definitions |
| `vitest` | Automated tests |
| `tailwindcss` | Utility CSS framework |
| `postcss`, `autoprefixer` | CSS processing and vendor prefixing |

## Reproducibility

Use the committed npm lockfile:

```bash
npm ci
npm test
npm run build
```

Do not update dependency versions solely for documentation polish. Review security advisories, compatibility, and test/build results before proposing upgrades.

## Configuration and secrets

The app's public environment template is [`.env.example`](.env.example). Frontend `VITE_*` variables are exposed to the client at build time. Never place passwords, service-role keys, or other server-side secrets in them.
