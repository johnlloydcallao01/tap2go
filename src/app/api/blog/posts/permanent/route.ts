import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

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

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    // First check if the post exists and is already soft deleted
    const { data: existingPost, error: checkError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, deleted_at')
      .eq('id', postId)
      .single();

    if (checkError || !existingPost) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    if (!existingPost.deleted_at) {
      return NextResponse.json(
        {
          success: false,
          message: 'Post must be in bin before permanent deletion. Move to bin first.'
        },
        { status: 400 }
      );
    }

    // Permanently delete the post from database (hard delete)
    const { data: result, error: deleteError } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', postId)
      .not('deleted_at', 'is', null)
      .select('id, title')
      .single();

    if (deleteError || !result) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete post or post not in bin' },
        { status: 400 }
      );
    }

    console.log(`✅ Post "${existingPost.title}" permanently deleted from database`);

    return NextResponse.json({
      success: true,
      message: 'Post permanently deleted from database',
      deletedPost: {
        id: postId,
        title: existingPost.title
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
