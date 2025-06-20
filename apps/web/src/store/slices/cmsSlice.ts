/**
 * CMS Redux Slice - Professional Content Management State
 * Handles blog posts, static pages, categories, tags, and global stats
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'private' | 'scheduled' | 'trash';
  featured_image_url?: string;
  featured_image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  author_id?: string;
  author_name: string;
  author_email?: string;
  author_avatar_url?: string;
  is_featured: boolean;
  is_sticky: boolean;
  reading_time?: number;
  view_count: number;
  published_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface StaticPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'private' | 'trash';
  parent_id?: number;
  menu_order: number;
  featured_image_url?: string;
  featured_image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  show_in_navigation: boolean;
  navigation_label?: string;
  page_template: string;
  author_id?: string;
  author_name: string;
  published_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
}

export interface CMSStats {
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

export interface CMSState {
  // Data
  posts: BlogPost[];
  pages: StaticPage[];
  categories: Category[];
  tags: Tag[];
  stats: CMSStats;
  
  // UI State
  loading: {
    global: boolean;
    posts: boolean;
    pages: boolean;
    categories: boolean;
    tags: boolean;
  };
  
  // Current View
  activeTab: 'posts' | 'pages' | 'categories' | 'tags';
  viewMode: 'all' | 'published' | 'draft' | 'trash';
  
  // Error handling
  error: string | null;
  lastUpdated: string | null;
}

const initialState: CMSState = {
  posts: [],
  pages: [],
  categories: [],
  tags: [],
  stats: {
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
  },
  loading: {
    global: false,
    posts: false,
    pages: false,
    categories: false,
    tags: false,
  },
  activeTab: 'posts',
  viewMode: 'all',
  error: null,
  lastUpdated: null,
};

// Async Thunks - Simplified for now
export const loadGlobalStats = createAsyncThunk(
  'cms/loadGlobalStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Loading global CMS statistics...');

      // Import here to avoid circular dependencies
      const { BlogPostOps, StaticPageOps, CategoryOps, TagOps } = await import('@/lib/supabase/cms-operations');

      const [allPosts, allPages, allCategories, allTags] = await Promise.all([
        BlogPostOps.getAllPosts(1000),
        StaticPageOps.getAllPages(),
        CategoryOps.getAllCategories(),
        TagOps.getAllTags()
      ]);

      const totalViews = allPosts?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;

      const stats: CMSStats = {
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

      console.log('✅ Global stats loaded successfully:', stats);

      return {
        stats,
        categories: allCategories || [],
        tags: allTags || [],
      };
    } catch (error) {
      console.error('❌ Error loading global stats:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load global stats');
    }
  }
);

export const loadFilteredPosts = createAsyncThunk(
  'cms/loadFilteredPosts',
  async (params: { viewMode: 'all' | 'published' | 'draft' | 'trash' }, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading filtered posts...', params);

      // Import here to avoid circular dependencies
      const { BlogPostOps } = await import('@/lib/supabase/cms-operations');
      const posts = await BlogPostOps.getPostsByStatus(params.viewMode, 100);

      console.log(`✅ Loaded ${posts?.length || 0} ${params.viewMode} posts`);
      return posts || [];
    } catch (error) {
      console.error('❌ Error loading filtered posts:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load posts');
    }
  }
);

export const loadFilteredPages = createAsyncThunk(
  'cms/loadFilteredPages',
  async (params: { viewMode: 'all' | 'published' | 'draft' | 'trash' }, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading filtered pages...', params);

      // Import here to avoid circular dependencies
      const { StaticPageOps } = await import('@/lib/supabase/cms-operations');
      const pages = await StaticPageOps.getPagesByStatus(params.viewMode, 100);

      console.log(`✅ Loaded ${pages?.length || 0} ${params.viewMode} pages`);
      return pages || [];
    } catch (error) {
      console.error('❌ Error loading filtered pages:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load pages');
    }
  }
);

// CMS Slice
const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'posts' | 'pages' | 'categories' | 'tags'>) => {
      state.activeTab = action.payload;
      state.error = null;
    },
    
    setViewMode: (state, action: PayloadAction<'all' | 'published' | 'draft' | 'trash'>) => {
      state.viewMode = action.payload;
      state.error = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetCMS: (state) => {
      return { ...initialState, activeTab: state.activeTab, viewMode: state.viewMode };
    },
  },
  extraReducers: (builder) => {
    // Global Stats
    builder
      .addCase(loadGlobalStats.pending, (state) => {
        state.loading.global = true;
        state.error = null;
      })
      .addCase(loadGlobalStats.fulfilled, (state, action) => {
        state.loading.global = false;
        state.stats = action.payload.stats;
        state.categories = action.payload.categories;
        state.tags = action.payload.tags;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(loadGlobalStats.rejected, (state, action) => {
        state.loading.global = false;
        state.error = action.payload as string;
      })
      
    // Filtered Posts
    builder
      .addCase(loadFilteredPosts.pending, (state) => {
        state.loading.posts = true;
        state.error = null;
      })
      .addCase(loadFilteredPosts.fulfilled, (state, action) => {
        state.loading.posts = false;
        state.posts = action.payload;
        state.error = null;
      })
      .addCase(loadFilteredPosts.rejected, (state, action) => {
        state.loading.posts = false;
        state.error = action.payload as string;
      })
      
    // Filtered Pages
    builder
      .addCase(loadFilteredPages.pending, (state) => {
        state.loading.pages = true;
        state.error = null;
      })
      .addCase(loadFilteredPages.fulfilled, (state, action) => {
        state.loading.pages = false;
        state.pages = action.payload;
        state.error = null;
      })
      .addCase(loadFilteredPages.rejected, (state, action) => {
        state.loading.pages = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTab, setViewMode, clearError, resetCMS } = cmsSlice.actions;

// Selectors
export const selectCMSState = (state: { cms: CMSState }) => state.cms;
export const selectCMSPosts = (state: { cms: CMSState }) => state.cms.posts;
export const selectCMSPages = (state: { cms: CMSState }) => state.cms.pages;
export const selectCMSCategories = (state: { cms: CMSState }) => state.cms.categories;
export const selectCMSTags = (state: { cms: CMSState }) => state.cms.tags;
export const selectCMSStats = (state: { cms: CMSState }) => state.cms.stats;
export const selectCMSLoading = (state: { cms: CMSState }) => state.cms.loading;
export const selectCMSActiveTab = (state: { cms: CMSState }) => state.cms.activeTab;
export const selectCMSViewMode = (state: { cms: CMSState }) => state.cms.viewMode;
export const selectCMSError = (state: { cms: CMSState }) => state.cms.error;
export const selectCMSLastUpdated = (state: { cms: CMSState }) => state.cms.lastUpdated;

// Computed selectors
export const selectIsLoading = (state: { cms: CMSState }) => {
  const loading = state.cms.loading;
  return loading.global || loading.posts || loading.pages || loading.categories || loading.tags;
};

export const selectCurrentContent = (state: { cms: CMSState }) => {
  const { activeTab, posts, pages, categories, tags } = state.cms;
  switch (activeTab) {
    case 'posts': return posts;
    case 'pages': return pages;
    case 'categories': return categories;
    case 'tags': return tags;
    default: return [];
  }
};

export const selectCurrentStats = (state: { cms: CMSState }) => {
  const { activeTab, stats } = state.cms;
  switch (activeTab) {
    case 'posts': return {
      total: stats.totalPosts,
      published: stats.publishedPosts,
      draft: stats.draftPosts,
      trash: stats.trashedPosts,
    };
    case 'pages': return {
      total: stats.totalPages,
      published: stats.publishedPages,
      draft: stats.totalPages - stats.publishedPages,
      trash: stats.trashedPages,
    };
    default: return { total: 0, published: 0, draft: 0, trash: 0 };
  }
};

export default cmsSlice.reducer;
