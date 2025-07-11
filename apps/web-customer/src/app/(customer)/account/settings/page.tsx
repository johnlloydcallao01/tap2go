'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import SettingsContent from '@/components/account/SettingsContent';

export default function SettingsPage() {
  return <SettingsContent />;
}
