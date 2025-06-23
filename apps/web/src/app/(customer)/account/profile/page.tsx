'use client';


import React from 'react';
// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import ProfileContent from '@/components/account/ProfileContent';

export default function ProfilePage() {
  return <ProfileContent />;
}
