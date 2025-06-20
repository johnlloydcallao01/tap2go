import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

// GET /api/blog/posts/bin - Get all soft deleted posts
export async function GET() {
  try {
    console.log('🗑️ Fetching posts from bin...');

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    // Get soft deleted posts (deleted_at IS NOT NULL)
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        author_name,
        status,
        created_at,
        updated_at,
        deleted_at
      `)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`✅ Found ${posts?.length || 0} posts in bin`);

    return NextResponse.json({
      success: true,
      posts: posts || [],
      stats: {
        totalInBin: posts?.length || 0,
        deletedToday: posts?.filter(post => {
          const deletedDate = new Date(post.deleted_at);
          const today = new Date();
          return deletedDate.toDateString() === today.toDateString();
        }).length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching bin posts:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch bin posts',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
