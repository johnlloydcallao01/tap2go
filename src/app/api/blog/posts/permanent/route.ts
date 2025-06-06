import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// DELETE /api/blog/posts/permanent?id=123 - Permanently delete a post from database
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'Post ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Permanently deleting post ID: ${postId}`);

    // First check if the post exists and is already soft deleted
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
          message: 'Post must be in bin before permanent deletion. Move to bin first.' 
        },
        { status: 400 }
      );
    }

    // Permanently delete the post from database (hard delete)
    const result = await sql`
      DELETE FROM blog_posts
      WHERE id = ${postId} AND deleted_at IS NOT NULL
      RETURNING id, title
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete post or post not in bin' },
        { status: 400 }
      );
    }

    console.log(`✅ Post "${existingPost[0].title}" permanently deleted from database`);

    return NextResponse.json({
      success: true,
      message: 'Post permanently deleted from database',
      deletedPost: {
        id: postId,
        title: existingPost[0].title
      }
    });

  } catch (error) {
    console.error('❌ Error permanently deleting post:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to permanently delete post',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
