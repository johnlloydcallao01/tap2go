'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import OrdersContent from '@/components/account/OrdersContent';

export default function OrdersPage() {
  return <OrdersContent />;
}
