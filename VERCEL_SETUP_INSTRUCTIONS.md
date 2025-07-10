# 🚀 Vercel Multi-Project Setup Instructions

## 📋 Step-by-Step Implementation

### Phase 1: Update Existing tap2go-web Project

1. **Go to your existing Vercel project** (`tap2go-web`)
2. **Navigate to Settings → Environment Variables**
3. **Add these NEW environment variables:**
   ```
   NEXT_PUBLIC_PANEL_TYPE = customer
   NEXT_PUBLIC_APP_URL = https://tap2go-web.vercel.app
   ```
4. **Keep all your existing environment variables unchanged**

### Phase 2: Create tap2go-vendor Project

1. **Go to Vercel Dashboard → New Project**
2. **Import from GitHub:** Select your `tap2go` repository
3. **Project Name:** `tap2go-vendor`
4. **Configure Build Settings:**
   ```
   Framework Preset: Next.js
   Build Command: cd ../.. && pnpm build --filter=web
   Output Directory: .next
   Install Command: cd ../.. && pnpm install --frozen-lockfile
   Root Directory: ./
   ```
5. **Environment Variables:** Copy ALL variables from `tap2go-web` PLUS add:
   ```
   NEXT_PUBLIC_PANEL_TYPE = vendor
   NEXT_PUBLIC_APP_URL = https://tap2go-vendor.vercel.app
   ```

### Phase 3: Create tap2go-admin Project

1. **Go to Vercel Dashboard → New Project**
2. **Import from GitHub:** Select your `tap2go` repository
3. **Project Name:** `tap2go-admin`
4. **Configure Build Settings:** (Same as vendor)
   ```
   Framework Preset: Next.js
   Build Command: cd ../.. && pnpm build --filter=web
   Output Directory: .next
   Install Command: cd ../.. && pnpm install --frozen-lockfile
   Root Directory: ./
   ```
5. **Environment Variables:** Copy ALL variables from `tap2go-web` PLUS add:
   ```
   NEXT_PUBLIC_PANEL_TYPE = admin
   NEXT_PUBLIC_APP_URL = https://tap2go-admin.vercel.app
   ```

### Phase 4: Create tap2go-driver Project

1. **Go to Vercel Dashboard → New Project**
2. **Import from GitHub:** Select your `tap2go` repository
3. **Project Name:** `tap2go-driver`
4. **Configure Build Settings:** (Same as others)
   ```
   Framework Preset: Next.js
   Build Command: cd ../.. && pnpm build --filter=web
   Output Directory: .next
   Install Command: cd ../.. && pnpm install --frozen-lockfile
   Root Directory: ./
   ```
5. **Environment Variables:** Copy ALL variables from `tap2go-web` PLUS add:
   ```
   NEXT_PUBLIC_PANEL_TYPE = driver
   NEXT_PUBLIC_APP_URL = https://tap2go-driver.vercel.app
   ```

## 🔧 Environment Variables Checklist

### Required for ALL Projects
Copy these from your existing `tap2go-web` project:

```
✅ NEXT_PUBLIC_FIREBASE_API_KEY
✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID
✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
✅ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
✅ NEXT_PUBLIC_FIREBASE_APP_ID
✅ FIREBASE_ADMIN_PROJECT_ID
✅ FIREBASE_ADMIN_PRIVATE_KEY
✅ FIREBASE_ADMIN_CLIENT_EMAIL
✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
✅ MAPS_BACKEND_KEY
✅ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
✅ PAYMONGO_PUBLIC_KEY_LIVE
✅ PAYMONGO_SECRET_KEY_LIVE
✅ PAYMONGO_PUBLIC_KEY_TEST
✅ PAYMONGO_SECRET_KEY_TEST
✅ DATABASE_URL
✅ REDIS_URL
✅ RESEND_API_KEY
✅ OPENAI_API_KEY
✅ GOOGLE_GENERATIVE_AI_API_KEY
... (all your existing variables)
```

### Panel-Specific Variables

**tap2go-web (customer):**
```
NEXT_PUBLIC_PANEL_TYPE = customer
NEXT_PUBLIC_APP_URL = https://tap2go-web.vercel.app
```

**tap2go-vendor:**
```
NEXT_PUBLIC_PANEL_TYPE = vendor
NEXT_PUBLIC_APP_URL = https://tap2go-vendor.vercel.app
```

**tap2go-admin:**
```
NEXT_PUBLIC_PANEL_TYPE = admin
NEXT_PUBLIC_APP_URL = https://tap2go-admin.vercel.app
```

**tap2go-driver:**
```
NEXT_PUBLIC_PANEL_TYPE = driver
NEXT_PUBLIC_APP_URL = https://tap2go-driver.vercel.app
```

## 🚀 Deployment Process

### Option 1: Automatic Deployment
After creating all projects, push your code:
```bash
git add .
git commit -m "Add multi-subdomain support"
git push origin main
```
All 4 projects will automatically deploy.

### Option 2: Manual Deployment
```bash
# Deploy all projects
pnpm run deploy:all

# Or deploy individually
pnpm run deploy:vendor
pnpm run deploy:admin
pnpm run deploy:driver
```

## ✅ Verification Steps

1. **Check all projects deploy successfully**
2. **Visit each URL:**
   - https://tap2go-web.vercel.app (should show customer app)
   - https://tap2go-vendor.vercel.app (should show vendor panel)
   - https://tap2go-admin.vercel.app (should show admin panel)
   - https://tap2go-driver.vercel.app (should show driver panel)

3. **Test functionality:**
   - Authentication works on each subdomain
   - API calls work from all panels
   - Navigation within each panel works correctly

## 🚨 Important Notes

### React Native App Safety
- ✅ **Zero impact** on your mobile app
- ✅ **Separate build systems** (Vercel vs Expo)
- ✅ **Independent deployments**
- ✅ **No shared dependencies**

### Rollback Plan
If anything goes wrong:
1. Delete the new Vercel projects
2. Revert middleware changes
3. Remove panel-specific environment variables
4. Your original setup remains intact

## 📞 Next Steps

After successful deployment:
1. Test all functionality across subdomains
2. Update any hardcoded URLs in your code
3. Configure custom domain when ready
4. Set up monitoring and analytics per panel

## 🎯 Expected Results

After completion, you'll have:
- ✅ 4 independent Vercel projects
- ✅ Professional subdomain structure
- ✅ Same codebase, different configurations
- ✅ Independent scaling and monitoring
- ✅ Easy migration to custom domains
- ✅ React Native app completely unaffected
