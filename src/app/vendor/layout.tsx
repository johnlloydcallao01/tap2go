'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import VendorHeader from '@/components/vendor/VendorHeader';
import VendorSidebar from '@/components/vendor/VendorSidebar';

interface VendorLayoutProps {
  children: React.ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!loading && isInitialized) {
      if (!user) {
        // Not authenticated, redirect to sign in
        router.replace('/auth/signin?redirect=/vendor');
        return;
      }

      // Check if user has vendor or admin role
      if (user.role !== 'vendor' && user.role !== 'admin') {
        // Not authorized, redirect to home
        router.replace('/');
        return;
      }
    }
  }, [user, loading, isInitialized, router]);

  // Handle sidebar collapse toggle
  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle expand and navigate (for collapsed sidebar)
  const handleExpandAndNavigate = (href: string) => {
    setSidebarCollapsed(false);
    router.push(href);
  };

  // Show loading state while checking authentication
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor panel...</p>
        </div>
      </div>
    );
  }

  // Show loading state if user is not authenticated or authorized
  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top, starts after sidebar on desktop */}
      <VendorHeader
        onMenuClick={() => setSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Sidebar - Fixed on left, starts below header */}
      <VendorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onExpandAndNavigate={handleExpandAndNavigate}
      />

      {/* Main Content - Positioned after header height and sidebar width */}
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pt-14 lg:pt-16`}>
        <div className="px-3 pt-8 pb-5 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
