'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { UserIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'USA'
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h1>
            <Link href="/auth/signin" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      phone: user.phone || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'USA'
      }
    });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="card p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    className="input-field bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Address</h3>
                  
                  <div>
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="address.zipCode"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <p className="text-gray-600">{user.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {user.address && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Address</p>
                        <p className="text-gray-600">
                          {user.address.street}<br />
                          {user.address.city}, {user.address.state} {user.address.zipCode}<br />
                          {user.address.country}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Member since {user.createdAt?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
