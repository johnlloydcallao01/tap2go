# 🌐 Multi-Subdomain Deployment Guide - Tap2Go

## 📋 Overview

This guide covers the complete setup and deployment of Tap2Go's multi-subdomain architecture using Vercel.

## 🏗️ Architecture

### Current Structure
```
tap2go-web.vercel.app     → Customer App (existing)
tap2go-vendor.vercel.app  → Vendor Panel (new)
tap2go-admin.vercel.app   → Admin Panel (new)  
tap2go-driver.vercel.app  → Driver Panel (new)
```

### Future Production URLs
```
tap2goph.com              → Customer App
vendor.tap2goph.com       → Vendor Panel
admin.tap2goph.com        → Admin Panel
driver.tap2goph.com       → Driver Panel
```

## 🚀 Vercel Project Setup

### Step 1: Create New Projects

For each new project, use these settings:

#### Build Configuration (Same for all projects)
```
Framework Preset: Next.js
Build Command: cd ../.. && pnpm build --filter=web
Output Directory: .next
Install Command: cd ../.. && pnpm install --frozen-lockfile
Root Directory: ./
Node.js Version: 20.x
```

#### Environment Variables

**tap2go-vendor project:**
```env
NEXT_PUBLIC_PANEL_TYPE=vendor
NEXT_PUBLIC_APP_URL=https://tap2go-vendor.vercel.app
# + ALL existing environment variables from tap2go-web
```

**tap2go-admin project:**
```env
NEXT_PUBLIC_PANEL_TYPE=admin
NEXT_PUBLIC_APP_URL=https://tap2go-admin.vercel.app
# + ALL existing environment variables from tap2go-web
```

**tap2go-driver project:**
```env
NEXT_PUBLIC_PANEL_TYPE=driver
NEXT_PUBLIC_APP_URL=https://tap2go-driver.vercel.app
# + ALL existing environment variables from tap2go-web
```

### Step 2: Update Existing Project

Add these to your existing `tap2go-web` project:
```env
NEXT_PUBLIC_PANEL_TYPE=customer
NEXT_PUBLIC_APP_URL=https://tap2go-web.vercel.app
```

## 🔧 Deployment Commands

### Deploy All Projects
```bash
pnpm run deploy:all
```

### Deploy Individual Projects
```bash
pnpm run deploy:customer  # tap2go-web
pnpm run deploy:vendor    # tap2go-vendor
pnpm run deploy:admin     # tap2go-admin
pnpm run deploy:driver    # tap2go-driver
```

### Manual Deployment
```bash
# Deploy specific project
vercel --prod --project=tap2go-vendor

# Deploy all projects manually
vercel --prod --project=tap2go-web
vercel --prod --project=tap2go-vendor
vercel --prod --project=tap2go-admin
vercel --prod --project=tap2go-driver
```

## 🧪 Testing

### Verify Each Subdomain
```bash
# Test each panel loads correctly
curl -I https://tap2go-web.vercel.app
curl -I https://tap2go-vendor.vercel.app
curl -I https://tap2go-admin.vercel.app
curl -I https://tap2go-driver.vercel.app
```

### Test Panel Routing
1. Visit each URL and verify correct panel loads
2. Test authentication flows
3. Verify API endpoints work across all panels
4. Test cross-domain functionality

## 🔐 Security Considerations

### Environment Variables
- All projects share the same Firebase configuration
- Same payment gateway credentials
- Same database access
- Panel-specific URLs for proper routing

### Access Control
- Middleware handles subdomain routing
- Panel-specific authentication flows
- Role-based access control maintained

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
- Verify all environment variables are set
- Check build command points to correct directory
- Ensure pnpm is available in build environment

**Routing Issues:**
- Verify middleware configuration
- Check hostname detection logic
- Test with different domain formats

**Environment Variable Issues:**
- Ensure all required variables are copied
- Verify panel-specific variables are set correctly
- Check for typos in variable names

### Debug Commands
```bash
# Check build locally
pnpm run web:build

# Test middleware locally
pnpm run web:dev

# Verify environment variables
node -e "console.log(process.env.NEXT_PUBLIC_PANEL_TYPE)"
```

## 📊 Monitoring

### Deployment Status
- Monitor all 4 projects in Vercel dashboard
- Set up alerts for deployment failures
- Track performance metrics per panel

### Analytics
- Panel-specific analytics tracking
- User behavior analysis per subdomain
- Performance monitoring across all domains

## 🔄 Migration to Custom Domain

When ready to use `tap2goph.com`:

1. **DNS Configuration:**
```dns
tap2goph.com        → Point to tap2go-web project
vendor.tap2goph.com → Point to tap2go-vendor project
admin.tap2goph.com  → Point to tap2go-admin project
driver.tap2goph.com → Point to tap2go-driver project
```

2. **Update Environment Variables:**
```env
# Update URLs in each project
NEXT_PUBLIC_APP_URL=https://tap2goph.com           # Customer
NEXT_PUBLIC_APP_URL=https://vendor.tap2goph.com    # Vendor
NEXT_PUBLIC_APP_URL=https://admin.tap2goph.com     # Admin
NEXT_PUBLIC_APP_URL=https://driver.tap2goph.com    # Driver
```

3. **No Code Changes Required** - Middleware already supports custom domains

## ✅ Success Criteria

- [ ] All 4 Vercel projects created and configured
- [ ] Environment variables properly set for each project
- [ ] Middleware routing working correctly
- [ ] Each subdomain loads the correct panel
- [ ] Authentication works across all panels
- [ ] API endpoints accessible from all subdomains
- [ ] React Native app unaffected and working normally

## 📞 Support

For issues with this deployment:
1. Check Vercel deployment logs
2. Verify environment variable configuration
3. Test middleware routing locally
4. Review this documentation for troubleshooting steps
