/**
 * Shared Authentication Error Alert Component
 * Displays authentication errors with consistent styling
 */

import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface AuthErrorAlertProps {
  error: string | null;
  title?: string;
  theme?: 'default' | 'admin' | 'driver' | 'customer';
  onDismiss?: () => void;
  className?: string;
}

/**
 * Theme configurations for different apps
 */
const themeConfig = {
  default: {
    background: 'bg-red-50',
    border: 'border-red-200',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    iconColor: 'text-red-400',
    dismissColor: 'text-red-400 hover:text-red-600',
  },
  admin: {
    background: 'bg-red-50',
    border: 'border-red-200',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    iconColor: 'text-red-400',
    dismissColor: 'text-red-400 hover:text-red-600',
  },
  driver: {
    background: 'bg-red-50',
    border: 'border-red-200',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    iconColor: 'text-red-400',
    dismissColor: 'text-red-400 hover:text-red-600',
  },
  customer: {
    background: 'bg-red-50',
    border: 'border-red-200',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    iconColor: 'text-red-400',
    dismissColor: 'text-red-400 hover:text-red-600',
  },
};

export function AuthErrorAlert({
  error,
  title = 'Authentication Error',
  theme = 'default',
  onDismiss,
  className = '',
}: AuthErrorAlertProps) {
  if (!error) return null;

  const themeStyles = themeConfig[theme];

  return (
    <div className={`${themeStyles.background} ${themeStyles.border} border rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className={`h-5 w-5 ${themeStyles.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${themeStyles.titleColor}`}>
            {title}
          </h3>
          <div className={`mt-2 text-sm ${themeStyles.textColor}`}>
            {error}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${themeStyles.dismissColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
