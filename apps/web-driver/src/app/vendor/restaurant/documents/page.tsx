'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface BusinessDocument {
  id: string;
  name: string;
  type: 'business_license' | 'food_permit' | 'tax_certificate' | 'insurance' | 'other';
  fileName: string;
  fileSize: number;
  uploadDate: string;
  expiryDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  notes?: string;
}

const mockDocuments: BusinessDocument[] = [
  {
    id: '1',
    name: 'Business Registration Certificate',
    type: 'business_license',
    fileName: 'business_registration_2024.pdf',
    fileSize: 2048576,
    uploadDate: '2024-01-15',
    expiryDate: '2025-01-15',
    status: 'approved',
  },
  {
    id: '2',
    name: 'Food Service License',
    type: 'food_permit',
    fileName: 'food_service_license.pdf',
    fileSize: 1536000,
    uploadDate: '2024-01-20',
    expiryDate: '2024-12-31',
    status: 'approved',
  },
  {
    id: '3',
    name: 'Tax Identification Number',
    type: 'tax_certificate',
    fileName: 'tin_certificate.pdf',
    fileSize: 1024000,
    uploadDate: '2024-01-10',
    status: 'approved',
  },
  {
    id: '4',
    name: 'General Liability Insurance',
    type: 'insurance',
    fileName: 'liability_insurance_2024.pdf',
    fileSize: 3072000,
    uploadDate: '2024-02-01',
    expiryDate: '2025-02-01',
    status: 'pending',
    notes: 'Under review by compliance team',
  },
  {
    id: '5',
    name: 'Fire Safety Certificate',
    type: 'other',
    fileName: 'fire_safety_cert.pdf',
    fileSize: 896000,
    uploadDate: '2023-12-15',
    expiryDate: '2024-12-15',
    status: 'expired',
    notes: 'Document has expired. Please upload renewed certificate.',
  },
];

const documentTypes = [
  { value: 'business_license', label: 'Business License' },
  { value: 'food_permit', label: 'Food Service Permit' },
  { value: 'tax_certificate', label: 'Tax Certificate' },
  { value: 'insurance', label: 'Insurance Document' },
  { value: 'other', label: 'Other Document' },
];

export default function VendorBusinessDocuments() {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);


  useEffect(() => {
    const loadDocuments = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDocuments(mockDocuments);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'rejected':
      case 'expired':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Documents</h1>
              <p className="text-gray-600">Manage your restaurant&apos;s legal and compliance documents</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/restaurant" className="btn-secondary">
                Back to Restaurant
              </Link>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary flex items-center"
              >
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => isExpiringSoon(d.expiryDate)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.status === 'expired').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Document Library</h2>
          <p className="text-gray-600 mt-1">All your uploaded business documents</p>
        </div>
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 btn-primary"
              >
                Upload Your First Document
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-600">{doc.fileName}</p>
                          <p className="text-sm text-gray-600">{formatFileSize(doc.fileSize)}</p>
                          <p className="text-sm text-gray-600">
                            Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                          {doc.expiryDate && (
                            <p className={`text-sm ${
                              isExpiringSoon(doc.expiryDate) ? 'text-orange-600 font-medium' : 'text-gray-600'
                            }`}>
                              Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {doc.notes && (
                          <p className="text-sm text-gray-500 mt-1">{doc.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        <span className="ml-1 capitalize">{doc.status}</span>
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {isExpiringSoon(doc.expiryDate) && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 text-orange-600 mr-2" />
                        <p className="text-sm text-orange-800">
                          This document expires soon. Please upload a renewed version.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Required Documents Checklist */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Required Documents Checklist</h2>
          <p className="text-gray-600 mt-1">Ensure you have all necessary documents for compliance</p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {documentTypes.map((type) => {
              const hasDocument = documents.some(d => d.type === type.value && d.status === 'approved');
              return (
                <div key={type.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {hasDocument ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                    )}
                    <span className={`font-medium ${hasDocument ? 'text-green-900' : 'text-gray-900'}`}>
                      {type.label}
                    </span>
                  </div>
                  {!hasDocument && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      Upload
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
            <p className="text-gray-600 mb-4">Document upload functionality will be implemented here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
