'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthErrorBoundary } from '@/components/auth';
import { LoadingScreenWrapper } from '@/components/loading';

interface ProvidersProps {
  children: ReactNode;
  initialUser: Parameters<typeof AuthProvider>[0]['initialUser'];
  initialToken: Parameters<typeof AuthProvider>[0]['initialToken'];
}

export function Providers({ children, initialUser, initialToken }: ProvidersProps) {
  return (
    <AuthErrorBoundary>
      <AuthProvider initialUser={initialUser} initialToken={initialToken}>
        <ThemeProvider>
          <LoadingScreenWrapper>{children}</LoadingScreenWrapper>
        </ThemeProvider>
      </AuthProvider>
    </AuthErrorBoundary>
  );
}