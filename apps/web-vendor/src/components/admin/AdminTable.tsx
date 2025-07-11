'use client';

import React from 'react';

interface AdminTableProps {
  children: React.ReactNode;
  className?: string;
}

interface AdminTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface AdminTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface AdminTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface AdminTableCellProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
}

interface AdminTableHeadCellProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
}

// Main table wrapper with professional horizontal scrolling
export function AdminTable({ children, className = '' }: AdminTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="min-w-max">
        <table className={`w-full divide-y divide-gray-200 ${className}`}>
          {children}
        </table>
      </div>
    </div>
  );
}

// Table header with sticky positioning
export function AdminTableHeader({ children, className = '' }: AdminTableHeaderProps) {
  return (
    <thead className={`bg-gray-50 sticky top-0 z-10 ${className}`}>
      {children}
    </thead>
  );
}

// Table body
export function AdminTableBody({ children, className = '' }: AdminTableBodyProps) {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
}

// Table row with hover effects
export function AdminTableRow({ children, className = '', onClick }: AdminTableRowProps) {
  const baseClasses = 'hover:bg-gray-50 transition-colors duration-150';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <tr 
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// Table header cell with professional styling
export function AdminTableHeadCell({ 
  children, 
  className = '', 
  minWidth,
  align = 'left' 
}: AdminTableHeadCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const minWidthStyle = minWidth ? { minWidth } : {};

  return (
    <th 
      className={`px-6 py-3 ${alignClasses[align]} text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
      style={minWidthStyle}
    >
      {children}
    </th>
  );
}

// Table data cell with professional styling
export function AdminTableCell({
  children,
  className = '',
  minWidth,
  align = 'left',
  colSpan
}: AdminTableCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const minWidthStyle = minWidth ? { minWidth } : {};

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap ${alignClasses[align]} ${className}`}
      style={minWidthStyle}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

// Loading state component
export function AdminTableLoading({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <AdminTable>
      <AdminTableHeader>
        <AdminTableRow>
          {Array.from({ length: columns }).map((_, index) => (
            <AdminTableHeadCell key={index}>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </AdminTableHeadCell>
          ))}
        </AdminTableRow>
      </AdminTableHeader>
      <AdminTableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <AdminTableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <AdminTableCell key={colIndex}>
                <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
              </AdminTableCell>
            ))}
          </AdminTableRow>
        ))}
      </AdminTableBody>
    </AdminTable>
  );
}

// Empty state component
export function AdminTableEmpty({ 
  message = 'No data available',
  columns = 5 
}: { 
  message?: string; 
  columns?: number; 
}) {
  return (
    <AdminTable>
      <AdminTableBody>
        <AdminTableRow>
          <AdminTableCell className="text-center py-12 text-gray-500" align="center" colSpan={columns}>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium">{message}</p>
            </div>
          </AdminTableCell>
        </AdminTableRow>
      </AdminTableBody>
    </AdminTable>
  );
}
