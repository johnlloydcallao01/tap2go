# Tap2Go - Professional Food Delivery Platform

A comprehensive, enterprise-grade food delivery platform built with Next.js 15, TypeScript, and modern technologies. Designed as a professional FoodPanda competitor with complete multi-vendor functionality, advanced analytics, and real-time operations.

## 🌟 Platform Overview

Tap2Go is a full-scale food delivery ecosystem featuring:
- **Admin Panel** - Complete platform management and analytics
- **Vendor Panel** - Restaurant management and order processing
- **Driver Panel** - Delivery management and earnings tracking
- **Customer App** - Mobile-first ordering experience with real-time tracking

## 🚀 Key Features -

### 🔐 Enterprise Authentication System
- Firebase Authentication with role-based access control
- Multi-panel authentication (Admin, Vendor, Driver, Customer)
- Secure admin login with super admin account
- Professional loading states without layout shifts
- Token-based API authentication with Firebase Admin SDK

### � Admin Panel
- Comprehensive dashboard with real-time analytics
- User management (Admins, Vendors, Drivers, Customers)
- Order management and dispute resolution
- Financial analytics and payout management
- Platform configuration and system monitoring
- Professional mobile-responsive design

### 🏪 Vendor Panel
- Restaurant profile and menu management
- Real-time order processing and status updates
- Sales analytics and performance metrics
- Menu item management with categories
- Restaurant settings and operational hours

### 🚚 Driver Panel
- Delivery request management and acceptance
- Real-time location tracking and route optimization
- Earnings tracking and performance analytics
- Vehicle management and status updates
- Professional driver interface

