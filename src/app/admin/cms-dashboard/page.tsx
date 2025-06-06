'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Types for our CMS content
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  featured_image_url?: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

interface CMSStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  trashedPosts: number;
  totalViews: number;
}

export default function CMSDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<CMSStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    trashedPosts: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBinModal, setShowBinModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'published' | 'draft' | 'trash'>('all');

  // Load posts function with useCallback - supports WordPress-style filtering
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);

      // Build endpoint and query parameters based on view mode
      let endpoint = '/api/blog/posts';
      const queryParams = new URLSearchParams();

      if (viewMode === 'trash') {
        endpoint = '/api/blog/posts/bin';
      } else if (viewMode === 'published') {
        queryParams.append('status', 'published');
      } else if (viewMode === 'draft') {
        queryParams.append('status', 'draft');
      }
      // 'all' mode doesn't need additional parameters

      const url = queryParams.toString() ? `${endpoint}?${queryParams}` : endpoint;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        // Use functional update to avoid dependency on current stats
        setStats(prevStats => ({ ...prevStats, ...data.stats }));
      } else {
        console.error('Failed to fetch posts:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [viewMode]); // Depend on viewMode to reload when switching between active/bin

  // Load posts on component mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = async (postData: Partial<BlogPost>) => {
    try {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Post created successfully:', result.post.title);
        // Refresh posts data after successful creation
        await loadPosts();
        setShowCreateModal(false);
        // You could add a toast notification here
      } else {
        console.error('❌ Failed to create post:', result.message);
        alert(`Failed to create post: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert('Network error: Failed to create post. Please try again.');
    }
  };

  // Handle view post
  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post);
    setShowViewModal(true);
  };

  // Handle edit post
  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  // Handle delete post (move to bin)
  const handleDeletePost = (post: BlogPost) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  // Handle permanent delete from bin
  const handlePermanentDelete = (post: BlogPost) => {
    setSelectedPost(post);
    setShowBinModal(true);
  };

  // Handle restore post from trash
  const handleRestorePost = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/posts/restore?id=${post.id}`, {
        method: 'PUT'
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Post restored successfully');
        await loadPosts();
      } else {
        console.error('❌ Failed to restore post:', result.message);
        alert(`Failed to restore post: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error restoring post:', error);
      alert('Network error: Failed to restore post. Please try again.');
    }
  };

  // Update post function
  const updatePost = async (postData: Partial<BlogPost>) => {
    if (!selectedPost) return;

    try {
      const response = await fetch('/api/blog/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPost.id, ...postData })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Post updated successfully:', result.post.title);
        await loadPosts();
        setShowEditModal(false);
        setSelectedPost(null);
      } else {
        console.error('❌ Failed to update post:', result.message);
        alert(`Failed to update post: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating post:', error);
      alert('Network error: Failed to update post. Please try again.');
    }
  };

  // Delete post function (soft delete - move to bin)
  const deletePost = async () => {
    if (!selectedPost) return;

    try {
      const response = await fetch(`/api/blog/posts?id=${selectedPost.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Post moved to bin successfully');
        await loadPosts();
        setShowDeleteModal(false);
        setSelectedPost(null);
      } else {
        console.error('❌ Failed to move post to bin:', result.message);
        alert(`Failed to move post to bin: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error moving post to bin:', error);
      alert('Network error: Failed to move post to bin. Please try again.');
    }
  };

  // Permanent delete function (hard delete from database)
  const permanentDeletePost = async () => {
    if (!selectedPost) return;

    try {
      const response = await fetch(`/api/blog/posts/permanent?id=${selectedPost.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Post permanently deleted from database');
        await loadPosts();
        setShowBinModal(false);
        setSelectedPost(null);
      } else {
        console.error('❌ Failed to permanently delete post:', result.message);
        alert(`Failed to permanently delete post: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error permanently deleting post:', error);
      alert('Network error: Failed to permanently delete post. Please try again.');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
            <DocumentTextIcon className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500 mr-2 lg:mr-3" />
            CMS Dashboard
          </h1>
          <p className="mt-1 text-xs lg:text-sm text-gray-500">
            Manage your content with enterprise-grade performance
          </p>
        </div>

        {/* Mobile-Optimized Controls */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          {/* WordPress-style View Mode Segmentation - Mobile Responsive */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 overflow-x-auto">
            <button
              onClick={() => setViewMode('all')}
              className={`px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({stats.totalPosts})
            </button>
            <button
              onClick={() => setViewMode('published')}
              className={`px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'published'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Published ({stats.publishedPosts})
            </button>
            <button
              onClick={() => setViewMode('draft')}
              className={`px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'draft'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Draft ({stats.draftPosts})
            </button>
            <button
              onClick={() => setViewMode('trash')}
              className={`px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'trash'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trash ({stats.trashedPosts})
            </button>
          </div>

          {/* Mobile-Optimized Action Row */}
          <div className="flex items-center justify-between lg:justify-start lg:space-x-4">
            {/* System Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-green-500"></div>
              <span className="text-xs lg:text-sm text-gray-600">
                CMS Active
              </span>
            </div>

            {viewMode !== 'trash' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-600 text-white px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-1 lg:space-x-2 hover:bg-orange-700 transition-colors text-sm lg:text-base"
              >
                <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">New Post</span>
                <span className="sm:hidden">New</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
        <div className="bg-white p-3 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
            <div className="ml-2 lg:ml-4 min-w-0">
              <h3 className="text-xs lg:text-sm font-medium text-gray-500 truncate">Total Posts</h3>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeIcon className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
            </div>
            <div className="ml-2 lg:ml-4 min-w-0">
              <h3 className="text-xs lg:text-sm font-medium text-gray-500 truncate">Published</h3>
              <p className="text-lg lg:text-2xl font-bold text-green-600">{stats.publishedPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PencilIcon className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
            </div>
            <div className="ml-2 lg:ml-4 min-w-0">
              <h3 className="text-xs lg:text-sm font-medium text-gray-500 truncate">Drafts</h3>
              <p className="text-lg lg:text-2xl font-bold text-yellow-600">{stats.draftPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrashIcon className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
            </div>
            <div className="ml-2 lg:ml-4 min-w-0">
              <h3 className="text-xs lg:text-sm font-medium text-gray-500 truncate">Trash</h3>
              <p className="text-lg lg:text-2xl font-bold text-red-600">{stats.trashedPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 lg:p-6 rounded-lg shadow-sm border border-gray-200 col-span-2 md:col-span-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
            </div>
            <div className="ml-2 lg:ml-4 min-w-0">
              <h3 className="text-xs lg:text-sm font-medium text-gray-500 truncate">Total Views</h3>
              <p className="text-lg lg:text-2xl font-bold text-purple-600">{stats.totalViews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
          <h2 className="text-base lg:text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left w-full"
            >
              <PlusIcon className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400 mr-2 lg:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-xs lg:text-sm font-medium text-gray-900 truncate">Create New Post</h3>
                <p className="text-xs lg:text-sm text-gray-500 truncate">Write a new blog post</p>
              </div>
            </button>

            <button className="flex items-center p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left w-full">
              <PhotoIcon className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400 mr-2 lg:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-xs lg:text-sm font-medium text-gray-900 truncate">Media Library</h3>
                <p className="text-xs lg:text-sm text-gray-500 truncate">Manage images and files</p>
              </div>
            </button>

            <button className="flex items-center p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left w-full sm:col-span-2 lg:col-span-1">
              <ChartBarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400 mr-2 lg:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-xs lg:text-sm font-medium text-gray-900 truncate">Analytics</h3>
                <p className="text-xs lg:text-sm text-gray-500 truncate">View content performance</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Posts - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
          <h2 className="text-base lg:text-lg font-medium text-gray-900">
            {viewMode === 'all' && 'All Posts'}
            {viewMode === 'published' && 'Published Posts'}
            {viewMode === 'draft' && 'Draft Posts'}
            {viewMode === 'trash' && 'Posts in Trash'}
          </h2>
        </div>

        {loading ? (
          <div className="p-6 lg:p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-sm lg:text-base text-gray-500">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6 lg:p-8 text-center">
            <DocumentTextIcon className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm lg:text-base text-gray-500 mb-4">
              {viewMode === 'all' && 'No posts found. Create your first post!'}
              {viewMode === 'published' && 'No published posts found.'}
              {viewMode === 'draft' && 'No draft posts found.'}
              {viewMode === 'trash' && 'Trash is empty. No deleted posts found.'}
            </p>
            {viewMode !== 'trash' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm lg:text-base"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Title
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Status
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Author
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Created
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.slice(0, 5).map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="min-w-0">
                        <div className="text-xs lg:text-sm font-medium text-gray-900 truncate">{post.title}</div>
                        <div className="text-xs text-gray-500 truncate">{post.slug}</div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
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
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                      <div className="truncate">{post.author_name}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                      <div className="truncate">{new Date(post.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1 lg:space-x-2">
                        <button
                          onClick={() => handleViewPost(post)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 lg:p-1 rounded hover:bg-blue-50 transition-colors touch-manipulation"
                          title="View Post"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        {viewMode === 'trash' ? (
                          <>
                            <button
                              onClick={() => handleRestorePost(post)}
                              className="text-green-600 hover:text-green-900 p-1.5 lg:p-1 rounded hover:bg-green-50 transition-colors touch-manipulation"
                              title="Restore Post"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(post)}
                              className="text-red-600 hover:text-red-900 p-1.5 lg:p-1 rounded hover:bg-red-50 transition-colors touch-manipulation"
                              title="Permanently Delete from Database"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditPost(post)}
                              className="text-orange-600 hover:text-orange-900 p-1.5 lg:p-1 rounded hover:bg-orange-50 transition-colors touch-manipulation"
                              title="Edit Post"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post)}
                              className="text-red-600 hover:text-red-900 p-1.5 lg:p-1 rounded hover:bg-red-50 transition-colors touch-manipulation"
                              title="Move to Trash"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
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

      {/* System Status - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
          <h2 className="text-base lg:text-lg font-medium text-gray-900">System Status</h2>
        </div>
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-xs lg:text-sm text-gray-600 truncate">Neon Database</span>
              <span className="text-xs lg:text-sm text-green-600 font-medium whitespace-nowrap ml-2">✅ Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-xs lg:text-sm text-gray-600 truncate">Custom CMS</span>
              <span className="text-xs lg:text-sm text-green-600 font-medium whitespace-nowrap ml-2">✅ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-xs lg:text-sm text-gray-600 truncate">Cloudinary CDN</span>
              <span className="text-xs lg:text-sm text-green-600 font-medium whitespace-nowrap ml-2">✅ Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-xs lg:text-sm text-gray-600 truncate">Performance</span>
              <span className="text-xs lg:text-sm text-blue-600 font-medium whitespace-nowrap ml-2">🚀 Direct DB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createPost}
        />
      )}

      {/* View Post Modal */}
      {showViewModal && selectedPost && (
        <ViewPostModal
          post={selectedPost}
          onClose={() => {
            setShowViewModal(false);
            setSelectedPost(null);
          }}
        />
      )}

      {/* Edit Post Modal */}
      {showEditModal && selectedPost && (
        <EditPostModal
          post={selectedPost}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPost(null);
          }}
          onSubmit={updatePost}
        />
      )}

      {/* Delete Confirmation Modal (Move to Bin) */}
      {showDeleteModal && selectedPost && (
        <DeletePostModal
          post={selectedPost}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPost(null);
          }}
          onConfirm={deletePost}
          isMoveToBin={true}
        />
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showBinModal && selectedPost && (
        <DeletePostModal
          post={selectedPost}
          onClose={() => {
            setShowBinModal(false);
            setSelectedPost(null);
          }}
          onConfirm={permanentDeletePost}
          isMoveToBin={false}
        />
      )}
    </div>
  );
}

// Create Post Modal Component
function CreatePostModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: Partial<BlogPost>) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author_name: 'Admin',
    status: 'draft' as 'draft' | 'published'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Create New Blog Post</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter blog post title"
              required
            />
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={2}
              placeholder="Brief description of the post"
            />
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={6}
              placeholder="Write your blog post content here..."
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm lg:text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className={`px-4 py-2 text-sm lg:text-base rounded-md text-white transition-colors touch-manipulation ${
                isSubmitting || !formData.title.trim() || !formData.content.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View Post Modal Component
function ViewPostModal({ post, onClose }: {
  post: BlogPost;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-gray-900">View Blog Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation"
          >
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {/* Post Header */}
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500">
              <span>By {post.author_name}</span>
              <span className="hidden sm:inline">•</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span className="hidden sm:inline">•</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                post.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : post.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {post.status}
              </span>
            </div>
          </div>

          {/* Post Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2">Slug</h4>
              <p className="text-xs lg:text-sm text-gray-900 bg-gray-50 p-2 rounded break-all">{post.slug}</p>
            </div>
            {post.excerpt && (
              <div>
                <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2">Excerpt</h4>
                <p className="text-xs lg:text-sm text-gray-900 bg-gray-50 p-2 rounded">{post.excerpt}</p>
              </div>
            )}
          </div>

          {/* Post Content */}
          <div>
            <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2">Content</h4>
            <div className="bg-gray-50 p-3 lg:p-4 rounded-lg max-h-64 lg:max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2 text-xs lg:text-sm text-gray-900">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 lg:mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm lg:text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Post Modal Component
function EditPostModal({ post, onClose, onSubmit }: {
  post: BlogPost;
  onClose: () => void;
  onSubmit: (data: Partial<BlogPost>) => void;
}) {
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || '',
    author_name: post.author_name,
    status: post.status
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base lg:text-lg font-medium text-gray-900">Edit Blog Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation"
          >
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter blog post title"
              required
            />
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={2}
              placeholder="Brief description of the post"
            />
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={6}
              placeholder="Write your blog post content here..."
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm lg:text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className={`px-4 py-2 text-sm lg:text-base rounded-md text-white transition-colors touch-manipulation ${
                isSubmitting || !formData.title.trim() || !formData.content.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Post Modal Component
function DeletePostModal({ post, onClose, onConfirm, isMoveToBin = true }: {
  post: BlogPost;
  onClose: () => void;
  onConfirm: () => void;
  isMoveToBin?: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            {isMoveToBin ? (
              <TrashIcon className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
            ) : (
              <svg className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </div>
          <div className="ml-3 min-w-0">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">
              {isMoveToBin ? 'Move to Bin' : 'Permanently Delete Post'}
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs lg:text-sm text-gray-500 mb-2">
            {isMoveToBin
              ? 'Are you sure you want to move this post to the bin? You can restore it later.'
              : 'Are you sure you want to permanently delete this post? This action cannot be undone and the post will be completely removed from the database.'
            }
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">{post.title}</p>
            <p className="text-xs text-gray-500">by {post.author_name}</p>
          </div>

          {!isMoveToBin && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs lg:text-sm text-red-800 font-medium">⚠️ Warning: This is permanent!</p>
              <p className="text-xs text-red-600 mt-1">
                The post will be completely removed from the database and cannot be recovered.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm lg:text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className={`px-4 py-2 text-sm lg:text-base text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
              isMoveToBin
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isDeleting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isMoveToBin ? 'Moving...' : 'Deleting...'}
              </div>
            ) : (
              isMoveToBin ? 'Move to Bin' : 'Permanently Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
