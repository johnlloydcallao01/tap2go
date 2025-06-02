'use client';

import React, { createContext, useContext } from 'react';
import { usePageLoading, useManualLoading, useAuthLoading } from '@/hooks/usePageLoading';
import { useAuth } from '@/contexts/AuthContext';
import FacebookStyleSplash, { TopProgressBar, LoadingDot } from './PageLoadingIndicator';

interface LoadingContextType {
  // Page loading
  isPageLoading: boolean;
  isInitialLoad: boolean;
  
  // Manual loading
  isManualLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
  
  // Auth loading
  isAuthLoading: boolean;
  startAuthLoading: () => void;
  stopAuthLoading: () => void;
  withAuthLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
  variant?: 'facebook' | 'progress' | 'dot' | 'minimal';
  showInitialLoad?: boolean;
}

/**
 * Professional loading provider with Facebook-style splash screen
 * - Manages all loading states
 * - Lightweight and super fast
 * - Multiple loading variants
 */
export default function LoadingProvider({
  children,
  variant = 'facebook',
  showInitialLoad = true
}: LoadingProviderProps) {
  const pageLoading = usePageLoading();
  const manualLoading = useManualLoading();
  const authLoading = useAuthLoading();
  const auth = useAuth() as any;

  const value: LoadingContextType = {
    // Page loading
    isPageLoading: pageLoading.isLoading,
    isInitialLoad: pageLoading.isInitialLoad,
    
    // Manual loading
    isManualLoading: manualLoading.isLoading,
    startLoading: manualLoading.startLoading,
    stopLoading: manualLoading.stopLoading,
    withLoading: manualLoading.withLoading,
    
    // Auth loading
    isAuthLoading: authLoading.isAuthLoading,
    startAuthLoading: authLoading.startAuthLoading,
    stopAuthLoading: authLoading.stopAuthLoading,
    withAuthLoading: authLoading.withAuthLoading,
  };

  // Determine if any loading is active
  const isAnyLoading = pageLoading.isLoading || manualLoading.isLoading || authLoading.isAuthLoading;
  const shouldShowInitialLoad = showInitialLoad && pageLoading.isInitialLoad;

  // Show splash screen until auth is resolved AND page loading is complete
  // This prevents layout shifts by ensuring we don't show content until everything is ready
  const shouldShowSplash = shouldShowInitialLoad && (pageLoading.isLoading || !auth.isInitialized);

  return (
    <LoadingContext.Provider value={value}>
      {/* Render appropriate loading indicator */}
      {variant === 'facebook' && (
        <FacebookStyleSplash
          isLoading={shouldShowSplash} // Show until auth and page loading complete
          duration={2000} // Fallback duration
        />
      )}

      {variant === 'progress' && (
        <TopProgressBar isLoading={isAnyLoading} />
      )}

      {variant === 'dot' && (
        <LoadingDot isLoading={isAnyLoading} size="md" />
      )}

      {variant === 'minimal' && isAnyLoading && (
        <div className="fixed top-4 left-4 z-[9999]">
          <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 font-medium">Loading</span>
          </div>
        </div>
      )}

      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Quick loading components for specific use cases
 */
export function QuickProgressBar() {
  const { isPageLoading, isManualLoading } = useLoading();
  return <TopProgressBar isLoading={isPageLoading || isManualLoading} />;
}

export function QuickLoadingDot() {
  const { isAuthLoading } = useLoading();
  return <LoadingDot isLoading={isAuthLoading} size="sm" />;
}

/**
 * Loading wrapper for async operations
 */
export function LoadingWrapper({ 
  children, 
  isLoading,
  variant = 'inline'
}: { 
  children: React.ReactNode; 
  isLoading: boolean;
  variant?: 'inline' | 'overlay' | 'minimal';
}) {
  if (!isLoading) return <>{children}</>;

  if (variant === 'overlay') {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className="flex items-center space-x-2 py-2">
      <div className="w-4 h-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
      <span className="text-sm text-gray-600">Loading...</span>
    </div>
  );
}
