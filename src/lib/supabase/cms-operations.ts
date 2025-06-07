/**
 * WordPress-Style CMS Operations for Tap2Go
 * Modern, scalable blog and static page management
 */

import { supabase, supabaseAdmin } from './client';

// Helper function to get the appropriate client
function getClient() {
  // Always use admin client for CMS operations (has service role key)
  // This bypasses RLS policies for admin operations
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  // Fallback to regular client if admin not available
  console.warn('⚠️ Using regular client - admin client not available');
  return supabase;
}

// Types based on our WordPress-style schema
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
  comment_status: 'open' | 'closed' | 'disabled';
  reading_time?: number;
  view_count: number;
  published_at?: string;
  scheduled_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  tags?: Tag[];
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
  children?: StaticPage[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  description?: string;
  uploaded_by?: string;
  created_at: string;
}

// ===== BLOG POST OPERATIONS =====

export class BlogPostOps {
  /**
   * Get all published blog posts (public) - excludes soft deleted
   */
  static async getPublishedPosts(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        categories:post_categories(category:categories(*)),
        tags:post_tags(tag:tags(*))
      `)
      .eq('status', 'published')
      .is('deleted_at', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  /**
   * Get featured blog posts
   */
  static async getFeaturedPosts(limit = 5) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        categories:post_categories(category:categories(*)),
        tags:post_tags(tag:tags(*))
      `)
      .eq('status', 'published')
      .eq('is_featured', true)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get blog post by slug (public)
   */
  static async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        categories:post_categories(category:categories(*)),
        tags:post_tags(tag:tags(*))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;

