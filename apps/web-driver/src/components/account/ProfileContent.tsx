'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function ProfileContent() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    gender: 'prefer-not-to-say',
    language: 'en',
    newsletter: true,
    smsNotifications: false,
  });

  const handleSave = () => {
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <CameraIcon className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-gray-500 mb-4">Customer since March 2023</p>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">★</span>
                </div>
                <span className="font-medium text-orange-900">Gold Member</span>
              </div>
              <p className="text-sm text-orange-700">2,340 loyalty points</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{profileData.firstName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{profileData.lastName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{profileData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{profileData.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{new Date(profileData.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                {isEditing ? (
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 capitalize">{profileData.gender.replace('-', ' ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Email Newsletter</label>
                  <p className="text-sm text-gray-500">Receive updates about new restaurants and offers</p>
                </div>
                <input
                  type="checkbox"
                  checked={profileData.newsletter}
                  onChange={(e) => setProfileData({...profileData, newsletter: e.target.checked})}
                  disabled={!isEditing}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Get order updates via text message</p>
                </div>
                <input
                  type="checkbox"
                  checked={profileData.smsNotifications}
                  onChange={(e) => setProfileData({...profileData, smsNotifications: e.target.checked})}
                  disabled={!isEditing}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
