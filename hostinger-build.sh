#!/usr/bin/env bash
set -euo pipefail

# Hostinger CMS build (monorepo root as application root).
#
# Background / why this script looks the way it does:
# - Hostinger Node.js hosting runs its own automatic "install dependencies"
#   step BEFORE this build script, auto-detecting pnpm from pnpm-lock.yaml.
#   That step currently resolves pnpm@11.23.0 through Corepack
#   (~/.cache/node/corepack/v1/pnpm/11.23.0/bin/pnpm.cjs).
# - pnpm >= 11 is ESM-only and crashes on Node 20 (CloudLinux alt-nodejs20)
#   with `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`, so the install phase fails
#   with "ERROR: Failed to install dependencies" and this script never runs.
# - Fix: set the Hostinger panel Node.js version to 22.x (see .nvmrc = 22.17.0
#   and HOSTINGER.md). pnpm 11 runs fine on Node 22, so the platform install
#   succeeds; this script then reinstalls deterministically with the
#   repo-pinned pnpm@9.12.3 via npx, bypassing Corepack entirely.

echo "Node: $(node --version)"
echo "npm: $(npm --version)"

# Never let incidental corepack shims jump to pnpm@latest inside this script.
export COREPACK_ENABLE=0
export COREPACK_DEFAULT_TO_LATEST=0
export NEXT_TELEMETRY_DISABLED=1

# Fail fast with a clear message: Payload/Next evaluates payload.config.ts
# during `next build`, so these must be set in Hostinger env vars already.
if [ -z "${DATABASE_URI:-}" ]; then
  echo "ERROR: DATABASE_URI is not set. Add it in Hostinger environment settings before building." >&2
  exit 1
fi
if [ -z "${PAYLOAD_SECRET:-}" ]; then
  echo "ERROR: PAYLOAD_SECRET is not set. Add it in Hostinger environment settings before building." >&2
  exit 1
fi

PNPM="npx --yes pnpm@9.12.3"

# Make a real `pnpm` binary resolvable for child processes. pnpm 10/11's
# pre-run check spawns bare `pnpm`, which is not on PATH on Hostinger
# (Corepack shim only) and fails with `spawnSync pnpm ENOENT`.
if npm install -g pnpm@9.12.3 >/dev/null 2>&1; then
  export PATH="$(npm config get prefix 2>/dev/null)/bin:$PATH"
  PNPM="pnpm"
fi

$PNPM --version
$PNPM install --frozen-lockfile --prod=false
$PNPM --filter @encreasl/cms run build

# Next places the standalone server under the workspace package path. Include
# the static assets it expects beside that server.
STANDALONE_DIR="apps/cms/.next/standalone/apps/cms"
rm -rf "$STANDALONE_DIR/.next/static"
rm -rf "$STANDALONE_DIR/public"
mkdir -p "$STANDALONE_DIR/.next"
cp -R apps/cms/.next/static "$STANDALONE_DIR/.next/static"
cp -R apps/cms/public "$STANDALONE_DIR/public"

echo "Hostinger build complete. Start with: bash hostinger-start.sh"
