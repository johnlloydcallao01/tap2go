'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // FAST LOADING: Handle redirects without blocking render
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      if (!loading) {
        if (!user) {
          router.push('/auth/signin');
        } else if (user.role !== 'admin') {
          router.push('/');
        }
      }
    }, 100); // Small delay to allow page to render

    return () => clearTimeout(redirectTimer);
  }, [user, loading, router]);

  // FAST LOADING: Only block for non-admin users, not during loading
  if (!loading && user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">!</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Access Required
          </h1>
          <p className="text-gray-600 mb-6">
            You need admin privileges to access this area.
          </p>
          <Link
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 lg:ml-64 pt-16 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
