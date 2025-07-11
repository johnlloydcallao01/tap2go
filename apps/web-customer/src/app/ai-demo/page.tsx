'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React from 'react';
import AIDemo from '@/components/ai/AIDemo';

export default function AIDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <AIDemo />
      </div>
    </div>
  );
}

// Note: metadata export removed because this is now a client component
// Metadata should be handled in layout.tsx or a parent server component
