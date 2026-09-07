import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// Makes Next's standalone runnable subtree self-contained.
//
// Background: Next's standalone trace hoists shared deps (react, react-dom,
// ...) to `.next/standalone/node_modules`, and the app server only resolves
// them by walking UP from `.next/standalone/apps/cms/server.js`. Hostinger
// snapshots just the app subtree into its version dir (dropping that parent),
// so `require('react')` from react-dom's server bundle dies at boot with
// "Error: Cannot find module 'react'" -> 503 from the edge.
//
// This runs as part of `apps/cms` build (see package.json), so it executes
// under EVERY Hostinger panel configuration (repo-root router build and
// direct apps/cms build alike). It is idempotent and portable (no bash).
//
// Steps: merge every parent entry missing from the app dir down into it
// (never overwriting traced versions), materialize symlinks to real files
// (pnpm links dangle after Hostinger copies the subtree), strip staged
// `.env*` (would shadow panel env vars via dotenv and leak secrets), then
// fail fast unless react/react-dom/next resolve from the staged server.

const cmsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const appDir = path.join(cmsDir, '.next', 'standalone', 'apps', 'cms')
const parentModules = path.join(cmsDir, '.next', 'standalone', 'node_modules')
const serverFile = path.join(appDir, 'server.js')

if (!fs.existsSync(serverFile)) {
  throw new Error(`Standalone server was not generated at ${serverFile}`)
}

const appModules = path.join(appDir, 'node_modules')
fs.mkdirSync(appModules, { recursive: true })

if (fs.existsSync(parentModules)) {
  for (const name of fs.readdirSync(parentModules)) {
    if (name === '.bin') continue
    const src = path.join(parentModules, name)
    const dest = path.join(appModules, name)
    if (!fs.existsSync(dest)) {
      fs.cpSync(src, dest, { recursive: true, dereference: true })
      console.log(`self-contain: merged ${name}`)
    }
  }

  // Materialize any remaining symlinks/junctions inside the app tree.
  const materialize = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name)
      let stat
      try {
        stat = fs.lstatSync(p)
      } catch {
        continue
      }
      if (stat.isSymbolicLink()) {
        const target = fs.realpathSync(p)
        fs.rmSync(p, { recursive: true, force: true })
        fs.cpSync(target, p, { recursive: true, dereference: true })
        console.log(`self-contain: materialized link ${path.relative(appModules, p)}`)
      } else if (stat.isDirectory()) {
        materialize(p)
      }
    }
  }
  materialize(appModules)
}

// Never ship local secrets: a staged .env would shadow Hostinger panel env
// vars at runtime (dotenv loads .env from CWD) and leak credentials.
for (const f of fs.readdirSync(appDir)) {
  if (f === '.env' || f.startsWith('.env.')) {
    fs.rmSync(path.join(appDir, f), { force: true })
    console.log(`self-contain: removed staged ${f}`)
  }
}

// Fail fast with a clear message instead of a 503 at boot.
const requireFromApp = createRequire(serverFile)
for (const mod of ['react', 'react-dom', 'next']) {
  requireFromApp.resolve(mod)
}
console.log('self-contain: standalone resolve ok (react, react-dom, next)')
