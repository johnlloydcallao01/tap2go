'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import TrackOrderContent from '@/components/account/TrackOrderContent';

export default function TrackOrderPage() {
  return <TrackOrderContent />;
}
