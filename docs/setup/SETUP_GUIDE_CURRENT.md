# 🚀 **Tap2Go Complete Setup Guide**
## **Current Implementation: Hybrid Database + Firebase + Cloudinary**

---

## 📋 **Current Architecture Status**

### **✅ COMPLETED (Phase 1)**
- ✅ **Hybrid Database Architecture**: Prisma ORM + Direct SQL + Neon PostgreSQL
- ✅ **Firebase Integration**: Authentication, real-time operations, cloud functions
- ✅ **Cloudinary Integration**: Media management with multiple upload presets
- ✅ **PayMongo Integration**: Live payment processing with webhooks
- ✅ **Google Maps Integration**: Frontend and backend API keys
- ✅ **FCM Notifications**: Push notifications with VAPID key
- ✅ **Redux Toolkit**: State management with RTK Query

### **⏳ PENDING (Phase 2)**
- ⏳ **Strapi CMS Integration**: Content management system (future enhancement)
- ⏳ **Elasticsearch Integration**: Advanced search capabilities
- ⏳ **Redis Caching**: Enterprise-grade caching layer

---

## 🔧 **Environment Configuration**

### **Required Environment Variables**

#### **Firebase Configuration**
```bash
# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB6ALvnN6aX0DMVhePhkUow9VrPauBCqgQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tap2go-kuucn.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tap2go-kuucn
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tap2go-kuucn.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=828629511294
NEXT_PUBLIC_FIREBASE_APP_ID=1:828629511294:web:fae32760ca3c3afcb87c2f

# Firebase Admin SDK (Backend)
FIREBASE_ADMIN_PROJECT_ID=tap2go-kuucn
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tap2go-kuucn.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[PRIVATE_KEY_CONTENT]\n-----END PRIVATE KEY-----\n"

# Firebase Cloud Messaging
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BIZ720hEPOJI1onp93mfqutx5ceyFakOJPRM8R-Oa8eJibI5jsntq4PH-erjRy502Ac823zPQ63BTV5_qWxQUoQ
```

#### **Hybrid Database Configuration**
```bash
# Neon PostgreSQL Database (Primary Database)
DATABASE_URL=postgresql://tap2godb_owner:npg_ru51KZGMFTlt@ep-winter-river-a118fvup-pooler.ap-southeast-1.aws.neon.tech/tap2godb?sslmode=require
DATABASE_SSL=true
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=60000

# Prisma Configuration
PRISMA_GENERATE_DATAPROXY=false
PRISMA_HIDE_UPDATE_MESSAGE=true

# Feature Flags
ENABLE_HYBRID_DATABASE=true
ENABLE_STRAPI_INTEGRATION=false
ENABLE_CONTENT_CACHING=true
```

#### **Payment & Maps Integration**
```bash
# PayMongo Live Keys (Production)
PAYMONGO_PUBLIC_KEY_LIVE=pk_live_UJhfSgBMCUEM7JsmPHVr9Qb7
PAYMONGO_SECRET_KEY_LIVE=sk_live_awrzTYbxEhL5nSgN21F7vRfd
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE=pk_live_UJhfSgBMCUEM7JsmPHVr9Qb7

# Google Maps API
NEXT_PUBLIC_MAPS_FRONTEND_KEY=AIzaSyDWWpv5PBQFpfIkHmtOnHTGktHv5o36Cnw
MAPS_BACKEND_KEY=AIzaSyAhGLoNGg-gMgpDmiMdVk2POptR219SGT4
```

#### **Cloudinary Configuration**
```bash
# Cloudinary Media Management
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpekh75yi
CLOUDINARY_API_KEY=191284661715922
CLOUDINARY_API_SECRET=G-_izp68I2eJuZOCvAKOmPkTXdI
```

---

## 🚀 **Setup Instructions**

### **1. Project Setup**
```bash
# Clone the repository
git clone https://github.com/your-username/tap2go.git
cd tap2go

# Install dependencies
npm install

# Install additional hybrid database dependencies
npm install prisma @prisma/client @prisma/adapter-neon @neondatabase/serverless ws @types/ws
```

### **2. Environment Configuration**
```bash
# Create environment files
cp .env.example .env.local

# Create Prisma environment file
echo "DATABASE_URL=postgresql://tap2godb_owner:npg_ru51KZGMFTlt@ep-winter-river-a118fvup-pooler.ap-southeast-1.aws.neon.tech/tap2godb?sslmode=require" > .env

# Edit .env.local with your actual values
nano .env.local
```

