# Debug Session: oracle-cms-db

Status: OPEN

## Goal
- Complete Oracle hosting for `apps/cms` and eliminate the remaining runtime `502` on the Oracle VM.

## Current Evidence
- Oracle VM is reachable over SSH.
- `apps/cms/.env` was uploaded to `/home/opc/tap2go/apps/cms/.env`.
- Local and remote `.env` hashes match exactly.
- `pnpm --filter @encreasl/cms build` succeeds locally and on Oracle.
- `nginx` is active.
- `tap2go-cms` is active but returns `502` through `nginx`.
- Runtime logs show database connection failure using the uploaded `DATABASE_URI`.

## Additional Evidence
- After the user resumed the paused Supabase project, the original uploaded `.env` passed `pnpm --filter @encreasl/cms db:test` on the Oracle VM.
- `tap2go-cms` restarts successfully and serves the admin login route.
- Public HTTP now redirects to HTTPS on `cms.tap2goph.com`.
- Public HTTPS now responds successfully and redirects `/` to `/admin`, then `/admin` to `/admin/login`.
- Let’s Encrypt certificate issuance succeeded for `cms.tap2goph.com`.

## Hypotheses
- H1: The `DATABASE_URI` in the uploaded `.env` is itself invalid for Oracle runtime use, even though it was copied correctly.
- H2: The pooled Supabase connection string requires an option such as SSL or a slightly different format when used from Oracle.
- H3: The app is reading the expected `.env`, but one character or encoding detail in the URI causes the database driver to interpret the username incorrectly.
- H4: The Oracle VM can resolve the host but the pooler rejects this tenant or username combination for this runtime path.
- H5: The deployment is otherwise complete, and fixing only the live `DATABASE_URI` will make `apps/cms` serve successfully behind `nginx`.

## Next Actions
- Wait for user verification in a real browser session.
- Keep the debug session open until user confirms the deployment is good.
