'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  VideoCameraIcon,
  DocumentIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import type { MediaFile } from '@/lib/services/mediaLibraryService';
import CreateFolderModal from '@/components/admin/CreateFolderModal';
import MediaFileModal from '@/components/admin/MediaFileModal';
import ImageViewModal from '@/components/admin/media/ImageViewModal';

export default function AdminMediaLibrary() {
  const {
    files: mediaFiles,
    folders,
    loading,
    error,
    pagination,
    uploadProgress,
    fetchFiles,
    uploadFiles,
    deleteFile,
    updateFile,
    createFolder,
    clearError,
  } = useMediaLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'created_at' | 'filename' | 'file_size' | 'usage_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [hoveredFile, setHoveredFile] = useState<number | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [viewingFile, setViewingFile] = useState<MediaFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search and filter files
  const applyFilters = useCallback((options: { page?: number } = {}) => {
    const page = options.page || 1;
    setCurrentPage(page);

    fetchFiles(
      {
        query: searchQuery || undefined,
        folder_id: selectedFolder === 'all' ? undefined : selectedFolder,
        file_type: selectedType === 'all' ? undefined : selectedType,
      },
      {
        page,
        limit: 20,
        sort_by: sortBy,
        sort_order: sortOrder,
      }
    );
  }, [searchQuery, selectedFolder, selectedType, sortBy, sortOrder, fetchFiles]);

  // Load files on component mount
  useEffect(() => {
    applyFilters({ page: 1 });
  }, [applyFilters]); // Include applyFilters in dependency array

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    applyFilters({ page: 1 });
  }, [applyFilters]);

  const handleFolderFilter = useCallback((folderId: number | 'all') => {
    setSelectedFolder(folderId);
    applyFilters({ page: 1 });
  }, [applyFilters]);

  const handleTypeFilter = useCallback((type: string) => {
    setSelectedType(type);
    applyFilters({ page: 1 });
  }, [applyFilters]);

  const handleSortChange = useCallback((newSortBy: typeof sortBy, newSortOrder?: typeof sortOrder) => {
    setSortBy(newSortBy);
    if (newSortOrder) setSortOrder(newSortOrder);
    applyFilters({ page: 1 });
  }, [applyFilters]);

  const handlePageChange = useCallback((page: number) => {
    applyFilters({ page });
  }, [applyFilters]);



  const handleUpload = useCallback(async (files: File[]) => {
    try {
      const results = await uploadFiles(files, {
        folder: selectedFolder === 'all' ? undefined : folders.find(f => f.id === selectedFolder)?.name,
        uploaded_by: 'admin-user',
        visibility: 'public',
      });

      // Check if any uploads were successful
      const successfulUploads = results.filter(result => result.status === 'fulfilled');

      if (successfulUploads.length > 0) {
        console.log(`✅ Successfully uploaded ${successfulUploads.length} file(s)`);

        // If we have filters applied, refresh the file list to ensure consistency
        if (searchQuery || selectedFolder !== 'all' || selectedType !== 'all') {
          console.log('🔄 Refreshing file list due to active filters...');
          applyFilters({ page: currentPage });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [uploadFiles, selectedFolder, folders, searchQuery, selectedType, applyFilters, currentPage]);

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleUpload(files);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles);
    }
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    noClick: true, // We'll handle clicks manually
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    onDropAccepted: () => setIsDragOver(false),
    onDropRejected: () => setIsDragOver(false),
  });

  const handleCreateFolder = async (name: string, description?: string) => {
    try {
      await createFolder(name, undefined, description, 'admin-user');
      setShowCreateFolderModal(false);
    } catch (error) {
      console.error('Create folder error:', error);
    }
  };



  const handleFileAction = (file: MediaFile, action: 'view' | 'copy' | 'delete') => {
    switch (action) {
      case 'view':
        // Use image view modal for images, regular modal for other files
        if (file.mime_type.startsWith('image/')) {
          handleImageView(file);
        } else {
          setSelectedFile(file);
          setShowFileModal(true);
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(file.file_url);
        // You could add a toast notification here
        break;
      case 'delete':
        handleDeleteFile(file);
        break;
    }
  };

  const handleDeleteFile = async (file: MediaFile) => {
    const confirmMessage = `Are you sure you want to permanently delete "${file.filename}"?\n\nThis action will:\n• Remove the file from your database\n• Delete the file from Cloudinary storage\n• This action CANNOT be undone\n\nType "DELETE" to confirm:`;

    const userInput = prompt(confirmMessage);

    if (userInput === 'DELETE') {
      try {
        console.log('🗑️ Starting hard delete for:', file.filename);
        const success = await deleteFile(file.id, 'admin-user', true); // true = hard delete

        if (success) {
          console.log('✅ File permanently deleted successfully');
          // Show success message (you could add a toast notification here)
        }
      } catch (error) {
        console.error('❌ Delete failed:', error);
        alert('Failed to delete file. Please try again.');
      }
    } else if (userInput !== null) {
      alert('Deletion cancelled. You must type "DELETE" exactly to confirm.');
    }
  };

  const handleDeleteSelectedFiles = async () => {
    if (selectedFiles.length === 0) return;

    const fileNames = selectedFiles.map(id => {
      const file = mediaFiles.find(f => f.id === id);
      return file?.filename || 'Unknown';
    }).join(', ');

    const confirmMessage = `Are you sure you want to permanently delete ${selectedFiles.length} file(s)?\n\nFiles: ${fileNames}\n\nThis action will:\n• Remove the files from your database\n• Delete the files from Cloudinary storage\n• This action CANNOT be undone\n\nType "DELETE" to confirm:`;

    const userInput = prompt(confirmMessage);

    if (userInput === 'DELETE') {
      try {
        console.log('🗑️ Starting bulk hard delete for:', selectedFiles.length, 'files');

        for (const fileId of selectedFiles) {
          const success = await deleteFile(fileId, 'admin-user', true);
          if (!success) {
            console.error('❌ Failed to delete file:', fileId);
          }
        }

        setSelectedFiles([]);
        console.log('✅ Bulk delete completed');
      } catch (error) {
        console.error('❌ Bulk delete failed:', error);
        alert('Failed to delete some files. Please try again.');
      }
    } else if (userInput !== null) {
      alert('Deletion cancelled. You must type "DELETE" exactly to confirm.');
    }
  };

  const handleSelectFile = (fileId: number) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === mediaFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(mediaFiles.map(f => f.id));
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  const handleImageView = (file: MediaFile) => {
    setViewingFile(file);
    setShowImageViewModal(true);
  };

  const handlePreviousImage = () => {
    if (!viewingFile) return;
    const currentIndex = mediaFiles.findIndex(f => f.id === viewingFile.id);
    if (currentIndex > 0) {
      setViewingFile(mediaFiles[currentIndex - 1]);
    }
  };

  const handleNextImage = () => {
    if (!viewingFile) return;
    const currentIndex = mediaFiles.findIndex(f => f.id === viewingFile.id);
    if (currentIndex < mediaFiles.length - 1) {
      setViewingFile(mediaFiles[currentIndex + 1]);
    }
  };



  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return PhotoIcon;
    if (mimeType.startsWith('video/')) return VideoCameraIcon;
    return DocumentIcon;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading media library</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div {...getRootProps()} className={`space-y-6 ${isDragActive || isDragOver ? 'bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg p-4' : ''}`}>
      <input {...getInputProps()} />

      {/* Drag Overlay */}
      {(isDragActive || isDragOver) && (
        <div className="fixed inset-0 z-40 bg-orange-100 bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <CloudArrowUpIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-orange-700">Drop files here to upload</p>
            <p className="text-orange-600">Supports images, videos, PDFs, and documents</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm lg:text-base text-gray-600">
            Manage your images, videos, and documents. Drag & drop files anywhere to upload.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
          >
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            Upload Files
          </button>
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Folder
          </button>

        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PhotoIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-lg font-semibold text-gray-900">{mediaFiles.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FolderIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Folders</p>
              <p className="text-lg font-semibold text-gray-900">{folders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <VideoCameraIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Videos</p>
              <p className="text-lg font-semibold text-gray-900">
                {mediaFiles.filter(f => f.mime_type.startsWith('video/')).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DocumentIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-lg font-semibold text-gray-900">
                {mediaFiles.filter(f => !f.mime_type.startsWith('image/') && !f.mime_type.startsWith('video/')).length}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                {selectedFiles.length === mediaFiles.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const firstSelected = mediaFiles.find(f => selectedFiles.includes(f.id));
                  if (firstSelected) {
                    if (firstSelected.mime_type.startsWith('image/')) {
                      handleImageView(firstSelected);
                    } else {
                      setSelectedFile(firstSelected);
                      setShowFileModal(true);
                    }
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                title="View first selected"
              >
                <EyeIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  const firstSelected = mediaFiles.find(f => selectedFiles.includes(f.id));
                  if (firstSelected) {
                    setSelectedFile(firstSelected);
                    setShowFileModal(true);
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                title="Edit first selected"
              >
                <PencilIcon className="h-5 w-5" />
              </button>

              <button
                onClick={handleDeleteSelectedFiles}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
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
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Folder Filter */}
            <div className="flex items-center space-x-2">
              <FolderIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedFolder}
                onChange={(e) => handleFolderFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
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
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                  handleSortChange(newSortBy, newSortOrder);
                }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="filename-asc">Name A-Z</option>
                <option value="filename-desc">Name Z-A</option>
                <option value="file_size-desc">Largest First</option>
                <option value="file_size-asc">Smallest First</option>
                <option value="usage_count-desc">Most Used</option>
                <option value="usage_count-asc">Least Used</option>
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
              {mediaFiles.map((file) => (
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

                  <Image
                    src={file.file_url}
                    alt={file.filename}
                    width={300}
                    height={160}
                    className="w-full h-40 object-cover rounded"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {mediaFiles.map((file) => {
              const FileIcon = getFileIcon(file.mime_type);
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
                      {file.mime_type.startsWith('image/') && file.thumbnail_url ? (
                        <Image
                          src={file.thumbnail_url}
                          alt={file.alt_text || file.filename}
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
                        <span>{formatFileSize(file.file_size)}</span>
                        {file.width && file.height && (
                          <span>{file.width}×{file.height}</span>
                        )}
                        <span>{file.folder_name || 'Root'}</span>
                        <span>Uploaded by {file.uploaded_by}</span>
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {file.is_used && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Used ({file.usage_count})
                        </span>
                      )}
                      <button
                        onClick={() => handleFileAction(file, 'view')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
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

        {mediaFiles.length === 0 && (
          <div className="p-12 text-center">
            <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria, or upload your first file.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Upload Your First File
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(currentPage - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Display */}
      {uploadProgress.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Upload Progress</h4>
          <div className="space-y-2">
            {uploadProgress.map((upload, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </span>
                  <span className={`text-xs ${
                    upload.status === 'success' ? 'text-green-600' :
                    upload.status === 'error' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {upload.status === 'uploading' && `${upload.progress}%`}
                    {upload.status === 'success' && '✅ Uploaded'}
                    {upload.status === 'error' && '❌ Failed'}
                  </span>
                </div>
                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-orange-500 h-1 rounded-full transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
                {upload.status === 'error' && upload.error && (
                  <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreate={handleCreateFolder}
      />

      {/* Media File Details Modal */}
      <MediaFileModal
        file={selectedFile}
        isOpen={showFileModal}
        onClose={() => {
          setShowFileModal(false);
          setSelectedFile(null);
        }}
        onUpdate={updateFile}
        onDelete={deleteFile}
      />

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
        hasPrevious={viewingFile ? mediaFiles.findIndex(f => f.id === viewingFile.id) > 0 : false}
        hasNext={viewingFile ? mediaFiles.findIndex(f => f.id === viewingFile.id) < mediaFiles.length - 1 : false}
      />
    </div>
  );
}
