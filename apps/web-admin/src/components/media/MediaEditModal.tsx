'use client';

import React, { useState, useEffect } from 'react';
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

interface MediaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: MediaFile | null;
  onUpdate: (updatedFile: MediaFile) => void;
}

export default function MediaEditModal({ isOpen, onClose, file, onUpdate }: MediaEditModalProps) {
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setAlt(file.alt || '');
      setCaption(file.caption || '');
      setError(null);
    }
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual API call when backend is ready
      const updatedFile: MediaFile = {
        ...file,
        alt: alt.trim(),
        caption: caption.trim(),
      };
      
      onUpdate(updatedFile);
      onClose();
    } catch (error) {
      console.error('Failed to update media file:', error);
      setError(error instanceof Error ? error.message : 'Failed to update file');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Media</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* File Preview */}
          <div className="mb-6">
            <div className="flex items-start space-x-4">
              {file.mimeType?.startsWith('image/') && file.url ? (
                <div className="relative w-32 h-32 rounded-lg border overflow-hidden">
                  <Image
                    src={file.url}
                    alt={file.alt || file.filename || 'Image'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Preview not available</span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {file.filename}
                </h3>
                <div className="mt-1 text-sm text-gray-500 space-y-1">
                  <p>Type: {file.mimeType}</p>
                  {file.filesize && <p>Size: {Math.round(file.filesize / 1024)} KB</p>}
                  {file.width && file.height && (
                    <p>Dimensions: {file.width} × {file.height}</p>
                  )}
                  <p>Uploaded: {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="alt" className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                id="alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe this image for accessibility"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Used by screen readers and when the image fails to load
              </p>
            </div>

            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Optional caption or description"
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
