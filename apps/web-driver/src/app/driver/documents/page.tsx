'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  uploadDate: string;
  expiryDate?: string;
  fileSize: string;
  notes?: string;
}

export default function DriverDocuments() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Driver License',
      type: 'license',
      status: 'verified',
      uploadDate: '2024-01-01',
      expiryDate: '2025-06-15',
      fileSize: '2.1 MB',
    },
    {
      id: '2',
      name: 'Vehicle Registration',
      type: 'registration',
      status: 'verified',
      uploadDate: '2024-01-10',
      expiryDate: '2025-01-10',
      fileSize: '1.8 MB',
    },
    {
      id: '3',
      name: 'Insurance Certificate',
      type: 'insurance',
      status: 'verified',
      uploadDate: '2024-01-05',
      expiryDate: '2024-12-31',
      fileSize: '1.5 MB',
    },
    {
      id: '4',
      name: 'Vehicle Inspection Report',
      type: 'inspection',
      status: 'pending',
      uploadDate: '2024-01-15',
      expiryDate: '2024-07-15',
      fileSize: '3.2 MB',
      notes: 'Under review by admin team',
    },
    {
      id: '5',
      name: 'Background Check',
      type: 'background',
      status: 'verified',
      uploadDate: '2023-12-20',
      fileSize: '0.8 MB',
    },
    {
      id: '6',
      name: 'Profile Photo',
      type: 'photo',
      status: 'rejected',
      uploadDate: '2024-01-12',
      fileSize: '0.5 MB',
      notes: 'Photo quality too low. Please upload a clearer image.',
    },
  ]);

  const [uploadingFile, setUploadingFile] = useState(false);

  const requiredDocuments = [
    { type: 'license', name: 'Driver License', required: true },
    { type: 'registration', name: 'Vehicle Registration', required: true },
    { type: 'insurance', name: 'Insurance Certificate', required: true },
    { type: 'inspection', name: 'Vehicle Inspection', required: true },
    { type: 'background', name: 'Background Check', required: true },
    { type: 'photo', name: 'Profile Photo', required: true },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  };

  const handleFileUpload = (documentType: string) => {
    setUploadingFile(true);
    // Simulate file upload
    setTimeout(() => {
      console.log('Uploading document:', documentType);
      setUploadingFile(false);
    }, 2000);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const getDocumentStatus = (type: string) => {
    const doc = documents.find(d => d.type === type);
    return doc ? doc.status : 'missing';
  };

  const getCompletionRate = () => {
    const verifiedDocs = documents.filter(doc => doc.status === 'verified').length;
    return Math.round((verifiedDocs / requiredDocuments.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your driver and vehicle documents.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {getCompletionRate()}% Complete
          </div>
        </div>
      </div>

      {/* Document Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requiredDocuments.map((reqDoc) => {
            const status = getDocumentStatus(reqDoc.type);
            const doc = documents.find(d => d.type === reqDoc.type);
            
            return (
              <div key={reqDoc.type} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{reqDoc.name}</h4>
                  {getStatusIcon(status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status === 'missing' ? 'Not Uploaded' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  {status === 'missing' || status === 'rejected' ? (
                    <button
                      onClick={() => handleFileUpload(reqDoc.type)}
                      disabled={uploadingFile}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                      {uploadingFile ? 'Uploading...' : 'Upload'}
                    </button>
                  ) : (
                    doc?.expiryDate && (
                      <span className={`text-xs ${isExpiringSoon(doc.expiryDate) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        Expires {formatDate(doc.expiryDate)}
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload New Document */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Document</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h4>
          <p className="text-gray-500 mb-4">
            Drag and drop your files here, or click to browse
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Choose Files
            </button>
            <span className="text-sm text-gray-500">
              Supported: PDF, JPG, PNG (Max 5MB)
            </span>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {documents.map((document) => (
            <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{document.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">
                        Uploaded {formatDate(document.uploadDate)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{document.fileSize}</span>
                      {document.expiryDate && (
                        <>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3 text-gray-400" />
                            <span className={`text-sm ${isExpiringSoon(document.expiryDate) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              Expires {formatDate(document.expiryDate)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    {document.notes && (
                      <p className="text-sm text-gray-600 mt-1">{document.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)}`}>
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Requirements */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Document Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📄 Required Documents</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Valid driver&apos;s license</li>
              <li>• Vehicle registration certificate</li>
              <li>• Current insurance policy</li>
              <li>• Vehicle inspection report</li>
              <li>• Background check clearance</li>
              <li>• Clear profile photograph</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📝 Upload Guidelines</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Files must be clear and readable</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Accepted formats: PDF, JPG, PNG</li>
              <li>• Documents must be current and valid</li>
              <li>• No edited or altered documents</li>
              <li>• Processing time: 1-3 business days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
