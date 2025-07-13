/**
 * Create Folder Modal Component
 * Simple modal for creating new folders in the media library
 */

import React, { useState } from 'react';
import { XMarkIcon, FolderIcon } from '@heroicons/react/24/outline';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => Promise<void>;
}

export default function CreateFolderModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await onCreate(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Create folder error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create folder');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setName('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FolderIcon className="h-6 w-6 text-blue-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Create New Folder</h3>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={creating}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Name *
                  </label>
                  <input
                    id="folder-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter folder name"
                    disabled={creating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="folder-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="folder-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter folder description"
                    disabled={creating}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={!name.trim() || creating}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                  !name.trim() || creating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {creating ? 'Creating...' : 'Create Folder'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={creating}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
