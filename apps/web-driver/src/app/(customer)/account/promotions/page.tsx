'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import PromotionsContent from '@/components/account/PromotionsContent';

export default function PromotionsPage() {
  return <PromotionsContent />;
}
