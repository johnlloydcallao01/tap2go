'use client';

import React, { useState, useEffect } from 'react';
import {
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface RestaurantProfile {
  businessName: string;
  businessType: string;
  description: string;
  businessPhone: string;
  businessEmail: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  deliverySettings: {
    deliveryRadius: number;
    minimumOrderValue: number;
    deliveryFee: number;
    estimatedDeliveryTime: string;
  };
  images: {
    logo?: string;
    cover?: string;
    gallery: string[];
  };
}

const mockProfile: RestaurantProfile = {
  businessName: "Mario's Italian Kitchen",
  businessType: "restaurant",
  description: "Authentic Italian cuisine made with fresh ingredients and traditional recipes passed down through generations.",
  businessPhone: "+1 (555) 123-4567",
  businessEmail: "info@mariositalian.com",
  address: {
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  },
  operatingHours: {
    monday: { open: "11:00", close: "22:00", isClosed: false },
    tuesday: { open: "11:00", close: "22:00", isClosed: false },
    wednesday: { open: "11:00", close: "22:00", isClosed: false },
    thursday: { open: "11:00", close: "22:00", isClosed: false },
    friday: { open: "11:00", close: "23:00", isClosed: false },
    saturday: { open: "11:00", close: "23:00", isClosed: false },
    sunday: { open: "12:00", close: "21:00", isClosed: false }
  },
  deliverySettings: {
    deliveryRadius: 5,
    minimumOrderValue: 15,
    deliveryFee: 3.99,
    estimatedDeliveryTime: "30-45 min"
  },
  images: {
    logo: "/images/restaurant-logo.jpg",
    cover: "/images/restaurant-cover.jpg",
    gallery: []
  }
};

export default function RestaurantProfile() {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfile(mockProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-300 rounded-lg"></div>
            <div className="h-48 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-300 rounded-lg"></div>
            <div className="h-48 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load restaurant profile.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Profile</h1>
              <p className="text-gray-600">Manage your restaurant information</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-primary"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={profile.businessName}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={profile.businessType}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="bakery">Bakery</option>
                  <option value="food_truck">Food Truck</option>
                  <option value="catering">Catering</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={profile.description}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Phone
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.businessPhone}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Email
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={profile.businessEmail}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={profile.address.street}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={profile.address.city}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={profile.address.state}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={profile.address.zipCode}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={profile.address.country}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Operating Hours */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Operating Hours</h2>
            <div className="space-y-3">
              {Object.entries(profile.operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{formatDay(day)}</span>
                  <span className="text-sm text-gray-600">
                    {hours.isClosed ? (
                      <span className="text-red-600">Closed</span>
                    ) : (
                      `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Delivery Radius</span>
                <span className="text-sm text-gray-600">{profile.deliverySettings.deliveryRadius} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Minimum Order</span>
                <span className="text-sm text-gray-600">${profile.deliverySettings.minimumOrderValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Delivery Fee</span>
                <span className="text-sm text-gray-600">${profile.deliverySettings.deliveryFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Delivery Time</span>
                <span className="text-sm text-gray-600">{profile.deliverySettings.estimatedDeliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
