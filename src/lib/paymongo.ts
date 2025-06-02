/**
 * PayMongo Payment Gateway Configuration for Tap2Go
 * Handles all PayMongo API interactions with proper error handling and security
 */

import axios, { AxiosInstance } from 'axios';

// PayMongo API Configuration
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// Production configuration (Business Verified)
const publicKey = process.env.PAYMONGO_PUBLIC_KEY_LIVE;
const secretKey = process.env.PAYMONGO_SECRET_KEY_LIVE;

// Note: Environment variables will be validated when actually used
// This allows the module to load even if keys are temporarily missing

/**
 * Create authenticated axios instance for PayMongo API
 */
const createPayMongoClient = (useSecretKey: boolean = false): AxiosInstance => {
  const apiKey = useSecretKey ? secretKey : publicKey;

  if (!apiKey) {
    throw new Error(`PayMongo ${useSecretKey ? 'secret' : 'public'} key is not configured. Please check your environment variables.`);
  }

  const encodedKey = Buffer.from(`${apiKey}:`).toString('base64');

  return axios.create({
    baseURL: PAYMONGO_BASE_URL,
    headers: {
      'Authorization': `Basic ${encodedKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
  });
};

// Client instances
export const paymongoPublicClient = createPayMongoClient(false);
export const paymongoSecretClient = createPayMongoClient(true);

/**
 * PayMongo API Response Types
 */
export interface PayMongoResponse<T> {
  data: {
    id: string;
    type: string;
    attributes: T;
  };
}

export interface PaymentIntentAttributes {
  amount: number;
  currency: string;
  description?: string;
  statement_descriptor?: string;
  status: 'awaiting_payment_method' | 'awaiting_next_action' | 'processing' | 'succeeded' | 'canceled';
  client_key: string;
  created_at: number;
  updated_at: number;
  last_payment_error?: any;
  payment_method_allowed: string[];
  payments?: any[];
  next_action?: {
    type: string;
    redirect: {
      url: string;
      return_url: string;
    };
  };
  metadata?: Record<string, any>;
}

export interface PaymentMethodAttributes {
  type: 'card' | 'gcash' | 'grab_pay' | 'paymaya' | 'billease' | 'dob';
  details?: {
    card_number?: string;
    exp_month?: number;
    exp_year?: number;
    cvc?: string;
  };
  billing?: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
  };
  metadata?: Record<string, any>;
}

export interface PaymentAttributes {
  amount: number;
  currency: string;
  description?: string;
  status: 'pending' | 'paid' | 'failed';
  payment_intent_id: string;
  payment_method_id?: string;
  created_at: number;
  updated_at: number;
  metadata?: Record<string, any>;
}

/**
 * PayMongo Error Types
 */
export interface PayMongoError {
  code: string;
  detail: string;
  source?: {
    pointer: string;
    attribute: string;
  };
}

export interface PayMongoErrorResponse {
  errors: PayMongoError[];
}

/**
 * Utility function to handle PayMongo API errors
 */
export const handlePayMongoError = (error: any): string => {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors as PayMongoError[];
    return errors.map(err => err.detail).join(', ');
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred with the payment gateway.';
};

/**
 * Convert amount to centavos (PayMongo requires amounts in centavos)
 */
export const toCentavos = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Convert centavos to peso amount
 */
export const fromCentavos = (centavos: number): number => {
  return centavos / 100;
};

/**
 * Validate payment amount
 */
export const validatePaymentAmount = (amount: number): boolean => {
  // PayMongo minimum amount is ₱20.00 (2000 centavos)
  const minimumAmount = 20;
  // PayMongo maximum amount is ₱999,999.99 (99999999 centavos)
  const maximumAmount = 999999.99;
  
  return amount >= minimumAmount && amount <= maximumAmount;
};

/**
 * Get supported payment methods for Tap2Go
 */
export const getSupportedPaymentMethods = (): string[] => {
  return [
    'card',        // Credit/Debit Cards
    'gcash',       // GCash E-wallet
    'grab_pay',    // GrabPay E-wallet
    'paymaya',     // Maya E-wallet
    'billease',    // BillEase Buy Now Pay Later
    'dob',         // Direct Online Banking
  ];
};

/**
 * Configuration constants
 */
export const PAYMONGO_CONFIG = {
  BASE_URL: PAYMONGO_BASE_URL,
  IS_LIVE_MODE: true, // Always live mode since we're using live keys
  SUPPORTED_CURRENCY: 'PHP',
  MIN_AMOUNT: 20, // ₱20.00
  MAX_AMOUNT: 999999.99, // ₱999,999.99
  TIMEOUT: 30000, // 30 seconds
} as const;

export default {
  publicClient: paymongoPublicClient,
  secretClient: paymongoSecretClient,
  handleError: handlePayMongoError,
  toCentavos,
  fromCentavos,
  validatePaymentAmount,
  getSupportedPaymentMethods,
  config: PAYMONGO_CONFIG,
};