### 📱 Customer Mobile App
- FoodPanda-style mobile interface with sticky navigation
- Location-based restaurant discovery
- Advanced search with fuzzy matching (Elasticsearch)
- Real-time order tracking with Google Maps
- Wishlist management and order history
- Professional Tap2Go branding (#f3a823 primary, #ef7b06 secondary)

### 💳 Payment Integration
- **PayMongo Live Integration** - Production payment gateway with live keys
- **Real-time Webhooks** - Firebase Cloud Functions for instant payment processing
- **Multiple Payment Methods** - GCash, Cards, Maya, GrabPay support
- **Secure Processing** - HMAC SHA256 signature verification
- **3D Secure Support** - Enhanced payment security
- **Professional Checkout** - Seamless payment experience

### 🔔 Real-time Notifications
- **Firebase Cloud Messaging (FCM)** - Professional push notification system
- **Multi-scenario Support** - Payment, order, delivery, and status notifications
- **Cross-platform Delivery** - Web and mobile notification support
- **Background Processing** - Service worker for offline notification handling
- **Professional UI** - Notification bell component with management interface
- **Token Management** - Automatic cleanup and refresh handling

### 📊 Advanced Analytics
- **ECharts Implementation** with strategic 90/10 rule approach
- **React Wrapper (90%)**: Standard business charts using echarts-for-react
- **Direct ECharts (10%)**: Advanced features for real-time and complex visualizations
- Real-time business intelligence dashboards across all panels
- Revenue tracking and performance metrics with interactive charts
- Customer behavior analytics and driver performance monitoring
- Professional Tap2Go-branded chart theming and responsive design

### 🗺️ Google Maps Integration
- Separate frontend and backend API keys for enterprise use
- Location search with auto-suggestions
- Delivery radius calculation and optimization
- Real-time driver tracking
- Address validation and geocoding

### 🔍 Intelligent Search
- Elasticsearch/OpenSearch integration (Bonsai)
- Fuzzy matching for typo tolerance
- Real-time search suggestions
- Category and filter-based discovery

### ☁️ Cloud Storage
- Cloudinary integration for image management
- Multiple upload presets for different content types
- Optimized image delivery and transformations
- Professional file management system

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15** - Latest React framework with App Router
- **TypeScript** - Enterprise-grade type safety
- **TailwindCSS** - Utility-first CSS with custom Tap2Go theme
- **React 19** - Latest React with concurrent features

### State Management
- **Redux Toolkit** - Enterprise state management
- **RTK Query** - Advanced data fetching and caching
- **React Context** - Authentication and cart management
- **Redux Persist** - State persistence

### Backend & Database
- **Firebase Firestore** - Real-time NoSQL database (tap2go-kuucn)
- **Firebase Cloud Functions** - Serverless backend with TypeScript
- **Firebase Admin SDK** - Server-side operations and FCM
- **Firebase Auth** - Authentication and user management
- **Firebase Cloud Messaging** - Real-time push notifications
- **Comprehensive database schema** - Professional data modeling

### Payment & Maps
- **PayMongo** - Philippine payment gateway (live production)
- **Google Maps API** - Location services and mapping
- **Cloudinary** - Image and file storage
- **Elasticsearch** - Advanced search capabilities

### Analytics & Monitoring
- **ECharts** - Professional charting and visualization with 90/10 strategy
- **Real-time analytics** - Business intelligence dashboards
- **Performance monitoring** - System health tracking

## 📁 Project Structure

```
tap2go/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── admin/                    # Admin Panel Pages
│   │   │   ├── dashboard/            # Admin dashboard
│   │   │   ├── users/                # User management
│   │   │   ├── vendors/              # Vendor management
│   │   │   ├── drivers/              # Driver management
│   │   │   ├── orders/               # Order management
│   │   │   └── analytics/            # Admin analytics
│   │   ├── vendor/                   # Vendor Panel Pages
│   │   │   ├── dashboard/            # Vendor dashboard
│   │   │   ├── menu/                 # Menu management
│   │   │   ├── orders/               # Order processing
│   │   │   └── analytics/            # Vendor analytics
│   │   ├── driver/                   # REMOVED: Driver functionality moved to apps/web-driver
│   │   ├── api/                      # API Routes (App Router)
│   │   │   ├── admin/                # Admin API endpoints
│   │   │   ├── vendor/               # Vendor API endpoints
│   │   │   ├── driver/               # REMOVED: Driver API moved to apps/web-driver
│   │   │   ├── paymongo/             # Payment processing
│   │   │   ├── maps/                 # Google Maps services
│   │   │   └── search/               # Search functionality
│   │   ├── auth/                     # Authentication pages
│   │   ├── restaurant/[id]/          # Restaurant detail pages
│   │   ├── cart/                     # Shopping cart
│   │   ├── orders/                   # Order history
│   │   ├── profile/                  # User profile
│   │   ├── analytics-demo/           # ECharts demo (90/10 strategy)
│   │   └── admin-login/              # Admin authentication
│   ├── components/                   # Reusable Components
│   │   ├── admin/                    # Admin-specific components
│   │   ├── vendor/                   # Vendor-specific components
│   │   ├── driver/                   # Driver-specific components
│   │   ├── customer/                 # Customer-specific components
│   │   ├── ui/                       # UI components
│   │   └── common/                   # Shared components
│   ├── store/                        # Redux Store
│   │   ├── slices/                   # Redux slices
│   │   ├── api/                      # RTK Query APIs
│   │   └── index.ts                  # Store configuration
│   ├── contexts/                     # React Contexts
│   │   ├── AuthContext.tsx           # Authentication context
│   │   └── CartContext.tsx           # Shopping cart context
│   ├── lib/                          # Utility Libraries
│   │   ├── database/                 # Database schemas & utilities
│   │   ├── maps/                     # Google Maps integration
│   │   ├── cloudinary/               # Image upload services
│   │   ├── firebase.ts               # Firebase client config
│   │   ├── firebase-admin.ts         # Firebase admin config
│   │   └── paymongo.ts               # PayMongo integration
│   ├── server/                       # Server-side Services
│   │   └── services/                 # Business logic services
│   └── types/                        # TypeScript definitions
├── scripts/                          # Database Setup Scripts
│   ├── setup-database.js             # Initialize database
│   ├── setup-users-admins.js         # Setup admin users
│   ├── setup-vendors.js              # Setup vendor data
│   ├── setup-restaurants.js          # Setup restaurant data
│   └── setup-customers.js            # Setup customer data
├── docs/                             # Documentation
│   ├── README.md                     # Documentation overview
│   ├── AUTHENTICATION_IMPROVEMENTS.md # Enterprise-grade authentication system
│   ├── AUTHENTICATION_LAYOUT_SHIFT_FIXES.md # Professional layout shift fixes
│   ├── DATABASE_SETUP.md             # Database setup guide
│   ├── FACEBOOK_SPLASH_SCREEN.md     # Facebook-style splash screen implementation
│   ├── FAST_LOADING_IMPROVEMENTS.md  # Lightning-fast loading system
│   ├── REDUX_IMPLEMENTATION.md       # Redux Toolkit state management
│   ├── ECHARTS_IMPLEMENTATION_GUIDE.md # ECharts 90/10 strategy guide
│   ├── ECHARTS_QUICK_REFERENCE.md    # ECharts quick reference
│   ├── ENVIRONMENT_SETUP.md          # Complete environment configuration
│   ├── FIREBASE_FUNCTIONS_ARCHITECTURE.md # Cloud Functions architecture
│   ├── FCM_INTEGRATION_GUIDE.md      # Push notifications setup
│   └── TROUBLESHOOTING_GUIDE.md      # Comprehensive troubleshooting guide
└── package.json                      # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** - Latest LTS version recommended
- **npm or yarn** - Package manager
- **Firebase Project** - With Firestore and Authentication enabled
- **PayMongo Account** - For payment processing (business verified)
- **Google Cloud Account** - For Maps API access
- **Cloudinary Account** - For image storage

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd tap2go
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Configuration:**
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# PayMongo (Live Production Keys)
PAYMONGO_PUBLIC_KEY_LIVE=pk_live_your_public_key
PAYMONGO_SECRET_KEY_LIVE=sk_live_your_secret_key

# Google Maps API
NEXT_PUBLIC_MAPS_FRONTEND_KEY=your_frontend_maps_key
MAPS_BACKEND_KEY=your_backend_maps_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Elasticsearch/OpenSearch (Bonsai)
BONSAI_HOST=https://your-cluster.bonsai.io
BONSAI_USERNAME=your_username
BONSAI_PASSWORD=your_password
BONSAI_URL=https://username:password@your-cluster.bonsai.io

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Database Setup:**
Initialize the Firestore database with professional schema:

```bash
# Setup main database structure
npm run setup-db

# Setup admin users (creates super admin)
npm run setup-users-admins

# Setup vendor data
npm run setup-vendors

# Setup restaurant data
npm run setup-restaurants

# Setup customer data
npm run setup-customers

# Add sample restaurants
npm run add-restaurants
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Access the application:**
- **Customer App**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Vendor Panel**: [http://localhost:3000/vendor](http://localhost:3000/vendor)
- **Driver Panel**: [http://localhost:3000/driver](http://localhost:3000/driver)
- **Analytics Demo**: [http://localhost:3000/analytics-demo](http://localhost:3000/analytics-demo)
- **FCM Testing**: [http://localhost:3000/test-notifications](http://localhost:3000/test-notifications)
- **Complete Flow Test**: [http://localhost:3000/test-all-notifications](http://localhost:3000/test-all-notifications)
- **PayMongo Testing**: [http://localhost:3000/paymongo-test](http://localhost:3000/paymongo-test)

### Default Admin Account
- **Email**: johnlloydcallao@gmail.com
- **Password**: 123456
- **Access Level**: Super Admin

## 🎨 Design Features

- **Tap2Go Brand Colors**: Primary #f3a823 (orange), Secondary #ef7b06 (darker orange)
- **Mobile-First Design**: Responsive across all devices with sticky navigation
- **Professional Loading States**: Facebook-style loading without layout shifts
- **FoodPanda-Style Interface**: Familiar UX patterns for food delivery
- **Smooth Animations**: Professional transitions and micro-interactions
- **Error Handling**: Comprehensive error states and fallbacks
- **Accessibility**: WCAG compliant design patterns

## 📱 Application Pages

### Customer App
- **Homepage** - Restaurant discovery with location-based filtering
- **Restaurant Detail** - Menu browsing with category filters
- **Cart** - Shopping cart with real-time calculations
- **Orders** - Order history with real-time tracking
- **Profile** - Account management and preferences
- **Wishlist** - Saved restaurants and favorite items

### Admin Panel
- **Dashboard** - Platform overview with key metrics
- **User Management** - Admin, vendor, driver, customer management
- **Order Management** - Real-time order monitoring and dispute resolution
- **Analytics** - Business intelligence with ECharts (90/10 strategy)
- **Financial** - Revenue tracking and payout management
- **System Config** - Platform settings and configuration

### Vendor Panel
- **Dashboard** - Restaurant performance overview
- **Menu Management** - Item creation, editing, and categorization
- **Order Processing** - Real-time order management
- **Analytics** - Sales performance and customer insights
- **Restaurant Settings** - Profile, hours, and operational settings

### Driver Panel
- **Dashboard** - Delivery overview and earnings summary
- **Delivery Management** - Active delivery tracking
- **Earnings** - Performance metrics and payment history
- **Profile** - Vehicle information and status management

## 🔌 API Documentation

### Authentication Endpoints
```
POST /api/auth/signin          # User authentication
POST /api/auth/signup          # User registration
GET  /api/admin/test           # Admin authentication test
```

### Payment Processing
```
POST /api/paymongo/simple-test           # PayMongo integration test
POST /api/paymongo/process-payment       # Process real payments
POST /api/paymongo/create-payment-intent # Create payment intent
GET  /api/paymongo/payment-methods       # Get available payment methods
GET  /api/paymongo/get-webhook-secret    # Get webhook secret for setup
```

### Firebase Cloud Functions
```
POST https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook
# PayMongo webhook handler with signature verification
```

### Notifications
```
POST /api/test-fcm-notification         # Test FCM notifications
```

### Maps & Location
```
POST /api/maps/geocode                # Address geocoding
POST /api/maps/distance               # Distance calculations
GET  /api/maps/nearby-restaurants     # Location-based restaurant search
```

### Search & Discovery
```
POST /api/search/setup                # Elasticsearch setup
GET  /api/search/restaurants          # Restaurant search with filters
```

### Database Management
```
POST /api/add-customers               # Customer data setup
POST /api/add-vendors                 # Vendor data setup
POST /api/add-restaurants             # Restaurant data setup
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Push to GitHub**: Commit your code to a GitHub repository
2. **Connect to Vercel**: Import your repository in Vercel dashboard
3. **Environment Variables**: Add all required environment variables
4. **Deploy**: Automatic deployment on every push to main branch

### Environment Variables for Production
Ensure all environment variables are properly configured in your deployment platform:

- Firebase configuration (client & admin)
- PayMongo live API keys
- Google Maps API keys with proper restrictions
- Cloudinary credentials
- Elasticsearch/Bonsai connection details

### Database Deployment
```bash
# Deploy Firestore security rules
npm run deploy-rules

# Initialize production database
npm run setup-db
```

## 📊 Available Scripts

```bash
# Development
npm run dev                    # Start development server with Turbopack
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Database Management
npm run setup-db               # Initialize database structure
npm run setup-users-admins     # Setup admin users
npm run setup-vendors          # Setup vendor data
npm run setup-restaurants      # Setup restaurant data
npm run setup-customers        # Setup customer data
npm run add-restaurants        # Add sample restaurants
npm run clear-db               # Clear database (with confirmation)
npm run update-system-docs     # Update system documentation

# Firebase
npm run deploy-rules           # Deploy Firestore security rules
```

## 🔮 Implemented Features

✅ **Multi-Panel Architecture** - Admin, Vendor, Driver, Customer panels
✅ **Payment Integration** - PayMongo with live production keys and webhooks
✅ **Real-time Notifications** - Firebase Cloud Messaging with professional UI
✅ **Firebase Cloud Functions** - TypeScript serverless backend with webhook processing
✅ **Real-time Analytics** - ECharts with 90/10 strategy across all panels
✅ **Advanced Search** - Elasticsearch with fuzzy matching
✅ **Google Maps Integration** - Location services and tracking
✅ **Professional Authentication** - Role-based access control
✅ **Redux State Management** - Enterprise-grade state handling
✅ **Cloud Storage** - Cloudinary image management
✅ **Mobile-First Design** - Responsive across all devices
✅ **Database Schema** - Comprehensive Firestore structure
✅ **Webhook Security** - HMAC SHA256 signature verification
✅ **Comprehensive Testing** - FCM, payment, and integration test suites

## 🚧 Future Enhancements

- [ ] Mobile App (React Native)
- [ ] Real-time Chat Support
- [ ] Advanced Loyalty Program
- [ ] Multi-language Support (i18n)
- [ ] Dark Mode Theme
- [ ] Progressive Web App (PWA)
- [ ] Advanced Analytics Dashboard
- [ ] Third-party Integrations (Facebook Shop, TikTok Shop)
- [ ] AI-powered Recommendations
- [ ] Advanced Reporting System

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Follow TypeScript best practices
2. Maintain consistent code formatting
3. Write comprehensive tests
4. Update documentation for new features
5. Follow the established project structure

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Review the documentation in the `/docs` folder
- Check the implementation guides (Redux, Analytics, Database, ECharts)

### 📊 ECharts Implementation Support
- **Full Guide**: `/docs/ECHARTS_IMPLEMENTATION_GUIDE.md` - Comprehensive 90/10 strategy
- **Quick Reference**: `/docs/ECHARTS_QUICK_REFERENCE.md` - Developer cheat sheet
- **Live Demo**: `/analytics-demo` - Working examples of both approaches
- **Components**: `src/components/analytics/` - BaseChart and DirectChart implementations

---

## 👨‍💻 Developer

**Tap2Go** is developed by **Software Engineer John Lloyd Callao**

- **Lead Developer**: John Lloyd Callao
- **Role**: Full-Stack Software Engineer
- **Specialization**: Enterprise web applications and food delivery platforms
- **Contact**: johnlloydcallao@gmail.com

---

**Tap2Go** - Professional Food Delivery Platform
Built with ❤️ by Software Engineer John Lloyd Callao using Next.js 15, TypeScript, and modern web technologies.
