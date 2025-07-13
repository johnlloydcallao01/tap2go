'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import PaymentContent from '@/components/account/PaymentContent';

export default function PaymentPage() {
  return <PaymentContent />;
}
