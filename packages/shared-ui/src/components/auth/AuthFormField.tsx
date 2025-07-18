/**
 * Shared Authentication Form Field Component
 * Reusable form field with consistent styling and validation display
 */

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export interface AuthFormFieldProps {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'tel';
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  icon?: React.ReactNode;
  theme?: 'default' | 'admin' | 'driver' | 'customer';
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

/**
 * Theme configurations for different apps
 */
const themeConfig = {
  default: {
    focusRing: 'focus:ring-[#f3a823] focus:border-[#f3a823]',
    iconColor: 'text-gray-400',
    labelColor: 'text-gray-700',
    errorColor: 'text-red-600',
    borderColor: 'border-gray-300',
    errorBorderColor: 'border-red-300',
  },
  admin: {
    focusRing: 'focus:ring-blue-500 focus:border-blue-500',
    iconColor: 'text-gray-500',
    labelColor: 'text-gray-800',
    errorColor: 'text-red-600',
    borderColor: 'border-gray-300',
    errorBorderColor: 'border-red-400',
  },
  driver: {
    focusRing: 'focus:ring-blue-500 focus:border-blue-500',
    iconColor: 'text-gray-400',
    labelColor: 'text-gray-700',
    errorColor: 'text-red-600',
    borderColor: 'border-gray-300',
    errorBorderColor: 'border-red-300',
  },
  customer: {
    focusRing: 'focus:ring-[#f3a823] focus:border-[#f3a823]',
    iconColor: 'text-gray-400',
    labelColor: 'text-gray-700',
    errorColor: 'text-red-600',
    borderColor: 'border-gray-300',
    errorBorderColor: 'border-red-300',
  },
};

export function AuthFormField({
  id,
  name,
  type,
  label,
  placeholder,
  value,
  error,
  required = false,
  disabled = false,
  autoComplete,
  icon,
  theme = 'default',
  onChange,
  className = '',
}: AuthFormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const themeStyles = themeConfig[theme];

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={className}>
      {/* Label */}
      <label 
        htmlFor={id} 
        className={`block text-sm font-medium ${themeStyles.labelColor} mb-2`}
      >
        {label}
        {required && <span className={themeStyles.errorColor}>*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={`h-5 w-5 ${themeStyles.iconColor}`}>
              {icon}
            </div>
          </div>
        )}

        {/* Input Field */}
        <input
          id={id}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            block w-full py-3 border rounded-md shadow-sm 
            placeholder-gray-400 focus:outline-none focus:ring-2 
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600
            text-gray-900 transition-colors duration-200 sm:text-sm
            ${icon ? 'pl-10' : 'pl-3'}
            ${type === 'password' ? 'pr-10' : 'pr-3'}
            ${error ? themeStyles.errorBorderColor : themeStyles.borderColor}
            ${themeStyles.focusRing}
          `}
        />

        {/* Password Toggle Button */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${themeStyles.iconColor} hover:text-gray-600 transition-colors`}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className={`mt-2 text-sm ${themeStyles.errorColor}`}>
          {error}
        </p>
      )}
    </div>
  );
}
