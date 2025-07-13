'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import LoyaltyContent from '@/components/account/LoyaltyContent';

export default function LoyaltyPage() {
  return <LoyaltyContent />;
}
