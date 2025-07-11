/**
 * Media File Details Modal
 * View and edit media file metadata
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { MediaFile } from '@/lib/services/mediaLibraryService';

interface MediaFileUpdateData {
  alt_text?: string;
  caption?: string;
  description?: string;
  title?: string;
  visibility?: 'public' | 'private' | 'restricted';
}

interface MediaFileModalProps {
  file: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, updates: MediaFileUpdateData) => Promise<MediaFile>;
  onDelete: (id: number, userId: string, hardDelete?: boolean) => Promise<boolean>;
}

export default function MediaFileModal({
  file,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: MediaFileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    alt_text: '',
    caption: '',
    description: '',
    title: '',
    visibility: 'public' as 'public' | 'private' | 'restricted',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (file) {
      setFormData({
        alt_text: file.alt_text || '',
        caption: file.caption || '',
        description: file.description || '',
        title: file.title || '',
        visibility: file.visibility,
      });
    }
  }, [file]);

  const handleSave = async () => {
    if (!file) return;

    setSaving(true);
    try {
      await onUpdate(file.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating file:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!file) return;

    const confirmMessage = `Are you sure you want to permanently delete "${file.filename}"?\n\nThis action will:\n• Remove the file from your database\n• Delete the file from Cloudinary storage\n• This action CANNOT be undone\n\nType "DELETE" to confirm:`;

    const userInput = prompt(confirmMessage);

    if (userInput !== 'DELETE') {
      if (userInput !== null) {
        alert('Deletion cancelled. You must type "DELETE" exactly to confirm.');
      }
      return;
    }

    setDeleting(true);
    try {
      const success = await onDelete(file.id, 'admin-user', true); // true = hard delete
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Media File Details</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Edit metadata"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => window.open(file.file_url, '_blank')}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="View full size"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-red-400 hover:text-red-600"
                  title="Delete file"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Preview */}
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                  {file.mime_type.startsWith('image/') ? (
                    <Image
                      src={file.file_url}
                      alt={file.alt_text || file.filename}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl text-gray-400 mb-2">📄</div>
                      <p className="text-sm text-gray-600">{file.filename}</p>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">File Size:</span>
                    <span className="font-medium">{formatFileSize(file.file_size)}</span>
                  </div>
                  {file.width && file.height && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimensions:</span>
                      <span className="font-medium">{file.width} × {file.height}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{file.mime_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uploaded:</span>
                    <span className="font-medium">{formatDate(file.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uploaded by:</span>
                    <span className="font-medium">{file.uploaded_by}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Folder:</span>
                    <span className="font-medium">{file.folder_name || 'Root'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Usage:</span>
                    <span className={`font-medium ${file.is_used ? 'text-green-600' : 'text-gray-600'}`}>
                      {file.is_used ? `Used (${file.usage_count})` : 'Not used'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata Form */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Metadata</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filename
                    </label>
                    <input
                      type="text"
                      value={file.filename}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50"
                      placeholder="Enter a title for this file"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50"
                      placeholder="Describe this image for accessibility"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption
                    </label>
                    <input
                      type="text"
                      value={formData.caption}
                      onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50"
                      placeholder="Add a caption"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50"
                      placeholder="Add a detailed description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visibility
                    </label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' | 'private' | 'restricted' }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={saving}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
