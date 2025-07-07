# 🌐 Multiple Subdomains Web Architecture - Tap2Go Monorepo

## 📋 Executive Summary

This document outlines the complete implementation strategy for deploying Tap2Go's single Next.js web application across multiple subdomains while maintaining the existing monorepo structure.

**Recommended Architecture:**
- `tap2goph.com` → Customer App
- `vendor.tap2goph.com` → Vendor Panel  
- `admin.tap2goph.com` → Admin Panel
- `driver.tap2goph.com` → Driver Panel

## 🔍 Current Monorepo Analysis

### **Existing Structure (Optimal for Subdomains)**
```
tap2go/
├── apps/
│   ├── web/                    # Single Next.js app with all panels
│   └── mobile-customer/        # React Native app
├── packages/                   # Shared packages across apps
│   ├── api-client/            # API client library
│   ├── business-logic/        # Shared business logic
│   ├── config/                # Configuration management
│   ├── database/              # Database utilities
│   ├── firebase-config/       # Firebase configuration
│   ├── shared-types/          # TypeScript definitions
│   ├── shared-ui/             # UI component library
│   └── shared-utils/          # Utility functions
└── turbo.json                 # Turborepo configuration
```

### **Web App Panel Structure**
```
apps/web/src/app/
├── (customer)/               # Customer app with route groups
├── admin/                    # Admin panel routes
├── vendor/                   # Vendor panel routes  
├── driver/                   # Driver panel routes
└── api/                      # Shared API routes
```

### **Key Architectural Strengths**
✅ **Role-based layouts** with dedicated authentication  
✅ **Shared API routes** serving all panels  
✅ **Centralized environment variables** via root `.env.local`  
✅ **Turborepo optimization** with pnpm workspaces  
✅ **Shared packages** for maximum code reuse  

## 🎯 Recommended Solution: Single App + Multiple Deployments

### **Why This Approach is Optimal**

1. **Maximum Code Reuse** - 80%+ shared components and logic
2. **Simplified Maintenance** - Single codebase, multiple deployments
3. **Consistent User Experience** - Shared design system and components
4. **Efficient Development** - Single development server for all panels
5. **Cost Effective** - Minimal infrastructure changes required

## 🚀 Implementation Strategy

### **Phase 1: Environment-Based Panel Routing**

Add subdomain detection to your existing middleware:

