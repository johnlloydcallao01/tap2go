'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import HomeSidebar from '@/components/home/HomeSidebar';
import HomeHeader from '@/components/home/HomeHeader';
import HomeContent from '@/components/home/HomeContent';
import StoresContent from '@/components/home/StoresContent';
import AccountContent from '@/components/home/AccountContent';
import MobileFooterNav from '@/components/MobileFooterNav';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'stores' | 'account'>('home');

  // Handle URL changes and set active view
  useEffect(() => {
    if (pathname === '/restaurants') {
      setActiveView('stores');
    } else if (pathname.startsWith('/account')) {
      setActiveView('account');
    } else if (pathname === '/home' || pathname === '/') {
      setActiveView('home');
    }
  }, [pathname]);

  // Handle navigation between views
  const handleNavigation = (view: 'home' | 'stores' | 'account', href?: string) => {
    // Update URL first, then let useEffect handle the view change
    if (view === 'stores') {
      router.push('/restaurants');
    } else if (view === 'account' && href) {
      router.push(href);
    } else {
      router.push('/');
    }

    // Close mobile sidebar if open
    setSidebarOpen(false);
  };

  // Handle expand sidebar and navigate to specific page
  const handleExpandAndNavigate = (href: string, categoryName: string) => {
    // First expand the sidebar
    setSidebarCollapsed(false);

    // Handle internal navigation
    if (href === '/' || href === '/home') {
      handleNavigation('home');
    } else if (href === '/restaurants') {
      handleNavigation('stores');
    } else if (href.startsWith('/account/')) {
      // For account routes, navigate directly to preserve the account layout
      router.push(href);
    } else {
      // External navigation
      router.push(href);
    }

    // Close mobile sidebar if open
    setSidebarOpen(false);

    // Optional: Add a small delay to show the expansion animation
    setTimeout(() => {
      console.log(`Expanded sidebar and navigated to ${href} from ${categoryName} category`);
    }, 300);
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top, starts after sidebar on desktop */}
      <HomeHeader
        onMenuClick={() => setSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Sidebar - Fixed on left, starts below header */}
      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onExpandAndNavigate={handleExpandAndNavigate}
        onNavigation={handleNavigation}
        activeView={activeView}
      />

      {/* Main Content - Positioned after header height and sidebar width */}
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pt-14 lg:pt-16`}>
        <div className="px-3 pt-8 pb-5 lg:p-6">
          {activeView === 'home' ? (
            <HomeContent />
          ) : activeView === 'stores' ? (
            <StoresContent />
          ) : (
            <AccountContent />
          )}
        </div>
      </main>

      <MobileFooterNav />
    </div>
  );
}
