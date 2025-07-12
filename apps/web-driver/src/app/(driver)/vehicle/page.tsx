'use client';

import React, { useState } from 'react';
import {
  TruckIcon,
  DocumentTextIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon,
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

  const [documents] = useState([
    {
      id: '1',
      name: 'Vehicle Registration',
      status: 'verified',
      uploadDate: '2024-01-10',
      expiryDate: '2025-01-10',
    },
    {
      id: '2',
      name: 'Insurance Certificate',
      status: 'verified',
      uploadDate: '2024-01-05',
      expiryDate: '2024-12-31',
    },
    {
      id: '3',
      name: 'Driver License',
      status: 'verified',
      uploadDate: '2024-01-01',
      expiryDate: '2025-06-15',
    },
    {
      id: '4',
      name: 'Vehicle Inspection',
      status: 'pending',
      uploadDate: '2024-01-15',
      expiryDate: '2024-07-15',
    },
  ]);

  const handleSave = () => {
    console.log('Saving vehicle data:', vehicleData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Vehicle Info
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                {isEditing ? (
                  <select
                    value={vehicleData.type}
                    onChange={(e) => setVehicleData({...vehicleData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Car">Car</option>
                    <option value="Scooter">Scooter</option>
                  </select>
                ) : (
                  <div className="flex items-center">
                    <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{vehicleData.type}</span>
                  </div>
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
                  <span>{vehicleData.make}</span>
                )}
              </div>
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
                  <span>{vehicleData.model}</span>
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
                  <span>{vehicleData.year}</span>
                )}
              </div>
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
                  <span>{vehicleData.color}</span>
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
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{vehicleData.plateNumber}</span>
                )}
              </div>
            </div>
          </div>

          {/* Registration & Insurance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration & Insurance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <span className="font-mono">{vehicleData.registrationNumber}</span>
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
                  <span>{vehicleData.insuranceProvider}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Policy</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={vehicleData.insurancePolicy}
                    onChange={(e) => setVehicleData({...vehicleData, insurancePolicy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="font-mono">{vehicleData.insurancePolicy}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Expiry</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={vehicleData.insuranceExpiry}
                    onChange={(e) => setVehicleData({...vehicleData, insuranceExpiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={isExpiringSoon(vehicleData.insuranceExpiry) ? 'text-red-600 font-medium' : ''}>
                      {formatDate(vehicleData.insuranceExpiry)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Documents & Status */}
        <div className="space-y-6">
          {/* Vehicle Photo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Photo</h3>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-16 w-16 text-gray-400" />
              </div>
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mx-auto transition-colors">
                <CameraIcon className="h-4 w-4" />
                <span>Upload Photo</span>
              </button>
            </div>
          </div>

          {/* Document Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status</h3>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        Expires: {formatDate(doc.expiryDate)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📄 Upload Documents
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                🔄 Renew Insurance
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                🔧 Schedule Inspection
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📞 Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
