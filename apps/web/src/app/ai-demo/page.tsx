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

export const metadata = {
  title: 'AI Demo - Google AI Studio Integration',
  description: 'Test and demo Google AI Studio (Gemini) integration features',
};
