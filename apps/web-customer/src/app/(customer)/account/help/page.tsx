'use client';

import React from 'react';
import HelpCenterContent from '@/components/account/HelpCenterContent';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function HelpPage() {
  return <HelpCenterContent />;
}
