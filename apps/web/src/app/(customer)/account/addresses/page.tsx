
'use client';

import React from 'react';
import AddressesContent from '@/components/account/AddressesContent';

// Force dynamic rendering for interactive account pages
export const dynamic = 'force-dynamic';

export default function AddressesPage() {
  return <AddressesContent />;
}
