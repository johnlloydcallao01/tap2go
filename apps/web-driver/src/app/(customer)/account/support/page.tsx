'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import ContactSupportContent from '@/components/account/ContactSupportContent';

export default function SupportPage() {
  return <ContactSupportContent />;
}
