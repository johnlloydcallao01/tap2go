'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AppQueryProvider } from '@encreasl/client-services';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthErrorBoundary } from '@/components/auth';
import { LoadingScreenWrapper } from '@/components/loading';
import { ORDER_ALERT_SOUND_ERROR_EVENT, ORDER_ALERT_SOUND_READY_EVENT, orderAlertSound } from '@/utils/orderAlertSound';

interface ProvidersProps {
  children: ReactNode;
  initialUser: Parameters<typeof AuthProvider>[0]['initialUser'];
  initialToken: Parameters<typeof AuthProvider>[0]['initialToken'];
}

export function Providers({ children, initialUser, initialToken }: ProvidersProps) {
  useEffect(() => {
    let unlocking = false;
    const unlockAudio = () => {
      if (orderAlertSound.isReady || unlocking) return;
      unlocking = true;
      void orderAlertSound.unlock()
        .then(() => {
          window.dispatchEvent(new Event(ORDER_ALERT_SOUND_READY_EVENT));
        })
        .catch((error: unknown) => {
          console.error('[MerchantOrderSound] Failed to activate order alert audio', error);
          window.dispatchEvent(new Event(ORDER_ALERT_SOUND_ERROR_EVENT));
        })
        .finally(() => {
          unlocking = false;
        });
    };

    document.addEventListener('pointerdown', unlockAudio, true);
    document.addEventListener('keydown', unlockAudio, true);
    return () => {
      document.removeEventListener('pointerdown', unlockAudio, true);
      document.removeEventListener('keydown', unlockAudio, true);
    };
  }, []);

  return (
    <AppQueryProvider>
      <AuthErrorBoundary>
        <AuthProvider initialUser={initialUser} initialToken={initialToken}>
          <ThemeProvider>
            <LoadingScreenWrapper>{children}</LoadingScreenWrapper>
          </ThemeProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </AppQueryProvider>
  );
}
