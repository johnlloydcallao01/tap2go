/**
 * Shared Authentication Form Layout Component
 * Provides consistent layout structure for auth forms across apps
 */

import React from 'react';

export interface AuthFormLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  theme?: 'default' | 'admin' | 'driver' | 'customer';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Theme configurations for different apps
 */
const themeConfig = {
  default: {
    background: 'bg-gradient-to-br from-orange-50 to-yellow-100',
    cardBackground: 'bg-white',
    iconBackground: 'bg-[#f3a823]',
    titleColor: 'text-gray-900',
    subtitleColor: 'text-gray-600',
  },
  admin: {
    background: 'bg-gradient-to-br from-slate-50 to-blue-100',
    cardBackground: 'bg-white',
    iconBackground: 'bg-blue-600',
    titleColor: 'text-gray-900',
    subtitleColor: 'text-gray-600',
  },
  driver: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    cardBackground: 'bg-white',
    iconBackground: 'bg-blue-600',
    titleColor: 'text-gray-900',
    subtitleColor: 'text-gray-600',
  },
  customer: {
    background: 'bg-gradient-to-br from-orange-50 to-yellow-100',
    cardBackground: 'bg-white',
    iconBackground: 'bg-[#f3a823]',
    titleColor: 'text-gray-900',
    subtitleColor: 'text-gray-600',
  },
};

export function AuthFormLayout({
  title,
  subtitle,
  icon,
  theme = 'default',
  children,
  footer,
  className = '',
}: AuthFormLayoutProps) {
  const themeStyles = themeConfig[theme];

  return (
    <div className={`min-h-screen flex items-center justify-center ${themeStyles.background} py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {icon && (
            <div className={`mx-auto h-16 w-16 ${themeStyles.iconBackground} rounded-full flex items-center justify-center`}>
              <div className="h-8 w-8 text-white">
                {icon}
              </div>
            </div>
          )}
          <h2 className={`mt-6 text-3xl font-bold ${themeStyles.titleColor}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`mt-2 text-sm ${themeStyles.subtitleColor}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Content */}
        <div className={`${themeStyles.cardBackground} rounded-lg shadow-lg p-8`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
