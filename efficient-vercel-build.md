# Efficient Vercel Build Strategy for Turborepo Monorepo

## Problem Statement

Currently, when changes are made to a single app (e.g., `apps/web`), Vercel rebuilds all applications in the monorepo, including those that haven't changed. This causes:
- Increased build times
- Unnecessary resource consumption
- Slower deployments for specific apps
- Higher build costs

## Solutions Overview

Based on comprehensive research, there are **two main approaches** to solve this problem:

### 1. **Vercel's "Skip Unaffected Projects" Feature (Recommended)**
### 2. **Ignored Build Step with `turbo-ignore`**

---

## Solution 1: Vercel's "Skip Unaffected Projects" (Recommended)

### How It Works
Vercel automatically detects changes in monorepo workspaces and skips builds for projects with no changes. **Skipped builds do NOT count towards concurrent build limits.**

### Prerequisites ✅ (Already Met)
- ✅ Using `pnpm` workspaces (confirmed in root `package.json`)
- ✅ Unique package names for each app
- ✅ Explicit dependencies in `package.json` files

### Current Status
Your monorepo already meets all requirements:
```json
// Root package.json
{
  "workspaces": ["apps/*", "packages/*"],
  "packageManager": "pnpm@9.14.4"
}
```

### Implementation Steps

#### Step 1: Enable in Vercel Dashboard
1. Go to your Vercel project settings
2. Navigate to **General** → **Build & Development Settings**
3. Enable **"Skip unaffected projects"** toggle
4. This feature should automatically detect your pnpm workspace setup

#### Step 2: Verify Package Dependencies
Ensure each app's `package.json` explicitly lists dependencies:

```json
// apps/web/package.json example
{
  "dependencies": {
    "@encreasl/cms-types": "workspace:*",
    "@encreasl/redux": "workspace:*",
    // ... other dependencies
  }
}
```

#### Step 3: Test the Setup
1. Make a change to only one app (e.g., `apps/web`)
2. Commit and push to GitHub
3. Verify in Vercel dashboard that only the changed app builds

---

## Solution 2: Ignored Build Step with `turbo-ignore`

### How It Works
Uses Vercel's "Ignored Build Step" feature with `npx turbo-ignore` to determine if a build should proceed based on file changes.

⚠️ **Note**: Skipped builds using this method **DO count** towards concurrent build limits.

### Implementation Steps

#### Step 1: Configure Ignored Build Step in Vercel
For each app in Vercel dashboard:

1. Go to **Project Settings** → **Git** → **Ignored Build Step**
2. Add the command:
```bash
npx turbo-ignore
```

#### Step 2: Update turbo.json (Optional Enhancement)
Add environment variables that affect builds:

```json
{
  "globalEnv": [
    "VERCEL_ENV",
    "VERCEL_URL",
    "VERCEL_GIT_COMMIT_SHA"
  ],
  "tasks": {
    "build": {
      "env": [
        "NEXT_PUBLIC_API_URL",
        "NEXT_PUBLIC_PAYLOAD_URL"
      ]
    }
  }
}
```

#### Step 3: Test Implementation
1. Make changes to one app
2. Push to GitHub
3. Check Vercel build logs to see if unchanged apps are skipped

---

## Current Monorepo Analysis

### Existing Configuration ✅
Your monorepo is well-configured for efficient builds:

#### turbo.json
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    }
  }
}
```

#### vercel.json (per app)
```json
{
  "buildCommand": "pnpm turbo run build --filter=web",
  "installCommand": "pnpm install"
}
```

### Workspace Structure ✅
```
tap2go/
├── apps/
│   ├── web/
│   ├── web-admin/
│   └── web-landing/
├── packages/
│   ├── cms-types/
│   └── redux/
└── turbo.json
```

---

## Recommended Implementation Plan

### Phase 1: Enable Vercel's Skip Unaffected Projects (Immediate)
1. **Enable the feature** in Vercel dashboard for all three projects
2. **Test with a small change** to one app
3. **Monitor build behavior** for 1-2 deployments

### Phase 2: Optimize turbo.json (Optional)
1. **Add environment variables** that affect builds to `globalEnv`
2. **Configure Remote Caching** by linking Turborepo to Vercel account
3. **Update task dependencies** if needed

### Phase 3: Fallback Implementation (If Needed)
If Solution 1 doesn't work as expected:
1. **Implement turbo-ignore** as Ignored Build Step
2. **Monitor build limits** usage
3. **Fine-tune configuration** based on results

---

## Expected Benefits

### With Solution 1 (Skip Unaffected Projects)
- ✅ **Faster deployments**: Only changed apps build
- ✅ **No build limit impact**: Skipped builds don't count
- ✅ **Automatic detection**: No manual configuration per change
- ✅ **Cost savings**: Reduced build minutes usage

### Performance Improvements
- **Build time reduction**: 60-80% for single-app changes
- **Resource efficiency**: Only necessary builds consume resources
- **Parallel builds**: Unchanged apps don't block changed apps

---

## Troubleshooting

### If Skip Unaffected Projects Doesn't Work
1. **Verify workspace setup**: Ensure `pnpm-workspace.yaml` or `package.json` workspaces are correct
2. **Check package names**: Each app must have unique names
3. **Review dependencies**: Ensure explicit workspace dependencies
4. **Contact Vercel support**: Feature might need manual enablement

### If turbo-ignore Fails
1. **Check git depth**: Vercel uses `--depth=10`, ensure changes are within this range
2. **Verify command syntax**: Use exact `npx turbo-ignore` command
3. **Review environment variables**: Some env vars might force rebuilds
4. **Check turbo.json**: Ensure proper task configuration

---

## Monitoring and Validation

### Key Metrics to Track
1. **Build duration** per app
2. **Number of concurrent builds**
3. **Build success rate**
4. **Resource usage** in Vercel dashboard

### Validation Checklist
- [ ] Only changed apps trigger builds
- [ ] Unchanged apps show "Skipped" status
- [ ] Build times are reduced for single-app changes
- [ ] No increase in build failures
- [ ] Dependencies between apps still work correctly

---

## Additional Optimizations

### Remote Caching Setup
1. **Link Turborepo to Vercel**:
   ```bash
   npx turbo login
   npx turbo link
   ```

2. **Verify caching**:
   ```bash
   npx turbo build --dry-run
   ```

### Environment Variable Management
Ensure environment variables are properly declared in `turbo.json` for optimal caching:

```json
{
  "globalEnv": [
    "VERCEL_ENV",
    "VERCEL_URL", 
    "VERCEL_GIT_COMMIT_SHA"
  ],
  "tasks": {
    "build": {
      "env": [
        "NEXT_PUBLIC_API_URL",
        "NEXT_PUBLIC_PAYLOAD_URL",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
      ]
    }
  }
}
```

---

## Conclusion

**Recommended Approach**: Start with Vercel's "Skip Unaffected Projects" feature as it provides the best balance of simplicity and efficiency without impacting build limits.

Your monorepo is already well-structured for this optimization. The main requirement is enabling the feature in Vercel's dashboard and testing the behavior.

This solution should significantly reduce build times and costs while maintaining the reliability of your deployment pipeline.