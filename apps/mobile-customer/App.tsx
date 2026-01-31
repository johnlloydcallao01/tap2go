import 'expo-dev-client';
import 'react-native-url-polyfill/auto';

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, StyleSheet, Alert } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import ProductionErrorHandler from './src/components/ProductionErrorHandler';

// Production-safe global error handler with Expo Go compatibility
let originalHandler: any = null;

try {
  // Check if ErrorUtils is available (might not be in Expo Go)
  if (typeof ErrorUtils !== 'undefined' && ErrorUtils.getGlobalHandler) {
    originalHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error, isFatal) => {
      // Always log to native logs (visible in adb logcat)
      console.error('🚨 GLOBAL ERROR:', error);
      console.error('🚨 IS FATAL:', isFatal);
      console.error('🚨 ERROR STACK:', error.stack);
      console.error('🚨 ERROR NAME:', error.name);
      console.error('🚨 ERROR MESSAGE:', error.message);

      // Production-safe error display - use native alert that works in production
      try {
        // This works in production builds
        Alert.alert(
          'App Error',
          `${error.name}: ${error.message}`,
          [
            { text: 'Details', onPress: () => {
              Alert.alert('Error Details', error.stack || 'No stack trace available');
            }},
            { text: 'OK' }
          ]
        );
      } catch (alertError) {
        console.error('Failed to show error alert:', alertError);
      }

      // Call original handler - but don't let it crash the app immediately
      try {
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      } catch (handlerError) {
        console.error('Original error handler failed:', handlerError);
      }
    });
  } else {
    console.warn('ErrorUtils not available in this environment (Expo Go)');
  }
} catch (errorUtilsError) {
  console.error('Failed to setup global error handler:', errorUtilsError);
}

// Import CSS conditionally to prevent production crashes
try {
  if (__DEV__) {
    import('./global.css')
      .then(() => console.log('✅ NativeWind CSS loaded successfully'))
      .catch((error) => console.warn('⚠️ NativeWind CSS not loaded:', error));
  }
} catch {
}

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');

        // Check runtime environment
        try {
          if (typeof globalThis !== 'undefined' && (globalThis as any).HermesInternal) {
            console.log('✅ Running on Hermes engine');
          }
          // Note: React Native handles promise rejections automatically
        } catch (envCheckError) {
          console.warn('⚠️ Could not check runtime environment:', envCheckError);
        }

        setIsInitialized(true);

      } catch (error) {
        console.error('🚨 App initialization failed:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();

    return () => {
      // React Native doesn't have window.removeEventListener
      // Cleanup is handled automatically by React Native
    };
  }, []);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🚀 Initializing Tap2Go...</Text>
          <Text style={styles.loadingSubtext}>Starting app...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Render main app with production error handling
  return (
    <SafeAreaProvider>
      <ProductionErrorHandler>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ErrorBoundary>
                <AppNavigator />
              </ErrorBoundary>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </ProductionErrorHandler>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666666',
  },
});
