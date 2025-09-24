'use client';

/**
 * Protected Route Component (Demo Only)
 * 
 * This component would normally protect routes that require authentication.
 * In demo mode, it simply renders all children without any protection.
 */

import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children 
}: ProtectedRouteProps) {
  // Demo mode - always render children without protection
  return <>{children}</>;
}
