/**
 * Simple CMS Redux Slice - Test Version
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Simple types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'private' | 'scheduled' | 'trash';
  author_name: string;
  is_featured?: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface StaticPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'private' | 'trash';
  author_name: string;
  show_in_navigation?: boolean;
  navigation_label?: string;
  menu_order?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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
  posts: BlogPost[];
  pages: StaticPage[];
  categories: Category[];
  tags: Tag[];
  stats: CMSStats;
  loading: {
    global: boolean;
    posts: boolean;
    pages: boolean;
    categories: boolean;
    tags: boolean;
  };
  activeTab: 'posts' | 'pages' | 'categories' | 'tags';
  viewMode: 'all' | 'published' | 'draft' | 'trash';
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
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    setPosts: (state, action: PayloadAction<BlogPost[]>) => {
      state.posts = action.payload;
    },
    
    setPages: (state, action: PayloadAction<StaticPage[]>) => {
      state.pages = action.payload;
    },
    
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.tags = action.payload;
    },
    
    setStats: (state, action: PayloadAction<CMSStats>) => {
      state.stats = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setActiveTab, 
  setViewMode, 
  setLoading, 
  setPosts, 
  setPages, 
  setCategories, 
  setTags, 
  setStats, 
  setError, 
  clearError 
} = cmsSlice.actions;

// Selectors
export const selectCMSState = (state: { cms: CMSState }) => state.cms;
export const selectCMSPosts = (state: { cms: CMSState }) => state.cms.posts;
export const selectCMSPages = (state: { cms: CMSState }) => state.cms.pages;
export const selectCMSCategories = (state: { cms: CMSState }) => state.cms.categories;
export const selectCMSTags = (state: { cms: CMSState }) => state.cms.tags;
export const selectCMSStats = (state: { cms: CMSState }) => state.cms.stats;
export const selectCMSLoading = (state: { cms: CMSState }) => state.cms.loading;
export const selectIsLoading = (state: { cms: CMSState }) => {
  const loading = state.cms.loading;
  return loading.global || loading.posts || loading.pages || loading.categories || loading.tags;
};
export const selectCMSActiveTab = (state: { cms: CMSState }) => state.cms.activeTab;
export const selectCMSViewMode = (state: { cms: CMSState }) => state.cms.viewMode;
export const selectCMSError = (state: { cms: CMSState }) => state.cms.error;



export default cmsSlice.reducer;
