'use client';

import * as React from 'react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ProtectedRoute } from '@/components/auth';
import { usePathname } from 'next/navigation';

interface MerchantLayoutProps {
  children: React.ReactNode;
}

/**
 * Merchant layout - protected layout for vendor users.
 * Combines authentication protection with the copied dashboard shell.
 */
export default function MerchantLayout({ children }: MerchantLayoutProps) {
  const pathname = usePathname();

  // If it's the login page, don't wrap with AdminDashboard or ProtectedRoute
  if (pathname === '/signin') {
    return children;
  }

  // For all other admin pages, wrap with ProtectedRoute and AdminDashboard
  return (
    <ProtectedRoute redirectTo="/signin">
      <AdminDashboard>
        {children}
      </AdminDashboard>
    </ProtectedRoute>
  );
}
