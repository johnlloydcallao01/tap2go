'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your cart</h1>
            <Link href="/auth/signin" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
        <MobileFooterNav />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <div className="container-custom py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some delicious items to get started!</p>
            <Link href="/" className="btn-primary">
              Browse Restaurants
            </Link>
          </div>
        </div>
        <MobileFooterNav />
      </div>
    );
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="card p-4">
                <div className="flex items-center space-x-4">
                  {/* Item Image */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    {imageErrors[item.id] ? (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-500">
                          {item.menuItem.name.charAt(0)}
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="80px"
                        onError={() => setImageErrors(prev => ({...prev, [item.id]: true}))}
                      />
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.menuItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {item.menuItem.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-medium text-gray-900">
                        ${item.menuItem.price.toFixed(2)}
                      </span>
                      {item.menuItem.isVegetarian && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Vegetarian
                        </span>
                      )}
                    </div>
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 mt-1">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 mt-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">${cart.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${cart.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full btn-primary">
                  Proceed to Checkout
                </button>
                <Link href="/" className="block w-full btn-secondary text-center">
                  Continue Shopping
                </Link>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Delivery Information</h3>
                <p className="text-sm text-gray-600">
                  Estimated delivery time: 25-35 minutes
                </p>
                <p className="text-sm text-gray-600">
                  Delivery to: Your current address
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileFooterNav />
    </div>
  );
}
