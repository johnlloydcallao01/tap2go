#!/usr/bin/env bash
set -euo pipefail

# Hostinger's Corepack currently resolves an incompatible pnpm version on Node 18.
# Use the repository-pinned pnpm through npm instead.
npx --yes pnpm@9.12.3 install --frozen-lockfile --prod=false
npx --yes pnpm@9.12.3 --filter @encreasl/cms run build

# Next places the standalone server under the workspace package path. Include
# the static assets it expects beside that server.
mkdir -p apps/cms/.next/standalone/apps/cms/.next
cp -R apps/cms/.next/static apps/cms/.next/standalone/apps/cms/.next/static
cp -R apps/cms/public apps/cms/.next/standalone/apps/cms/public