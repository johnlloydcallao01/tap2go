'use client';

import React, { useEffect, useState } from 'react';

interface FacebookStyleSplashProps {
  isLoading?: boolean;
  duration?: number;
  className?: string;
}

/**
 * Facebook-style splash screen with Tap2Go branding
 * - Lightweight and super fast
 * - Shows briefly during initial loads only
 * - Never blocks app performance
 */
export default function FacebookStyleSplash({
  isLoading = false,
  duration = 600, // Very brief, just like Facebook
  className = ''
}: FacebookStyleSplashProps) {
  const [show, setShow] = useState(isLoading);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setFadeOut(false);

      // Don't auto-hide - wait for isLoading to become false
      // This ensures we show until auth is fully resolved
    } else {
      // Only hide when loading is explicitly set to false
      setFadeOut(true);
      setTimeout(() => {
        setShow(false);
        setFadeOut(false);
      }, 400); // Slightly longer fade for smoother transition
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      } ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', // Dark gradient like Facebook
      }}
    >
      {/* Tap2Go Logo - Facebook Style */}
      <div className="flex flex-col items-center">
        {/* Main Logo */}
        <div className="mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #f3a823 0%, #ef7b06 100%)',
              boxShadow: '0 20px 40px rgba(243, 168, 35, 0.3)'
            }}
          >
            <span className="text-white font-bold text-3xl">T</span>
          </div>
        </div>

        {/* App Name */}
        <div className="text-center mb-12">
          <h1 className="text-white text-2xl font-semibold mb-1">Tap2Go</h1>
          <p className="text-gray-400 text-sm">Food Delivery</p>
        </div>

        {/* Loading Indicator - Professional */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Loading Text */}
        <div className="mt-4">
          <p className="text-gray-400 text-sm">Loading your experience...</p>
        </div>

        {/* "from" text like Facebook */}
        <div className="absolute bottom-16 text-center">
          <p className="text-gray-500 text-sm mb-2">from</p>
          <p className="text-gray-400 text-lg font-medium">Tap2Go Team</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Lightweight top progress bar only (like YouTube/GitHub)
 */
export function TopProgressBar({ 
  isLoading = false, 
  className = '' 
}: { isLoading?: boolean; className?: string }) {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setProgress(0);

      // Fast progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + Math.random() * 20;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    } else {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setShow(false);
        setProgress(0);
      }, 300);

      return () => clearTimeout(hideTimer);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] h-1 ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 transition-all duration-200 ease-out"
        style={{ 
          width: `${progress}%`,
          boxShadow: '0 0 8px rgba(243, 168, 35, 0.6)'
        }}
      />
    </div>
  );
}

/**
 * Minimal loading dot (like Twitter)
 */
export function LoadingDot({ 
  isLoading = false,
  size = 'sm'
}: { isLoading?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <div className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-100">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-orange-500 border-t-transparent`} />
      </div>
    </div>
  );
}
