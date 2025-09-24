/**
 * Admin Layout Wrapper
 * 
 * This component provides the main layout structure for the admin application.
 * It includes the header, sidebar, and main content area.
 * Demo mode: No authentication protection is applied.
 */

'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed] = useState(false);
  
  // Pages that should not show the admin layout (like login/signup)
  const authPages = ['/login', '/signup', '/signin'];
  const isAuthPage = authPages.some(page => pathname.startsWith(page));

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleExpandAndNavigate = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  // If it's an auth page, render without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <AdminHeader 
        onMenuToggle={handleMobileMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar 
          isOpen={isMobileMenuOpen}
          onClose={handleMobileMenuClose}
          isCollapsed={isCollapsed}
          onExpandAndNavigate={handleExpandAndNavigate}
        />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 pt-16">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
