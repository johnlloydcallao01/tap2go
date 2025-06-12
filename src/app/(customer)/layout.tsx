'use client';

import React, { useState } from 'react';
import HomeSidebar from '@/components/home/HomeSidebar';
import HomeHeader from '@/components/home/HomeHeader';
import MobileFooterNav from '@/components/MobileFooterNav';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle expand sidebar and navigate to specific page
  const handleExpandAndNavigate = (href: string, categoryName: string) => {
    // First expand the sidebar
    setSidebarCollapsed(false);

    // Close mobile sidebar if open
    setSidebarOpen(false);

    // Optional: Add a small delay to show the expansion animation
    setTimeout(() => {
      console.log(`Expanded sidebar and navigated to ${href} from ${categoryName} category`);
    }, 300);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top, starts after sidebar on desktop */}
      <HomeHeader
        onMenuClick={() => setSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Sidebar - Fixed on left, starts below header */}
      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onExpandAndNavigate={handleExpandAndNavigate}
      />

      {/* Main Content - Positioned after header height and sidebar width */}
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pt-14 lg:pt-16`}>
        <div className="px-3 pt-8 pb-5 lg:p-4">
          {children}
        </div>
      </main>

      <MobileFooterNav />
    </div>
  );
}
