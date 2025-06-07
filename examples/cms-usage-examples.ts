/**
 * WordPress-Style CMS Usage Examples
 * How to use the new Supabase CMS in your Tap2Go app
 */

import { BlogPostOps, StaticPageOps, CategoryOps, TagOps } from '@/lib/supabase/cms-operations';

// ===== BLOG EXAMPLES =====

// Get latest blog posts for homepage
export async function getHomepageBlogPosts() {
  try {
    const posts = await BlogPostOps.getPublishedPosts(6); // Get 6 latest posts
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Get featured posts for hero section
export async function getFeaturedPosts() {
  try {
    const featuredPosts = await BlogPostOps.getFeaturedPosts(3);
    return featuredPosts;
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

// Get single blog post for blog detail page
export async function getBlogPost(slug: string) {
  try {
    const post = await BlogPostOps.getPostBySlug(slug);
    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Search blog posts
export async function searchBlogPosts(query: string) {
  try {
    const results = await BlogPostOps.searchPosts(query, 10);
    return results;
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

// Get posts by category (e.g., for category pages)
export async function getPostsByCategory(categorySlug: string, page = 1) {
  try {
    const limit = 10;
    const offset = (page - 1) * limit;
    const posts = await BlogPostOps.getPostsByCategory(categorySlug, limit, offset);
    return posts;
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }
}

// ===== STATIC PAGES EXAMPLES =====

// Get navigation menu items
export async function getNavigationPages() {
  try {
    const navPages = await StaticPageOps.getNavigationPages();
    return navPages;
  } catch (error) {
    console.error('Error fetching navigation pages:', error);
    return [];
  }
}

// Get single static page (e.g., About, Contact, Privacy)
export async function getStaticPage(slug: string) {
  try {
    const page = await StaticPageOps.getPageBySlug(slug);
    return page;
  } catch (error) {
    console.error('Error fetching static page:', error);
    return null;
  }
}

// Get page hierarchy for sitemap or nested navigation
export async function getPageHierarchy() {
  try {
    const hierarchy = await StaticPageOps.getPageHierarchy();
    return hierarchy;
  } catch (error) {
    console.error('Error fetching page hierarchy:', error);
    return [];
  }
}

// ===== CATEGORY & TAG EXAMPLES =====

// Get all categories for blog sidebar or filter
export async function getAllCategories() {
  try {
    const categories = await CategoryOps.getAllCategories();
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get all tags for tag cloud or filter
export async function getAllTags() {
  try {
    const tags = await TagOps.getAllTags();
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

// ===== ADMIN EXAMPLES (for CMS admin panel) =====

// Create new blog post
export async function createBlogPost(postData: {
  title: string;
  content: string;
  author_name: string;
  author_id?: string;
  status?: 'draft' | 'published';
  is_featured?: boolean;
  categories?: number[];
  tags?: number[];
}) {
  try {
    // Generate slug from title
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-');

    // Calculate reading time
    const readingTime = Math.ceil(postData.content.split(' ').length / 200);

    // Extract excerpt
    const excerpt = postData.content
      .replace(/<[^>]*>/g, '')
      .substring(0, 160) + '...';

    // Remove categories and tags from postData as they need special handling
    const { categories, tags, ...cleanPostData } = postData;

    const newPost = await BlogPostOps.createPost({
      ...cleanPostData,
      slug,
      excerpt,
      reading_time: readingTime,
      status: postData.status || 'draft'
    });

    return newPost;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
}

// Create new static page
export async function createStaticPage(pageData: {
  title: string;
  content: string;
  author_name: string;
  author_id?: string;
  status?: 'draft' | 'published';
  show_in_navigation?: boolean;
  page_template?: string;
}) {
  try {
    const slug = pageData.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-');

    const newPage = await StaticPageOps.createPage({
      ...pageData,
      slug,
      status: pageData.status || 'draft',
      page_template: pageData.page_template || 'default',
      menu_order: 0
    });

    return newPage;
  } catch (error) {
    console.error('Error creating static page:', error);
    throw error;
  }
}

// ===== NEXT.JS PAGE EXAMPLES =====

// Example: Blog listing page
export async function generateBlogListingProps() {
  const [posts, categories, tags] = await Promise.all([
    getHomepageBlogPosts(),
    getAllCategories(),
    getAllTags()
  ]);

  return {
    props: {
      posts,
      categories,
      tags
    }
  };
}

// Example: Single blog post page
export async function generateBlogPostProps(slug: string) {
  const post = await getBlogPost(slug);
  
  if (!post) {
    return { notFound: true };
  }

  return {
    props: { post }
  };
}

// Example: Static page props
export async function generateStaticPageProps(slug: string) {
  const page = await getStaticPage(slug);
  
  if (!page) {
    return { notFound: true };
  }

  return {
    props: { page }
  };
}
