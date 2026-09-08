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
// and Render runs `node .next/standalone/apps/cms/server.js` from apps/cms,
// so `require('react')` from react-dom's server bundle dies at boot with
// "Error: Cannot find module 'react'" -> 503 from the edge.
//
// This runs as part of `apps/cms` build (see package.json), so it executes
// under EVERY Hostinger panel configuration (repo-root router build and
// direct apps/cms build alike) and on Render. It is idempotent and portable
// (no bash).
//
// Steps: merge every parent entry missing from the app dir down into it
// (never overwriting traced versions, except for the @swc/helpers repair
// below which deep-merges missing files), materialize symlinks to real files
// (pnpm links dangle after hosts copy the subtree), strip staged
// `.env*` (would shadow panel env vars via dotenv and leak secrets), then
// fail fast unless react/react-dom/next/@swc/helpers resolve from the staged
// server.

const cmsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const appDir = path.join(cmsDir, '.next', 'standalone', 'apps', 'cms')
const parentModules = path.join(cmsDir, '.next', 'standalone', 'node_modules')
const serverFile = path.join(appDir, 'server.js')

if (!fs.existsSync(serverFile)) {
  throw new Error(`Standalone server was not generated at ${serverFile}`)
}

const appModules = path.join(appDir, 'node_modules')
const installedModules = path.join(cmsDir, 'node_modules')
const workspaceModules = path.resolve(cmsDir, '..', '..', 'node_modules')
fs.mkdirSync(appModules, { recursive: true })

const copyIfMissing = (name, sourceRoot) => {
  const src = path.join(sourceRoot, name)
  const dest = path.join(appModules, name)
  if (fs.existsSync(dest) || !fs.existsSync(src)) return false
  fs.cpSync(src, dest, { recursive: true, dereference: true })
  console.log(`self-contain: merged ${name} from ${path.relative(cmsDir, sourceRoot)}`)
  return true
}

// Recursively copy only files missing in dest (non-destructive deep merge).
// Used for scoped packages like @swc where the staged dir may exist but be
// missing the helpers subpackage.
const copyMissingRecursive = (srcDir, destDir) => {
  let copied = 0
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name)
    const dest = path.join(destDir, entry.name)
    let destStat = null
    try {
      destStat = fs.lstatSync(dest)
    } catch {
      destStat = null
    }
    if (entry.isSymbolicLink() || entry.isFile()) {
      if (destStat) continue
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.cpSync(src, dest, { recursive: true, dereference: true, force: false })
      copied += 1
    } else if (entry.isDirectory()) {
      if (!destStat) {
        fs.mkdirSync(dest, { recursive: true })
      } else if (!destStat.isDirectory()) {
        continue
      }
      copied += copyMissingRecursive(src, dest)
    }
  }
  return copied
}

if (fs.existsSync(parentModules)) {
  for (const name of fs.readdirSync(parentModules)) {
    if (name === '.bin') continue
    // Scoped dirs need a deep merge: a staged `@swc` containing only
    // `@swc/counter` must not block merging `@swc/helpers` from the parent.
    if (name.startsWith('@')) {
      const srcScope = path.join(parentModules, name)
      const destScope = path.join(appModules, name)
      if (!fs.existsSync(destScope)) {
        copyIfMissing(name, parentModules)
      } else {
        try {
          const stat = fs.lstatSync(srcScope)
          if (stat.isDirectory() && !stat.isSymbolicLink()) {
            const n = copyMissingRecursive(srcScope, destScope)
            if (n > 0) console.log(`self-contain: deep-merged ${n} file(s) under ${name}/ from .next/standalone/node_modules`)
          }
        } catch {
          // best-effort; validation below will fail fast with details
        }
      }
      continue
    }
    copyIfMissing(name, parentModules)
  }
}

// Resolve the canonical @swc/helpers source across every supported install
// layout (hoisted flat, app-local, pnpm isolated .pnpm virtual store, npm
// flat). require.resolve follows symlinks, so it works regardless of
// node-linker and pnpm version drift between local dev and Render.
const resolveSwcHelpersDir = () => {
  const candidates = []
  const requirers = []
  try {
    requirers.push(createRequire(path.join(cmsDir, 'package.json')))
  } catch {}
  try {
    requirers.push(createRequire(serverFile))
  } catch {}
  try {
    const nextPkg = requirers[0]?.resolve?.('next/package.json')
    if (nextPkg) requirers.push(createRequire(nextPkg))
  } catch {}
  for (const req of requirers) {
    try {
      const pkgFile = req.resolve('@swc/helpers/package.json')
      candidates.push(path.dirname(fs.realpathSync(pkgFile)))
    } catch {}
  }
  // Hard-path fallbacks (hoisted root, app-local, traced parent).
  for (const dir of [
    path.join(workspaceModules, '@swc', 'helpers'),
    path.join(installedModules, '@swc', 'helpers'),
    path.join(parentModules, '@swc', 'helpers'),
  ]) {
    candidates.push(dir)
  }
  const seen = new Set()
  for (const dir of candidates) {
    if (!dir || seen.has(dir)) continue
    seen.add(dir)
    try {
      if (fs.existsSync(path.join(dir, 'package.json'))) return dir
    } catch {}
  }
  return null
}

