import 'expo-dev-client'; // Add development client for better debugging

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, ScrollView, StyleSheet, Alert, ErrorUtils } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import ProductionErrorHandler from './src/components/ProductionErrorHandler';
import { validateEnvironment } from './src/config/environment';

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

// Note: React Native handles promise rejections differently than web
// Unhandled promise rejections are logged to console automatically

// Import CSS conditionally to prevent production crashes
try {
  if (__DEV__) {
    require('./global.css');
    console.log('✅ NativeWind CSS loaded successfully');
  }
} catch (error) {
  console.warn('⚠️ NativeWind CSS not loaded:', error);
}

// Debug component to show environment validation results
function DebugScreen({ errors }: { errors: string[] }) {
  return (
    <SafeAreaProvider>
      <View style={styles.debugContainer}>
        <ScrollView style={styles.debugScroll}>
          <Text style={styles.debugTitle}>🚨 App Initialization Failed</Text>
          <Text style={styles.debugSubtitle}>Environment Validation Errors:</Text>
          {errors.map((error, index) => (
            <Text key={index} style={styles.debugError}>
              • {error}
            </Text>
          ))}
          <Text style={styles.debugInfo}>
            This debug screen helps identify configuration issues.
            Check the console logs for more details.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [initializationErrors, setInitializationErrors] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');

        // Check runtime environment
        try {
          if (typeof global !== 'undefined' && global.HermesInternal) {
            console.log('✅ Running on Hermes engine');
          }
          // Note: React Native handles promise rejections automatically
        } catch (envCheckError) {
          console.warn('⚠️ Could not check runtime environment:', envCheckError);
        }

        // Validate environment variables with error handling
        console.log('🔧 Validating environment configuration...');
        let envValidation;
        try {
          envValidation = validateEnvironment();
        } catch (envError) {
          console.error('🚨 Environment validation crashed:', envError);
          envValidation = {
            isValid: false,
            errors: [`Environment validation crashed: ${envError.message || 'Unknown error'}`]
          };
        }

        if (!envValidation.isValid) {
          console.error('❌ Environment validation failed:', envValidation.errors);
          setInitializationErrors(envValidation.errors);
          return;
        }

        console.log('✅ Environment validation passed');

        // Test critical service initializations with safe property access
        console.log('🔥 Testing Firebase configuration...');
        try {
          const envModule = await import('./src/config/environment');
          const firebaseConfig = envModule?.firebaseConfig || {};
          console.log('Firebase config loaded:', {
            apiKey: firebaseConfig?.apiKey ? '✅ Present' : '❌ Missing',
            projectId: firebaseConfig?.projectId ? '✅ Present' : '❌ Missing',
            authDomain: firebaseConfig?.authDomain ? '✅ Present' : '❌ Missing'
          });

          console.log('🔥 Testing Supabase configuration...');
          const supabaseConfig = envModule?.supabaseConfig || {};
          console.log('Supabase config loaded:', {
            url: supabaseConfig?.url ? '✅ Present' : '❌ Missing',
            anonKey: supabaseConfig?.anonKey ? '✅ Present' : '❌ Missing'
          });
        } catch (configError) {
          console.error('🚨 Failed to load configuration modules:', configError);
          setInitializationErrors([
            `Configuration Error: ${configError.message}`,
            'Failed to load environment configuration modules'
          ]);
          return;
        }

        console.log('✅ All critical services configured successfully');
        setIsInitialized(true);

      } catch (error) {
        console.error('🚨 App initialization failed:', error);
        setInitializationErrors([
          `Initialization Error: ${error.message}`,
          `Stack: ${error.stack?.substring(0, 300)}...`
        ]);
      }
    };

    initializeApp();

    return () => {
      // React Native doesn't have window.removeEventListener
      // Cleanup is handled automatically by React Native
    };
  }, []);

  // Show debug screen if there are initialization errors
  if (initializationErrors.length > 0) {
    return <DebugScreen errors={initializationErrors} />;
  }

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🚀 Initializing Tap2Go...</Text>
          <Text style={styles.loadingSubtext}>Validating configuration...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Render main app with production error handling
  return (
    <ProductionErrorHandler>
      <ErrorBoundary>
        <SafeAreaProvider>
          <CartProvider>
            <NavigationContainer
              fallback={
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text>Loading...</Text>
                </View>
              }
            >
              <AppNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </CartProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </ProductionErrorHandler>
  );
}

const styles = StyleSheet.create({
  debugContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  debugScroll: {
    flex: 1,
  },
  debugTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  debugSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  debugError: {
    fontSize: 14,
    color: '#ff6666',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  debugInfo: {
    fontSize: 12,
    color: '#888888',
    marginTop: 20,
    fontStyle: 'italic',
  },
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
