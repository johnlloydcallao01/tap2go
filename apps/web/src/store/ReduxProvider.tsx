/**
 * Redux Provider - Wraps the app with Redux store and persistence
 * Integrates seamlessly with your existing provider structure
 */

'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';

interface ReduxProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Provider component that wraps the application
 * - Provides Redux store to all components
 * - Handles persistence with PersistGate
 * - Shows loading state while rehydrating
 */
export default function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading Tap2Go...</p>
            </div>
          </div>
        }
        persistor={persistor}
      >
        {children as any}
      </PersistGate>
    </Provider>
  );
}