### **3. Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Test hybrid database connection
npm run db:test

# Seed sample data (optional)
curl -X POST http://localhost:3000/api/database/test -H "Content-Type: application/json" -d '{"action":"seed"}'

# Open Prisma Studio to view data
npm run db:studio
```

### **4. Firebase Setup**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Select project
firebase use tap2go-kuucn

# Deploy functions
cd functions
npm install
npx tsc
firebase deploy --only functions
cd ..
```

### **5. Development Server**
```bash
# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

---

## 🧪 **Testing & Verification**

### **Database Testing**
```bash
# Test hybrid database connections
curl http://localhost:3000/api/database/test

# Test restaurant API
curl http://localhost:3000/api/restaurants?popular=true

# Test restaurant search
curl "http://localhost:3000/api/restaurants?q=pizza&lat=14.5995&lng=120.9842"
```

### **Firebase Testing**
```bash
# Check Firebase functions
firebase functions:log

# Test authentication
# Login through the web interface

# Test notifications
# Use the notification test interface in admin panel
```

### **Payment Testing**
```bash
# Test PayMongo webhook
curl -X POST https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook

# Test payment flow
# Use the payment interface with test cards
```

---

## 📊 **Available Scripts**

### **Database Scripts**
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:migrate:deploy # Deploy migrations to production
npm run db:migrate:reset  # Reset database (development only)
npm run db:studio        # Open Prisma Studio
npm run db:test          # Test database connections
npm run db:hybrid-test   # Test hybrid client directly
```

### **Development Scripts**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks
```

### **Legacy Scripts (for reference)**
```bash
npm run neon:setup       # Legacy Neon setup (replaced by Prisma)
npm run neon:test        # Legacy Neon test (replaced by db:test)
npm run neon:info        # Legacy Neon info (replaced by db:studio)
```

---

## 🔍 **Troubleshooting**

### **Database Issues**
```bash
# If migration fails
npx prisma migrate reset --force
npx prisma migrate dev --name init

# If Prisma client is outdated
npx prisma generate

# If connection fails
# Check DATABASE_URL in both .env and .env.local
```

### **Firebase Issues**
```bash
# If functions don't deploy
firebase login --reauth
firebase use tap2go-kuucn
firebase deploy --only functions --force

# If authentication fails
# Check Firebase configuration in .env.local
```

### **Environment Issues**
```bash
# If environment variables are missing
cp .env.example .env.local
# Edit .env.local with actual values

# If Prisma can't find DATABASE_URL
echo "DATABASE_URL=your_connection_string" > .env
```

---

## 🎯 **Next Steps**

### **Phase 2: Strapi Integration (Future)**
1. **Install Strapi**: Set up headless CMS
2. **Configure Database Sharing**: Use same Neon database
3. **Build CMS Interface**: Integrate into admin panel
4. **Content Synchronization**: Link operational and content data

### **Phase 3: Advanced Features (Future)**
1. **Redis Caching**: Enterprise-grade caching layer
2. **Elasticsearch**: Advanced search capabilities
3. **Analytics Dashboard**: Business intelligence features
4. **Mobile Apps**: React Native applications

---

## 📞 **Support & Resources**

### **Documentation**
- **Hybrid Architecture**: `docs/HYBRID_DATABASE_ARCHITECTURE.md`
- **Environment Setup**: `docs/ENVIRONMENT_SETUP.md`
- **Strapi Integration Plan**: `docs/STRAPI_INTEGRATION_PLAN.md`

### **Key Files**
- **Hybrid Client**: `src/lib/database/hybrid-client.ts`
- **Operations**: `src/lib/database/operations.ts`
- **API Routes**: `src/app/api/restaurants/`, `src/app/api/database/`
- **Schema**: `prisma/schema.prisma`

### **Admin Interfaces**
- **Database Management**: Prisma Studio (`npm run db:studio`)
- **Firebase Console**: https://console.firebase.google.com
- **Neon Console**: https://console.neon.tech
- **Cloudinary Console**: https://cloudinary.com/console

**Your Tap2Go platform is now ready for production with enterprise-grade scalability!** 🚀
