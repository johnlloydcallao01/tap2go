'use client';

/**
 * Authentication Wrapper - DISABLED
 *
 * Authentication has been disabled for the public web app.
 * This component now always renders children without any auth checks.
 */

import React from 'react';
import { User } from '@/types';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: User['role'][];
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

/**
 * Enterprise-grade auth wrapper that prevents layout shifts
 * and provides consistent loading states across the application
 */
export default function AuthWrapper({
  children,
  requireAuth = false,
  allowedRoles = [],
  fallback,
  loadingComponent,
  unauthorizedComponent
}: AuthWrapperProps) {
  // Authentication disabled - always render children
  console.warn('Authentication is disabled in the public web app');

  return <>{children}</>;
}
