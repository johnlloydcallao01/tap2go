"use client";

import React from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  onClick?: () => void;
  readOnly?: boolean;
  autoFocus?: boolean;
};

export default function SearchField({ value, onChange, placeholder = "Search", className = "", inputClassName = "", disabled = false, onClick, readOnly = false, autoFocus = false }: Props) {
  return (
    <div className={("relative flex items-center " + className).trim()}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        onClick={onClick}
        readOnly={readOnly}
        autoFocus={autoFocus}
        className={("w-full h-10 pl-10 pr-4 rounded-full border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-[#eba236] focus:border-transparent " + inputClassName).trim()}
      />
      <i className="fas fa-search absolute left-3 text-gray-400" />
    </div>
  );
}
