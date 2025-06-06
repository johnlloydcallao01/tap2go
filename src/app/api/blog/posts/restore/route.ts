import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// PUT /api/blog/posts/restore?id=123 - Restore a post from bin (remove deleted_at)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'Post ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Restoring post ID: ${postId}`);

    // First check if the post exists and is soft deleted
    const existingPost = await sql`
      SELECT id, title, deleted_at 
      FROM blog_posts 
      WHERE id = ${postId}
    `;

    if (existingPost.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    if (!existingPost[0].deleted_at) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Post is not in bin. Only deleted posts can be restored.' 
        },
        { status: 400 }
      );
    }

    // Restore the post by setting deleted_at to NULL
    const result = await sql`
      UPDATE blog_posts 
      SET deleted_at = NULL, updated_at = NOW()
      WHERE id = ${postId} AND deleted_at IS NOT NULL
      RETURNING id, title, status, updated_at
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to restore post' },
        { status: 400 }
      );
    }

    console.log(`✅ Post "${existingPost[0].title}" restored successfully`);

    return NextResponse.json({
      success: true,
      message: 'Post restored successfully',
      restoredPost: {
        id: postId,
        title: existingPost[0].title,
        status: result[0].status,
        updated_at: result[0].updated_at
      }
    });

  } catch (error) {
    console.error('❌ Error restoring post:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to restore post',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
