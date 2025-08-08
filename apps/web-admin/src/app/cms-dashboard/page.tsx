'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TagIcon,
  FolderIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Content types
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'private' | 'trash';
  author_name: string;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  deleted_at?: string;
}

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'private' | 'trash';
  author_name: string;
  show_in_navigation: boolean;
  navigation_label?: string;
  menu_order: number;
  created_at: string;
  deleted_at?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
}

interface CMSStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalPages: number;
  publishedPages: number;
  totalCategories: number;
  totalTags: number;
  totalViews: number;
  trashedPosts: number;
  trashedPages: number;
}

// Content creation types (kept for future use)
// interface CreateContentData {
//   title?: string;
//   content?: string;
//   excerpt?: string;
//   status?: 'draft' | 'published' | 'private' | 'trash';
//   is_featured?: boolean;
//   show_in_navigation?: boolean;
//   navigation_label?: string;
//   menu_order?: number;
//   name?: string; // For categories and tags
//   description?: string; // For categories and tags
//   author_name?: string; // For posts and pages
// }

export default function CMSDashboard() {
  // State management
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<CMSStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalPages: 0,
    publishedPages: 0,
    totalCategories: 0,
    totalTags: 0,
    totalViews: 0,
    trashedPosts: 0,
    trashedPages: 0,
  });
  const [activeTab, setActiveTab] = useState<'posts' | 'pages' | 'categories' | 'tags'>('posts');
  const [viewMode, setViewMode] = useState<'all' | 'published' | 'draft' | 'trash'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local UI state (simplified for visual demo)
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [selectedItem, setSelectedItem] = useState<BlogPost | StaticPage | Category | Tag | null>(null);

  // Load data function
  const loadCMSData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Loading CMS data...');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Welcome to Our New Food Delivery Platform',
          slug: 'welcome-to-our-new-food-delivery-platform',
          content: 'We are excited to announce the launch of our new food delivery platform...',
          excerpt: 'Announcing the launch of our new food delivery platform with amazing features.',
          status: 'published',
          author_name: 'Admin',
          view_count: 1234,
          is_featured: true,
          created_at: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          title: 'How to Choose the Best Restaurant',
          slug: 'how-to-choose-the-best-restaurant',
          content: 'Here are some tips for choosing the best restaurant for your needs...',
          excerpt: 'Tips and tricks for finding the perfect restaurant for any occasion.',
          status: 'published',
          author_name: 'John Smith',
          view_count: 856,
          is_featured: false,
          created_at: '2024-01-12T14:20:00Z',
        },
        {
          id: '3',
          title: 'Upcoming Features and Updates',
          slug: 'upcoming-features-and-updates',
          content: 'We have some exciting features coming soon...',
          excerpt: 'A preview of the exciting new features coming to our platform.',
          status: 'draft',
          author_name: 'Admin',
          view_count: 0,
          is_featured: false,
          created_at: '2024-01-18T09:15:00Z',
        },
      ];

      const mockPages: StaticPage[] = [
        {
          id: '1',
          title: 'About Us',
          slug: 'about-us',
          content: 'Learn more about our company and mission...',
          status: 'published',
          author_name: 'Admin',
          show_in_navigation: true,
          navigation_label: 'About',
          menu_order: 1,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          content: 'Our privacy policy and data handling practices...',
          status: 'published',
          author_name: 'Admin',
          show_in_navigation: false,
          menu_order: 2,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockCategories: Category[] = [
        { id: '1', name: 'Food Reviews', slug: 'food-reviews', description: 'Reviews of restaurants and dishes', post_count: 15 },
        { id: '2', name: 'Platform Updates', slug: 'platform-updates', description: 'News and updates about our platform', post_count: 8 },
        { id: '3', name: 'Cooking Tips', slug: 'cooking-tips', description: 'Tips and tricks for cooking at home', post_count: 12 },
      ];

      const mockTags: Tag[] = [
        { id: '1', name: 'delivery', slug: 'delivery', post_count: 25 },
        { id: '2', name: 'restaurants', slug: 'restaurants', post_count: 18 },
        { id: '3', name: 'food', slug: 'food', post_count: 32 },
        { id: '4', name: 'updates', slug: 'updates', post_count: 8 },
      ];

      // Calculate stats
      const totalViews = mockPosts.reduce((sum, post) => sum + (post.view_count || 0), 0);

      const newStats: CMSStats = {
        totalPosts: mockPosts.filter(p => !p.deleted_at).length,
        publishedPosts: mockPosts.filter(p => p.status === 'published' && !p.deleted_at).length,
        draftPosts: mockPosts.filter(p => p.status === 'draft' && !p.deleted_at).length,
        totalPages: mockPages.filter(p => !p.deleted_at).length,
        publishedPages: mockPages.filter(p => p.status === 'published' && !p.deleted_at).length,
        totalCategories: mockCategories.length,
        totalTags: mockTags.length,
        totalViews,
        trashedPosts: mockPosts.filter(p => p.deleted_at).length,
        trashedPages: mockPages.filter(p => p.deleted_at).length,
      };

      console.log('📊 Calculated stats:', newStats);

      // Update state
      setStats(newStats);

      // Filter content based on current view
      let filteredPosts = mockPosts;

      if (viewMode !== 'all') {
        if (viewMode === 'trash') {
          filteredPosts = filteredPosts.filter(p => p.deleted_at);
        } else {
          filteredPosts = filteredPosts.filter(p => p.status === viewMode && !p.deleted_at);
        }
      } else {
        filteredPosts = filteredPosts.filter(p => !p.deleted_at);
      }

      setPosts(filteredPosts);
      // setPages(filteredPages); // Simplified for demo

      console.log('✅ CMS data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading CMS data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load CMS data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when view changes
  useEffect(() => {
    loadCMSData();
  }, [viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle tab changes
  const handleTabChange = (tab: 'posts' | 'pages' | 'categories' | 'tags') => {
    setActiveTab(tab);
    if (error) setError(null);
  };

  // Handle view mode changes
  const handleViewModeChange = (mode: 'all' | 'published' | 'draft' | 'trash') => {
    setViewMode(mode);
    if (error) setError(null);
  };

  // Refresh data
  const handleRefresh = () => {
    loadCMSData();
  };

  // Simplified handlers for demo
  const handleEdit = (item: BlogPost | StaticPage | Category | Tag) => {
    console.log('Edit item:', item.id);
    const itemName = 'title' in item ? item.title : item.name;
    alert(`Edit functionality would open for: ${itemName}`);
  };

  // Handle move to trash (mock implementation)
  const handleMoveToTrash = async (item: BlogPost | StaticPage | Category | Tag) => {
    if (!confirm('Are you sure you want to move this item to trash?')) return;

    try {
      console.log('Moving to trash:', item.id);
      // Mock trash operation
      await new Promise(resolve => setTimeout(resolve, 500));
      setViewMode('trash');
      await loadCMSData();
      alert('Content moved to trash successfully! Switched to Trash view.');
    } catch (error) {
      console.error('❌ Error moving content to trash:', error);
      alert('Failed to move content to trash. Please try again.');
    }
  };

  // Handle restore from trash
  const handleRestoreFromTrash = async (item: BlogPost | StaticPage) => {
    if (!confirm('Are you sure you want to restore this item from trash?')) return;

    try {
      console.log('Restoring from trash:', item.id);
      // Mock restore operation
      await new Promise(resolve => setTimeout(resolve, 500));
      setViewMode('draft');
      await loadCMSData();
      alert('Content restored from trash successfully! Switched to Draft view.');
    } catch (error) {
      console.error('❌ Error restoring content from trash:', error);
      alert('Failed to restore content from trash. Please try again.');
    }
  };

  // Handle permanent delete
  const handlePermanentDelete = async (item: BlogPost | StaticPage) => {
    if (!confirm('⚠️ PERMANENT DELETE: This action cannot be undone! Are you absolutely sure?')) return;

    try {
      console.log('Permanently deleting:', item.id);
      // Mock permanent delete
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadCMSData();
      alert('Content permanently deleted!');
    } catch (error) {
      console.error('❌ Error permanently deleting content:', error);
      alert('Failed to permanently delete content. Please try again.');
    }
  };

  // Simplified for demo - removed updateContent function

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-orange-500 mr-3" />
              WordPress-Style CMS
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Powered by Supabase • Modern, Fast, Scalable
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="flex items-center space-x-2">
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-sm text-blue-600">Loading...</span>
                </>
              ) : error ? (
                <>
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600">Error: {error}</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Supabase Connected</span>
                </>
              )}
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {error && (
              <button
                onClick={() => setError(null)}
                className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                <span>Clear Error</span>
              </button>
            )}

            <button
              onClick={() => alert('Create New functionality would open here')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create New</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Blog Posts</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Published</h3>
                <p className="text-2xl font-bold text-green-600">{stats.publishedPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <PencilIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.draftPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pages</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.totalPages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <FolderIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Categories</h3>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TagIcon className="h-8 w-8 text-pink-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                <p className="text-2xl font-bold text-pink-600">{stats.totalTags}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <EyeIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                <p className="text-2xl font-bold text-orange-600">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Published Pages</h3>
                <p className="text-2xl font-bold text-teal-600">{stats.publishedPages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Blog Posts ({stats.totalPosts})</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('pages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pages'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Static Pages ({stats.totalPages})</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FolderIcon className="w-5 h-5" />
                  <span>Categories ({stats.totalCategories})</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('tags')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tags'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TagIcon className="w-5 h-5" />
                  <span>Tags ({stats.totalTags})</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Content Management Area */}
          <div className="p-6">
            {/* Filter Controls - WordPress Style */}
            {(activeTab === 'posts' || activeTab === 'pages') && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => handleViewModeChange('all')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'all'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      All ({activeTab === 'posts' ? stats.totalPosts : stats.totalPages})
                    </button>
                    <button
                      onClick={() => handleViewModeChange('published')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'published'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Published ({activeTab === 'posts' ? stats.publishedPosts : stats.publishedPages})
                    </button>
                    <button
                      onClick={() => handleViewModeChange('draft')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'draft'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Draft ({activeTab === 'posts' ? stats.draftPosts : stats.totalPages - stats.publishedPages})
                    </button>
                    <button
                      onClick={() => handleViewModeChange('trash')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'trash'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      🗑️ Trash ({activeTab === 'posts' ? stats.trashedPosts : stats.trashedPages})
                    </button>
                  </div>
                </div>

                {/* WordPress-style action info */}
                <div className="text-sm text-gray-500">
                  {viewMode === 'trash' ? (
                    <span className="text-orange-600">⚠️ Items in trash can be restored or permanently deleted</span>
                  ) : (
                    <span>
                      Showing {viewMode === 'all' ? 'all active' : viewMode} {activeTab}
                      {loading && <span className="ml-2 text-blue-600">• Loading...</span>}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Content Display */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading {activeTab === 'posts' ? 'posts' : activeTab === 'pages' ? 'pages' : activeTab}...
                </p>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">Error: {error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-2 text-xs text-red-700 underline hover:no-underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 mb-4">Failed to load content: {error}</p>
                <div className="space-x-4">
                  <button
                    onClick={handleRefresh}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Clear Error
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Blog Posts Tab */}
                {activeTab === 'posts' && (
                  <div>
                    {posts.length === 0 ? (
                      <div className="text-center py-12">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No blog posts found. Create your first post!</p>
                        <button
                          onClick={() => alert('Create First Post functionality would open here')}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Create First Post
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Author
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Views
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {posts.map((post) => (
                              <tr key={post.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                    <div className="text-sm text-gray-500">/{post.slug}</div>
                                    {post.is_featured && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    post.status === 'published'
                                      ? 'bg-green-100 text-green-800'
                                      : post.status === 'draft'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {post.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {post.author_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {post.view_count || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEdit(post)}
                                      className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                                      title="Edit Post"
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                    </button>
                                    {viewMode === 'trash' ? (
                                      <>
                                        <button
                                          onClick={() => handleRestoreFromTrash(post)}
                                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                          title="Restore from Trash"
                                        >
                                          <ArrowUturnLeftIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handlePermanentDelete(post)}
                                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                          title="Permanently Delete"
                                        >
                                          <XCircleIcon className="w-4 h-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => handleMoveToTrash(post)}
                                        className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                                        title="Move to Trash"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
