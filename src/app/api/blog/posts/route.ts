import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { BlogPostOps } from '@/lib/supabase/cms-operations';

/**
 * Blog Posts API Route - Supabase Database Access
 */

// GET /api/blog/posts - Get all blog posts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    console.log('📖 Fetching blog posts...');

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';

    console.log('🔍 Query parameters:', { page, limit, status });

    // Use the CMS operations for consistent data fetching
    let posts;
    if (status === 'all') {
      posts = await BlogPostOps.getAllPosts(limit, (page - 1) * limit);
    } else if (status === 'trash') {
      posts = await BlogPostOps.getTrashedPosts();
    } else if (status === 'published' || status === 'draft') {
      posts = await BlogPostOps.getPostsByStatus(status, limit);
    } else {
      // Default to all posts for any other status
      posts = await BlogPostOps.getAllPosts(limit, (page - 1) * limit);
    }

    // Get total count and stats
    const allPosts = await BlogPostOps.getAllPostsIncludingTrashed(1000);
    const totalCount = allPosts?.length || 0;
    
    const stats = {
      total: allPosts?.filter(p => !p.deleted_at).length || 0,
      published: allPosts?.filter(p => p.status === 'published' && !p.deleted_at).length || 0,
      draft: allPosts?.filter(p => p.status === 'draft' && !p.deleted_at).length || 0,
      trash: allPosts?.filter(p => p.deleted_at).length || 0
    };

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);

    console.log(`✅ Found ${posts?.length || 0} posts`);

    return NextResponse.json({
      success: true,
      posts: posts || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      },
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch blog posts',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/blog/posts - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new blog post...');

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const body = await request.json();
    console.log('📝 Post data:', body);

    const result = await BlogPostOps.createPost(body);

    if (result) {
      console.log('✅ Post created successfully:', result.id);
      return NextResponse.json({
        success: true,
        message: 'Post created successfully',
        post: result
      });
    } else {
      throw new Error('Failed to create post');
    }

  } catch (error) {
    console.error('❌ Error creating blog post:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/blog/posts - Update a blog post
export async function PUT(request: NextRequest) {
  try {
    console.log('📝 Updating blog post...');

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Post ID is required' },
        { status: 400 }
      );
    }

    const result = await BlogPostOps.updatePost(id, updateData);

    if (result) {
      console.log('✅ Post updated successfully:', result.id);
      return NextResponse.json({
        success: true,
        message: 'Post updated successfully',
        post: result
      });
    } else {
      throw new Error('Failed to update post');
    }

  } catch (error) {
    console.error('❌ Error updating blog post:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/posts - Delete a blog post (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting blog post...');

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Post ID is required' },
        { status: 400 }
      );
    }

    const result = await BlogPostOps.moveToTrash(parseInt(id), 'admin');

    if (result) {
      console.log('✅ Post moved to trash successfully:', id);
      return NextResponse.json({
        success: true,
        message: 'Post moved to trash successfully'
      });
    } else {
      throw new Error('Failed to move post to trash');
    }

  } catch (error) {
    console.error('❌ Error deleting blog post:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
