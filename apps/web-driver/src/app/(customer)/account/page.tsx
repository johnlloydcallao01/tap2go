'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React from 'react';
import DashboardContent from '@/components/account/DashboardContent';

export default function AccountDashboardPage() {
  return <DashboardContent />;
}
