'use client';

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  type: 'license' | 'registration' | 'insurance' | 'inspection' | 'other';
  status: 'verified' | 'pending' | 'rejected';
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
  ]);

  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = (documentType: string) => {
    setUploadingDocument(documentType);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadingDocument(null);
          setUploadProgress(0);
          // Add a new document (in a real app, this would come from the server)
          const newDoc: Document = {
            id: `${documents.length + 1}`,
            name: `New ${documentType}`,
            type: documentType as Document['type'],
            status: 'pending',
            uploadDate: new Date().toISOString().split('T')[0],
            fileSize: '2.5 MB',
            notes: 'Newly uploaded, pending verification',
          };
          setDocuments([...documents, newDoc]);
        }, 500);
      }
    }, 300);
  };

  const deleteDocument = (documentId: string) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'license':
        return <DocumentTextIcon className="h-5 w-5 text-blue-600" />;
      case 'registration':
        return <DocumentTextIcon className="h-5 w-5 text-purple-600" />;
      case 'insurance':
        return <DocumentTextIcon className="h-5 w-5 text-green-600" />;
      case 'inspection':
        return <DocumentTextIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (dateString?: string) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate < today;
  };

  const getCompletionRate = () => {
    const requiredDocs = ['license', 'registration', 'insurance', 'inspection'];
    const verifiedDocs = documents.filter(doc => 
      requiredDocs.includes(doc.type) && doc.status === 'verified'
    );
    return Math.round((verifiedDocs.length / requiredDocs.length) * 100);
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

      {/* Document Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['license', 'registration', 'insurance', 'inspection'].map((docType) => {
            const existingDoc = documents.find(doc => doc.type === docType);
            const isUploading = uploadingDocument === docType;
            
            return (
              <div key={docType} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900 capitalize">{docType}</span>
                  {existingDoc && getStatusBadge(existingDoc.status)}
                </div>
                
                {existingDoc ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>
                        {existingDoc.expiryDate ? (
                          <>
                            Expires: {formatDate(existingDoc.expiryDate)}
                            {isExpiringSoon(existingDoc.expiryDate) && (
                              <span className="ml-2 text-orange-600 font-medium">Soon</span>
                            )}
                            {isExpired(existingDoc.expiryDate) && (
                              <span className="ml-2 text-red-600 font-medium">Expired</span>
                            )}
                          </>
                        ) : (
                          'No expiry date'
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => handleUpload(docType)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {isUploading ? (
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 text-center">{uploadProgress}% Uploading...</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpload(docType)}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4" />
                        <span>Upload</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
                    {getDocumentTypeIcon(document.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{document.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">Uploaded: {formatDate(document.uploadDate)}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{document.fileSize}</span>
                      {document.status === 'verified' && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {document.expiryDate && (
                              <>
                                Expires: {formatDate(document.expiryDate)}
                                {isExpiringSoon(document.expiryDate) && (
                                  <span className="ml-1 text-orange-600 font-medium">
                                    (Soon)
                                  </span>
                                )}
                                {isExpired(document.expiryDate) && (
                                  <span className="ml-1 text-red-600 font-medium">
                                    (Expired)
                                  </span>
                                )}
                              </>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                    {document.notes && (
                      <p className="text-sm text-gray-500 mt-1 italic">{document.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    {getStatusBadge(document.status)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteDocument(document.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {documents.some(doc => isExpiringSoon(doc.expiryDate) || isExpired(doc.expiryDate)) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-orange-900 mb-2">Document Alerts</h3>
              <div className="space-y-1">
                {documents.filter(doc => isExpired(doc.expiryDate)).map(doc => (
                  <p key={doc.id} className="text-sm text-red-700">
                    • {doc.name} expired on {formatDate(doc.expiryDate)}
                  </p>
                ))}
                {documents.filter(doc => isExpiringSoon(doc.expiryDate) && !isExpired(doc.expiryDate)).map(doc => (
                  <p key={doc.id} className="text-sm text-orange-700">
                    • {doc.name} expires on {formatDate(doc.expiryDate)}
                  </p>
                ))}
              </div>
              <p className="text-sm text-orange-700 mt-2">
                Please update your documents to maintain your driver status.
              </p>
            </div>
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h3>
          <p className="text-gray-500 mb-6">
            You haven&apos;t uploaded any documents yet. Please upload required documents to start driving.
          </p>
          <button
            onClick={() => handleUpload('license')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Upload First Document
          </button>
        </div>
      )}
    </div>
  );
}
