'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

/**
 * Redux Demo Page - Test Redux integration
 */

import React from 'react';
import ReduxIntegrationDemo from '@/components/redux/ReduxIntegrationDemo';

export default function ReduxDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <ReduxIntegrationDemo />
    </div>
  );
}
