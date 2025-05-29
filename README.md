# Tap2Go - Professional Food Delivery Platform

A modern, full-featured food delivery platform built with Next.js 15, TypeScript, TailwindCSS, and Firebase. Similar to FoodPanda, this application provides a complete multivendor food delivery experience.

## 🚀 Features

### 🔐 Authentication System
- User registration and login with Firebase Auth
- Role-based access (Customer, Restaurant Owner, Admin)
- Protected routes and user context management
- Secure password handling with validation

### 🏠 Homepage
- Beautiful hero section with search functionality
- Restaurant listings with filtering by category
- Featured restaurants display
- Responsive design with loading states
- Professional footer with company information

### 🍕 Restaurant Features
- Restaurant cards with ratings, delivery time, and fees
- Detailed restaurant pages with menu items
- Menu item components with add-to-cart functionality
- Category filtering for menu items
- Restaurant information display (hours, contact, etc.)

### 🛒 Shopping Cart System
- Add/remove items from cart
- Quantity management with real-time updates
- Special instructions for items
- Cart persistence with localStorage
- Order summary with tax and delivery fee calculations

### 👤 User Management
- User profile page with editable information
- Order history page with status tracking
- Address management
- Account settings and preferences

## 🛠️ Tech Stack

- **Next.js 15** - Latest React framework with App Router
- **TypeScript** - Type safety and better development experience
- **TailwindCSS** - Utility-first CSS framework for styling
- **Firebase** - Authentication, Firestore database, and storage
- **Heroicons** - Beautiful SVG icons
- **React Context** - State management for auth and cart

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── restaurant/[id]/page.tsx
│   ├── cart/page.tsx
│   ├── orders/page.tsx
│   ├── profile/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── RestaurantCard.tsx
│   ├── MenuItem.tsx
│   └── LoadingSpinner.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── lib/
│   ├── firebase.ts
│   └── firestore.ts
└── types/
    └── index.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tap2go
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication and Firestore
   - Update the Firebase configuration in `src/lib/firebase.ts`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Configuration

### Firebase Setup
Update the Firebase configuration in `src/lib/firebase.ts` with your project credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🎨 Design Features

- **Professional orange and gray color scheme**
- **Responsive design for all screen sizes**
- **Smooth animations and transitions**
- **Loading states and error handling**
- **Clean, modern UI components**
- **Image fallbacks for better UX**

## 📱 Pages

- **Homepage** - Restaurant browsing and search
- **Restaurant Detail** - Menu viewing and item selection
- **Cart** - Shopping cart management
- **Orders** - Order history and tracking
- **Profile** - User account management
- **Authentication** - Sign in/up pages

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

## 🔮 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Admin dashboard
- [ ] Restaurant owner dashboard
- [ ] Advanced search and filters
- [ ] Reviews and ratings system
- [ ] Delivery tracking with maps
- [ ] Multi-language support
- [ ] Dark mode theme

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
