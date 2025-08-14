'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import ProtectedRoute from '../auth/ProtectedRoute';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Persist sidebar state in localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('admin-sidebar-collapsed');
    if (savedCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Don't show header/sidebar on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // Handle expand sidebar and navigate to specific page
  // This function is only called when clicking on collapsed category icons
  // Regular navigation uses Link components directly
  const handleExpandAndNavigate = (href: string, categoryName: string) => {
    // First expand the sidebar
    setSidebarCollapsed(false);

    // Use window.location.href for category expansion navigation
    // This is consistent with how web-driver handles it
    window.location.href = href;

    // Close mobile sidebar if open
    setSidebarOpen(false);

    // Optional: Add a small delay to show the expansion animation
    setTimeout(() => {
      console.log(`Expanded sidebar and navigated to ${href} from ${categoryName} category`);
    }, 300);
  };

  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Fixed at top, starts after sidebar on desktop */}
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Sidebar - Fixed on left, starts below header */}
        <AdminSidebar
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
      </div>
    </ProtectedRoute>
  );
}
