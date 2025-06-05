/**
 * Neon Database Test Component
 * Admin component to test and manage Neon PostgreSQL connection
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, DatabaseIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DatabaseInfo {
  isConnected: boolean;
  version?: string;
  size?: string;
  tableCount?: number;
  tables?: string[];
  connectionString?: string;
}

interface TestResult {
  success: boolean;
  message: string;
  data?: DatabaseInfo;
  error?: string;
}

export default function NeonDatabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);

  // Test database connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/neon/test');
      const result = await response.json();
      
      setTestResult(result);
      if (result.success && result.data) {
        setDbInfo(result.data.database);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/neon/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      const result = await response.json();
      setTestResult(result);
      
      // Refresh connection info after schema operations
      if (result.success && (action === 'create_schema' || action === 'drop_schema')) {
        setTimeout(() => testConnection(), 1000);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Failed to execute ${action}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testQuery = () => executeAction('test_query');
  const createSchema = () => executeAction('create_schema');
  const dropSchema = () => {
    if (confirm('Are you sure you want to drop the CMS schema? This will delete all CMS data!')) {
      executeAction('drop_schema');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <DatabaseIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Neon PostgreSQL Database</h2>
        </div>
        
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          ) : (
            <PlayIcon className="h-4 w-4 mr-2" />
          )}
          Test Connection
        </button>
      </div>

      {/* Connection Status */}
      {testResult && (
        <div className={`mb-6 p-4 rounded-md ${
          testResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {testResult.success ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className={`font-medium ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.message}
            </span>
          </div>
          
          {testResult.error && (
            <p className="mt-2 text-sm text-red-700">{testResult.error}</p>
          )}
        </div>
      )}

      {/* Database Information */}
      {dbInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Database Information</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`text-sm font-medium ${
                  dbInfo.isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {dbInfo.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {dbInfo.version && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Version:</span>
                  <span className="text-sm text-gray-900">{dbInfo.version.split(' ')[1]}</span>
                </div>
              )}
              
              {dbInfo.size && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Size:</span>
                  <span className="text-sm text-gray-900">{dbInfo.size}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tables:</span>
                <span className="text-sm text-gray-900">{dbInfo.tableCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Connection Details</h3>
            
            {dbInfo.connectionString && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600 font-mono break-all">
                  {dbInfo.connectionString}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tables List */}
      {dbInfo?.tables && dbInfo.tables.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Database Tables</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {dbInfo.tables.map((table) => (
              <div
                key={table}
                className="bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-700 font-mono"
              >
                {table}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={testQuery}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <PlayIcon className="h-4 w-4 mr-2" />
          Test Query
        </button>

        <button
          onClick={createSchema}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <DatabaseIcon className="h-4 w-4 mr-2" />
          Create CMS Schema
        </button>

        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={dropSchema}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Drop Schema (Dev Only)
          </button>
        )}
      </div>

      {/* Environment Variables Check */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Environment Configuration</h4>
        <div className="space-y-1 text-sm text-yellow-700">
          <div className="flex justify-between">
            <span>DATABASE_URL:</span>
            <span className={process.env.DATABASE_URL ? 'text-green-600' : 'text-red-600'}>
              {process.env.DATABASE_URL ? '✓ Configured' : '✗ Missing'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>DATABASE_SSL:</span>
            <span className="text-gray-600">
              {process.env.DATABASE_SSL || 'true (default)'}
            </span>
          </div>
        </div>
        
        {!process.env.DATABASE_URL && (
          <p className="mt-2 text-sm text-yellow-700">
            Please add your Neon database URL to .env.local to enable CMS features.
          </p>
        )}
      </div>
    </div>
  );
}
