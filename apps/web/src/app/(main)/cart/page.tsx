'use client';

import React, { useState } from 'react';
import ImageWrapper from '@/components/ui/ImageWrapper';

/**
 * Cart Page - Professional shopping cart with minimal design
 * Features cart management, quantity updates, and checkout functionality
 */
export default function CartPage() {
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  // Mock cart data
  const cartItems = [
    {
      id: 1,
      name: "Truffle Mushroom Pizza",
      restaurant: "Bella Italia",
      category: "Italian",
      price: 24.99,
      originalPrice: 29.99,
      quantity: 2,
      image: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400",
      customizations: ["Extra cheese", "Thin crust"],
      isOnSale: true
    },
    {
      id: 2,
      name: "Wagyu Beef Burger",
      restaurant: "Gourmet Burgers Co.",
      category: "American",
      price: 18.50,
      originalPrice: null,
      quantity: 1,
      image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400",
      customizations: ["No onions", "Extra sauce"],
      isOnSale: false
    },
    {
      id: 3,
      name: "Dragon Roll Sushi",
      restaurant: "Sakura Sushi",
      category: "Japanese",
      price: 16.99,
      originalPrice: null,
      quantity: 1,
      image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400",
      customizations: ["Extra wasabi"],
      isOnSale: false
    }
  ];

  const deliveryFee = 3.99;
  const serviceFee = 2.50;
  const promoDiscount = isPromoApplied ? 5.00 : 0;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + deliveryFee + serviceFee - promoDiscount;

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    console.log(`Updating item ${itemId} quantity to ${newQuantity}`);
    // Update quantity logic here
  };

  const handleRemoveItem = (itemId: number) => {
    console.log(`Removing item ${itemId} from cart`);
    // Remove item logic here
  };

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'save5') {
      setIsPromoApplied(true);
      console.log('Promo code applied successfully');
    } else {
      console.log('Invalid promo code');
    }
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout');
    // Checkout logic here
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-2.5 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Your Cart</h1>
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <i className="fas fa-search text-gray-600"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty Cart State */}
        <div className="flex flex-col items-center justify-center px-2.5 py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-shopping-cart text-3xl text-gray-400"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 text-center mb-8 max-w-sm">
            Looks like you haven&apos;t added any items to your cart yet. Start browsing to find delicious food!
          </p>
          <button 
            className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-colors"
            style={{backgroundColor: '#eba236'}}
          >
            <i className="fas fa-utensils mr-2"></i>
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-2.5 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Your Cart</h1>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2.5 py-6 space-y-6">
        {/* Cart Items */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex space-x-3">
                {/* Item Image */}
                <div className="flex-shrink-0">
                  <ImageWrapper
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.restaurant} • {item.category}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors ml-2"
                    >
                      <i className="fas fa-trash text-xs text-gray-400 hover:text-red-500"></i>
                    </button>
                  </div>

                  {/* Customizations */}
                  {item.customizations.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600">
                        <i className="fas fa-edit mr-1"></i>
                        {item.customizations.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Price and Quantity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">${item.originalPrice}</span>
                      )}
                      {item.isOnSale && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          Sale
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        style={{ border: '1px solid #e5e7eb' }}
                      >
                        <i className="fas fa-minus text-xs text-gray-600"></i>
                      </button>
                      <span className="font-medium text-gray-900 min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                        style={{ border: '1px solid #eba236', color: '#eba236', backgroundColor: 'white' }}
                      >
                        <i className="fas fa-plus text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo Code Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Promo Code</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || isPromoApplied}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                border: '1px solid #eba236',
                color: isPromoApplied ? '#10b981' : '#eba236',
                backgroundColor: 'white'
              }}
            >
              {isPromoApplied ? (
                <>
                  <i className="fas fa-check mr-1"></i>
                  Applied
                </>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          {isPromoApplied && (
            <p className="text-xs text-green-600 mt-2">
              <i className="fas fa-check-circle mr-1"></i>
              Promo code &quot;SAVE5&quot; applied successfully!
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium text-gray-900">${deliveryFee.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-medium text-gray-900">${serviceFee.toFixed(2)}</span>
            </div>
            
            {isPromoApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Promo Discount</span>
                <span className="font-medium text-green-600">-${promoDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="pb-20">
          <button
            onClick={handleCheckout}
            className="w-full text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-colors shadow-lg"
            style={{backgroundColor: '#eba236'}}
          >
            <i className="fas fa-credit-card mr-2"></i>
            Proceed to Checkout
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            By placing this order, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}