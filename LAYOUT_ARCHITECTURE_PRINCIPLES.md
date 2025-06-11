# Layout Architecture & Routing Principles

## 🎯 Core Philosophy: YouTube-Style Unified Layouts

This document establishes the **mandatory architectural principles** for our application's layout and routing system. These principles ensure professional user experience with natural sidebar scroll position preservation, similar to platforms like YouTube and Facebook.

## 🚨 Critical Rule: NO Layout Boundary Crossing

**NEVER** create separate layouts for routes that should share the same sidebar/navigation experience. This causes sidebar remounting and destroys scroll position preservation.

### ❌ WRONG: Multiple Layouts (Causes Sidebar Remounting)
```
src/app/
├── page.tsx (individual layout)
├── restaurants/page.tsx (individual layout)  
└── account/layout.tsx (separate layout)
    └── profile/page.tsx
```
**Result**: Navigating between routes = sidebar remounts = scroll position lost ❌

### ✅ CORRECT: Unified Layout (Preserves Sidebar State)
```
src/app/(customer)/
├── layout.tsx (SINGLE UNIFIED LAYOUT)
├── home/page.tsx
├── restaurants/page.tsx
└── account/
    ├── page.tsx
    ├── profile/page.tsx
    └── orders/page.tsx
```
**Result**: All navigation = same sidebar instance = scroll position preserved ✅

## 🏗️ Mandatory Layout Structure

### Panel-Based Architecture
Our application follows a **multi-panel architecture** where each user type has a dedicated panel:

1. **Admin Panel** (`/admin/*`) - System administration
2. **Vendor Panel** (`/vendor/*`) - Restaurant management  
3. **Driver Panel** (`/driver/*`) - Delivery management
4. **Customer Panel** (`/(customer)/*`) - Shopping & account management

### Customer Panel Unified Structure
The customer panel MUST use a single layout for ALL customer-facing routes:

```typescript
// src/app/(customer)/layout.tsx
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />
      <HomeSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <main>{children}</main>
      <MobileFooterNav />
    </div>
  );
}
```

## 📋 Route Organization Standards

### Customer Routes Structure
```
/(customer)/
├── home/page.tsx           # Home content
├── restaurants/page.tsx    # Restaurant browsing
└── account/
    ├── page.tsx           # Account dashboard
    ├── profile/page.tsx   # User profile
    ├── orders/page.tsx    # Order history
    ├── favorites/page.tsx # Favorite restaurants
    └── settings/page.tsx  # Account settings
```

### URL Mapping
- `/` → redirects to `/home`
- `/home` → Home page with unified layout
- `/restaurants` → Restaurants page with unified layout
- `/account/*` → All account pages with unified layout

## 🎯 Professional Navigation Behavior

### Desktop Behavior (Like YouTube)
1. User scrolls down in sidebar
2. User clicks any navigation item
3. **Sidebar stays open** ✅
4. **Scroll position preserved naturally** ✅
5. Page content updates instantly
6. **No jarring animations or resets** ✅

### Mobile Behavior (Expected UX)
1. User opens mobile sidebar
2. User clicks navigation item
3. **Sidebar closes** (expected mobile UX) ✅
4. Page content updates

### Implementation Pattern
```typescript
// Handle navigation link clicks - only close sidebar on mobile
const handleNavClick = () => {
  // Only close sidebar on mobile (when screen is small)
  if (window.innerWidth < 1024) { // lg breakpoint
    onClose();
  }
};

// In sidebar navigation items
<Link
  href="/account/profile"
  onClick={handleNavClick}
  className="nav-item"
>
  Profile
</Link>
```

## 🚫 Anti-Patterns to Avoid

### 1. Individual Page Layouts
```typescript
// ❌ NEVER DO THIS
export default function HomePage() {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>Home Content</main>
    </div>
  );
}
```

### 2. State-Based Content Switching
```typescript
// ❌ NEVER DO THIS
const [activeView, setActiveView] = useState('home');
return (
  <div>
    {activeView === 'home' ? <HomeContent /> : <AccountContent />}
  </div>
);
```

### 3. Callback-Based Navigation
```typescript
// ❌ NEVER DO THIS
<Sidebar onNavigation={(view) => setActiveView(view)} />
```

## ✅ Required Patterns

