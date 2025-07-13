'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SystemDocsPage() {
  const [systemDocs, setSystemDocs] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('complete_schema');

  useEffect(() => {
    loadSystemDocumentation();
  }, []);

  const loadSystemDocumentation = async () => {
    try {
      setLoading(true);
      
      // Get all documents from _system collection
      const systemRef = collection(db, '_system');
      const snapshot = await getDocs(systemRef);
      
      const docs: any = {};
      for (const docSnap of snapshot.docs) {
        docs[docSnap.id] = docSnap.data();
      }
      
      setSystemDocs(docs);
    } catch (error: any) {
      setError(error.message);
      console.error('Error loading system documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return timestamp.toString();
  };

  const renderValue = (value: any, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className={value ? 'text-green-600' : 'text-red-600'}>{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }
    
    if (typeof value === 'string') {
      if (value.includes('timestamp') || value.includes('Timestamp')) {
        return <span className="text-purple-600">{value}</span>;
      }
      return <span className="text-gray-800">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      return (
        <div className={`${depth > 0 ? 'ml-4' : ''}`}>
          <span className="text-gray-600">[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {renderValue(item, depth + 1)}
              {index < value.length - 1 && <span className="text-gray-600">,</span>}
            </div>
          ))}
          <span className="text-gray-600">]</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      // Handle Firestore Timestamp
      if (value.toDate) {
        return <span className="text-purple-600">{formatTimestamp(value)}</span>;
      }
      
      return (
        <div className={`${depth > 0 ? 'ml-4' : ''}`}>
          <span className="text-gray-600">{'{'}</span>
          {Object.entries(value).map(([key, val], index, array) => (
            <div key={key} className="ml-4">
              <span className="text-indigo-600 font-medium">"{key}"</span>
              <span className="text-gray-600">: </span>
              {renderValue(val, depth + 1)}
              {index < array.length - 1 && <span className="text-gray-600">,</span>}
            </div>
          ))}
          <span className="text-gray-600">{'}'}</span>
        </div>
      );
    }
    
    return <span>{value.toString()}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">System Documentation</h1>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading system documentation...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!loading && Object.keys(systemDocs).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No system documentation found.</p>
            </div>
          )}

          {!loading && Object.keys(systemDocs).length > 0 && (
            <div className="space-y-6">
              {/* Document Selector */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Available Documentation ({Object.keys(systemDocs).length} documents)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(systemDocs).map((docId) => (
                    <button
                      key={docId}
                      onClick={() => setSelectedDoc(docId)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedDoc === docId
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {docId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Document Content */}
              {selectedDoc && systemDocs[selectedDoc] && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedDoc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {renderValue(systemDocs[selectedDoc])}
                    </pre>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              {systemDocs.complete_schema && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Collections</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {systemDocs.complete_schema.systemMetadata?.collectionsCount || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">Subcollections</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {systemDocs.complete_schema.systemMetadata?.subcollectionsCount || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Schema Version</h4>
                    <p className="text-lg font-bold text-purple-600">
                      {systemDocs.complete_schema.systemMetadata?.version || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800">Last Updated</h4>
                    <p className="text-sm font-medium text-orange-600">
                      {formatTimestamp(systemDocs.complete_schema.systemMetadata?.lastUpdated)}
                    </p>
                  </div>
                </div>
              )}

              {/* Collection Overview */}
              {systemDocs.collection_summary && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Collection Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(systemDocs.collection_summary.collections || {}).map(([name, info]: [string, any]) => (
                      <div key={name} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 capitalize">{name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{info.purpose}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="bg-gray-100 px-2 py-1 rounded">{info.type}</span>
                          <span className="text-gray-500">{info.subcollections} subcollections</span>
                        </div>
                        <div className="mt-2">
                          {info.keyFeatures?.map((feature: string, index: number) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2">About System Documentation:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complete database schema with field specifications</li>
              <li>• Collection relationships and data flow</li>
              <li>• TypeScript interfaces and validation rules</li>
              <li>• Development tools and test page references</li>
              <li>• Automatically updated when collections change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
