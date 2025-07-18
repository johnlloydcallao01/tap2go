/**
 * Shared Authentication Form Hook
 * Provides common form validation logic and state management for auth forms
 */

import { useState, useCallback } from 'react';

// Form validation rules
export interface ValidationRules {
  email?: boolean;
  password?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
  };
  name?: {
    minLength?: number;
    maxLength?: number;
    allowSpaces?: boolean;
  };
  required?: boolean;
}

// Form field configuration
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  validation?: ValidationRules;
  autoComplete?: string;
}

// Form configuration
export interface AuthFormConfig {
  fields: FormField[];
  submitButtonText: string;
  loadingText?: string;
}

// Form state
export interface FormState {
  [key: string]: string;
}

// Form errors
export interface FormErrors {
  [key: string]: string;
}

// Hook return type
export interface UseAuthFormReturn {
  formData: FormState;
  errors: FormErrors;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent, onSubmit: (data: FormState) => Promise<void>) => Promise<void>;
  validateForm: () => boolean;
  clearErrors: () => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
}

/**
 * Validation utility functions
 */
const validators = {
  email: (value: string): string | null => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },

  password: (value: string, rules?: ValidationRules['password']): string | null => {
    if (!value) return 'Password is required';
    
    const minLength = rules?.minLength || 8;
    if (value.length < minLength) {
      return `Password must be at least ${minLength} characters`;
    }

    if (rules?.requireUppercase && !/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (rules?.requireLowercase && !/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (rules?.requireNumber && !/\d/.test(value)) {
      return 'Password must contain at least one number';
    }

    if (rules?.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return 'Password must contain at least one special character';
    }

    return null;
  },

  name: (value: string, rules?: ValidationRules['name']): string | null => {
    if (!value.trim()) return 'This field is required';
    
    const minLength = rules?.minLength || 2;
    const maxLength = rules?.maxLength || 50;
    
    if (value.trim().length < minLength) {
      return `Must be at least ${minLength} characters`;
    }
    
    if (value.trim().length > maxLength) {
      return `Must be no more than ${maxLength} characters`;
    }

    if (!rules?.allowSpaces && /\s/.test(value)) {
      return 'Spaces are not allowed';
    }

    // Only allow letters and spaces (if allowed)
    const allowedPattern = rules?.allowSpaces ? /^[a-zA-Z\s]+$/ : /^[a-zA-Z]+$/;
    if (!allowedPattern.test(value.trim())) {
      return 'Only letters' + (rules?.allowSpaces ? ' and spaces' : '') + ' are allowed';
    }

    return null;
  },

  required: (value: string): string | null => {
    if (!value.trim()) return 'This field is required';
    return null;
  },
};

/**
 * Custom hook for authentication forms
 */
export function useAuthForm(config: AuthFormConfig): UseAuthFormReturn {
  // Initialize form data with empty values
  const initialFormData = config.fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {} as FormState);

  const [formData, setFormData] = useState<FormState>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Validate individual field
  const validateField = useCallback((field: FormField, value: string): string | null => {
    const { validation } = field;
    if (!validation) return null;

    // Required validation
    if (validation.required && !value.trim()) {
      return `${field.label} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !validation.required) {
      return null;
    }

    // Email validation
    if (validation.email) {
      return validators.email(value);
    }

    // Password validation
    if (validation.password) {
      return validators.password(value, validation.password);
    }

    // Name validation
    if (validation.name) {
      return validators.name(value, validation.name);
    }

    return null;
  }, []);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    config.fields.forEach(field => {
      const error = validateField(field, formData[field.name] || '');
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config.fields, formData, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (
    e: React.FormEvent,
    onSubmit: (data: FormState) => Promise<void>
  ): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  // Utility functions
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    validateForm,
    clearErrors,
    setFieldError,
    clearFieldError,
  };
}