```typescript
// apps/web/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;
  
  // Subdomain-based routing
  if (hostname.startsWith('vendor.')) {
    if (!pathname.startsWith('/vendor')) {
      return NextResponse.rewrite(new URL(`/vendor${pathname}`, request.url));
    }
  }
  
  if (hostname.startsWith('admin.')) {
    if (!pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
    }
  }
  
  if (hostname.startsWith('driver.')) {
    if (!pathname.startsWith('/driver')) {
      return NextResponse.rewrite(new URL(`/driver${pathname}`, request.url));
    }
  }
  
  // Existing test route logic...
  if (pathname.startsWith('/tests/') || pathname.startsWith('/test-')) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const enableTestRoutes = process.env.ENABLE_TEST_ROUTES === 'true';
    
    if (!isDevelopment || !enableTestRoutes) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### **Phase 2: Environment Configuration**

Update your configuration package to handle panel-specific settings:

```typescript
// packages/config/src/config.ts
export const config = {
  // ... existing config
  
  // Panel Configuration
  panel: {
    type: process.env.NEXT_PUBLIC_PANEL_TYPE || 'customer',
    subdomain: process.env.NEXT_PUBLIC_SUBDOMAIN || '',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // ... rest of config
};
```

### **Phase 3: Development Workflow Enhancement**

Update your package.json scripts for flexible development:

```json
{
  "scripts": {
    "dev": "turbo run dev --filter=web",
    "dev:all-panels": "concurrently \"pnpm:dev:*\"",
    "dev:customer": "cd apps/web && NEXT_PUBLIC_PANEL_TYPE=customer pnpm dev",
    "dev:vendor": "cd apps/web && NEXT_PUBLIC_PANEL_TYPE=vendor pnpm dev -p 3001",
    "dev:admin": "cd apps/web && NEXT_PUBLIC_PANEL_TYPE=admin pnpm dev -p 3002",
    "dev:driver": "cd apps/web && NEXT_PUBLIC_PANEL_TYPE=driver pnpm dev -p 3003",
    
    "build": "turbo run build --filter=web",
    "build:customer": "cd apps/web && NEXT_PUBLIC_PANEL_TYPE=customer pnpm build",
    "build:vendor": "cd apps/web && NEXT_PUBLIC_PANEL_TYPE=vendor pnpm build",
    "build:admin": "cd apps/web && NEXT_PUBLIC_PANEL_TYPE=admin pnpm build",
    "build:driver": "cd apps/web && NEXT_PUBLIC_PANEL_TYPE=driver pnpm build"
  }
}
```

## 🔧 Development Workflow

### **Daily Development (Recommended)**
```bash
# Single command starts all panels in one instance
pnpm run dev
# Access via:
# - localhost:3000 (customer)
# - localhost:3000/admin (admin)
# - localhost:3000/vendor (vendor)
# - localhost:3000/driver (driver)
```

### **Panel-Specific Development**
```bash
# Focus on specific panel
pnpm run dev:vendor-only  # Vendor panel on port 3001
pnpm run dev:admin-only   # Admin panel on port 3002
```

### **Multi-Panel Testing**
```bash
# Run all panels simultaneously for subdomain testing
pnpm run dev:all-panels
# → 4 instances on different ports
```

## 🚀 Deployment Strategy

### **Option A: Multiple Vercel Projects (Recommended)**

Create 4 separate Vercel projects pointing to the same repository:

1. **Customer App Project**
   ```bash
   # Environment Variables
   NEXT_PUBLIC_PANEL_TYPE=customer
   NEXT_PUBLIC_APP_URL=https://tap2goph.com
   ```

2. **Vendor Panel Project**
   ```bash
   # Environment Variables  
   NEXT_PUBLIC_PANEL_TYPE=vendor
   NEXT_PUBLIC_APP_URL=https://vendor.tap2goph.com
   ```

3. **Admin Panel Project**
   ```bash
   # Environment Variables
   NEXT_PUBLIC_PANEL_TYPE=admin
   NEXT_PUBLIC_APP_URL=https://admin.tap2goph.com
   ```

4. **Driver Panel Project**
   ```bash
   # Environment Variables
   NEXT_PUBLIC_PANEL_TYPE=driver
   NEXT_PUBLIC_APP_URL=https://driver.tap2goph.com
   ```

### **Vercel Configuration**

Update your `apps/web/vercel.json`:

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter=web",
  "outputDirectory": ".next",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  
  "env": {
    "VERCEL": "1",
    "NODE_VERSION": "20",
    "NEXT_TELEMETRY_DISABLED": "1"
  },
  
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods", 
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

## 🌐 DNS Configuration

Configure your domain DNS settings:

```dns
# Main domain
tap2goph.com        A/CNAME → Vercel customer app

# Subdomains
vendor.tap2goph.com A/CNAME → Vercel vendor app
admin.tap2goph.com  A/CNAME → Vercel admin app  
driver.tap2goph.com A/CNAME → Vercel driver app
```

## 🔐 Cross-Domain Considerations

### **Authentication (Firebase)**
Update Firebase configuration for subdomain support:

```typescript
// packages/firebase-config/src/config.ts
export const firebaseConfig = {
  // ... existing config
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // Ensure cookies work across subdomains
};

// Set cookie domain in auth context
// domain: '.tap2goph.com' for shared sessions
```

### **API Routes**
Your existing `/api/*` structure works perfectly across subdomains. No changes needed.

## ✅ Benefits of This Architecture

### **Development Benefits**
- ✅ **Single codebase** - Easy maintenance and updates
- ✅ **Shared components** - Consistent UI across panels  
- ✅ **Unified testing** - Single test suite for all panels
- ✅ **Fast development** - Hot reload across all panels

### **Business Benefits**  
- ✅ **Professional appearance** - Dedicated domains for each user type
- ✅ **Better SEO** - Panel-specific optimization
- ✅ **Enhanced security** - Subdomain-level policies
- ✅ **Scalable architecture** - Easy to add new panels

### **Technical Benefits**
- ✅ **Optimal resource usage** - Shared infrastructure
- ✅ **Simplified deployment** - Single build, multiple targets
- ✅ **Consistent environment** - Shared configuration management
- ✅ **Future-proof** - Easy to migrate to separate apps if needed

## 🎯 Migration Timeline

### **Week 1: Preparation**
- [ ] Update middleware for subdomain routing
- [ ] Add panel-specific environment variables
- [ ] Test local development workflow

### **Week 2: Deployment Setup**  
- [ ] Create 4 Vercel projects
- [ ] Configure DNS settings
- [ ] Deploy to staging subdomains

### **Week 3: Testing & Optimization**
- [ ] Cross-domain authentication testing
- [ ] Performance optimization
- [ ] Security validation

### **Week 4: Production Launch**
- [ ] Deploy to production subdomains
- [ ] Monitor and optimize
- [ ] Documentation updates

## 🚨 Important Notes

1. **Keep existing structure** - No need to split into separate apps
2. **Leverage Turborepo** - Your current setup is optimal
3. **Maintain shared packages** - Continue using monorepo benefits
4. **Single development server** - Simplest daily workflow
5. **Environment-based deployment** - Same code, different configurations

This architecture provides the professional subdomain structure you want while maintaining all the benefits of your current monorepo setup.
