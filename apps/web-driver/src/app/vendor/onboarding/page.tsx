'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

export default function VendorOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Restaurant Info
    restaurantName: '',
    description: '',
    cuisine: [] as string[],
    phone: '',
    email: '',

    // Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',

    // Business Info
    businessLicense: '',
    taxId: '',

    // Operating Hours
    openingHours: {
      monday: { open: '09:00', close: '22:00', isClosed: false },
      tuesday: { open: '09:00', close: '22:00', isClosed: false },
      wednesday: { open: '09:00', close: '22:00', isClosed: false },
      thursday: { open: '09:00', close: '22:00', isClosed: false },
      friday: { open: '09:00', close: '23:00', isClosed: false },
      saturday: { open: '09:00', close: '23:00', isClosed: false },
      sunday: { open: '10:00', close: '21:00', isClosed: false }
    },

    // Delivery Settings
    deliveryFee: 3.99,
    minimumOrder: 15.00,
    deliveryTime: '30-45 min'
  });

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Japanese', 'Thai',
    'Mediterranean', 'French', 'Korean', 'Vietnamese', 'Greek', 'Lebanese',
    'Pizza', 'Burgers', 'Sushi', 'BBQ', 'Seafood', 'Vegetarian', 'Vegan'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCuisineToggle = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter(c => c !== cuisine)
        : [...prev.cuisine, cuisine]
    }));
  };

  // Removed unused function

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // In a real app, this would submit to API
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/vendor/dashboard');
    } catch (error) {
      console.error('Error submitting restaurant info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be a vendor to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <BuildingStorefrontIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Tap2Go!</h1>
          <p className="text-gray-600 mt-2">Let&apos;s set up your restaurant and get you started</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-orange-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Restaurant Info</span>
            <span>Location</span>
            <span>Hours & Delivery</span>
            <span>Review</span>
          </div>
        </div>

        <div className="card p-8">
          {/* Step 1: Restaurant Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your restaurant name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field"
                  placeholder="Describe your restaurant and what makes it special"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Types * (Select all that apply)
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => handleCuisineToggle(cuisine)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        formData.cuisine.includes(cuisine)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="restaurant@example.com"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Location</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="10001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business License Number
                  </label>
                  <input
                    type="text"
                    name="businessLicense"
                    value={formData.businessLicense}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="BL123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="12-3456789"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(Math.min(4, step + 1))}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