### 1. Layout-Based Architecture
```typescript
// ✅ ALWAYS DO THIS
// Layout handles UI structure
export default function CustomerLayout({ children }) {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

// Pages handle content only
export default function ProfilePage() {
  return <ProfileContent />;
}
```

### 2. Link-Based Navigation
```typescript
// ✅ ALWAYS DO THIS
<Link href="/account/profile">Profile</Link>
```

### 3. Route-Based Content
```typescript
// ✅ ALWAYS DO THIS
// Each route = separate page component
/account/profile → ProfilePage
/account/orders → OrdersPage
```

## 🔧 Implementation Checklist

When creating new customer-facing features:

- [ ] ✅ Use the unified `(customer)` layout
- [ ] ✅ Create individual page components
- [ ] ✅ Use `Link` components for navigation
- [ ] ✅ Test sidebar scroll preservation
- [ ] ✅ Verify mobile sidebar behavior
- [ ] ❌ NO individual layouts
- [ ] ❌ NO state-based content switching
- [ ] ❌ NO callback-based navigation

## 🎯 Success Metrics

A properly implemented layout should achieve:

1. **Instant Navigation** - No loading delays between routes
2. **Preserved Scroll Position** - Sidebar scroll stays exactly where user left it
3. **No Visual Glitches** - No sidebar flickering or repositioning
4. **Professional Feel** - Matches YouTube/Facebook navigation experience
5. **Mobile Optimization** - Sidebar closes appropriately on mobile

## 🚨 Enforcement

This architecture is **mandatory** for all customer-facing routes. Any deviation from these principles will result in:
- Poor user experience
- Broken scroll position preservation
- Inconsistent navigation behavior
- Failed code reviews

## 📚 Reference Implementation

See the current customer panel implementation in:
- `src/app/(customer)/layout.tsx` - Unified layout
- `src/app/(customer)/home/page.tsx` - Home page
- `src/app/(customer)/restaurants/page.tsx` - Restaurants page
- `src/app/(customer)/account/*/page.tsx` - Account pages
- `src/components/home/HomeSidebar.tsx` - Professional sidebar navigation

## 🎬 Real-World Examples

### YouTube Navigation Behavior
1. User scrolls down YouTube sidebar to "Watch Later"
2. User clicks on a video → Video changes, sidebar stays exactly where it was
3. User clicks "Home" → Content changes, sidebar scroll position preserved
4. User clicks "Subscriptions" → Content changes, sidebar still at "Watch Later"

### Facebook Navigation Behavior
1. User scrolls down Facebook left sidebar to "Marketplace"
2. User clicks on "Groups" → Content changes, sidebar stays at "Marketplace"
3. User clicks on "Events" → Content changes, sidebar position preserved
4. User navigates back → Everything exactly as they left it

### Our Implementation
```
User scrolls sidebar to "Order History" →
Clicks "Home" → Sidebar stays at "Order History" ✅
Clicks "Restaurants" → Sidebar stays at "Order History" ✅
Clicks "Account Profile" → Sidebar stays at "Order History" ✅
Clicks "Favorites" → Sidebar stays at "Order History" ✅
```

## 🔄 Migration Guide

### When Adding New Customer Routes
1. **Always** place under `src/app/(customer)/`
2. **Never** create separate layouts
3. **Always** use the unified customer layout
4. **Test** sidebar scroll preservation between all routes

### When Refactoring Existing Routes
1. Move routes to `(customer)` group
2. Remove individual layouts
3. Convert to page-only components
4. Update navigation links
5. Test scroll preservation

## 🎯 Quality Assurance

### Manual Testing Checklist
1. Open application in browser
2. Scroll sidebar to middle position
3. Navigate between: Home → Restaurants → Account → Profile → Orders
4. Verify sidebar scroll position never resets
5. Test on both desktop and mobile
6. Verify mobile sidebar closes appropriately

### Automated Testing (Future)
```typescript
// Example test case
test('sidebar scroll position preserved across navigation', () => {
  // Scroll sidebar to position
  // Navigate to different routes
  // Assert scroll position unchanged
});
```

---

**Remember**: We build applications that feel as professional as YouTube and Facebook. Sidebar scroll position preservation is not optional—it's a fundamental requirement for modern web applications.

**Culture**: Every navigation should feel instant and natural. If a user notices the sidebar "jumping" or "resetting", we have failed to meet professional standards.
