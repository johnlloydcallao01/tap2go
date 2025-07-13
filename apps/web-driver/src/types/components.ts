/**
 * Component type definitions
 * Shared component interfaces and types
 */

import { ReactNode } from 'react';

// Base component props
export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
}

// Button component types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Input component types
export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Card component types
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  image?: string;
  onClick?: () => void;
  loading?: boolean;
}

// Navigation component types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
}

export interface NavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
}

// Form component types
export interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

// Table component types
export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

// Layout component types
export interface LayoutProps extends BaseComponentProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}

// Default export for compatibility
const ComponentTypes = {
  BaseComponentProps: {} as BaseComponentProps,
  ButtonProps: {} as ButtonProps,
  InputProps: {} as InputProps,
  ModalProps: {} as ModalProps,
  CardProps: {} as CardProps,
  NavigationItem: {} as NavigationItem,
  NavigationProps: {} as NavigationProps,
  FormFieldProps: {} as FormFieldProps,
  TableColumn: {} as TableColumn,
  TableProps: {} as TableProps,
  LayoutProps: {} as LayoutProps,
};

export default ComponentTypes;
