'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Image from 'next/image';
import ImageViewModal from '@/components/media/ImageViewModal';
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
} from '@heroicons/react/24/outline';

interface MediaFile {
  id: string;
  filename: string;
  file_url: string;
  thumbnail_url?: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  folder_name?: string;
  uploaded_by: string;
  created_at: string;
  is_used: boolean;
  usage_count: number;
}

interface Folder {
  id: number;
  name: string;
  file_count: number;
}

export default function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [viewingFile, setViewingFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    const loadMediaLibrary = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockFolders: Folder[] = [
          { id: 1, name: 'Restaurant Images', file_count: 45 },
          { id: 2, name: 'Promotional Banners', file_count: 12 },
          { id: 3, name: 'Food Categories', file_count: 28 },
          { id: 4, name: 'User Avatars', file_count: 156 },
        ];

        const mockFiles: MediaFile[] = [
          {
            id: '1',
            filename: 'pizza-margherita.jpg',
            file_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
            thumbnail_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
            mime_type: 'image/jpeg',
            file_size: 245760,
            width: 800,
            height: 600,
            alt_text: 'Delicious Margherita Pizza',
            folder_name: 'Restaurant Images',
            uploaded_by: 'John Smith',
            created_at: '2024-01-15T10:30:00Z',
            is_used: true,
            usage_count: 5,
          },
          {
            id: '2',
            filename: 'burger-special.jpg',
            file_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
            thumbnail_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200',
            mime_type: 'image/jpeg',
            file_size: 189432,
            width: 800,
            height: 600,
            alt_text: 'Special Burger with Fries',
            folder_name: 'Restaurant Images',
            uploaded_by: 'Lisa Wilson',
            created_at: '2024-01-14T14:20:00Z',
            is_used: true,
            usage_count: 3,
          },
          {
            id: '3',
            filename: 'sushi-platter.jpg',
            file_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
            thumbnail_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200',
            mime_type: 'image/jpeg',
            file_size: 312890,
            width: 800,
            height: 600,
            alt_text: 'Fresh Sushi Platter',
            folder_name: 'Restaurant Images',
            uploaded_by: 'Mike Johnson',
            created_at: '2024-01-13T16:45:00Z',
            is_used: false,
            usage_count: 0,
          },
          {
            id: '4',
            filename: 'promo-banner-new-year.jpg',
            file_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
            thumbnail_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200',
            mime_type: 'image/jpeg',
            file_size: 456123,
            width: 1200,
            height: 400,
            alt_text: 'New Year Promotion Banner',
            folder_name: 'Promotional Banners',
            uploaded_by: 'Sarah Davis',
            created_at: '2024-01-12T11:15:00Z',
            is_used: true,
            usage_count: 8,
          },
          {
            id: '5',
            filename: 'pasta-carbonara.jpg',
            file_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
            thumbnail_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=200',
            mime_type: 'image/jpeg',
            file_size: 278945,
            width: 800,
            height: 600,
            alt_text: 'Creamy Pasta Carbonara',
            folder_name: 'Restaurant Images',
            uploaded_by: 'David Brown',
            created_at: '2024-01-11T09:30:00Z',
            is_used: true,
            usage_count: 2,
          },
          {
            id: '6',
            filename: 'dessert-tiramisu.jpg',
            file_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
            thumbnail_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200',
            mime_type: 'image/jpeg',
            file_size: 198765,
            width: 800,
            height: 600,
            alt_text: 'Classic Tiramisu Dessert',
            folder_name: 'Restaurant Images',
            uploaded_by: 'Emily Rodriguez',
            created_at: '2024-01-10T15:20:00Z',
            is_used: false,
            usage_count: 0,
          },
        ];

        setFolders(mockFolders);
        setMediaFiles(mockFiles);
      } catch (error) {
        console.error('Error loading media library:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMediaLibrary();
  }, []);

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (file.alt_text && file.alt_text.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder === 'all' || file.folder_name === folders.find(f => f.id === selectedFolder)?.name;
    const matchesType = selectedType === 'all' ||
                       (selectedType === 'image' && file.mime_type.startsWith('image/')) ||
                       (selectedType === 'video' && file.mime_type.startsWith('video/')) ||
                       (selectedType === 'document' && !file.mime_type.startsWith('image/') && !file.mime_type.startsWith('video/'));
    
    return matchesSearch && matchesFolder && matchesType;
  });

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
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

  const handleFileAction = (file: MediaFile, action: 'view' | 'copy' | 'delete') => {
    switch (action) {
      case 'view':
        // Use image view modal for images, regular modal for other files
        if (file.mime_type.startsWith('image/')) {
          handleImageView(file);
        } else {
          // For non-images, just show a simple alert for now
          alert(`Viewing ${file.filename}\nType: ${file.mime_type}\nSize: ${formatFileSize(file.file_size)}`);
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(file.file_url);
        // You could add a toast notification here
        break;
      case 'delete':
        // Just show confirmation for now
        if (confirm(`Are you sure you want to delete ${file.filename}?`)) {
          console.log('Delete file:', file.id);
        }
        break;
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
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return PhotoIcon;
    if (mimeType.startsWith('video/')) return VideoCameraIcon;
    return DocumentIcon;
  };

  if (loading) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
            />
            <button className="bg-orange-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm lg:text-base">
              <CloudArrowUpIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Upload Files
            </button>
            <button className="bg-blue-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-600 flex items-center text-sm lg:text-base">
              <PlusIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
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
                <button className="text-sm text-orange-600 hover:text-orange-700">
                  {selectedFiles.length === mediaFiles.length ? 'Deselect All' : 'Select All'}
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
                  onClick={() => {
                    if (selectedFiles.length > 0) {
                      if (confirm(`Are you sure you want to delete ${selectedFiles.length} selected file(s)?`)) {
                        console.log('Delete selected files:', selectedFiles);
                        setSelectedFiles([]);
                      }
                    }
                  }}
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
              {filteredFiles.map((file) => {
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

          {filteredFiles.length === 0 && (
            <div className="p-12 text-center">
              <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria, or upload your first file.</p>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                Upload Your First File
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
      </div>
    </AdminLayout>
  );
}
