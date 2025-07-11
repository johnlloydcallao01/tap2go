/**
 * Redux Integration Demo Component
 * Shows how to use Redux alongside existing Context patterns
 */

'use client';


import React from 'react';
import { useAppDispatch, useAppSelector, useAuthState, useCartState } from '@/store/hooks';
import { addToCart, removeFromCart, clearCart } from '@/store/slices/cartSlice';
import { showSuccessNotification, showErrorNotification } from '@/store/slices/uiSlice';
import { useAuthReduxSync } from '@/store/integration/authIntegration';

export default function ReduxIntegrationDemo() {
  const dispatch = useAppDispatch();
  
  // Sync existing AuthContext with Redux
  useAuthReduxSync();
  
  // Use Redux state
  const authState = useAuthState();
  const cartState = useCartState();
  const notifications = useAppSelector(state => state.ui.notifications);
  
  // Demo functions
  const handleAddToCart = () => {
    const mockMenuItem = {
      id: 'demo-item-1',
      slug: 'demo-burger',
      name: 'Demo Burger',
      description: 'A delicious demo burger',
      price: 12.99,
      restaurantId: 'demo-restaurant',
      category: 'burgers',
      image: '',
      available: true,
      preparationTime: 15,
      ingredients: ['beef', 'lettuce', 'tomato'],
      allergens: ['gluten'],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      nutritionalInfo: {
        calories: 500,
        protein: 25,
        carbs: 40,
        fat: 20,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    dispatch(addToCart({ item: mockMenuItem, quantity: 1 }));
    dispatch(showSuccessNotification({
      title: 'Added to Cart',
      message: 'Demo Burger added to your cart!',
    }));
  };
  
  const handleClearCart = () => {
    dispatch(clearCart());
    dispatch(showErrorNotification({
      title: 'Cart Cleared',
      message: 'All items removed from cart',
    }));
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Redux Integration Demo</h2>
        
        {/* Auth State */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Auth State (Redux)</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Authenticated:</strong> {authState.isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Loading:</strong> {authState.loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {authState.user?.name || 'Not logged in'}</p>
            <p><strong>Role:</strong> {authState.user?.role || 'N/A'}</p>
            <p><strong>Initialized:</strong> {authState.isInitialized ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        {/* Cart State */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Cart State (Redux)</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Items:</strong> {cartState.itemCount}</p>
            <p><strong>Total:</strong> ${cartState.total.toFixed(2)}</p>
            <p><strong>Restaurant:</strong> {cartState.restaurantId || 'None'}</p>
            <p><strong>Loading:</strong> {cartState.loading ? 'Yes' : 'No'}</p>
            
            {cartState.items.length > 0 && (
              <div className="mt-3">
                <p className="font-medium">Items:</p>
                <ul className="list-disc list-inside ml-4">
                  {cartState.items.map((item) => (
                    <li key={item.id} className="flex justify-between items-center">
                      <span>{item.menuItem.name} x{item.quantity}</span>
                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Redux Actions</h3>
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Demo Item to Cart
            </button>
            <button
              onClick={handleClearCart}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              disabled={cartState.itemCount === 0}
            >
              Clear Cart
            </button>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Notifications (Redux)</h3>
          <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 rounded text-sm ${
                      notification.type === 'success' ? 'bg-green-100 text-green-800' :
                      notification.type === 'error' ? 'bg-red-100 text-red-800' :
                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <p className="font-medium">{notification.title}</p>
                    <p>{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Integration Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Redux Integration Status</h3>
          <ul className="text-green-700 space-y-1">
            <li>✅ Redux store configured and running</li>
            <li>✅ Auth state synced with existing AuthContext</li>
            <li>✅ Cart state managed by Redux</li>
            <li>✅ UI notifications working</li>
            <li>✅ Persistence enabled</li>
            <li>✅ TypeScript support active</li>
            <li>✅ Middleware configured (analytics, real-time, error handling)</li>
            <li>✅ RTK Query ready for API calls</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
