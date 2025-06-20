/**
 * Order Confirmation Email Template
 * Professional email for order confirmations in Tap2Go
 */

import React from 'react';
import {
  Text,
  Section,
  Row,
  Column,
  Button,
  Hr,
} from '@react-email/components';
import { BaseEmailTemplate } from './BaseEmailTemplate';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  orderNumber: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  estimatedDeliveryTime: string;
  deliveryAddress: string;
  paymentMethod: string;
  trackingUrl?: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  orderId,
  orderNumber,
  restaurantName,
  items,
  subtotal,
  deliveryFee,
  tax,
  total,
  estimatedDeliveryTime,
  deliveryAddress,
  paymentMethod,
  trackingUrl
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tap2go.com';

  return (
    <BaseEmailTemplate
      title={`Order Confirmation - ${orderNumber}`}
      previewText={`Your order from ${restaurantName} has been confirmed!`}
    >
      {/* Greeting */}
      <Text style={heading}>Order Confirmed! 🎉</Text>
      <Text style={paragraph}>
        Hi {customerName},
      </Text>
      <Text style={paragraph}>
        Great news! Your order from <strong>{restaurantName}</strong> has been confirmed 
        and is being prepared. We&apos;ll keep you updated on its progress.
      </Text>

      {/* Order Details */}
      <Section style={orderSection}>
        <Row>
          <Column>
            <Text style={orderTitle}>Order Details</Text>
          </Column>
          <Column align="right">
            <Text style={orderNumberStyle}>#{orderNumber}</Text>
          </Column>
        </Row>
        
        <Text style={orderInfo}>
          <strong>Restaurant:</strong> {restaurantName}<br />
          <strong>Estimated Delivery:</strong> {estimatedDeliveryTime}<br />
          <strong>Delivery Address:</strong> {deliveryAddress}
        </Text>
      </Section>

      {/* Order Items */}
      <Section style={itemsSection}>
        <Text style={sectionTitle}>Your Order</Text>
        {items.map((item) => (
          <Row key={item.id} style={itemRow}>
            <Column style={itemDetails}>
              <Text style={itemName}>
                {item.quantity}x {item.name}
              </Text>
              {item.specialInstructions && (
                <Text style={itemInstructions}>
                  Note: {item.specialInstructions}
                </Text>
              )}
            </Column>
            <Column align="right" style={itemPrice}>
              <Text style={priceText}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Hr style={hr} />

      {/* Order Summary */}
      <Section style={summarySection}>
        <Row style={summaryRow}>
          <Column>
            <Text style={summaryLabel}>Subtotal</Text>
          </Column>
          <Column align="right">
            <Text style={summaryValue}>${subtotal.toFixed(2)}</Text>
          </Column>
        </Row>
        
        <Row style={summaryRow}>
          <Column>
            <Text style={summaryLabel}>Delivery Fee</Text>
          </Column>
          <Column align="right">
            <Text style={summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </Column>
        </Row>
        
        <Row style={summaryRow}>
          <Column>
            <Text style={summaryLabel}>Tax</Text>
          </Column>
          <Column align="right">
            <Text style={summaryValue}>${tax.toFixed(2)}</Text>
          </Column>
        </Row>
        
        <Hr style={summaryHr} />
        
        <Row style={totalRow}>
          <Column>
            <Text style={totalLabel}>Total</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>${total.toFixed(2)}</Text>
          </Column>
        </Row>
        
        <Text style={paymentInfo}>
          Paid with {paymentMethod}
        </Text>
      </Section>

      {/* Action Buttons */}
      <Section style={buttonSection}>
        {trackingUrl && (
          <Button style={primaryButton} href={trackingUrl}>
            Track Your Order
          </Button>
        )}
        
        <Button style={secondaryButton} href={`${baseUrl}/orders/${orderId}`}>
          View Order Details
        </Button>
      </Section>

      {/* Additional Info */}
      <Section style={infoSection}>
        <Text style={infoText}>
          <strong>Need help?</strong> Contact us at support@tap2go.com or call (555) 123-4567.
        </Text>
        <Text style={infoText}>
          You can also manage your orders and preferences in your Tap2Go account.
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
};

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 20px 0',
  lineHeight: '1.3',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 16px 0',
};

const orderSection = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
};

const orderTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0',
};

const orderNumberStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#f97316',
  margin: '0',
};

const orderInfo = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#6b7280',
  margin: '12px 0 0 0',
};

const itemsSection = {
  margin: '20px 0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const itemRow = {
  marginBottom: '12px',
};

const itemDetails = {
  width: '70%',
};

const itemName = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  margin: '0',
};

const itemInstructions = {
  fontSize: '12px',
  color: '#6b7280',
  fontStyle: 'italic',
  margin: '4px 0 0 0',
};

const itemPrice = {
  width: '30%',
};

const priceText = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const summarySection = {
  margin: '20px 0',
};

const summaryRow = {
  marginBottom: '8px',
};

const summaryLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const summaryValue = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
};

const summaryHr = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const totalRow = {
  marginTop: '12px',
};

const totalLabel = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0',
};

const totalValue = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0',
};

const paymentInfo = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '8px 0 0 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const primaryButton = {
  backgroundColor: '#f97316',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 8px 12px 8px',
};

const secondaryButton = {
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 8px 12px 8px',
};

const infoSection = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '6px',
  margin: '20px 0',
};

const infoText = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#6b7280',
  margin: '0 0 8px 0',
};

export default OrderConfirmationEmail;
