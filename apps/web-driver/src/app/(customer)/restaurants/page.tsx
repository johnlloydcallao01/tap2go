'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import StoresContent from '@/components/home/StoresContent';

export default function RestaurantsPage() {
  return <StoresContent />;
}
