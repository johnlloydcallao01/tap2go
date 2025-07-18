/**
 * Shared Authentication Form Button Component
 * Reusable button with consistent styling and loading states
 */

import React from 'react';
import { LoadingSpinner } from '../../components';

export interface AuthFormButtonProps {
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'default' | 'admin' | 'driver' | 'customer';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Theme configurations for different apps
 */
const themeConfig = {
  default: {
    primary: 'bg-[#f3a823] text-white hover:bg-[#ef7b06] focus:ring-[#f3a823]',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-[#f3a823] text-[#f3a823] hover:bg-[#f3a823] hover:text-white focus:ring-[#f3a823]',
  },
  admin: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
  },
  driver: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
  },
  customer: {
    primary: 'bg-[#f3a823] text-white hover:bg-[#ef7b06] focus:ring-[#f3a823]',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-[#f3a823] text-[#f3a823] hover:bg-[#f3a823] hover:text-white focus:ring-[#f3a823]',
  },
};

const sizeConfig = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function AuthFormButton({
  type = 'button',
  variant = 'primary',
  size = 'md',
  theme = 'default',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  loadingText,
  onClick,
  className = '',
}: AuthFormButtonProps) {
  const themeStyles = themeConfig[theme][variant];
  const sizeStyles = sizeConfig[size];

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium 
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${themeStyles}
        ${sizeStyles}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && (
        <LoadingSpinner 
          size="sm" 
          className="mr-2 border-current" 
        />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
