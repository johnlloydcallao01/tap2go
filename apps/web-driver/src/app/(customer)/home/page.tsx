'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import HomeContent from '@/components/home/HomeContent';

export default function HomePage() {
  return <HomeContent />;
}
