'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import ReferralsContent from '@/components/account/ReferralsContent';

export default function ReferralsPage() {
  return <ReferralsContent />;
}
