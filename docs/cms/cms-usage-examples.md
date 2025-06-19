# 📝 CMS Usage Examples

This guide demonstrates how to use the Supabase CMS operations in your Tap2Go application.

## 📋 Overview

The CMS system provides WordPress-style functionality for managing blog posts, static pages, categories, and tags. These examples show practical implementation patterns for common use cases.

## 🔧 Import Statement

```typescript
import { BlogPostOps, StaticPageOps, CategoryOps, TagOps } from '@/lib/supabase/cms-operations';
```

## 📖 Blog Examples

### Get Latest Blog Posts for Homepage

```typescript
export async function getHomepageBlogPosts() {
  try {
    const posts = await BlogPostOps.getPublishedPosts(6); // Get 6 latest posts
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}
```

### Get Featured Posts for Hero Section

```typescript
export async function getFeaturedPosts() {
  try {
    const featuredPosts = await BlogPostOps.getFeaturedPosts(3);
    return featuredPosts;
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}
```

### Get Single Blog Post for Detail Page

```typescript
export async function getBlogPost(slug: string) {
  try {
    const post = await BlogPostOps.getPostBySlug(slug);
    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}
```

### Search Blog Posts

```typescript
export async function searchBlogPosts(query: string) {
  try {
    const results = await BlogPostOps.searchPosts(query, 10);
    return results;
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}
```

### Get Posts by Category

```typescript
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
```

## 📄 Static Pages Examples

### Get Navigation Menu Items

```typescript
export async function getNavigationPages() {
  try {
    const navPages = await StaticPageOps.getNavigationPages();
    return navPages;
  } catch (error) {
    console.error('Error fetching navigation pages:', error);
    return [];
  }
}
```

### Get Single Static Page

```typescript
export async function getStaticPage(slug: string) {
  try {
    const page = await StaticPageOps.getPageBySlug(slug);
    return page;
  } catch (error) {
    console.error('Error fetching static page:', error);
    return null;
  }
}
```

### Get Page Hierarchy

```typescript
export async function getPageHierarchy() {
  try {
    const hierarchy = await StaticPageOps.getPageHierarchy();
    return hierarchy;
  } catch (error) {
    console.error('Error fetching page hierarchy:', error);
    return [];
  }
}
```

## 🏷️ Categories & Tags Examples

### Get All Categories

```typescript
export async function getAllCategories() {
  try {
    const categories = await CategoryOps.getAllCategories();
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
```

### Get All Tags

```typescript
export async function getAllTags() {
  try {
    const tags = await TagOps.getAllTags();
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}
```

## ⚙️ Admin Examples

### Create New Blog Post

```typescript
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
```

### Create New Static Page

```typescript
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
```

## ⚛️ Next.js Integration Examples

### Blog Listing Page Props

```typescript
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
```

### Single Blog Post Page Props

```typescript
export async function generateBlogPostProps(slug: string) {
  const post = await getBlogPost(slug);
  
  if (!post) {
    return { notFound: true };
  }

  return {
    props: { post }
  };
}
```

### Static Page Props

```typescript
export async function generateStaticPageProps(slug: string) {
  const page = await getStaticPage(slug);
  
  if (!page) {
    return { notFound: true };
  }

  return {
    props: { page }
  };
}
```

## 🔗 Related Documentation

- [CMS Implementation Success](./CMS_IMPLEMENTATION_SUCCESS.md)
- [Professional Blog Schema](./PROFESSIONAL_BLOG_SCHEMA.md)
- [CMS API Documentation](./CMS_API_DOCUMENTATION.md)

## 💡 Best Practices

1. **Error Handling**: Always wrap CMS operations in try-catch blocks
2. **Performance**: Use Promise.all() for parallel operations when possible
3. **SEO**: Generate proper slugs and meta descriptions
4. **Caching**: Consider implementing caching for frequently accessed content
5. **Validation**: Validate input data before creating/updating content

## 🚀 Next Steps

1. Implement these examples in your pages and components
2. Customize the functions based on your specific requirements
3. Add proper TypeScript types for better development experience
4. Consider implementing caching strategies for better performance
