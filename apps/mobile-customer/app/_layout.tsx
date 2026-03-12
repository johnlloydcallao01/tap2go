import 'expo-dev-client';
import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { CartProvider } from '../src/contexts/CartContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { QueryProvider } from '../src/providers/QueryProvider';
import ErrorBoundary from '../src/components/ErrorBoundary';
import ProductionErrorHandler from '../src/components/ProductionErrorHandler';

// Import CSS conditionally
try {
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../global.css');
  }
} catch {}

function RootNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsNavigationReady(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isNavigationReady || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      if (inAuthGroup) {
        // Redirect to the home page if authenticated and trying to access auth pages
        router.replace('/(tabs)');
      } else if ((segments as string[]).length === 0) {
         // Redirect to home if at root
         router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, segments, isLoading, isNavigationReady, router]);

  if (isLoading) {
      return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />; 
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProductionErrorHandler>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <ErrorBoundary>
                  <StatusBar style="auto" />
                  <RootNavigation />
                </ErrorBoundary>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </ProductionErrorHandler>
    </SafeAreaProvider>
  );
}
