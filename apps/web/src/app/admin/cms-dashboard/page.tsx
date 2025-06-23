'use client';

import React from 'react';

import { useState, useEffect, useCallback } from 'react';
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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BlogPostOps, StaticPageOps, CategoryOps, TagOps } from '@/lib/supabase/cms-operations';
import { generateSlug, calculateReadingTime, extractExcerpt } from '@/lib/supabase/cms-operations';
import { useAuth } from '@/contexts/AuthContext';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setActiveTab,
  setViewMode,
  setLoading,
  setPosts,
  setPages,
  setCategories,
  setTags,
  setStats,
  setError,
  clearError,
  selectCMSPosts,
  selectCMSPages,
  selectCMSCategories,
  selectCMSTags,
  selectCMSStats,
  selectCMSActiveTab,
  selectCMSViewMode,
  selectCMSError,
  selectIsLoading,
  type BlogPost,
  type StaticPage,
  type Category,
  type Tag
} from '@/store/slices/cmsSliceSimple';

// Content creation types
interface CreateContentData {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'private' | 'trash';
  is_featured?: boolean;
  show_in_navigation?: boolean;
  navigation_label?: string;
  menu_order?: number;
  name?: string; // For categories and tags
  description?: string; // For categories and tags
  author_name?: string; // For posts and pages
}

