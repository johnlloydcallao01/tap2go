'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageViewModal from '@/components/media/ImageViewModal';
import MediaEditModal from '@/components/media/MediaEditModal';
import { mediaAPI, MediaFile, formatFileSize } from '@/lib/api/media';
import {
  PhotoIcon,
  FolderIcon,
  VideoCameraIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// MediaFile interface is now imported from the API client

interface Folder {
  id: number;
  name: string;
  file_count: number;
}

export default function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [hoveredFile, setHoveredFile] = useState<number | null>(null);
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [viewingFile, setViewingFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    const loadMediaLibrary = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load media files from CMS API
        const mediaResponse = await mediaAPI.getMediaFiles({ limit: 100 });
        setMediaFiles(mediaResponse.docs);

        // For now, we'll use mock folders since PayloadCMS doesn't have folder structure by default
        const mockFolders: Folder[] = [
          { id: 1, name: 'All Files', file_count: mediaResponse.totalDocs },
          { id: 2, name: 'Images', file_count: mediaResponse.docs.filter(f => f.mimeType?.startsWith('image/')).length },
          { id: 3, name: 'Videos', file_count: mediaResponse.docs.filter(f => f.mimeType?.startsWith('video/')).length },
          { id: 4, name: 'Documents', file_count: mediaResponse.docs.filter(f => f.mimeType && !f.mimeType.startsWith('image/') && !f.mimeType.startsWith('video/')).length },
        ];
        setFolders(mockFolders);

      } catch (error) {
        console.error('Error loading media library:', error);
        setError(error instanceof Error ? error.message : 'Failed to load media library');
      } finally {
        setLoading(false);
      }
    };

    loadMediaLibrary();
  }, []);

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = (file.filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (file.alt && file.alt.toLowerCase().includes(searchQuery.toLowerCase()));

    // For now, ignore folder filtering since we don't have folder structure in PayloadCMS
    const matchesFolder = selectedFolder === 'all' || selectedFolder === 1; // All Files

    const matchesType = selectedType === 'all' ||
                       (selectedType === 'image' && file.mimeType?.startsWith('image/')) ||
                       (selectedType === 'video' && file.mimeType?.startsWith('video/')) ||
                       (selectedType === 'document' && file.mimeType && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/'));

    return matchesSearch && matchesFolder && matchesType;
  });

  const handleSelectFile = (fileId: number) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  const handleSelectAll = () => {
    // Check if all currently visible (filtered) files are selected
    const filteredFileIds = filteredFiles.map(file => file.id);
    const allFilteredSelected = filteredFileIds.every(id => selectedFiles.includes(id));

    if (allFilteredSelected && filteredFileIds.length > 0) {
      // If all filtered files are selected, deselect them
      setSelectedFiles(prev => prev.filter(id => !filteredFileIds.includes(id)));
    } else {
      // Select all filtered files (merge with existing selection)
      setSelectedFiles(prev => {
        const newSelection = [...prev];
        filteredFileIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleImageView = (file: MediaFile) => {
    setViewingFile(file);
    setShowImageViewModal(true);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    try {
      setError(null);
      setUploading(true);

      // Process files one by one for better UX
      for (const file of Array.from(files)) {
        try {
          // Create temporary file object for immediate UI feedback
          const tempFile: MediaFile = {
            id: Date.now() + Math.random(), // Temporary ID
            filename: file.name,
            mimeType: file.type,
            filesize: file.size,
            url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined, // Only create preview for images
            alt: '',
            caption: `Uploading...`,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };

          // Add to UI immediately with uploading state
          setMediaFiles(prev => [tempFile, ...prev]);

          // Upload the actual file
          const metadata = {
            caption: `Uploaded on ${new Date().toLocaleDateString()}`,
          };
          const uploadedFile = await mediaAPI.uploadFile(file, metadata);

          // Replace temporary file with actual uploaded file
          setMediaFiles(prev =>
            prev.map(f => f.id === tempFile.id ? uploadedFile : f)
          );

          // Clean up temporary URL if it exists
          if (tempFile.url) {
            URL.revokeObjectURL(tempFile.url);
          }

        } catch (error) {
          console.error('Upload failed for file:', file.name, error);
          // Remove failed file from UI
          setMediaFiles(prev => prev.filter(f => f.filename !== file.name));
          setError(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Upload process failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePreviousImage = () => {
    if (!viewingFile) return;
    const currentIndex = filteredFiles.findIndex(f => f.id === viewingFile.id);
    if (currentIndex > 0) {
      setViewingFile(filteredFiles[currentIndex - 1]);
    }
  };

  const handleNextImage = () => {
    if (!viewingFile) return;
    const currentIndex = filteredFiles.findIndex(f => f.id === viewingFile.id);
    if (currentIndex < filteredFiles.length - 1) {
      setViewingFile(filteredFiles[currentIndex + 1]);
    }
  };

  const handleFileAction = async (file: MediaFile, action: 'view' | 'copy' | 'edit' | 'delete') => {
    switch (action) {
      case 'view':
        // Use image view modal for images, regular modal for other files
        if (file.mimeType?.startsWith('image/')) {
          handleImageView(file);
        } else {
          // For non-images, just show a simple alert for now
          alert(`Viewing ${file.filename}\nType: ${file.mimeType}\nSize: ${formatFileSize(file.filesize || 0)}`);
        }
        break;
      case 'copy':
        if (file.url) {
          navigator.clipboard.writeText(file.url);
        }
        break;
      case 'edit':
        setEditingFile(file);
        setShowEditModal(true);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${file.filename}"?\n\nThis will permanently remove the file from both the media library and Cloudinary storage.`)) {
          try {
            // Optimistically remove from UI first
            setMediaFiles(prev => prev.filter(f => f.id !== file.id));

            // Then delete from server
            await mediaAPI.deleteMediaFile(file.id);
          } catch (error) {
            console.error('Delete failed:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete file');

            // Restore file to UI if deletion failed
            setMediaFiles(prev => [...prev, file].sort((a, b) => b.id - a.id));
          }
        }
        break;
    }
  };

  const handleFileUpdate = (updatedFile: MediaFile) => {
    setMediaFiles(prev =>
      prev.map(file => file.id === updatedFile.id ? updatedFile : file)
    );
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    const fileNames = selectedFiles.map(id => {
      const file = mediaFiles.find(f => f.id === id);
      return file?.filename || `File ${id}`;
    }).join(', ');

    if (confirm(`Are you sure you want to delete ${selectedFiles.length} selected file(s)?\n\nFiles: ${fileNames}\n\nThis will permanently remove the files from both the media library and Cloudinary storage.`)) {
      const errors: string[] = [];
      const failedFiles: MediaFile[] = [];

      try {
        // Optimistically remove all selected files from UI first
        const filesToDelete = mediaFiles.filter(f => selectedFiles.includes(f.id));
        setMediaFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
        setSelectedFiles([]);

        // Delete files one by one to handle individual errors
        for (const fileId of selectedFiles) {
          try {
            await mediaAPI.deleteMediaFile(fileId);
          } catch (error) {
            const file = filesToDelete.find(f => f.id === fileId);
            if (file) {
              failedFiles.push(file);
              errors.push(`${file.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }

        // Restore failed files to UI
        if (failedFiles.length > 0) {
          setMediaFiles(prev => [...failedFiles, ...prev].sort((a, b) => b.id - a.id));
        }

        // Show errors if any
        if (errors.length > 0) {
          setError(`Some files could not be deleted:\n${errors.join('\n')}`);
        }

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Bulk delete failed');
      }
    }
  };

  const refreshMediaLibrary = async () => {
    try {
      setLoading(true);
      setError(null);

      const mediaResponse = await mediaAPI.getMediaFiles({ limit: 100 });
      setMediaFiles(mediaResponse.docs);

      // Update folder counts
      const mockFolders: Folder[] = [
        { id: 1, name: 'All Files', file_count: mediaResponse.totalDocs },
        { id: 2, name: 'Images', file_count: mediaResponse.docs.filter(f => f.mimeType?.startsWith('image/')).length },
        { id: 3, name: 'Videos', file_count: mediaResponse.docs.filter(f => f.mimeType?.startsWith('video/')).length },
        { id: 4, name: 'Documents', file_count: mediaResponse.docs.filter(f => f.mimeType && !f.mimeType.startsWith('image/') && !f.mimeType.startsWith('video/')).length },
      ];
      setFolders(mockFolders);
    } catch (error) {
      console.error('Error refreshing media library:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh media library');
    } finally {
      setLoading(false);
    }
  };

  // formatFileSize is imported from the API client

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return PhotoIcon;
    if (mimeType?.startsWith('video/')) return VideoCameraIcon;
    return DocumentIcon;
  };

  // Enterprise approach: Backend provides correct Cloudinary URLs in file.url
  // No complex URL resolution needed - just use the standard url field

  if (loading) {
    return (
      <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-300 rounded-lg h-40"></div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage your images, videos, and documents.</p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
              className="bg-orange-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-orange-300 flex items-center text-sm lg:text-base"
            >
              <CloudArrowUpIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
            <button className="bg-blue-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-600 flex items-center text-sm lg:text-base">
              <PlusIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              New Folder
            </button>
            <button
              onClick={refreshMediaLibrary}
              disabled={loading}
              className="bg-gray-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-300 flex items-center text-sm lg:text-base"
              title="Refresh media library"
            >
              <ArrowPathIcon className={`h-4 w-4 lg:h-5 lg:w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="bg-red-100 px-2 py-1 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                    onClick={() => setError(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters or Selection Bar */}
        <div className="bg-white p-4 rounded-lg shadow border mb-6">
          {selectedFiles.length > 0 ? (
            /* Selection Bar */
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">
                  {selectedFiles.length} item{selectedFiles.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  {(() => {
                    const filteredFileIds = filteredFiles.map(file => file.id);
                    const allFilteredSelected = filteredFileIds.every(id => selectedFiles.includes(id)) && filteredFileIds.length > 0;
                    return allFilteredSelected ? 'Deselect All' : 'Select All';
                  })()}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const firstSelected = filteredFiles.find(f => selectedFiles.includes(f.id));
                    if (firstSelected) {
                      handleFileAction(firstSelected, 'view');
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  title="View first selected"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md" title="Edit first selected">
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedFiles.length === 0 || loading}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete selected"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={clearSelection}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                  title="Clear selection"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Normal Filters */
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files by name or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Folder Filter */}
              <div className="flex items-center space-x-2">
                <FolderIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Folders</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Files Grid/List */}
        <div className="bg-white rounded-lg shadow border">
          {viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`relative border rounded-lg cursor-pointer hover:border-orange-300 transition-all duration-200 group ${
                      selectedFiles.includes(file.id) ? 'border-orange-500 bg-orange-50' : ''
                    }`}
                    onMouseEnter={() => setHoveredFile(file.id)}
                    onMouseLeave={() => setHoveredFile(null)}
                    onClick={(e) => {
                      // If clicking on checkbox area, don't trigger image view
                      if ((e.target as HTMLElement).closest('.checkbox-area')) {
                        return;
                      }
                      handleImageView(file);
                    }}
                  >
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-lg z-5"></div>

                    {/* Checkbox with circular clickable area */}
                    <div
                      className={`checkbox-area absolute top-1 left-1 z-10 ${
                        hoveredFile === file.id || selectedFiles.includes(file.id) ? 'opacity-100' : 'opacity-0'
                      } transition-opacity`}
                    >
                      <div
                        className="w-8 h-8 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFile(file.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => {}} // Handled by parent div click
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded bg-white shadow-sm pointer-events-none"
                        />
                      </div>
                    </div>

                    {file.mimeType?.startsWith('image/') && file.url ? (
                      <Image
                        src={file.url}
                        alt={file.alt || file.filename || 'Image'}
                        width={300}
                        height={160}
                        className="w-full h-40 object-cover rounded"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center">
                        {(() => {
                          const FileIcon = getFileIcon(file.mimeType || '');
                          return <FileIcon className="h-12 w-12 text-gray-400" />;
                        })()}
                        <div className="ml-2 text-center">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.filesize || 0)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.mimeType || '');
                return (
                  <div
                    key={file.id}
                    className={`p-4 hover:bg-gray-50 ${
                      selectedFiles.includes(file.id) ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleSelectFile(file.id)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />

                      <div className="flex-shrink-0">
                        {file.mimeType?.startsWith('image/') && file.url ? (
                          <Image
                            src={file.thumbnailURL || file.url}
                            alt={file.alt || file.filename || 'Image'}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover rounded-lg"
                            unoptimized
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatFileSize(file.filesize || 0)}</span>
                          {file.width && file.height && (
                            <span>{file.width}×{file.height}</span>
                          )}
                          <span>All Files</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFileAction(file, 'view')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFileAction(file, 'edit')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Edit metadata"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFileAction(file, 'copy')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Copy URL"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFileAction(file, 'delete')}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Delete file"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredFiles.length === 0 && (
            <div className="p-12 text-center">
              <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria, or upload your first file.</p>
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-orange-300"
              >
                {uploading ? 'Uploading...' : 'Upload Your First File'}
              </button>
            </div>
          )}
        </div>

        {/* Image View Modal */}
        <ImageViewModal
          file={viewingFile}
          isOpen={showImageViewModal}
          onClose={() => {
            setShowImageViewModal(false);
            setViewingFile(null);
          }}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
          hasPrevious={viewingFile ? filteredFiles.findIndex(f => f.id === viewingFile.id) > 0 : false}
          hasNext={viewingFile ? filteredFiles.findIndex(f => f.id === viewingFile.id) < filteredFiles.length - 1 : false}
        />

        {/* Media Edit Modal */}
        <MediaEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingFile(null);
          }}
          file={editingFile}
          onUpdate={handleFileUpdate}
        />
      </div>
  );
}
