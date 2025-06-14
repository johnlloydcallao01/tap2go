'use client';

import React, { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  uploadedAt: string;
  uploadedBy: string;
  folder: string;
  tags: string[];
  isUsed: boolean;
  usageCount: number;
}

interface MediaFolder {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
}

export default function AdminMediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  // Removed unused variable: showUploadModal

  useEffect(() => {
    const loadMediaData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockFolders: MediaFolder[] = [
          { id: '1', name: 'Restaurant Images', fileCount: 45, createdAt: '2024-01-01T00:00:00Z' },
          { id: '2', name: 'Menu Items', fileCount: 128, createdAt: '2024-01-02T00:00:00Z' },
          { id: '3', name: 'Promotional Banners', fileCount: 23, createdAt: '2024-01-03T00:00:00Z' },
          { id: '4', name: 'Blog Images', fileCount: 67, createdAt: '2024-01-04T00:00:00Z' },
          { id: '5', name: 'User Avatars', fileCount: 234, createdAt: '2024-01-05T00:00:00Z' },
        ];

        const mockFiles: MediaFile[] = [
          {
            id: '1',
            name: 'pizza-margherita.jpg',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
            thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
            size: 245760,
            dimensions: { width: 1200, height: 800 },
            uploadedAt: '2024-01-15T10:30:00Z',
            uploadedBy: 'John Smith',
            folder: 'Menu Items',
            tags: ['pizza', 'italian', 'food'],
            isUsed: true,
            usageCount: 5,
          },
          {
            id: '2',
            name: 'restaurant-interior.jpg',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
            thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
            size: 512000,
            dimensions: { width: 1600, height: 1200 },
            uploadedAt: '2024-01-14T18:45:00Z',
            uploadedBy: 'Lisa Wilson',
            folder: 'Restaurant Images',
            tags: ['interior', 'ambiance', 'dining'],
            isUsed: true,
            usageCount: 3,
          },
          {
            id: '3',
            name: 'promotional-banner.png',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
            thumbnail: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200',
            size: 1024000,
            dimensions: { width: 1920, height: 1080 },
            uploadedAt: '2024-01-14T14:20:00Z',
            uploadedBy: 'David Brown',
            folder: 'Promotional Banners',
            tags: ['promotion', 'banner', 'marketing'],
            isUsed: false,
            usageCount: 0,
          },
          {
            id: '4',
            name: 'cooking-video.mp4',
            type: 'video',
            url: '#',
            thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
            size: 15728640,
            uploadedAt: '2024-01-13T20:15:00Z',
            uploadedBy: 'Emily Rodriguez',
            folder: 'Blog Images',
            tags: ['cooking', 'video', 'tutorial'],
            isUsed: true,
            usageCount: 2,
          },
          {
            id: '5',
            name: 'menu-pdf.pdf',
            type: 'document',
            url: '#',
            size: 2048000,
            uploadedAt: '2024-01-13T16:30:00Z',
            uploadedBy: 'Mike Chen',
            folder: 'Restaurant Images',
            tags: ['menu', 'pdf', 'document'],
            isUsed: true,
            usageCount: 1,
          },
        ];

        setFolders(mockFolders);
        setMediaFiles(mockFiles);
      } catch (error) {
        console.error('Error loading media data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMediaData();
  }, []);

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesType = selectedType === 'all' || file.type === selectedType;
    
    return matchesSearch && matchesFolder && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return PhotoIcon;
      case 'video':
        return VideoCameraIcon;
      case 'document':
        return DocumentIcon;
      default:
        return DocumentIcon;
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkDelete = () => {
    setMediaFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage your images, videos, and documents.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => console.log('Upload modal would open')}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
          >
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            Upload Files
          </button>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center text-sm"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete ({selectedFiles.length})
            </button>
          )}
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
                {mediaFiles.filter(f => f.type === 'video').length}
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
                {mediaFiles.filter(f => f.type === 'document').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
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
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.name}>{folder.name}</option>
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
      </div>

      {/* Files Grid/List */}
      <div className="bg-white rounded-lg shadow border">
        {viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className={`relative group cursor-pointer border-2 rounded-lg p-3 hover:border-orange-300 ${
                      selectedFiles.includes(file.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>

                    {/* File Preview */}
                    <div className="aspect-square mb-2 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {file.type === 'image' && file.thumbnail ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={file.thumbnail}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </>
                      ) : (
                        <FileIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      {file.dimensions && (
                        <p className="text-xs text-gray-400">
                          {file.dimensions.width}×{file.dimensions.height}
                        </p>
                      )}
                    </div>

                    {/* Usage Badge */}
                    {file.isUsed && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                          Used
                        </span>
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <DocumentDuplicateIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
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
                      onChange={() => handleFileSelect(file.id)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />

                    <div className="flex-shrink-0">
                      {file.type === 'image' && file.thumbnail ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={file.thumbnail}
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded-lg"
                          />
                        </>
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        {file.dimensions && (
                          <span>{file.dimensions.width}×{file.dimensions.height}</span>
                        )}
                        <span>{file.folder}</span>
                        <span>Uploaded by {file.uploadedBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {file.isUsed && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Used ({file.usageCount})
                        </span>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-red-400 hover:text-red-600">
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
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => console.log('Upload modal would open')}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Upload Your First File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
