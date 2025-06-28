# 🌐 Environment Variables Guide - Tap2Go Monorepo

## 📋 Overview

This monorepo uses a **centralized environment variable approach** where all apps share the same environment variables from the root `.env.local` file.

## 🏗️ Structure

```
tap2go/
├── .env.local                          # 🌐 Single source of truth
├── .env.example                        # 📝 Template for setup
├── scripts/
│   └── sync-env.js                     # 🔄 Auto-sync script
├── apps/
│   ├── web/                           # ✅ Auto-inherits from root
│   └── mobile-customer/               # ✅ Synced via script
│       └── .env.local                 # 📱 Auto-generated copy
```

## 🎯 Why This Approach?

### ✅ **Advantages:**
- **Single Source of Truth** - All environment variables in one place
- **Consistency** - Web and mobile apps use identical configurations
- **Easy Management** - Update once, applies everywhere
- **Shared Services** - Firebase, Supabase, PayMongo work across all apps
- **Type Safety** - Centralized TypeScript declarations

### ❌ **Alternative (Not Used):**
```
# Decentralized approach (more complex)
apps/web/.env.local
apps/mobile-customer/.env.local
```

## 🔧 How It Works

### **Web App (Next.js)**
- Automatically loads from root `.env.local`
- No additional setup required

### **Mobile App (React Native/Expo)**
- Uses `react-native-dotenv` to load environment variables
- Babel configured to read from `../../.env.local`
- Auto-sync script ensures consistency

## 🚀 Usage

### **Development Setup**
```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Fill in your actual values
# Edit .env.local with your API keys

# 3. Sync environment variables
pnpm run sync-env

# 4. Start development
pnpm run dev
```

### **Automatic Synchronization**
```bash
# Manual sync
pnpm run sync-env

# Auto-sync on install
pnpm install  # Runs postinstall hook

# Auto-sync before mobile dev
pnpm run mobile:dev  # Syncs then starts
```

## 📱 Mobile App Integration

### **Import Environment Variables**
```typescript
// Import specific configurations
import { 
  firebaseConfig, 
  mapsConfig, 
  paymentConfig 
} from './src/config/environment';

// Validate environment
import { validateEnvironment } from './src/config/environment';
if (!validateEnvironment()) {
  console.error('Environment setup incomplete');
}
```

### **Available Configurations**
- `firebaseConfig` - Firebase services
- `firebaseAdminConfig` - Admin SDK
- `mapsConfig` - Google Maps
- `searchConfig` - Elasticsearch
- `cloudinaryConfig` - Media management
- `paymentConfig` - PayMongo
- `supabaseConfig` - Database
- `redisConfig` - Caching
- `emailConfig` - Notifications
- `aiConfig` - AI features

## 🔐 Production Deployment

### **Web App (Vercel)**
- Automatically uses root `.env.local` during build
- Set production variables in Vercel dashboard

### **Mobile App (EAS Build)**
- Set variables in Expo dashboard
- EAS Build environment overrides local files

## 🛠️ Troubleshooting

### **Mobile App Can't Access Variables**
```bash
# Check if sync script ran
pnpm run sync-env

# Verify mobile .env.local exists
ls apps/mobile-customer/.env.local

# Check Babel configuration
cat apps/mobile-customer/babel.config.js
```

### **Variables Not Loading**
```bash
# Clear Metro cache
cd apps/mobile-customer
pnpm run cache:clean

# Restart with fresh environment
pnpm run mobile:dev
```

### **TypeScript Errors**
```bash
# Regenerate type declarations
pnpm run sync-env

# Check types file
cat apps/mobile-customer/types/env.d.ts
```

## 📝 Adding New Environment Variables

1. **Add to root `.env.local`**
2. **Update `.env.example`**
3. **Add TypeScript declaration** in `apps/mobile-customer/types/env.d.ts`
4. **Update configuration** in `apps/mobile-customer/src/config/environment.ts`
5. **Run sync script** `pnpm run sync-env`

## 🎉 Benefits for Your Monorepo

- ✅ **Simplified Management** - One file to rule them all
- ✅ **Consistent Configuration** - Web and mobile always in sync
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Automatic Sync** - No manual copying required
- ✅ **Production Ready** - Works with Vercel and EAS Build
- ✅ **Developer Friendly** - Clear structure and documentation
