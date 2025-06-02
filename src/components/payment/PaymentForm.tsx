'use client';

/**
 * PayMongo Payment Form Component for Tap2Go
 * Handles card payments and e-wallet payments
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Smartphone } from 'lucide-react';

interface PaymentFormProps {
  orderId: string;
  amount: number;
  description: string;
  customerId?: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

interface PaymentIntent {
  id: string;
  client_key: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  payment_method_allowed: string[];
}

interface CardDetails {
  card_number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
}

interface BillingDetails {
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

export default function PaymentForm({
  orderId,
  amount,
  description,
  customerId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  // Card form state
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    card_number: '',
    exp_month: 0,
    exp_year: 0,
    cvc: '',
  });

  // Billing form state
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      city: '',
      state: '',
      country: 'PH',
      postal_code: '',
    },
  });

  // Create payment intent on component mount
  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          orderId,
          customerId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      setPaymentIntent(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!paymentIntent) return;

    setProcessing(true);
    setError('');

    try {
      // Validate card details
      if (!cardDetails.card_number || !cardDetails.exp_month || !cardDetails.exp_year || !cardDetails.cvc) {
        throw new Error('Please fill in all card details');
      }

      // Validate billing details
      if (!billingDetails.name || !billingDetails.email) {
        throw new Error('Please fill in billing name and email');
      }

      // Create payment method
      const paymentMethodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE + ':')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: 'card',
              details: cardDetails,
              billing: billingDetails,
              metadata: {
                order_id: orderId,
                customer_id: customerId,
              },
            },
          },
        }),
      });

      const paymentMethodResult = await paymentMethodResponse.json();

      if (!paymentMethodResponse.ok) {
        throw new Error(paymentMethodResult.errors?.[0]?.detail || 'Failed to create payment method');
      }

      // Attach payment method to payment intent
      const attachResponse = await fetch('/api/payments/attach-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id,
          payment_method_id: paymentMethodResult.data.id,
          client_key: paymentIntent.client_key,
          return_url: `${window.location.origin}/payment/callback?order_id=${orderId}`,
        }),
      });

      const attachResult = await attachResponse.json();

      if (!attachResponse.ok) {
        throw new Error(attachResult.error || 'Failed to process payment');
      }

      // Handle payment result
      const status = attachResult.data.status;
      
      if (status === 'awaiting_next_action') {
        // Redirect for 3D Secure authentication
        const redirectUrl = attachResult.data.next_action?.redirect?.url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          throw new Error('3D Secure authentication required but no redirect URL provided');
        }
      } else if (status === 'succeeded') {
        // Payment successful
        onSuccess(attachResult.data);
      } else if (status === 'awaiting_payment_method') {
        // Payment failed
        const errorDetail = attachResult.data.last_payment_error?.detail || 'Payment was declined';
        throw new Error(errorDetail);
      } else if (status === 'processing') {
        // Payment is processing, check status
        setTimeout(() => checkPaymentStatus(), 2000);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleEWalletPayment = async (method: string) => {
    if (!paymentIntent) return;

    setProcessing(true);
    setError('');

    try {
      // Validate billing details
      if (!billingDetails.name || !billingDetails.email) {
        throw new Error('Please fill in billing name and email');
      }

      // Create payment method for e-wallet
      const paymentMethodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE + ':')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: method,
              billing: billingDetails,
              metadata: {
                order_id: orderId,
                customer_id: customerId,
              },
            },
          },
        }),
      });

      const paymentMethodResult = await paymentMethodResponse.json();

      if (!paymentMethodResponse.ok) {
        throw new Error(paymentMethodResult.errors?.[0]?.detail || 'Failed to create payment method');
      }

      // Attach payment method to payment intent
      const attachResponse = await fetch('/api/payments/attach-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id,
          payment_method_id: paymentMethodResult.data.id,
          client_key: paymentIntent.client_key,
          return_url: `${window.location.origin}/payment/callback?order_id=${orderId}`,
        }),
      });

      const attachResult = await attachResponse.json();

      if (!attachResponse.ok) {
        throw new Error(attachResult.error || 'Failed to process payment');
      }

      // Redirect to e-wallet checkout
      const redirectUrl = attachResult.data.next_action?.redirect?.url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('E-wallet checkout URL not provided');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentIntent) return;

    try {
      const response = await fetch(`/api/payments/status/${paymentIntent.id}?client_key=${paymentIntent.client_key}`);
      const result = await response.json();

      if (response.ok) {
        const status = result.data.status;
        
        if (status === 'succeeded') {
          onSuccess(result.data);
        } else if (status === 'awaiting_payment_method') {
          const errorDetail = result.data.last_payment_error?.detail || 'Payment failed';
          setError(errorDetail);
          onError(errorDetail);
        } else if (status === 'processing') {
          // Still processing, check again
          setTimeout(() => checkPaymentStatus(), 2000);
        }
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Initializing payment...</span>
        </CardContent>
      </Card>
    );
  }

  if (!paymentIntent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>
              Failed to initialize payment. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={createPaymentIntent} className="w-full mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Pay ₱{(amount).toFixed(2)}
        </CardTitle>
        <p className="text-sm text-gray-600 text-center">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedMethod === 'card' ? 'default' : 'outline'}
              onClick={() => setSelectedMethod('card')}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Card
            </Button>
            <Button
              variant={selectedMethod === 'ewallet' ? 'default' : 'outline'}
              onClick={() => setSelectedMethod('ewallet')}
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              E-Wallet
            </Button>
          </div>
        </div>

        {/* Billing Details */}
        <div className="space-y-3">
          <Label>Billing Information</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={billingDetails.name}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={billingDetails.email}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="juan@example.com"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              value={billingDetails.phone}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+639171234567"
            />
          </div>
        </div>

        {/* Card Details (only show for card payment) */}
        {selectedMethod === 'card' && (
          <div className="space-y-3">
            <Label>Card Details</Label>
            <div>
              <Label htmlFor="card_number">Card Number</Label>
              <Input
                id="card_number"
                value={cardDetails.card_number}
                onChange={(e) => setCardDetails(prev => ({ ...prev, card_number: e.target.value }))}
                placeholder="4343 4343 4343 4345"
                maxLength={19}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="exp_month">Month</Label>
                <Input
                  id="exp_month"
                  type="number"
                  value={cardDetails.exp_month || ''}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, exp_month: parseInt(e.target.value) }))}
                  placeholder="12"
                  min="1"
                  max="12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="exp_year">Year</Label>
                <Input
                  id="exp_year"
                  type="number"
                  value={cardDetails.exp_year || ''}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, exp_year: parseInt(e.target.value) }))}
                  placeholder="2025"
                  min="2024"
                  max="2040"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* E-Wallet Options (only show for e-wallet payment) */}
        {selectedMethod === 'ewallet' && (
          <div className="space-y-3">
            <Label>Choose E-Wallet</Label>
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => handleEWalletPayment('gcash')}
                disabled={processing}
                className="justify-start"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                GCash
              </Button>
              <Button
                variant="outline"
                onClick={() => handleEWalletPayment('grab_pay')}
                disabled={processing}
                className="justify-start"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                GrabPay
              </Button>
              <Button
                variant="outline"
                onClick={() => handleEWalletPayment('paymaya')}
                disabled={processing}
                className="justify-start"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Maya
              </Button>
            </div>
          </div>
        )}

        {/* Pay Button (only show for card payment) */}
        {selectedMethod === 'card' && (
          <Button
            onClick={handleCardPayment}
            disabled={processing}
            className="w-full bg-[#f3a823] hover:bg-[#ef7b06] text-white"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Pay ₱${amount.toFixed(2)}`
            )}
          </Button>
        )}

        <p className="text-xs text-gray-500 text-center">
          Secured by PayMongo. Your payment information is encrypted and secure.
        </p>
      </CardContent>
    </Card>
  );
}