    // Increment view count
    if (data && supabaseAdmin) {
      await supabaseAdmin
        .from('blog_posts')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id);
    }

    return data;
  }

  /**
   * Search blog posts (public)
   */
  static async searchPosts(query: string, limit = 10) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        categories:post_categories(category:categories(*)),
        tags:post_tags(tag:tags(*))
      `)
      .eq('status', 'published')
      .textSearch('search_vector', query)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get posts by category (public)
   */
  static async getPostsByCategory(categorySlug: string, limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        categories:post_categories!inner(category:categories!inner(*)),
        tags:post_tags(tag:tags(*))
      `)
      .eq('status', 'published')
      .eq('categories.category.slug', categorySlug)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  /**
   * Get posts by tag (public)
   */
  static async getPostsByTag(tagSlug: string, limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        categories:post_categories(category:categories(*)),
        tags:post_tags!inner(tag:tags!inner(*))
      `)
      .eq('status', 'published')
      .eq('tags.tag.slug', tagSlug)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  /**
   * Get all active posts for admin (excluding soft deleted)
   */
  static async getAllPosts(limit = 100, offset = 0) {
    try {
      const { data, error } = await getClient()
        .from('blog_posts')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ getAllPosts error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('❌ getAllPosts failed:', error);
      throw error;
    }
  }

  /**
   * Get ALL posts including trashed ones (for stats calculation)
   */
  static async getAllPostsIncludingTrashed(limit = 1000, offset = 0) {
    try {
      const { data, error } = await getClient()
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ getAllPostsIncludingTrashed error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('❌ getAllPostsIncludingTrashed failed:', error);
      throw error;
    }
  }

  /**
   * Get posts by status for admin (WordPress-style filtering)
   */
  static async getPostsByStatus(status: 'all' | 'published' | 'draft' | 'trash' = 'all', limit = 100, offset = 0) {
    try {
      let query = getClient()
        .from('blog_posts')
        .select('*');

      if (status === 'trash') {
        query = query.not('deleted_at', 'is', null);
      } else if (status === 'all') {
        query = query.is('deleted_at', null);
      } else {
        query = query
          .eq('status', status)
          .is('deleted_at', null);
      }

      const { data, error } = await query
        .order(status === 'trash' ? 'deleted_at' : 'created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ getPostsByStatus error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('❌ getPostsByStatus failed:', error);
      throw error;
    }
  }

  /**
   * Get trashed posts for admin
   */
  static async getTrashedPosts(limit = 100, offset = 0) {
    try {
      const { data, error } = await getClient()
        .from('blog_posts')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ getTrashedPosts error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('❌ getTrashedPosts failed:', error);
      throw error;
    }
  }

  /**
   * Create new blog post (admin) - FIXED VERSION
   */
  static async createPost(postData: Partial<BlogPost>) {
    try {
      console.log('📝 Creating post with data:', postData);

      // Only include fields that definitely exist in the database
      const insertData: {
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        status: string;
        author_name: string;
        is_featured: boolean;
        reading_time: number;
        view_count: number;
        published_at?: string;
      } = {
        title: postData.title || 'Untitled',
        slug: postData.slug || generateSlug(postData.title || 'untitled'),
        content: postData.content || '',
        excerpt: postData.excerpt || '',
        status: postData.status || 'draft',
        author_name: postData.author_name || 'Admin',
        is_featured: postData.is_featured || false,
        reading_time: postData.reading_time || 0,
        view_count: postData.view_count || 0
      };

      // Only add optional fields if they exist
      if (postData.status === 'published') {
        insertData.published_at = new Date().toISOString();
      }

      console.log('📋 Insert data:', insertData);

      const { data, error } = await getClient()
        .from('blog_posts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Create post error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Post created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Create post failed:', error);
      throw error;
    }
  }

  /**
   * Update blog post (admin)
   */
  static async updatePost(id: number, postData: Partial<BlogPost>) {
    const { data, error } = await getClient()
      .from('blog_posts')
      .update({
        ...postData,
        published_at: postData.status === 'published' && !postData.published_at
          ? new Date().toISOString()
          : postData.published_at
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete blog post (move to trash) - WordPress style
   */
  static async moveToTrash(id: number, userId?: string) {
    try {
      console.log('🗑️ Moving post to trash:', { id, userId });

      const { data, error } = await getClient()
        .from('blog_posts')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: userId || null,
          status: 'trash',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null) // Only move to trash if not already deleted
        .select()
        .single();

      if (error) {
        console.error('❌ moveToTrash error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Trash error: ${error.message}`);
      }

      console.log('✅ Post moved to trash successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ moveToTrash failed:', error);
      throw error;
    }
  }

  /**
   * Restore blog post from trash - WordPress style
   */
  static async restoreFromTrash(id: number, newStatus: 'draft' | 'published' = 'draft') {
    try {
      console.log('♻️ Restoring post from trash:', { id, newStatus });

      const { data, error } = await getClient()
        .from('blog_posts')
        .update({
          deleted_at: null,
          deleted_by: null,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .not('deleted_at', 'is', null) // Only restore if currently in trash
        .select()
        .single();

      if (error) {
        console.error('❌ restoreFromTrash error:', error);
        throw error;
      }

      console.log('✅ Post restored from trash successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ restoreFromTrash failed:', error);
      throw error;
    }
  }

  /**
   * Permanently delete blog post (hard delete) - WordPress style
   * Only works on posts that are already in trash
   */
  static async permanentDelete(id: number) {
    try {
      console.log('🗑️ Permanently deleting post:', { id });

      const { error } = await getClient()
        .from('blog_posts')
        .delete()
        .eq('id', id)
        .not('deleted_at', 'is', null); // Only permanently delete if already in trash

      if (error) {
        console.error('❌ permanentDelete error:', error);
        throw error;
      }

      console.log('✅ Post permanently deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ permanentDelete failed:', error);
      throw error;
    }
  }

  /**
   * Legacy delete method - now redirects to moveToTrash for safety
   * @deprecated Use moveToTrash instead
   */
  static async deletePost(id: number, userId?: string) {
    console.warn('deletePost is deprecated. Use moveToTrash instead.');
    return this.moveToTrash(id, userId);
  }
}

// ===== STATIC PAGE OPERATIONS =====

export class StaticPageOps {
  /**
   * Get all published pages (public) - excludes soft deleted
   */
  static async getPublishedPages() {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('menu_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get navigation pages (public)
   */
  static async getNavigationPages() {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('status', 'published')
      .eq('show_in_navigation', true)
      .order('menu_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get page by slug (public)
   */
  static async getPageBySlug(slug: string) {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get page hierarchy (public)
   */
  static async getPageHierarchy() {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('status', 'published')
      .order('menu_order', { ascending: true });

    if (error) throw error;

    // Build hierarchy
    const pages = data || [];
    const pageMap = new Map();
    const rootPages: StaticPage[] = [];

    // First pass: create map
    pages.forEach(page => {
      pageMap.set(page.id, { ...page, children: [] });
    });

    // Second pass: build hierarchy
    pages.forEach(page => {
      if (page.parent_id) {
        const parent = pageMap.get(page.parent_id);
        if (parent) {
          parent.children.push(pageMap.get(page.id));
        }
      } else {
        rootPages.push(pageMap.get(page.id));
      }
    });

    return rootPages;
  }

  /**
   * Get all active pages for admin (excluding soft deleted)
   */
  static async getAllPages() {
    const { data, error } = await getClient()
      .from('static_pages')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get ALL pages including trashed ones (for stats calculation)
   */
  static async getAllPagesIncludingTrashed() {
    const { data, error } = await getClient()
      .from('static_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get pages by status for admin (WordPress-style filtering)
   */
  static async getPagesByStatus(status: 'all' | 'published' | 'draft' | 'trash' = 'all', limit = 100, offset = 0) {
    try {
      let query = getClient()
        .from('static_pages')
        .select('*');

      if (status === 'trash') {
        query = query.not('deleted_at', 'is', null);
      } else if (status === 'all') {
        query = query.is('deleted_at', null);
      } else {
        query = query
          .eq('status', status)
          .is('deleted_at', null);
      }

      const { data, error } = await query
        .order(status === 'trash' ? 'deleted_at' : 'created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ getPagesByStatus error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('❌ getPagesByStatus failed:', error);
      throw error;
    }
  }

  /**
   * Get trashed pages for admin
   */
  static async getTrashedPages(limit = 100, offset = 0) {
    const { data, error } = await getClient()
      .from('static_pages')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  /**
   * Create new page (admin)
   */
  static async createPage(pageData: Partial<StaticPage>) {
    try {
      const insertData = {
        title: pageData.title || 'Untitled Page',
        slug: pageData.slug || generateSlug(pageData.title || 'untitled-page'),
        content: pageData.content || '',
        excerpt: pageData.excerpt || '',
        status: pageData.status || 'draft',
        menu_order: pageData.menu_order || 0,
        show_in_navigation: pageData.show_in_navigation || false,
        navigation_label: pageData.navigation_label || '',
        page_template: pageData.page_template || 'default',
        author_name: pageData.author_name || 'Admin',
        published_at: pageData.status === 'published' ? new Date().toISOString() : null
      };

      const { data, error } = await getClient()
        .from('static_pages')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Create page error:', error);
        throw error;
      }

      console.log('✅ Page created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Create page failed:', error);
      throw error;
    }
  }

  /**
   * Update page (admin)
   */
  static async updatePage(id: number, pageData: Partial<StaticPage>) {
    const { data, error } = await getClient()
      .from('static_pages')
      .update({
        ...pageData,
        published_at: pageData.status === 'published' && !pageData.published_at
          ? new Date().toISOString()
          : pageData.published_at
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete static page (move to trash) - WordPress style
   */
  static async moveToTrash(id: number, userId?: string) {
    try {
      console.log('🗑️ Moving page to trash:', { id, userId });

      const { data, error } = await getClient()
        .from('static_pages')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: userId || null,
          status: 'trash',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null) // Only move to trash if not already deleted
        .select()
        .single();

      if (error) {
        console.error('❌ moveToTrash (page) error:', error);
        throw error;
      }

      console.log('✅ Page moved to trash successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ moveToTrash (page) failed:', error);
      throw error;
    }
  }

  /**
   * Restore static page from trash - WordPress style
   */
  static async restoreFromTrash(id: number, newStatus: 'draft' | 'published' = 'draft') {
    const { data, error } = await getClient()
      .from('static_pages')
      .update({
        deleted_at: null,
        deleted_by: null,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .not('deleted_at', 'is', null) // Only restore if currently in trash
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Permanently delete static page (hard delete) - WordPress style
   * Only works on pages that are already in trash
   */
  static async permanentDelete(id: number) {
    const { error } = await getClient()
      .from('static_pages')
      .delete()
      .eq('id', id)
      .not('deleted_at', 'is', null); // Only permanently delete if already in trash

    if (error) throw error;
    return true;
  }

  /**
   * Legacy delete method - now redirects to moveToTrash for safety
   * @deprecated Use moveToTrash instead
   */
  static async deletePage(id: number, userId?: string) {
    console.warn('deletePage is deprecated. Use moveToTrash instead.');
    return this.moveToTrash(id, userId);
  }
}

// ===== CATEGORY OPERATIONS =====

export class CategoryOps {
  /**
   * Get all categories (public)
   */
  static async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get category by slug (public)
   */
  static async getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create category (admin)
   */
  static async createCategory(categoryData: Partial<Category>) {
    try {
      const insertData = {
        name: categoryData.name || 'Untitled Category',
        slug: categoryData.slug || generateSlug(categoryData.name || 'untitled-category'),
        description: categoryData.description || '',
        post_count: 0
      };

      const { data, error } = await getClient()
        .from('categories')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Create category error:', error);
        throw error;
      }

      console.log('✅ Category created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Create category failed:', error);
      throw error;
    }
  }

  /**
   * Update category (admin)
   */
  static async updateCategory(id: number, categoryData: Partial<Category>) {
    const { data, error } = await getClient()
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ===== TAG OPERATIONS =====

export class TagOps {
  /**
   * Get all tags (public)
   */
  static async getAllTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get tag by slug (public)
   */
  static async getTagBySlug(slug: string) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create tag (admin)
   */
  static async createTag(tagData: Partial<Tag>) {
    try {
      const insertData = {
        name: tagData.name || 'Untitled Tag',
        slug: tagData.slug || generateSlug(tagData.name || 'untitled-tag'),
        description: tagData.description || '',
        post_count: 0
      };

      const { data, error } = await getClient()
        .from('tags')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Create tag error:', error);
        throw error;
      }

      console.log('✅ Tag created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Create tag failed:', error);
      throw error;
    }
  }

  /**
   * Update tag (admin)
   */
  static async updateTag(id: number, tagData: Partial<Tag>) {
    const { data, error } = await getClient()
      .from('tags')
      .update(tagData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ===== CMS STATISTICS =====

export class CMSStats {
  /**
   * Get comprehensive CMS statistics (WordPress-style)
   */
  static async getCMSStatistics() {
    try {
      // Get blog post statistics
      const { data: postStats, error: postError } = await getClient()
        .from('blog_posts')
        .select('status, deleted_at, view_count');

      if (postError) throw postError;

      // Get static page statistics
      const { data: pageStats, error: pageError } = await getClient()
        .from('static_pages')
        .select('status, deleted_at');

      if (pageError) throw pageError;

      // Calculate blog post counts
      const posts = postStats || [];
      const blogStats = {
        total: posts.filter(p => !p.deleted_at).length,
        published: posts.filter(p => p.status === 'published' && !p.deleted_at).length,
        draft: posts.filter(p => p.status === 'draft' && !p.deleted_at).length,
        private: posts.filter(p => p.status === 'private' && !p.deleted_at).length,
        scheduled: posts.filter(p => p.status === 'scheduled' && !p.deleted_at).length,
        trash: posts.filter(p => p.deleted_at).length,
        totalViews: posts.filter(p => !p.deleted_at).reduce((sum, p) => sum + (p.view_count || 0), 0)
      };

      // Calculate static page counts
      const pages = pageStats || [];
      const pageStatsResult = {
        total: pages.filter(p => !p.deleted_at).length,
        published: pages.filter(p => p.status === 'published' && !p.deleted_at).length,
        draft: pages.filter(p => p.status === 'draft' && !p.deleted_at).length,
        private: pages.filter(p => p.status === 'private' && !p.deleted_at).length,
        trash: pages.filter(p => p.deleted_at).length
      };

      return {
        posts: blogStats,
        pages: pageStatsResult,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting CMS statistics:', error);
      throw error;
    }
  }

  /**
   * Get quick status counts for a specific content type
   */
  static async getStatusCounts(contentType: 'posts' | 'pages') {
    const tableName = contentType === 'posts' ? 'blog_posts' : 'static_pages';

    const { data, error } = await getClient()
      .from(tableName)
      .select('status, deleted_at');

    if (error) throw error;

    const items = data || [];
    return {
      all: items.filter(item => !item.deleted_at).length,
      published: items.filter(item => item.status === 'published' && !item.deleted_at).length,
      draft: items.filter(item => item.status === 'draft' && !item.deleted_at).length,
      trash: items.filter(item => item.deleted_at).length
    };
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Extract excerpt from content
 */
export function extractExcerpt(content: string, maxLength = 160): string {
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > maxLength
    ? plainText.substring(0, maxLength).trim() + '...'
    : plainText;
}
