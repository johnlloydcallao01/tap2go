import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Import CSS conditionally to prevent production crashes
try {
  require('./global.css');
} catch (error) {
  console.warn('NativeWind CSS not loaded:', error);
}

export default function App() {
  return (
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
  );
}
