'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import FavoritesContent from '@/components/account/FavoritesContent';

export default function FavoritesPage() {
  return <FavoritesContent />;
}
