// Placeholder OrderConfirmationEmail component
import React from 'react';

interface OrderConfirmationEmailProps {
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  restaurantName?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  subtotal?: number;
  deliveryFee?: number;
  tax?: number;
  total?: number;
  deliveryAddress?: string;
  estimatedDeliveryTime?: string;
  paymentMethod?: string;
  trackingUrl?: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderId,
  orderNumber = "ORD-000",
  customerName = "Customer",
  restaurantName,
  items = [],
  subtotal = 0,
  deliveryFee = 0,
  tax = 0,
  total = 0,
  deliveryAddress = "",
  estimatedDeliveryTime,
  paymentMethod,
  trackingUrl
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#2563eb' }}>Order Confirmation</h1>
      <p>Dear {customerName},</p>
      <p>Thank you for your order! Your order #{orderNumber} has been confirmed.</p>
      
      <div style={{ border: '1px solid #e5e7eb', padding: '16px', marginTop: '16px' }}>
        <h3>Order Details:</h3>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>{item.quantity}x {item.name}</span>
            <span>₱{item.price.toFixed(2)}</span>
          </div>
        ))}
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Total:</span>
          <span>₱{total.toFixed(2)}</span>
        </div>
      </div>
      
      {deliveryAddress && (
        <div style={{ marginTop: '16px' }}>
          <h3>Delivery Address:</h3>
          <p>{deliveryAddress}</p>
        </div>
      )}
      
      <p style={{ marginTop: '24px', color: '#6b7280' }}>
        This is a placeholder email template. Email service integration needed.
      </p>
    </div>
  );
};

export default OrderConfirmationEmail;
