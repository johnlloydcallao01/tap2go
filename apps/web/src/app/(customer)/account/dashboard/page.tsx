
'use client';

import React from 'react';
import DashboardContent from '@/components/account/DashboardContent';

// Force dynamic rendering for interactive account pages
export const dynamic = 'force-dynamic';

export default function AccountDashboardPage() {
  return <DashboardContent />;
}
