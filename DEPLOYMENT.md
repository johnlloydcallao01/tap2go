# Deployment Guide for Tap2Go Monorepo

## Overview
This is a monorepo containing a Next.js web application and React Native mobile app.

## Project Structure
```
tap2go/
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native mobile app
├── packages/         # Shared packages
└── package.json      # Root package.json
```

## Deployment Configuration

### For Vercel Deployment

1. **Root Directory**: Set to `apps/web`
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`
4. **Install Command**: `npm install`
5. **Node.js Version**: `18.x`

### Environment Variables Required
- `NODE_VERSION=18`
- `NEXT_TELEMETRY_DISABLED=1`
- Add your Firebase, Cloudinary, and other service keys

### Vercel Project Settings
- Framework Preset: Next.js
- Root Directory: `apps/web`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Alternative Deployment Platforms

#### Netlify
- Build command: `cd apps/web && npm run build`
- Publish directory: `apps/web/.next`
- Node version: `18.20.4`

#### Railway/Render
- Build command: `cd apps/web && npm run build`
- Start command: `cd apps/web && npm start`
- Node version: `18.x`

## Troubleshooting

### "No Next.js version detected"
- Ensure you're deploying from the correct directory (`apps/web`)
- Check that `next` is in dependencies in `apps/web/package.json`
- Verify the build command points to the web app

### Node.js Version Warnings
- Use specific version ranges: `18.x || 20.x || 22.x`
- Avoid `>=18` which auto-upgrades to new major versions
- Set `.nvmrc` file with exact version: `18.20.4`

## Files Created for Deployment
- `/.nvmrc` - Node version specification
- `/apps/web/.nvmrc` - Web app Node version
- `/apps/web/vercel.json` - Vercel configuration
- `/project.json` - General project configuration
- Updated `package.json` files with proper engines and scripts
