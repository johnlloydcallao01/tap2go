import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/blog/posts/bin - Get all soft deleted posts
export async function GET() {
  try {
    console.log('🗑️ Fetching posts from bin...');

    // Get soft deleted posts (deleted_at IS NOT NULL)
    const posts = await sql`
      SELECT 
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
      FROM blog_posts 
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    `;

    console.log(`✅ Found ${posts.length} posts in bin`);

    return NextResponse.json({
      success: true,
      posts: posts,
      stats: {
        totalInBin: posts.length,
        deletedToday: posts.filter(post => {
          const deletedDate = new Date(post.deleted_at);
          const today = new Date();
          return deletedDate.toDateString() === today.toDateString();
        }).length
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
