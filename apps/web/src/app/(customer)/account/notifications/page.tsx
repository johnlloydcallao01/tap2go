'use client';

import React from 'react';
import NotificationsContent from '@/components/account/NotificationsContent';

// Force dynamic rendering for interactive account pages
export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  return <NotificationsContent />;
}
