/**
 * Verify CMS Database Schema
 * Check what tables and columns actually exist in Supabase
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    console.log('🔍 Checking Supabase database schema...');

    // Check if blog_posts table exists
    const { data: blogPostsData, error: blogPostsError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(1);

    // Check if static_pages table exists  
    const { data: staticPagesData, error: staticPagesError } = await supabase
      .from('static_pages')
      .select('*')
      .limit(1);

    // Check if categories table exists
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    // Check if tags table exists
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .limit(1);

    const results = {
      blog_posts: {
        exists: !blogPostsError,
        error: blogPostsError?.message,
        sample_data: blogPostsData?.[0] || null
      },
      static_pages: {
        exists: !staticPagesError,
        error: staticPagesError?.message,
        sample_data: staticPagesData?.[0] || null
      },
      categories: {
        exists: !categoriesError,
        error: categoriesError?.message,
        sample_data: categoriesData?.[0] || null
      },
      tags: {
        exists: !tagsError,
        error: tagsError?.message,
        sample_data: tagsData?.[0] || null
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Database schema verification complete',
      results
    });

  } catch (error) {
    console.error('❌ Schema verification error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Schema verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