export default function CMSDashboard() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // Redux state
  const posts = useAppSelector(selectCMSPosts);
  const pages = useAppSelector(selectCMSPages);
  const categories = useAppSelector(selectCMSCategories);
  const tags = useAppSelector(selectCMSTags);
  const stats = useAppSelector(selectCMSStats);
  const activeTab = useAppSelector(selectCMSActiveTab);
  const viewMode = useAppSelector(selectCMSViewMode);
  const error = useAppSelector(selectCMSError);
  const isLoading = useAppSelector(selectIsLoading);

  // Local UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BlogPost | StaticPage | Category | Tag | null>(null);

  // Load data function
  const loadCMSData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      console.log('🚀 Loading CMS data...');

      // Load all data INCLUDING trashed items for accurate stats
      const [allPosts, allPages, allCategories, allTags] = await Promise.all([
        BlogPostOps.getAllPostsIncludingTrashed(1000),
        StaticPageOps.getAllPagesIncludingTrashed(),
        CategoryOps.getAllCategories(),
        TagOps.getAllTags()
      ]);

      // Calculate stats
      const totalViews = allPosts?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;

      // Debug: Log the actual data
      console.log('📊 Raw data loaded:', {
        totalPostsLoaded: allPosts?.length || 0,
        totalPagesLoaded: allPages?.length || 0,
        postsWithDeletedAt: allPosts?.filter(p => p.deleted_at).length || 0,
        pagesWithDeletedAt: allPages?.filter(p => p.deleted_at).length || 0,
      });

      const newStats = {
        totalPosts: allPosts?.filter(p => !p.deleted_at).length || 0,
        publishedPosts: allPosts?.filter(p => p.status === 'published' && !p.deleted_at).length || 0,
        draftPosts: allPosts?.filter(p => p.status === 'draft' && !p.deleted_at).length || 0,
        totalPages: allPages?.filter(p => !p.deleted_at).length || 0,
        publishedPages: allPages?.filter(p => p.status === 'published' && !p.deleted_at).length || 0,
        totalCategories: allCategories?.length || 0,
        totalTags: allTags?.length || 0,
        totalViews,
        trashedPosts: allPosts?.filter(p => p.deleted_at).length || 0,
        trashedPages: allPages?.filter(p => p.deleted_at).length || 0,
      };

      console.log('📊 Calculated stats:', newStats);

      // Update Redux state
      dispatch(setStats(newStats));
      dispatch(setCategories(allCategories || []));
      dispatch(setTags(allTags || []));

      // Filter content based on current view
      let filteredPosts = allPosts || [];
      let filteredPages = allPages || [];

      console.log('🔍 Filtering content:', {
        viewMode,
        totalPosts: filteredPosts.length,
        totalPages: filteredPages.length,
        trashedPosts: filteredPosts.filter(p => p.deleted_at).length,
        trashedPages: filteredPages.filter(p => p.deleted_at).length
      });

      if (viewMode !== 'all') {
        if (viewMode === 'trash') {
          filteredPosts = filteredPosts.filter(p => p.deleted_at);
          filteredPages = filteredPages.filter(p => p.deleted_at);
          console.log('📋 Trash view - filtered:', { posts: filteredPosts.length, pages: filteredPages.length });
        } else {
          filteredPosts = filteredPosts.filter(p => p.status === viewMode && !p.deleted_at);
          filteredPages = filteredPages.filter(p => p.status === viewMode && !p.deleted_at);
          console.log(`📋 ${viewMode} view - filtered:`, { posts: filteredPosts.length, pages: filteredPages.length });
        }
      } else {
        filteredPosts = filteredPosts.filter(p => !p.deleted_at);
        filteredPages = filteredPages.filter(p => !p.deleted_at);
        console.log('📋 All view - filtered (active only):', { posts: filteredPosts.length, pages: filteredPages.length });
      }

      dispatch(setPosts(filteredPosts));
      dispatch(setPages(filteredPages));

      console.log('✅ CMS data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading CMS data:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to load CMS data'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, viewMode]);

  // Load data on component mount and when view changes
  useEffect(() => {
    loadCMSData();
  }, [loadCMSData]);

  // Handle tab changes
  const handleTabChange = (tab: 'posts' | 'pages' | 'categories' | 'tags') => {
    dispatch(setActiveTab(tab));
    if (error) dispatch(clearError());
  };

  // Handle view mode changes
  const handleViewModeChange = (mode: 'all' | 'published' | 'draft' | 'trash') => {
    dispatch(setViewMode(mode));
    if (error) dispatch(clearError());
  };

  // Refresh data
  const handleRefresh = () => {
    loadCMSData();
  };

  // Create new content using Supabase operations
  const createContent = async (contentData: CreateContentData) => {
    try {
      let result;

      if (activeTab === 'posts') {
        // Generate slug and reading time
        const slug = generateSlug(contentData.title || 'untitled');
        const readingTime = calculateReadingTime(contentData.content || '');
        const excerpt = contentData.excerpt || extractExcerpt(contentData.content || '');

        result = await BlogPostOps.createPost({
          ...contentData,
          slug,
          reading_time: readingTime,
          excerpt,
          author_name: 'Admin', // You can get this from auth context
          status: contentData.status || 'draft'
        });
      } else if (activeTab === 'pages') {
        const slug = generateSlug(contentData.title || 'untitled');
        result = await StaticPageOps.createPage({
          ...contentData,
          slug,
          author_name: 'Admin',
          status: (contentData.status as 'draft' | 'published' | 'private' | 'trash') || 'draft'
        });
      } else if (activeTab === 'categories') {
        const slug = generateSlug(contentData.name || 'untitled');
        result = await CategoryOps.createCategory({
          ...contentData,
          slug
        });
      } else if (activeTab === 'tags') {
        const slug = generateSlug(contentData.name || 'untitled');
        result = await TagOps.createTag({
          ...contentData,
          slug
        });
      }

      if (result) {
        console.log('✅ Content created successfully');
        // Reload data
        await loadCMSData();
        setShowCreateModal(false);
        alert('Content created successfully!');
      }
    } catch (error) {
      console.error('❌ Error creating content:', error);
      alert('Failed to create content. Please try again.');
    }
  };

  // Handle edit content
  const handleEdit = (item: BlogPost | StaticPage | Category | Tag) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // Handle move to trash (WordPress-style soft delete)
  const handleMoveToTrash = async (item: BlogPost | StaticPage | Category | Tag) => {
    if (!confirm('Are you sure you want to move this item to trash?')) return;

    try {
      if (activeTab === 'posts') {
        await BlogPostOps.moveToTrash(item.id, user?.id);
      } else if (activeTab === 'pages') {
        await StaticPageOps.moveToTrash(item.id, user?.id);
      }

      console.log('✅ Content moved to trash successfully');

      // Switch to trash view to show the moved item
      dispatch(setViewMode('trash'));

      // Reload data
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
      if (activeTab === 'posts') {
        await BlogPostOps.restoreFromTrash(item.id, 'draft');
      } else if (activeTab === 'pages') {
        await StaticPageOps.restoreFromTrash(item.id, 'draft');
      }

      console.log('✅ Content restored from trash successfully');

      // Switch to draft view to show the restored item
      dispatch(setViewMode('draft'));

      // Reload data
      await loadCMSData();
      alert('Content restored from trash successfully! Switched to Draft view.');
    } catch (error) {
      console.error('❌ Error restoring content from trash:', error);
      alert('Failed to restore content from trash. Please try again.');
    }
  };

  // Handle permanent delete (hard delete)
  const handlePermanentDelete = async (item: BlogPost | StaticPage) => {
    if (!confirm('⚠️ PERMANENT DELETE: This action cannot be undone! Are you absolutely sure?')) return;

    try {
      if (activeTab === 'posts') {
        await BlogPostOps.permanentDelete(item.id);
      } else if (activeTab === 'pages') {
        await StaticPageOps.permanentDelete(item.id);
      }

      console.log('✅ Content permanently deleted');
      // Reload data
      await loadCMSData();
      alert('Content permanently deleted!');
    } catch (error) {
      console.error('❌ Error permanently deleting content:', error);
      alert('Failed to permanently delete content. Please try again.');
    }
  };



  // Update content
  const updateContent = async (contentData: CreateContentData) => {
    if (!selectedItem) return;

    try {
      let result;

      if (activeTab === 'posts') {
        result = await BlogPostOps.updatePost(selectedItem.id, {
          ...contentData,
          reading_time: calculateReadingTime(contentData.content || ''),
          excerpt: contentData.excerpt || extractExcerpt(contentData.content || '')
        });
      } else if (activeTab === 'pages') {
        result = await StaticPageOps.updatePage(selectedItem.id, {
          ...contentData,
          status: (contentData.status as 'draft' | 'published' | 'private' | 'trash') || 'draft'
        });
      }

      if (result) {
        console.log('✅ Content updated successfully');
        // Reload data
        await loadCMSData();
        setShowEditModal(false);
        setSelectedItem(null);
        alert('Content updated successfully!');
      }
    } catch (error) {
      console.error('❌ Error updating content:', error);
      alert('Failed to update content. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            {React.createElement(DocumentTextIcon as any, { className: "w-8 h-8 text-orange-500 mr-3" })}
            WordPress-Style CMS
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Powered by Supabase • Modern, Fast, Scalable
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* System Status */}
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <>
                {React.createElement(ArrowPathIcon as any, { className: "w-5 h-5 text-blue-500 animate-spin" })}
                <span className="text-sm text-blue-600">Loading...</span>
              </>
            ) : error ? (
              <>
                {React.createElement(ExclamationTriangleIcon as any, { className: "w-5 h-5 text-red-500" })}
                <span className="text-sm text-red-600">Error: {error}</span>
              </>
            ) : (
              <>
                {React.createElement(CheckCircleIcon as any, { className: "w-5 h-5 text-green-500" })}
                <span className="text-sm text-gray-600">Supabase Connected</span>
              </>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {error && (
            <button
              onClick={() => dispatch(clearError())}
              className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              {React.createElement(XCircleIcon as any, { className: "w-4 h-4" })}
              <span>Clear Error</span>
            </button>
          )}



          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700 transition-colors"
          >
            {React.createElement(PlusIcon as any, { className: "w-5 h-5" })}
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            {React.createElement(DocumentTextIcon as any, { className: "h-8 w-8 text-blue-600" })}
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Blog Posts</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            {React.createElement(CheckCircleIcon as any, { className: "h-8 w-8 text-green-600" })}
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Published</h3>
              <p className="text-2xl font-bold text-green-600">{stats.publishedPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            {React.createElement(PencilIcon as any, { className: "h-8 w-8 text-yellow-600" })}
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.draftPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            {React.createElement(DocumentTextIcon as any, { className: "h-8 w-8 text-purple-600" })}
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pages</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.totalPages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            {React.createElement(FolderIcon as any, { className: "h-8 w-8 text-indigo-600" })}
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Categories</h3>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalCategories}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            {React.createElement(TagIcon as any, { className: "h-8 w-8 text-pink-600" })}
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Tags</h3>
              <p className="text-2xl font-bold text-pink-600">{stats.totalTags}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            {React.createElement(EyeIcon as any, { className: "h-8 w-8 text-orange-600" })}
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
              <p className="text-2xl font-bold text-orange-600">{stats.totalViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            {React.createElement(ChartBarIcon as any, { className: "h-8 w-8 text-teal-600" })}
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
                {React.createElement(DocumentTextIcon as any, { className: "w-5 h-5" })}
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
                {React.createElement(DocumentTextIcon as any, { className: "w-5 h-5" })}
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
                {React.createElement(FolderIcon as any, { className: "w-5 h-5" })}
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
                {React.createElement(TagIcon as any, { className: "w-5 h-5" })}
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
                    {isLoading && <span className="ml-2 text-blue-600">• Loading...</span>}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Content Display */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">
                Loading {activeTab === 'posts' ? 'posts' : activeTab === 'pages' ? 'pages' : activeTab}...
              </p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Error: {error}</p>
                  <button
                    onClick={() => dispatch(clearError())}
                    className="mt-2 text-xs text-red-700 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              {React.createElement(ExclamationTriangleIcon as any, { className: "w-12 h-12 text-red-400 mx-auto mb-4" })}
              <p className="text-red-600 mb-4">Failed to load content: {error}</p>
              <div className="space-x-4">
                <button
                  onClick={handleRefresh}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => dispatch(clearError())}
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
                      {React.createElement(DocumentTextIcon as any, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" })}
                      <p className="text-gray-500 mb-4">No blog posts found. Create your first post!</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
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
                                    {React.createElement(PencilIcon as any, { className: "w-4 h-4" })}
                                  </button>
                                  {viewMode === 'trash' ? (
                                    <>
                                      <button
                                        onClick={() => handleRestoreFromTrash(post)}
                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                        title="Restore from Trash"
                                      >
                                        {React.createElement(ArrowUturnLeftIcon as any, { className: "w-4 h-4" })}
                                      </button>
                                      <button
                                        onClick={() => handlePermanentDelete(post)}
                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="Permanently Delete"
                                      >
                                        {React.createElement(XCircleIcon as any, { className: "w-4 h-4" })}
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleMoveToTrash(post)}
                                      className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                                      title="Move to Trash"
                                    >
                                      {React.createElement(TrashIcon as any, { className: "w-4 h-4" })}
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

              {/* Static Pages Tab */}
              {activeTab === 'pages' && (
                <div>
                  {pages.length === 0 ? (
                    <div className="text-center py-12">
                      {React.createElement(DocumentTextIcon as any, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" })}
                      <p className="text-gray-500 mb-4">No static pages found. Create your first page!</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Create First Page
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
                              Navigation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{page.title}</div>
                                  <div className="text-sm text-gray-500">/{page.slug}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  page.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {page.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {page.show_in_navigation ? (
                                  React.createElement(CheckCircleIcon as any, { className: "w-5 h-5 text-green-500" })
                                ) : (
                                  React.createElement(XCircleIcon as any, { className: "w-5 h-5 text-gray-400" })
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {page.menu_order || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(page)}
                                    className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                                  >
                                    {React.createElement(PencilIcon as any, { className: "w-4 h-4" })}
                                  </button>
                                  {viewMode === 'trash' ? (
                                    <>
                                      <button
                                        onClick={() => handleRestoreFromTrash(page)}
                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                        title="Restore from Trash"
                                      >
                                        {React.createElement(ArrowUturnLeftIcon as any, { className: "w-4 h-4" })}
                                      </button>
                                      <button
                                        onClick={() => handlePermanentDelete(page)}
                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="Permanently Delete"
                                      >
                                        {React.createElement(XCircleIcon as any, { className: "w-4 h-4" })}
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleMoveToTrash(page)}
                                      className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                                      title="Move to Trash"
                                    >
                                      {React.createElement(TrashIcon as any, { className: "w-4 h-4" })}
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

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div>
                  {categories.length === 0 ? (
                    <div className="text-center py-12">
                      {React.createElement(FolderIcon as any, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" })}
                      <p className="text-gray-500 mb-4">No categories found. Create your first category!</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Create First Category
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((category) => (
                        <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEdit(category)}
                                className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                              >
                                {React.createElement(PencilIcon as any, { className: "w-4 h-4" })}
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">/{category.slug}</p>
                          {category.description && (
                            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                          )}
                          <div className="text-sm text-gray-500">
                            {category.post_count} posts
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags Tab */}
              {activeTab === 'tags' && (
                <div>
                  {tags.length === 0 ? (
                    <div className="text-center py-12">
                      {React.createElement(TagIcon as any, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" })}
                      <p className="text-gray-500 mb-4">No tags found. Create your first tag!</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Create First Tag
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {tags.map((tag) => (
                        <div key={tag.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                            <div className="text-xs text-gray-500">{tag.post_count} posts</div>
                          </div>
                          <button
                            onClick={() => handleEdit(tag)}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                          >
                            {React.createElement(PencilIcon as any, { className: "w-3 h-3" })}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">System Status</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Supabase Database</span>
              <span className="text-sm text-green-600 font-medium">✅ Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">WordPress CMS</span>
              <span className="text-sm text-green-600 font-medium">✅ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Firebase Auth</span>
              <span className="text-sm text-green-600 font-medium">✅ Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Performance</span>
              <span className="text-sm text-blue-600 font-medium">🚀 Optimized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Content Modal */}
      {showCreateModal && (
        <CreateContentModal
          activeTab={activeTab}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createContent}
        />
      )}

      {/* Edit Content Modal */}
      {showEditModal && selectedItem && (
        <EditContentModal
          activeTab={activeTab}
          item={selectedItem}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={updateContent}
        />
      )}
    </div>
  );
}

// Create Content Modal Component
function CreateContentModal({ activeTab, onClose, onSubmit }: {
  activeTab: 'posts' | 'pages' | 'categories' | 'tags';
  onClose: () => void;
  onSubmit: (data: CreateContentData) => void;
}) {
  const [formData, setFormData] = useState<CreateContentData>({
    title: '',
    name: '',
    content: '',
    excerpt: '',
    description: '',
    author_name: 'Admin',
    status: 'draft',
    show_in_navigation: false,
    menu_order: 0,
    is_featured: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredField = activeTab === 'posts' || activeTab === 'pages' ? 'title' : 'name';
    if (!formData[requiredField]?.trim()) {
      alert(`Please fill in the ${requiredField}`);
      return;
    }

    if ((activeTab === 'posts' || activeTab === 'pages') && !formData.content?.trim()) {
      alert('Please fill in the content');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (activeTab) {
      case 'posts': return 'Create New Blog Post';
      case 'pages': return 'Create New Static Page';
      case 'categories': return 'Create New Category';
      case 'tags': return 'Create New Tag';
      default: return 'Create New Content';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{getModalTitle()}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title/Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {activeTab === 'posts' || activeTab === 'pages' ? 'Title' : 'Name'} *
            </label>
            <input
              type="text"
              value={activeTab === 'posts' || activeTab === 'pages' ? formData.title : formData.name}
              onChange={(e) => setFormData({
                ...formData,
                [activeTab === 'posts' || activeTab === 'pages' ? 'title' : 'name']: e.target.value
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={`Enter ${activeTab === 'posts' || activeTab === 'pages' ? 'title' : 'name'}`}
              required
            />
          </div>

          {/* Content Field (Posts and Pages only) */}
          {(activeTab === 'posts' || activeTab === 'pages') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={2}
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={8}
                  placeholder="Write your content here..."
                  required
                />
              </div>
            </>
          )}

          {/* Description Field (Categories and Tags) */}
          {(activeTab === 'categories' || activeTab === 'tags') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Optional description"
              />
            </div>
          )}

          {/* Additional Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(activeTab === 'posts' || activeTab === 'pages') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'private' | 'trash' })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Page-specific fields */}
          {activeTab === 'pages' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_in_navigation"
                  checked={formData.show_in_navigation}
                  onChange={(e) => setFormData({ ...formData, show_in_navigation: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="show_in_navigation" className="ml-2 block text-sm text-gray-900">
                  Show in Navigation
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Order</label>
                <input
                  type="number"
                  value={formData.menu_order}
                  onChange={(e) => setFormData({ ...formData, menu_order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Post-specific fields */}
          {activeTab === 'posts' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                Featured Post
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Content Modal Component
function EditContentModal({ activeTab, item, onClose, onSubmit }: {
  activeTab: 'posts' | 'pages' | 'categories' | 'tags';
  item: BlogPost | StaticPage | Category | Tag;
  onClose: () => void;
  onSubmit: (data: CreateContentData) => void;
}) {
  const [formData, setFormData] = useState<CreateContentData>(() => {
    if (activeTab === 'posts') {
      const post = item as BlogPost;
      return {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        author_name: post.author_name,
        status: post.status as 'draft' | 'published' | 'private' | 'trash',
        is_featured: post.is_featured || false
      };
    } else if (activeTab === 'pages') {
      const page = item as StaticPage;
      return {
        title: page.title,
        content: page.content,
        excerpt: page.excerpt || '',
        author_name: page.author_name,
        status: page.status as 'draft' | 'published' | 'private' | 'trash',
        show_in_navigation: page.show_in_navigation || false,
        navigation_label: page.navigation_label || '',
        menu_order: page.menu_order || 0
      };
    } else if (activeTab === 'categories') {
      const category = item as Category;
      return {
        name: category.name,
        description: category.description || ''
      };
    } else {
      const tag = item as Tag;
      return {
        name: tag.name,
        description: tag.description || ''
      };
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredField = activeTab === 'posts' || activeTab === 'pages' ? 'title' : 'name';
    if (!formData[requiredField]?.trim()) {
      alert(`Please fill in the ${requiredField}`);
      return;
    }

    if ((activeTab === 'posts' || activeTab === 'pages') && !formData.content?.trim()) {
      alert('Please fill in the content');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (activeTab) {
      case 'posts': return 'Edit Blog Post';
      case 'pages': return 'Edit Static Page';
      case 'categories': return 'Edit Category';
      case 'tags': return 'Edit Tag';
      default: return 'Edit Content';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{getModalTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title/Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {activeTab === 'posts' || activeTab === 'pages' ? 'Title' : 'Name'} *
            </label>
            <input
              type="text"
              value={activeTab === 'posts' || activeTab === 'pages' ? formData.title : formData.name}
              onChange={(e) => setFormData({
                ...formData,
                [activeTab === 'posts' || activeTab === 'pages' ? 'title' : 'name']: e.target.value
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content Field (Posts and Pages only) */}
          {(activeTab === 'posts' || activeTab === 'pages') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={8}
                  required
                />
              </div>
            </>
          )}

          {/* Description Field (Categories and Tags) */}
          {(activeTab === 'categories' || activeTab === 'tags') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}

          {/* Additional Fields */}
          {(activeTab === 'posts' || activeTab === 'pages') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'private' | 'trash' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {/* Page-specific fields */}
          {activeTab === 'pages' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_in_navigation"
                  checked={formData.show_in_navigation}
                  onChange={(e) => setFormData({ ...formData, show_in_navigation: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="show_in_navigation" className="ml-2 block text-sm text-gray-900">
                  Show in Navigation
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Order</label>
                <input
                  type="number"
                  value={formData.menu_order}
                  onChange={(e) => setFormData({ ...formData, menu_order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Post-specific fields */}
          {activeTab === 'posts' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                Featured Post
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
