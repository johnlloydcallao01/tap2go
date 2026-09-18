'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ProtectedRoute } from '@/components/auth';
import { usePathname } from 'next/navigation';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Static admin shell fallback — plain divs with INLINE styles only.
 * Rendered by Suspense/ProtectedRoute before hydration or while auth settles.
 * Deliberately uses no Tailwind classes, no hooks, no useSearchParams:
 * compiled CSS and JS chunks may not have arrived yet on cold first load,
 * and anything hook-based would suspend again (or mismatch hydration #441).
 * Shape mirrors AdminDashboard: top bar + sidebar + content cards.
 */
export function AdminShellFallback() {
  const bar: React.CSSProperties = {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  };
  const card: React.CSSProperties = {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    minHeight: 120,
  };
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <div style={{ width: 240, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...bar, height: 28 }} />
        <div style={{ ...bar, height: 20 }} />
        <div style={{ ...bar, height: 20 }} />
        <div style={{ ...bar, height: 20 }} />
        <div style={{ ...bar, height: 20 }} />
      </div>
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ ...bar, height: 28, width: 180 }} />
          <div style={{ ...bar, height: 36, width: 36, borderRadius: 999 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={card} />
          <div style={card} />
          <div style={card} />
        </div>
        <div style={{ ...card, minHeight: 280 }} />
      </div>
    </div>
  );
}

/**
 * Admin Layout - Protected layout for admin pages
 * Combines authentication protection with AdminDashboard wrapper
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // If it's the login page, don't wrap with AdminDashboard or ProtectedRoute
  if (pathname === '/signin') {
    return children;
  }

  // For all other admin pages, wrap with ProtectedRoute and AdminDashboard
  // Suspense is required because Sidebar uses useSearchParams() — without it
  // server prerender (null params) mismatches client hydration (real params) → React #441.
  // Fallbacks render a static skeleton (never null): previously fallback={null}
  // plus ProtectedRoute's null meant first paint was a blank page on cold load.
  return (
    <NotificationsProvider userId={user?.id}>
      <ProtectedRoute redirectTo="/signin" fallback={<AdminShellFallback />}>
        <Suspense fallback={<AdminShellFallback />}>
          <AdminDashboard>{children}</AdminDashboard>
        </Suspense>
      </ProtectedRoute>
    </NotificationsProvider>
  );
}
