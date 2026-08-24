# Hostinger CMS deployment

Use Hostinger's Node.js application hosting with the repository root as the
application root.

- Node.js version: `20.19.1` or any version from `20.9` through `22`
- Build command: `bash hostinger-build.sh`
- Start command: `bash hostinger-start.sh`
- Port: use Hostinger's assigned `PORT` environment variable
- Health check: `/admin`

Add the CMS environment variables in Hostinger's environment settings. At a
minimum, configure `DATABASE_URI` and `PAYLOAD_SECRET`; add the provider and
public URL variables used by the CMS as needed. Do not upload `.env` files.

The build script installs the pinned `pnpm@9.12.3` through npm instead of
Corepack. This avoids the `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING` failure from
Hostinger's Node 18/Corepack-provided pnpm executable. The CMS uses Next.js
standalone output, so runtime startup does not require pnpm.