'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MediaFile {
  id: string;
  filename: string;
  url?: string;
  size?: number;
  type?: string;
  createdAt?: string;
  alt?: string;
  title?: string;
  description?: string;
  mimeType?: string;
  filesize?: number;
  width?: number;
  height?: number;
  caption?: string;
  thumbnailURL?: string;
}

interface ImageViewModalProps {
  file: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function ImageViewModal({
  file,
  isOpen,
  onClose,
  onPrevious: _onPrevious,
  onNext: _onNext,
  hasPrevious: _hasPrevious = false,
  hasNext: _hasNext = false
}: ImageViewModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-90"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-6xl mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {file.filename}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Image Section */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 min-h-[400px]">
            <div className="relative max-w-full max-h-full">
              {file.url && (
                <Image
                  src={file.url}
                  alt={file.alt || file.filename}
                  width={file.width || 800}
                  height={file.height || 600}
                  className="max-w-full max-h-full object-contain rounded"
                  style={{ maxHeight: 'calc(90vh - 200px)' }}
                />
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="w-full lg:w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* File Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">File Information</h3>
                <div className="space-y-3">
                  {/* Filename */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filename
                    </label>
                    <p className="text-sm text-gray-900 break-all">{file.filename}</p>
                  </div>

                  {/* File Size */}
                  {file.size && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size
                      </label>
                      <p className="text-sm text-gray-900">{formatFileSize(file.size)}</p>
                    </div>
                  )}

                  {/* Dimensions */}
                  {file.width && file.height && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dimensions
                      </label>
                      <p className="text-sm text-gray-900">{file.width} × {file.height} pixels</p>
                    </div>
                  )}

                  {/* File Type */}
                  {file.type && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <p className="text-sm text-gray-900">{file.type}</p>
                    </div>
                  )}

                  {/* Upload Date */}
                  {file.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Uploaded
                      </label>
                      <p className="text-sm text-gray-900">{formatDate(file.createdAt)}</p>
                    </div>
                  )}

                  {/* Alt Text */}
                  {file.alt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alt Text
                      </label>
                      <p className="text-sm text-gray-900">{file.alt}</p>
                    </div>
                  )}

                  {/* Caption */}
                  {file.caption && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Caption
                      </label>
                      <p className="text-sm text-gray-900">{file.caption}</p>
                    </div>
                  )}

                  {/* File URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File URL
                    </label>
                    <input
                      type="text"
                      value={file.url || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
