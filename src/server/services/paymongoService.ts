/**
 * PayMongo Service Layer for Tap2Go
 * Handles all PayMongo API operations with proper error handling
 */

import {
  paymongoSecretClient,
  paymongoPublicClient,
  PayMongoResponse,
  PaymentIntentAttributes,
  PaymentMethodAttributes,
  PaymentAttributes,
  handlePayMongoError,
  toCentavos,
  fromCentavos,
  validatePaymentAmount,
  getSupportedPaymentMethods,
} from '@/lib/paymongo';

/**
 * Create Payment Intent Request Interface
 */
export interface CreatePaymentIntentRequest {
  amount: number; // Amount in PHP
  currency?: string;
  description?: string;
  statement_descriptor?: string;
  payment_method_allowed?: string[];
  payment_method_options?: {
    card?: {
      request_three_d_secure?: 'automatic' | 'any';
    };
  };
  metadata?: Record<string, any>;
}

/**
 * Create Payment Method Request Interface
 */
export interface CreatePaymentMethodRequest {
  type: 'card' | 'gcash' | 'grab_pay' | 'paymaya' | 'billease' | 'dob';
  details?: {
    card_number?: string;
    exp_month?: number;
    exp_year?: number;
    cvc?: string;
  };
  billing: {
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

/**
 * Attach Payment Method Request Interface
 */
export interface AttachPaymentMethodRequest {
  payment_intent_id: string;
  payment_method_id: string;
  client_key: string;
  return_url?: string;
}

/**
 * PayMongo Service Class
 */
export class PayMongoService {
  /**
   * Create a Payment Intent
   */
  static async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<PayMongoResponse<PaymentIntentAttributes>> {
    try {
      // Validate amount
      if (!validatePaymentAmount(request.amount)) {
        throw new Error(`Payment amount must be between ₱20.00 and ₱999,999.99. Received: ₱${request.amount}`);
      }

      const payload = {
        data: {
          attributes: {
            amount: toCentavos(request.amount),
            currency: request.currency || 'PHP',
            description: request.description,
            statement_descriptor: request.statement_descriptor || 'Tap2Go Food Delivery',
            payment_method_allowed: request.payment_method_allowed || getSupportedPaymentMethods(),
            payment_method_options: request.payment_method_options || {
              card: {
                request_three_d_secure: 'automatic'
              }
            },
            metadata: {
              ...request.metadata,
              platform: 'tap2go',
              created_via: 'api',
            },
          },
        },
      };

      const response = await paymongoSecretClient.post('/payment_intents', payload);
      return response.data;
    } catch (error) {
      console.error('PayMongo createPaymentIntent error:', error);
      throw new Error(handlePayMongoError(error));
    }
  }

  /**
   * Retrieve a Payment Intent
   */
  static async getPaymentIntent(
    paymentIntentId: string,
    clientKey?: string
  ): Promise<PayMongoResponse<PaymentIntentAttributes>> {
    try {
      const url = clientKey 
        ? `/payment_intents/${paymentIntentId}?client_key=${clientKey}`
        : `/payment_intents/${paymentIntentId}`;
      
      const client = clientKey ? paymongoPublicClient : paymongoSecretClient;
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error('PayMongo getPaymentIntent error:', error);
      throw new Error(handlePayMongoError(error));
    }
  }

  /**
   * Create a Payment Method (Client-side operation)
   */
  static async createPaymentMethod(
    request: CreatePaymentMethodRequest
  ): Promise<PayMongoResponse<PaymentMethodAttributes>> {
    try {
      const payload = {
        data: {
          attributes: {
            type: request.type,
            details: request.details,
            billing: request.billing,
            metadata: {
              ...request.metadata,
              platform: 'tap2go',
            },
          },
        },
      };

      const response = await paymongoPublicClient.post('/payment_methods', payload);
      return response.data;
    } catch (error) {
      console.error('PayMongo createPaymentMethod error:', error);
      throw new Error(handlePayMongoError(error));
    }
  }

  /**
   * Attach Payment Method to Payment Intent
   */
  static async attachPaymentMethod(
    request: AttachPaymentMethodRequest
  ): Promise<PayMongoResponse<PaymentIntentAttributes>> {
    try {
      const payload = {
        data: {
          attributes: {
            payment_method: request.payment_method_id,
            client_key: request.client_key,
            return_url: request.return_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback`,
          },
        },
      };

      const response = await paymongoPublicClient.post(
        `/payment_intents/${request.payment_intent_id}/attach`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('PayMongo attachPaymentMethod error:', error);
      throw new Error(handlePayMongoError(error));
    }
  }

  /**
   * Get Payment by ID
   */
  static async getPayment(paymentId: string): Promise<PayMongoResponse<PaymentAttributes>> {
    try {
      const response = await paymongoSecretClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('PayMongo getPayment error:', error);
      throw new Error(handlePayMongoError(error));
    }
  }

  /**
   * List all Payments with optional filters
   */
  static async listPayments(options?: {
    before?: string;
    after?: string;
    limit?: number;
  }): Promise<{ data: PayMongoResponse<PaymentAttributes>[] }> {
    try {
      const params = new URLSearchParams();
      if (options?.before) params.append('before', options.before);
      if (options?.after) params.append('after', options.after);
      if (options?.limit) params.append('limit', options.limit.toString());

      const url = `/payments${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await paymongoSecretClient.get(url);
      return response.data;
    } catch (error) {
      console.error('PayMongo listPayments error:', error);
      throw new Error(handlePayMongoError(error));
    }
  }

  /**
   * Create a Refund
   */
  static async createRefund(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<any> {
    try {
      const payload = {
        data: {
          attributes: {
            payment_id: paymentId,
            amount: amount ? toCentavos(amount) : undefined,
            reason: reason || 'requested_by_customer',
            metadata: {
              platform: 'tap2go',
              refund_via: 'api',
            },
          },
        },
      };

      const response = await paymongoSecretClient.post('/refunds', payload);
      return response.data;
    } catch (error) {
      console.error('PayMongo createRefund error:', error);
      throw new Error(handlePayMongoError(error));
    }
  }

  /**
   * Verify webhook signature (for webhook security)
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('PayMongo webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Get supported payment methods for the current environment
   */
  static getSupportedPaymentMethods(): string[] {
    return getSupportedPaymentMethods();
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount: number): boolean {
    return validatePaymentAmount(amount);
  }

  /**
   * Convert amount utilities
   */
  static convertToCentavos(amount: number): number {
    return toCentavos(amount);
  }

  static convertFromCentavos(centavos: number): number {
    return fromCentavos(centavos);
  }
}

export default PayMongoService;