const stagedSwcHelpers = path.join(appModules, '@swc', 'helpers')
const swcSource = resolveSwcHelpersDir()
if (swcSource) {
  fs.mkdirSync(path.dirname(stagedSwcHelpers), { recursive: true })
  if (!fs.existsSync(stagedSwcHelpers)) {
    fs.cpSync(swcSource, stagedSwcHelpers, { recursive: true, dereference: true })
    console.log(`self-contain: repaired @swc/helpers from ${path.relative(cmsDir, swcSource)}`)
  } else {
    const n = copyMissingRecursive(swcSource, stagedSwcHelpers)
    console.log(
      n > 0
        ? `self-contain: repaired @swc/helpers (${n} missing file(s) from ${path.relative(cmsDir, swcSource)})`
        : `self-contain: @swc/helpers already complete (source ${path.relative(cmsDir, swcSource)})`,
    )
  }
} else {
  console.log(
    `self-contain: WARNING @swc/helpers source not found (checked cms require.resolve, workspace ${path.relative(cmsDir, path.join(workspaceModules, '@swc', 'helpers'))}, app-local, traced parent)`,
  )
}

// Some hosts flatten or regenerate the standalone tree and omit modules that
// Next traced into its parent directory. Seed the critical runtime packages
// from the CMS install as a fallback before validating the staged server.
for (const name of ['react', 'react-dom', 'next', 'scheduler', 'use-sync-external-store']) {
  copyIfMissing(name, installedModules)
}

// Materialize any remaining symlinks/junctions inside the app tree.
// Tolerates dangling links (broken pnpm store targets on a fresh host):
// they are removed so validation reports the real missing package instead
// of crashing with ENOENT from realpathSync.
const materialize = (dir) => {
  let entries = []
  try {
    entries = fs.readdirSync(dir)
  } catch {
    return
  }
  for (const name of entries) {
    const p = path.join(dir, name)
    let stat
    try {
      stat = fs.lstatSync(p)
    } catch {
      continue
    }
    if (stat.isSymbolicLink()) {
      let target = null
      try {
        target = fs.realpathSync(p)
      } catch {
        fs.rmSync(p, { recursive: true, force: true })
        console.log(`self-contain: removed dangling link ${path.relative(appModules, p)}`)
        continue
      }
      try {
        fs.rmSync(p, { recursive: true, force: true })
        fs.cpSync(target, p, { recursive: true, dereference: true })
        console.log(`self-contain: materialized link ${path.relative(appModules, p)}`)
      } catch (err) {
        console.log(`self-contain: WARNING could not materialize ${path.relative(appModules, p)}: ${err?.message ?? err}`)
      }
    } else if (stat.isDirectory()) {
      materialize(p)
    }
  }
}
materialize(appModules)

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
try {
  for (const mod of ['react', 'react-dom', 'next', '@swc/helpers/_/_interop_require_default']) {
    requireFromApp.resolve(mod)
  }
} catch (err) {
  const stagedPkg = path.join(stagedSwcHelpers, 'package.json')
  let stagedVersion = 'missing'
  try {
    stagedVersion = JSON.parse(fs.readFileSync(stagedPkg, 'utf8')).version
  } catch {}
  let stagedFiles = []
  try {
    stagedFiles = fs.readdirSync(path.join(stagedSwcHelpers, 'esm')).slice(0, 8)
  } catch {}
  throw new Error(
    `self-contain: standalone validation failed: ${err?.message ?? err}\n` +
      `  server: ${serverFile}\n` +
      `  swc source tried: ${swcSource ?? '(none found)'}\n` +
      `  staged @swc/helpers: ${stagedSwcHelpers} (version ${stagedVersion}, esm sample: ${stagedFiles.join(',') || 'n/a'})\n` +
      `  hint: ensure @swc/helpers is a direct dependency and reinstall with the pinned pnpm (${'`'}pnpm install --frozen-lockfile${'`'}).`,
    { cause: err },
  )
}
console.log('self-contain: standalone resolve ok (react, react-dom, next, @swc/helpers)')
