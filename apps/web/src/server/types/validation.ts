/**
 * Validation Types
 * 
 * Types for validation functions and results.
 */

/**
 * Validation result interface
 */
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: string[];
  fieldErrors?: Record<string, string[]>;
}

/**
 * Validation rule interface
 */
export interface ValidationRule<T = unknown> {
  validate: (value: T) => ValidationResult<T>;
  message?: string;
}

/**
 * Schema validation interface
 */
export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[];
}

/**
 * Field validation error
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Validation context
 */
export interface ValidationContext {
  field?: string;
  parent?: unknown;
  root?: unknown;
  path?: string[];
}

/**
 * Custom validator function type
 */
export type ValidatorFunction<T = unknown> = (
  value: T,
  context?: ValidationContext
) => ValidationResult<T>;

/**
 * Validation options
 */
export interface ValidationOptions {
  abortEarly?: boolean; // Stop on first error
  stripUnknown?: boolean; // Remove unknown fields
  allowUnknown?: boolean; // Allow unknown fields
  context?: ValidationContext;
}

/**
 * Common validation constraints
 */
export interface StringConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: string[];
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
}

export interface NumberConstraints {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
}

export interface ArrayConstraints {
  minItems?: number;
  maxItems?: number;
  unique?: boolean;
  itemValidator?: ValidatorFunction;
}

export interface ObjectConstraints {
  required?: string[];
  optional?: string[];
  schema?: ValidationSchema;
}

/**
 * File validation constraints
 */
export interface FileConstraints {
  maxSize?: number; // in bytes
  minSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
  maxWidth?: number; // for images
  maxHeight?: number; // for images
  minWidth?: number; // for images
  minHeight?: number; // for images
}

/**
 * Date validation constraints
 */
export interface DateConstraints {
  min?: Date;
  max?: Date;
  format?: string;
  timezone?: string;
}

/**
 * Email validation constraints
 */
export interface EmailConstraints {
  allowDisposable?: boolean;
  requireTLD?: boolean;
  maxLength?: number;
}

/**
 * Phone validation constraints
 */
export interface PhoneConstraints {
  country?: string;
  format?: 'international' | 'national' | 'e164';
  allowLandline?: boolean;
  allowMobile?: boolean;
}

/**
 * URL validation constraints
 */
export interface UrlConstraints {
  protocols?: string[];
  requireTLD?: boolean;
  requireProtocol?: boolean;
  allowLocalhost?: boolean;
}

/**
 * Password validation constraints
 */
export interface PasswordConstraints {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  forbidCommon?: boolean;
  forbidPersonalInfo?: boolean;
}

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
  REQUIRED = 'REQUIRED',
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  TOO_SHORT = 'TOO_SHORT',
  TOO_LONG = 'TOO_LONG',
  TOO_SMALL = 'TOO_SMALL',
  TOO_LARGE = 'TOO_LARGE',
  INVALID_ENUM = 'INVALID_ENUM',
  INVALID_PATTERN = 'INVALID_PATTERN',
  DUPLICATE_VALUE = 'DUPLICATE_VALUE',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_URL = 'INVALID_URL',
  INVALID_DATE = 'INVALID_DATE',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  CUSTOM_ERROR = 'CUSTOM_ERROR'
}

/**
 * Validation error with code
 */
export interface ValidationError {
  message: string;
  code: ValidationErrorCode;
  field?: string;
  value?: unknown;
  constraint?: unknown;
}

/**
 * Sanitization options
 */
export interface SanitizationOptions {
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  removeHtml?: boolean;
  escapeHtml?: boolean;
  removeScripts?: boolean;
  normalizeWhitespace?: boolean;
}

/**
 * Validation middleware options
 */
export interface ValidationMiddlewareOptions {
  body?: ValidationSchema;
  query?: ValidationSchema;
  params?: ValidationSchema;
  headers?: ValidationSchema;
  files?: FileConstraints;
  options?: ValidationOptions;
}
