# 🚀 Automated Supabase CMS Setup Guide

## **What You're Getting**

A **WordPress-style CMS** built on Supabase with:
- ✅ **Blog posts** with categories, tags, and full-text search
- ✅ **Static pages** with hierarchical structure  
- ✅ **Media management** capabilities
- ✅ **SEO optimization** built-in
- ✅ **Draft/publish workflow**
- ✅ **Performance optimized** with indexes
- ✅ **Security** with Row Level Security

## **🎯 One-Command Setup (Recommended)**

### **Step 1: Run the Automated Setup**

```bash
npm run supabase:setup
```

This single command will:
1. ✅ Test your Supabase connection
2. ✅ Create all necessary tables
3. ✅ Set up Row Level Security
4. ✅ Insert sample data (optional)
5. ✅ Configure indexes for performance

### **Step 2: Verify Everything Works**

```bash
npm run supabase:verify
```

This will check that all tables are created and accessible.

### **Step 3: Test Connection**

```bash
npm run supabase:test
```

## **📋 What Gets Created**

### **Database Tables:**
- `blog_posts` - WordPress-style blog posts
- `static_pages` - Hierarchical pages (About, Contact, etc.)
- `categories` - Hierarchical categories for posts
- `tags` - Flat tag system for posts
- `post_categories` - Many-to-many post-category relationships
- `post_tags` - Many-to-many post-tag relationships

### **Features:**
- **Full-text search** across posts and pages
- **SEO fields** (meta title, description, featured images)
- **Author management** (links to your Firebase users)
- **Publishing workflow** (draft → published)
- **Featured posts** and sticky posts
- **Reading time calculation**
- **View counting**
- **Scheduled publishing**

## **🔧 Manual Setup (If Automated Fails)**

If the automated setup doesn't work, you can run the SQL manually:

### **Option 1: Use Manual Script**
```bash
npm run supabase:setup-manual
```

### **Option 2: Run SQL in Supabase Dashboard**

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Run these files in order:
   - `supabase-cms-schema.sql`
   - `supabase-cms-policies.sql`
   - `supabase-sample-data.sql` (optional)

## **💻 Using the CMS in Your Code**

### **Import Operations**
```javascript
import { 
  BlogPostOps, 
  StaticPageOps, 
  CategoryOps, 
  TagOps 
} from '@/lib/supabase/cms-operations';
```

### **Get Blog Posts for Homepage**
```javascript
// Get latest published posts
const posts = await BlogPostOps.getPublishedPosts(6);

// Get featured posts
const featured = await BlogPostOps.getFeaturedPosts(3);

// Get single post by slug
const post = await BlogPostOps.getPostBySlug('my-post-slug');
```

### **Get Static Pages**
```javascript
// Get navigation pages
const navPages = await StaticPageOps.getNavigationPages();

// Get single page
const aboutPage = await StaticPageOps.getPageBySlug('about');
```

### **Search Content**
```javascript
// Search blog posts
const results = await BlogPostOps.searchPosts('food delivery');

// Get posts by category
const categoryPosts = await BlogPostOps.getPostsByCategory('technology');
```

### **Admin Operations (Create/Update)**
```javascript
// Create new blog post
const newPost = await BlogPostOps.createPost({
  title: 'My New Post',
  content: '<p>Post content here...</p>',
  author_name: 'John Doe',
  status: 'published',
  is_featured: true
});

// Create new page
const newPage = await StaticPageOps.createPage({
  title: 'Contact Us',
  content: '<p>Contact information...</p>',
  author_name: 'Admin',
  show_in_navigation: true
});
```

## **🎨 Integration with Your App**

### **Next.js Pages Example**
```javascript
// pages/blog/index.js
export async function getStaticProps() {
  const posts = await BlogPostOps.getPublishedPosts(10);
  const categories = await CategoryOps.getAllCategories();
  
  return {
    props: { posts, categories },
    revalidate: 60 // Regenerate every minute
  };
}

// pages/blog/[slug].js
export async function getStaticProps({ params }) {
  const post = await BlogPostOps.getPostBySlug(params.slug);
  
  if (!post) {
    return { notFound: true };
  }
  
  return {
    props: { post },
    revalidate: 60
  };
}
```

## **🔍 Troubleshooting**

### **Connection Issues**
```bash
# Check your environment variables
cat .env.local | grep SUPABASE

# Test connection
npm run supabase:test
```

### **Permission Issues**
- Ensure you're using the **Service Role Key** (not Anon Key) for setup
- Check that your Supabase project is active
- Verify your credentials are correct

### **Table Creation Issues**
- Try the manual setup: `npm run supabase:setup-manual`
- Or run SQL files directly in Supabase Dashboard

## **📚 Example Usage Files**

Check these files for complete examples:
- `examples/cms-usage-examples.ts` - Complete usage examples
- `src/lib/supabase/cms-operations.ts` - All available operations

## **🚀 Next Steps**

1. **Verify setup**: `npm run supabase:verify`
2. **Check Supabase Dashboard** → Table Editor to see your tables
3. **Start building** your blog and pages using the CMS operations
4. **Customize** the schema if needed for your specific requirements

## **🎯 Key Benefits Over Neon**

- ✅ **All-in-one**: Database + Auth + Storage + Realtime
- ✅ **Better developer experience**: Auto-generated APIs
- ✅ **More features**: Built-in search, real-time subscriptions
- ✅ **Easier scaling**: Automatic connection pooling
- ✅ **Better pricing**: More predictable costs
- ✅ **Open source**: Self-hostable if needed

Your WordPress-style CMS is now ready! 🎉
