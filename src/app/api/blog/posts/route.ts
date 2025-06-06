import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/hybrid-client';

/**
 * Blog Posts API Route - Direct Neon Database Access
 * Fallback when Strapi is not available
 */

/**
 * GET - Fetch blog posts from Neon database
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/blog/posts - Starting request...');
    console.log('🌍 Environment details:', {
      isVercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasUnpooledUrl: !!process.env.DATABASE_URL_UNPOOLED,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      timestamp: new Date().toISOString()
    });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    console.log('📊 Query params:', { page, limit, status, offset });

    // Build query with optional status filter
    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [limit, offset];

    // Add deleted_at filter (assume it exists, handle error if it doesn't)
    let hasDeletedAtColumn = false;
    try {
      // Test if deleted_at column exists by trying to query it
      await db.sql(`SELECT deleted_at FROM blog_posts LIMIT 1`);
      whereClause += ' AND deleted_at IS NULL';
      hasDeletedAtColumn = true;
      console.log('✅ Using deleted_at filter');
    } catch (error) {
      console.log('⚠️ No deleted_at column found, proceeding without soft delete filter');
      console.log('⚠️ Column check error:', error instanceof Error ? error.message : 'Unknown error');
    }

    if (status) {
      whereClause += ' AND status = $3';
      params.push(status);
    }

    console.log('🔍 WHERE clause:', whereClause);
    console.log('🔍 Query params array:', params);

    // Fetch posts using direct SQL for performance
    const postsQuery = `
      SELECT
        id,
        uuid,
        title,
        slug,
        content,
        excerpt,
        status,
        featured_image_url,
        author_name,
        author_bio,
        author_avatar_url,
        categories,
        tags,
        is_featured,
        is_sticky,
        view_count,
        reading_time,
        published_at,
        created_at,
        updated_at
      FROM blog_posts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    console.log('🔍 Executing posts query:', postsQuery.substring(0, 200) + '...');
    console.log('🔍 With parameters:', params);

    const posts = await db.sql(postsQuery, params);
    console.log(`📝 Found ${posts.length} posts`);

    // Log first few posts for debugging
    if (posts.length > 0) {
      console.log('📝 Sample posts:', posts.slice(0, 2).map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        created_at: p.created_at
      })));
    } else {
      console.log('⚠️ No posts found - checking if table has any data...');
      try {
        const totalCount = await db.sql<{ count: number }>('SELECT COUNT(*) as count FROM blog_posts');
        const count = totalCount[0]?.count || 0;
        console.log('📊 Total posts in table:', count);

        if (count > 0) {
          console.log('📊 Sample of all posts in table:');
          const samplePosts = await db.sql('SELECT id, title, status, created_at, deleted_at FROM blog_posts ORDER BY created_at DESC LIMIT 3');
          console.log(samplePosts);
        }
      } catch (debugError) {
        console.log('⚠️ Debug query failed:', debugError instanceof Error ? debugError.message : 'Unknown error');
      }
    }

    // Get total count for pagination (use same WHERE clause logic)
    let countWhereClause = 'WHERE 1=1';

    // Add deleted_at filter if it was used in main query
    if (hasDeletedAtColumn) {
      countWhereClause += ' AND deleted_at IS NULL';
    }

    if (status) {
      countWhereClause += ' AND status = $1';
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM blog_posts
      ${countWhereClause}
    `;
    const countParams = status ? [status] : [];

    console.log('🔍 Executing count query:', countQuery);
    console.log('🔍 Count params:', countParams);

    const [{ total }] = await db.sql(countQuery, countParams);
    console.log(`📊 Total count: ${total}`);

    // Calculate stats (use same deleted_at logic as main query)
    let statsQuery;

    if (hasDeletedAtColumn) {
      // Use soft delete aware stats
      statsQuery = `
        SELECT
          COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as total_posts,
          COUNT(CASE WHEN status = 'published' AND deleted_at IS NULL THEN 1 END) as published_posts,
          COUNT(CASE WHEN status = 'draft' AND deleted_at IS NULL THEN 1 END) as draft_posts,
          COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as trashed_posts,
          COALESCE(SUM(CASE WHEN deleted_at IS NULL THEN view_count ELSE 0 END), 0) as total_views
        FROM blog_posts
      `;
    } else {
      // Use simple stats without deleted_at
      statsQuery = `
        SELECT
          COUNT(*) as total_posts,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts,
          0 as trashed_posts,
          COALESCE(SUM(view_count), 0) as total_views
        FROM blog_posts
      `;
    }

    console.log('🔍 Executing stats query:', statsQuery);
    const [stats] = await db.sql(statsQuery);
    console.log('📊 Stats:', stats);

    // Transform data to match frontend interface
    const transformedPosts = posts.map((post: Record<string, unknown>) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      featured_image_url: post.featured_image_url,
      author_name: post.author_name,
      created_at: post.created_at,
      updated_at: post.updated_at,
      // Additional fields for rich content
      categories: post.categories || [],
      tags: post.tags || [],
      is_featured: post.is_featured,
      view_count: post.view_count || 0,
      reading_time: post.reading_time
    }));

    const response = {
      success: true,
      posts: transformedPosts,
      stats: {
        totalPosts: parseInt(String(stats.total_posts || 0)),
        publishedPosts: parseInt(String(stats.published_posts || 0)),
        draftPosts: parseInt(String(stats.draft_posts || 0)),
        trashedPosts: parseInt(String(stats.trashed_posts || 0)),
        totalViews: parseInt(String(stats.total_views || 0))
      },
      pagination: {
        page,
        limit,
        total: parseInt(String(total || 0)),
        totalPages: Math.ceil(parseInt(String(total || 0)) / limit)
      }
    };

    console.log('✅ Returning response with', transformedPosts.length, 'posts');
    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('Error fetching blog posts from database:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch blog posts',
      posts: [],
      stats: {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        trashedPosts: 0,
        totalViews: 0
      }
    }, { status: 500 });
  }
}

/**
 * POST - Create new blog post in Neon database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting blog post creation...');
    console.log('Environment:', {
      isVercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL
    });

    const body = await request.json();
    console.log('📝 Request body received:', { title: body.title, hasContent: !!body.content });

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json({
        success: false,
        message: 'Title and content are required'
      }, { status: 400 });
    }

    // Generate slug if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    console.log('🔗 Generated slug:', slug);
    console.log('💾 Attempting database insert...');

    // Insert using direct SQL for maximum performance and reliability
    // Use PostgreSQL NOW() for timestamps to avoid constraint violations
    const status = body.status || 'draft';

    const insertResult = await db.sql(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, status,
        author_name, author_bio, featured_image_url,
        categories, tags, is_featured, is_sticky,
        reading_time, published_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5::VARCHAR(20), $6, $7, $8, $9, $10, $11, $12, $13,
              CASE WHEN $5::VARCHAR(20) = 'published' THEN NOW() ELSE NULL END,
              NOW(), NOW())
      RETURNING id, title, slug, content, excerpt, status,
                featured_image_url, author_name, created_at, updated_at, published_at
    `, [
      body.title,
      slug,
      body.content,
      body.excerpt || '',
      status,
      body.author_name || 'Admin',
      body.author_bio || '',
      body.featured_image_url || '',
      JSON.stringify(body.categories || []),
      JSON.stringify(body.tags || []),
      Boolean(body.is_featured),
      Boolean(body.is_sticky),
      parseInt(String(body.reading_time || 5))
    ]);

    const post = insertResult[0];
    console.log('✅ Blog post created successfully:', post.id);

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        featured_image_url: post.featured_image_url,
        author_name: post.author_name,
        created_at: post.created_at,
        updated_at: post.updated_at,
        published_at: post.published_at
      }
    });

  } catch (error: unknown) {
    console.error('❌ Error creating blog post:', error);

    // Enhanced error logging for production debugging
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      },
      timestamp: new Date().toISOString()
    };

    console.error('Error details:', errorDetails);

    // Return user-friendly error message
    let userMessage = 'Failed to create blog post';
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        userMessage = 'Database connection failed. Please try again.';
      } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
        userMessage = 'A post with this title already exists.';
      } else {
        userMessage = error.message;
      }
    }

    return NextResponse.json({
      success: false,
      message: userMessage,
      errorDetails: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    }, { status: 500 });
  }
}

/**
 * PUT - Update blog post in Neon database
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Post ID is required'
      }, { status: 400 });
    }

    // Update using direct SQL for maximum performance
    // Use PostgreSQL NOW() for published_at when status changes to published to avoid constraint violations
    const updateResult = await db.sql(`
      UPDATE blog_posts
      SET
        title = $2,
        content = $3,
        excerpt = $4,
        status = $5,
        author_name = $6,
        featured_image_url = $7,
        categories = $8,
        tags = $9,
        is_featured = $10,
        published_at = CASE
          WHEN $5 = 'published' AND published_at IS NULL THEN NOW()
          WHEN $5 != 'published' THEN NULL
          ELSE published_at
        END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, title, slug, content, excerpt, status,
                featured_image_url, author_name, created_at, updated_at, published_at
    `, [
      parseInt(id),
      updateData.title,
      updateData.content,
      updateData.excerpt,
      updateData.status,
      updateData.author_name,
      updateData.featured_image_url,
      JSON.stringify(updateData.categories || []),
      JSON.stringify(updateData.tags || []),
      updateData.is_featured || false
    ]);

    const post = updateResult[0];

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        featured_image_url: post.featured_image_url,
        author_name: post.author_name,
        created_at: post.created_at,
        updated_at: post.updated_at,
        published_at: post.published_at
      }
    });

  } catch (error: unknown) {
    console.error('Error updating blog post:', error);

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update blog post'
    }, { status: 500 });
  }
}

/**
 * DELETE - Delete blog post from Neon database
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('🗑️ DELETE request received for post ID:', id);

    if (!id) {
      console.log('❌ No post ID provided');
      return NextResponse.json({
        success: false,
        message: 'Post ID is required'
      }, { status: 400 });
    }

    // Check if post exists before deletion
    console.log('🔍 Checking if post exists...');
    const existingPost = await db.sql(`
      SELECT id, title, deleted_at
      FROM blog_posts
      WHERE id = $1
    `, [parseInt(id)]);

    if (existingPost.length === 0) {
      console.log('❌ Post not found with ID:', id);
      return NextResponse.json({
        success: false,
        message: 'Post not found'
      }, { status: 404 });
    }

    console.log('📋 Post found:', existingPost[0]);

    // Soft delete by setting deleted_at timestamp using direct SQL
    console.log('🗑️ Performing soft delete...');
    const deleteResult = await db.sql(`
      UPDATE blog_posts
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING id, title, deleted_at
    `, [parseInt(id)]);

    console.log('✅ Delete result:', deleteResult);

    // Verify the deletion
    const verifyDelete = await db.sql(`
      SELECT id, title, deleted_at
      FROM blog_posts
      WHERE id = $1
    `, [parseInt(id)]);

    console.log('🔍 Verification - Post after deletion:', verifyDelete[0]);

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
      deletedPost: deleteResult[0]
    });

  } catch (error: unknown) {
    console.error('❌ Error deleting blog post:', error);

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete blog post'
    }, { status: 500 });
  }
}
