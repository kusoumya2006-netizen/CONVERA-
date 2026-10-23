# CONVERA — Dependency Inventory

Summarized from `package.json`; the npm lockfile is the source of exact resolved versions.

## Runtime dependencies
| Package | Role |
|---|---|
| `react`, `react-dom` | UI rendering |
| `@supabase/supabase-js` | Supabase cloud auth/data client |
| `recharts` | Dashboard charts |
| `lucide-react` | Interface icons |
| `clsx` | Conditional class composition |
| `tailwind-merge` | Utility-class conflict resolution |

## Development dependencies
| Package | Role |
|---|---|
| `vite`, `@vitejs/plugin-react` | Dev server and production bundling |
| `typescript`, `@types/react`, `@types/react-dom` | Type checking |
| `vitest` | Automated tests |
| `tailwindcss` | Utility CSS framework |
| `postcss`, `autoprefixer` | CSS processing |

## Reproducibility
```bash
npm ci
npm test
npm run build
```
Do not upgrade versions solely for documentation polish. Frontend `VITE_*` variables are exposed to the client at build time; never place passwords or service-role secrets in them. See [`.env.example`](../.env.example).
