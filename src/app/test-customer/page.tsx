'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Customer {
  id: string;
  userRef: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: any;
  gender?: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  preferredCuisines?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  marketingConsent: boolean;
  smsConsent: boolean;
  emailConsent: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: any;
  updatedAt: any;
  lastOrderAt?: any;
}

export default function TestCustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);
      
      const customerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      
      setCustomers(customerData);
    } catch (error: any) {
      setError(error.message);
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customer: Customer) => {
    try {
      setSelectedCustomer(customer);
      
      // Load addresses
      const addressesRef = collection(db, 'customers', customer.id, 'addresses');
      const addressesSnapshot = await getDocs(addressesRef);
      const addressesData = addressesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAddresses(addressesData);

      // Load payment methods
      const paymentRef = collection(db, 'customers', customer.id, 'paymentMethods');
      const paymentSnapshot = await getDocs(paymentRef);
      const paymentData = paymentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPaymentMethods(paymentData);

      // Load favorites
      const favoritesRef = collection(db, 'customers', customer.id, 'favorites');
      const favoritesSnapshot = await getDocs(favoritesRef);
      const favoritesData = favoritesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFavorites(favoritesData);

      // Load cart items
      const cartRef = collection(db, 'customers', customer.id, 'cart');
      const cartSnapshot = await getDocs(cartRef);
      const cartData = cartSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCartItems(cartData);

    } catch (error: any) {
      setError(error.message);
      console.error('Error loading customer details:', error);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return timestamp.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Customers Collection</h1>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading customers...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!loading && customers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No customers found in the database.</p>
            </div>
          )}

          {!loading && customers.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Found {customers.length} customer(s)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadCustomerDetails(customer)}
                  >
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">ID: {customer.id}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          customer.loyaltyTier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                          customer.loyaltyTier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          customer.loyaltyTier === 'silver' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {customer.loyaltyTier.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {customer.loyaltyPoints} pts
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Orders: {customer.totalOrders}</p>
                        <p>Spent: ${customer.totalSpent}</p>
                        <p>Avg: ${customer.avgOrderValue}</p>
                        <p>Referral: {customer.referralCode}</p>
                      </div>

                      {customer.preferredCuisines && customer.preferredCuisines.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {customer.preferredCuisines.slice(0, 2).map((cuisine, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                            >
                              {cuisine}
                            </span>
                          ))}
                          {customer.preferredCuisines.length > 2 && (
                            <span className="text-xs text-gray-500">+{customer.preferredCuisines.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedCustomer && (
                <div className="mt-8 border-t pt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Customer Details: {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>Name:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                          <p><strong>Gender:</strong> {selectedCustomer.gender || 'Not specified'}</p>
                          <p><strong>DOB:</strong> {formatTimestamp(selectedCustomer.dateOfBirth)}</p>
                          <p><strong>Loyalty Tier:</strong> {selectedCustomer.loyaltyTier}</p>
                          <p><strong>Points:</strong> {selectedCustomer.loyaltyPoints}</p>
                          <p><strong>Referral Code:</strong> {selectedCustomer.referralCode}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Order Statistics</h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>Total Orders:</strong> {selectedCustomer.totalOrders}</p>
                          <p><strong>Total Spent:</strong> ${selectedCustomer.totalSpent}</p>
                          <p><strong>Average Order:</strong> ${selectedCustomer.avgOrderValue}</p>
                          <p><strong>Last Order:</strong> {formatTimestamp(selectedCustomer.lastOrderAt)}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Preferences & Restrictions</h3>
                        <div className="space-y-2 text-sm">
                          {selectedCustomer.preferredCuisines && selectedCustomer.preferredCuisines.length > 0 && (
                            <div>
                              <strong>Preferred Cuisines:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCustomer.preferredCuisines.map((cuisine, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {cuisine}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedCustomer.dietaryRestrictions && selectedCustomer.dietaryRestrictions.length > 0 && (
                            <div>
                              <strong>Dietary Restrictions:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCustomer.dietaryRestrictions.map((restriction, index) => (
                                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    {restriction}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedCustomer.allergies && selectedCustomer.allergies.length > 0 && (
                            <div>
                              <strong>Allergies:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCustomer.allergies.map((allergy, index) => (
                                  <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                    {allergy}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Communication Preferences</h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>Marketing:</strong> {selectedCustomer.marketingConsent ? '✅ Yes' : '❌ No'}</p>
                          <p><strong>SMS:</strong> {selectedCustomer.smsConsent ? '✅ Yes' : '❌ No'}</p>
                          <p><strong>Email:</strong> {selectedCustomer.emailConsent ? '✅ Yes' : '❌ No'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Subcollections */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">
                          Addresses ({addresses.length})
                        </h3>
                        {addresses.map((address) => (
                          <div key={address.id} className="text-sm text-blue-700 mb-2 p-2 bg-white rounded">
                            <p><strong>{address.label}</strong> {address.isDefault && '(Default)'}</p>
                            <p>{address.formattedAddress}</p>
                            <p>Contact: {address.recipientName} - {address.recipientPhone}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">
                          Payment Methods ({paymentMethods.length})
                        </h3>
                        {paymentMethods.map((payment) => (
                          <div key={payment.id} className="text-sm text-green-700 mb-1">
                            • {payment.type.toUpperCase()} - {payment.cardBrand} ****{payment.last4} {payment.isDefault && '(Default)'}
                          </div>
                        ))}
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-800 mb-2">
                          Favorites ({favorites.length})
                        </h3>
                        {favorites.map((favorite) => (
                          <div key={favorite.id} className="text-sm text-purple-700 mb-1">
                            • {favorite.type.toUpperCase()} - {favorite.restaurantRef || favorite.menuItemRef}
                          </div>
                        ))}
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">
                          Cart Items ({cartItems.length})
                        </h3>
                        {cartItems.map((item) => (
                          <div key={item.id} className="text-sm text-yellow-700 mb-2 p-2 bg-white rounded">
                            <p><strong>Qty:</strong> {item.quantity} - <strong>Price:</strong> ${item.totalPrice}</p>
                            <p><strong>Item:</strong> {item.menuItemRef}</p>
                            {item.specialInstructions && <p><strong>Notes:</strong> {item.specialInstructions}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2">Test Information:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• This page displays all customers from the Firestore database</li>
              <li>• Click on a customer to view their subcollections</li>
              <li>• Shows addresses, payment methods, favorites, and cart items</li>
              <li>• Demonstrates the complete customer data structure</li>
              <li>• Includes loyalty system, referral codes, and preferences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
