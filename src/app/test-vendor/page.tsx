'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser } from '@/lib/database/users';
import { createVendor } from '@/lib/database/vendors';
import { useRouter } from 'next/navigation';

export default function TestVendorPage() {
  const [formData, setFormData] = useState({
    email: 'vendor@example.com',
    password: 'TestPassword123!',
    businessName: 'Test Restaurant',
    contactPerson: 'John Doe',
    contactPhone: '+1-555-0123',
    businessEmail: 'business@example.com',
    businessType: 'restaurant',
    businessRegistrationNumber: 'REG123456789',
    taxId: 'TAX987654321'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const testVendorRegistration = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Create user document in users collection
      await createUser(user.uid, {
        email: formData.email,
        role: 'vendor',
        isActive: true,
        isVerified: false,
      });

      // 3. Create vendor document in vendors collection
      await createVendor(user.uid, {
        userRef: `users/${user.uid}`,
        businessName: formData.businessName,
        businessType: formData.businessType as "restaurant" | "grocery" | "pharmacy" | "convenience",
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        businessEmail: formData.businessEmail,
        businessRegistrationNumber: formData.businessRegistrationNumber,
        taxId: formData.taxId,
        status: 'pending_approval',
        verificationStatus: 'pending',
        verificationDocuments: {
          businessLicense: 'https://storage.example.com/docs/business_license.pdf',
          taxCertificate: 'https://storage.example.com/docs/tax_cert.pdf',
          ownerIdCard: 'https://storage.example.com/docs/owner_id.pdf',
          bankStatement: 'https://storage.example.com/docs/bank_statement.pdf'
        },
        commissionRate: 15.0,
        payoutDetailsRef: `payouts/${user.uid}`,
      });

      setResult({
        success: true,
        vendorUid: user.uid,
        email: formData.email,
        businessName: formData.businessName,
        status: 'pending_approval'
      });

      console.log('Vendor registration successful!', { uid: user.uid });
      
    } catch (error: any) {
      setError(error.message);
      console.error('Vendor registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Vendor Registration</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Type
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="restaurant">Restaurant</option>
                <option value="grocery">Grocery</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="convenience">Convenience</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Registration Number
              </label>
              <input
                type="text"
                name="businessRegistrationNumber"
                value={formData.businessRegistrationNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID
              </label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            onClick={testVendorRegistration}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Vendor Account...' : 'Test Vendor Registration'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-700">✅ Vendor Registration Successful!</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="font-medium text-green-800 mb-2">Registration Details:</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Vendor UID:</strong> {result.vendorUid}</p>
                  <p><strong>Email:</strong> {result.email}</p>
                  <p><strong>Business Name:</strong> {result.businessName}</p>
                  <p><strong>Status:</strong> {result.status}</p>
                  <p><strong>Collections Created:</strong></p>
                  <ul className="ml-4 list-disc">
                    <li>users/{result.vendorUid}</li>
                    <li>vendors/{result.vendorUid}</li>
                    <li>vendors/{result.vendorUid}/modifierGroups (ready)</li>
                    <li>vendors/{result.vendorUid}/masterMenuItems (ready)</li>
                    <li>vendors/{result.vendorUid}/masterMenuAssignments (ready)</li>
                    <li>vendors/{result.vendorUid}/auditLogs (ready)</li>
                    <li>vendors/{result.vendorUid}/analytics (ready)</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/vendor/dashboard')}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Go to Vendor Dashboard
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2">Test Information:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• This page tests vendor registration functionality</li>
              <li>• Creates user account with role "vendor"</li>
              <li>• Creates vendor business profile</li>
              <li>• Sets up all vendor subcollections</li>
              <li>• Status starts as "pending_approval"</li>
              <li>• Ready for admin approval workflow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
