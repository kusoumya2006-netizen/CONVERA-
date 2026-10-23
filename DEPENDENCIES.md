# CONVERA — Dependency Inventory

This inventory summarizes package roles. `package.json` and the committed npm lockfile remain the source of truth for exact dependencies and resolved versions.

## Runtime dependencies

| Package | Role |
|---|---|
| `react`, `react-dom` | UI rendering |
| `@supabase/supabase-js` | Supabase client for configured cloud auth/data operations |
| `recharts` | Dashboard charts |
| `lucide-react` | Interface icons |
| `clsx` | Conditional class composition |
| `tailwind-merge` | Utility-class conflict resolution |

## Development dependencies

| Package | Role |
|---|---|
| `vite`, `@vitejs/plugin-react` | Development server and production bundling |
| `typescript`, `@types/react`, `@types/react-dom` | Type checking and React types |
| `vitest` | Automated tests |
| `tailwindcss` | Utility CSS framework |
| `postcss`, `autoprefixer` | CSS processing |

Consult `package.json` for the complete list; this short guide is not a replacement for the manifest.

## Reproducible setup

```bash
npm ci
npm test
npm run build
```

Use the committed lockfile for repeatable installs. Do not upgrade packages solely for visual polish; assess compatibility, advisories, and tests before proposing upgrades.

## Environment safety

The [`.env.example`](.env.example) file documents public configuration placeholders. Frontend `VITE_*` variables are exposed to the client bundle. Never put passwords, service-role keys, or server-only secrets in them.
