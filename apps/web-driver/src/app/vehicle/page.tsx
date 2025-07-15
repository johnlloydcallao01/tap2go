'use client';

import React, { useState } from 'react';
import {
  TruckIcon,
  PencilIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function VehicleInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    type: 'Motorcycle',
    make: 'Honda',
    model: 'CBR 250R',
    year: '2022',
    color: 'Red',
    plateNumber: 'ABC-1234',
    registrationNumber: 'REG123456789',
    insuranceProvider: 'SafeRide Insurance',
    insurancePolicy: 'POL987654321',
    insuranceExpiry: '2024-12-31',
    licenseNumber: 'DL123456789',
    licenseExpiry: '2025-06-15',
    lastInspection: '2024-01-15',
    nextInspection: '2024-07-15',
  });

  const handleSave = () => {
    console.log('Saving vehicle data:', vehicleData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const isExpiringSoon = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  };

  const getExpiryStatus = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', bgColor: 'bg-red-100', icon: ExclamationTriangleIcon };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: ExclamationTriangleIcon };
    } else {
      return { status: 'valid', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Information</h1>
          <p className="text-gray-600">Manage your vehicle details and documents.</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Vehicle Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
            <TruckIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {vehicleData.year} {vehicleData.make} {vehicleData.model}
            </h2>
            <p className="text-gray-600">{vehicleData.type} • {vehicleData.color}</p>
            <p className="text-sm text-gray-500 font-mono">{vehicleData.plateNumber}</p>
          </div>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Insurance</p>
                <p className="font-medium text-gray-900">
                  {getExpiryStatus(vehicleData.insuranceExpiry).status === 'expired' ? 'Expired' :
                   getExpiryStatus(vehicleData.insuranceExpiry).status === 'expiring' ? 'Expiring Soon' : 'Valid'}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getExpiryStatus(vehicleData.insuranceExpiry).bgColor}`}>
                {React.createElement(getExpiryStatus(vehicleData.insuranceExpiry).icon, {
                  className: `h-4 w-4 ${getExpiryStatus(vehicleData.insuranceExpiry).color}`
                })}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">License</p>
                <p className="font-medium text-gray-900">
                  {getExpiryStatus(vehicleData.licenseExpiry).status === 'expired' ? 'Expired' :
                   getExpiryStatus(vehicleData.licenseExpiry).status === 'expiring' ? 'Expiring Soon' : 'Valid'}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getExpiryStatus(vehicleData.licenseExpiry).bgColor}`}>
                {React.createElement(getExpiryStatus(vehicleData.licenseExpiry).icon, {
                  className: `h-4 w-4 ${getExpiryStatus(vehicleData.licenseExpiry).color}`
                })}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inspection</p>
                <p className="font-medium text-gray-900">
                  {getExpiryStatus(vehicleData.nextInspection).status === 'expired' ? 'Overdue' :
                   getExpiryStatus(vehicleData.nextInspection).status === 'expiring' ? 'Due Soon' : 'Current'}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getExpiryStatus(vehicleData.nextInspection).bgColor}`}>
                {React.createElement(getExpiryStatus(vehicleData.nextInspection).icon, {
                  className: `h-4 w-4 ${getExpiryStatus(vehicleData.nextInspection).color}`
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                {isEditing ? (
                  <select
                    value={vehicleData.type}
                    onChange={(e) => setVehicleData({...vehicleData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Car">Car</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Scooter">Scooter</option>
                  </select>
                ) : (
                  <span className="text-gray-900">{vehicleData.type}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={vehicleData.make}
                    onChange={(e) => setVehicleData({...vehicleData, make: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-gray-900">{vehicleData.make}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-gray-900">{vehicleData.model}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={vehicleData.year}
                    onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-gray-900">{vehicleData.year}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={vehicleData.color}
                    onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-gray-900">{vehicleData.color}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={vehicleData.plateNumber}
                    onChange={(e) => setVehicleData({...vehicleData, plateNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-gray-900 font-mono">{vehicleData.plateNumber}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registration & Insurance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration & Insurance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={vehicleData.registrationNumber}
                  onChange={(e) => setVehicleData({...vehicleData, registrationNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="font-mono text-gray-900">{vehicleData.registrationNumber}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
              {isEditing ? (
                <input
                  type="text"
                  value={vehicleData.insuranceProvider}
                  onChange={(e) => setVehicleData({...vehicleData, insuranceProvider: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="text-gray-900">{vehicleData.insuranceProvider}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={vehicleData.insurancePolicy}
                  onChange={(e) => setVehicleData({...vehicleData, insurancePolicy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="font-mono text-gray-900">{vehicleData.insurancePolicy}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Expiry</label>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <input
                    type="date"
                    value={vehicleData.insuranceExpiry}
                    onChange={(e) => setVehicleData({...vehicleData, insuranceExpiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(vehicleData.insuranceExpiry)}</span>
                    {isExpiringSoon(vehicleData.insuranceExpiry) && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Expiring Soon
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* License & Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver License</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={vehicleData.licenseNumber}
                  onChange={(e) => setVehicleData({...vehicleData, licenseNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="font-mono text-gray-900">{vehicleData.licenseNumber}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry</label>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <input
                    type="date"
                    value={vehicleData.licenseExpiry}
                    onChange={(e) => setVehicleData({...vehicleData, licenseExpiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(vehicleData.licenseExpiry)}</span>
                    {isExpiringSoon(vehicleData.licenseExpiry) && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Expiring Soon
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Inspection</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Inspection</label>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{formatDate(vehicleData.lastInspection)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Inspection Due</label>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <input
                    type="date"
                    value={vehicleData.nextInspection}
                    onChange={(e) => setVehicleData({...vehicleData, nextInspection: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(vehicleData.nextInspection)}</span>
                    {isExpiringSoon(vehicleData.nextInspection) && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Due Soon
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(isExpiringSoon(vehicleData.insuranceExpiry) || isExpiringSoon(vehicleData.licenseExpiry) || isExpiringSoon(vehicleData.nextInspection)) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-orange-900 mb-2">Action Required</h3>
              <div className="space-y-1">
                {isExpiringSoon(vehicleData.insuranceExpiry) && (
                  <p className="text-sm text-orange-700">• Your insurance expires on {formatDate(vehicleData.insuranceExpiry)}</p>
                )}
                {isExpiringSoon(vehicleData.licenseExpiry) && (
                  <p className="text-sm text-orange-700">• Your license expires on {formatDate(vehicleData.licenseExpiry)}</p>
                )}
                {isExpiringSoon(vehicleData.nextInspection) && (
                  <p className="text-sm text-orange-700">• Vehicle inspection is due on {formatDate(vehicleData.nextInspection)}</p>
                )}
              </div>
              <p className="text-sm text-orange-700 mt-2">Please renew these documents to continue driving.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
