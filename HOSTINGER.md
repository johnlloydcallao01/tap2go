# Hostinger CMS deployment (migrated from Render)

Deploy the Payload CMS (`apps/cms`) on Hostinger's Node.js hosting with the
**repository root as the application root** (monorepo — do not point Hostinger
at `apps/cms` alone; `workspace:*` deps only resolve from the root).

## Required panel settings

- **Node.js version: `22.x`** (repo `.nvmrc` = `22.17.0`). Do NOT use Node 18
  or 20. Hostinger's automatic install step resolves `pnpm@11.23.0` via
  Corepack, and pnpm 11 is ESM-only — on Node 20 it crashes before your build
  ever runs with:
  `TypeError [ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING]` at
  `.../.cache/node/corepack/v1/pnpm/11.23.0/bin/pnpm.cjs` +
  `ERROR: Failed to install dependencies`. Node 22 runs pnpm 11 fine.
- **Build command:** `npm run hostinger-build` (wraps `bash hostinger-build.sh`).
  If your hPanel version only accepts a script name from `package.json`,
  use the wrapper; both run the same script.
- **Start / entry:** `apps/cms/.next/standalone/apps/cms/server.js`
  (via `npm run hostinger-start` / `bash hostinger-start.sh`). Runtime needs
  only `node` — no pnpm/corepack.
- **Port:** use Hostinger's assigned `PORT` env var (start script defaults to
  `3001` locally). Keep `HOSTNAME=0.0.0.0` on Hostinger.
- **Health check:** `/api/health` (Render parity; `/admin` also works once DB
  is reachable).

## Environment variables

Add these in Hostinger's environment settings — do NOT upload `.env` files.
Set them **before** building: `NEXT_PUBLIC_*` values are inlined at build
time, and Payload evaluates `payload.config.ts` during `next build`.

Minimum to build/boot: `DATABASE_URI`, `PAYLOAD_SECRET`.

Full Render-parity list (see `apps/cms/.env.example` + `render.yaml`):
`DATABASE_URI`, `DATABASE_POOL_MAX/MIN`, `DATABASE_IDLE_TIMEOUT`,
`DATABASE_CONNECTION_TIMEOUT`, `DATABASE_ACQUIRE_TIMEOUT`,
`DATABASE_MAX_USES`, `PAYLOAD_SECRET`, `NODE_ENV=production`,
`GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`, `ADMIN_PROD_URL`, `WEB_PROD_URL`, `CMS_PROD_URL`
(+ `ADMIN/WEB/CMS_LOCAL_URL` for CORS parity), `COOKIE_DOMAIN`,
`PAYMONGO_PUBLIC_KEY_LIVE`, `PAYMONGO_SECRET_KEY_LIVE`,
`PAYMONGO_WEBHOOK_SECRET`, `LALAMOVE_API_KEY`, `LALAMOVE_API_SECRET`,
`LALAMOVE_MARKET=PH`, `LALAMOVE_PRIORITY_FEE=20`.

## How the build works

1. Hostinger auto-installs (uses pnpm 11 — succeeds only on Node 22).
2. `hostinger-build.sh` then reinstalls deterministically with the pinned
   `pnpm@9.12.3` via `npx` (bypasses Corepack), matching
   `packageManager: pnpm@9.12.3`, and runs
   `pnpm --filter @encreasl/cms run build` from the repo root.
3. The script copies `.next/static` + `public` next to the standalone server
   (`apps/cms/.next/standalone/apps/cms/`), which Next standalone expects.
4. `hostinger-start.sh` runs that standalone `server.js` with `$PORT`.

## Troubleshooting

- `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING` + `pnpm/11.23.0/bin/pnpm.cjs`:
  panel is on Node 20 (often from a stale `.nvmrc`). Switch panel to Node 22
  and redeploy. This repo's `.nvmrc` is now `22.17.0`.
- `This project is configured to use 9.12.3 of pnpm. Your current pnpm is
  v11.23.0` / `"pnpm" field in package.json is no longer read`: fixed in
  `pnpm-workspace.yaml` via `pmOnFail: ignore` plus the pnpm 11 homes for
  `overrides`, `peerDependencyRules`, `allowBuilds` (replaces
  `onlyBuiltDependencies`), and `nodeLinker` (replaces `.npmrc`
  `node-linker`). No panel change needed — redeploy picks it up.
- `DATABASE_URI / PAYLOAD_SECRET is not set`: set them in Hostinger env and
  rebuild (build-time requirement, not just runtime).
- Wrong public URL / Supabase / Cloudinary values after deploy: those are
  build-time inlined — fix env vars and trigger a rebuild.
- Build OOM: `apps/cms` build allows up to 8 GB heap but only uses what it
  needs; on small shared plans keep other apps stopped during build, or use
  the archive-upload fallback below.

## Fallback: archive upload (skip Hostinger build)

If Git auto-deploy keeps fighting the platform installer, build where you
control the toolchain and upload the standalone output:

```bash
npm i -g pnpm@9.12.3
pnpm install --frozen-lockfile --prod=false
pnpm --filter @encreasl/cms run build
# upload apps/cms/.next/standalone (+ static/public, already copied by the
# build script) as your deploy artifact, entry file server.js above
```
