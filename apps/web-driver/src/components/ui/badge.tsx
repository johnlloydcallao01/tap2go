import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className = '', children }: BadgeProps) {
  const variantClasses = {
    default: 'bg-[#f3a823] text-white',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
