import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-[#f3a823] focus:border-transparent
        disabled:bg-gray-100 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      {...props}
    />
  );
}
