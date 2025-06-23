'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import ReviewsContent from '@/components/account/ReviewsContent';

export default function ReviewsPage() {
  return <ReviewsContent />;
}
