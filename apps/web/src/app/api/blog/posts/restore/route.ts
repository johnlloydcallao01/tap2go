import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

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

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    // First check if the post exists and is soft deleted
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
          message: 'Post is not in bin. Only deleted posts can be restored.'
        },
        { status: 400 }
      );
    }

    // Restore the post by setting deleted_at to NULL
    const { data: result, error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .not('deleted_at', 'is', null)
      .select('id, title, status, updated_at')
      .single();

    if (updateError || !result) {
      return NextResponse.json(
        { success: false, message: 'Failed to restore post' },
        { status: 400 }
      );
    }

    console.log(`✅ Post "${existingPost.title}" restored successfully`);

    return NextResponse.json({
      success: true,
      message: 'Post restored successfully',
      restoredPost: {
        id: postId,
        title: existingPost.title,
        status: result.status,
        updated_at: result.updated_at
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
