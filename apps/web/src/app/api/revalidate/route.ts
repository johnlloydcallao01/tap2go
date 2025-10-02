import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand revalidation API route
 * This allows manual cache invalidation without waiting for the revalidate timer
 * or requiring a full rebuild
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, tag, secret } = body;

    // Optional: Add a secret token for security in production
    if (process.env.REVALIDATION_SECRET && secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    // Revalidate specific path (like home page)
    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    // Revalidate specific cache tag
    if (tag) {
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag}`);
    }

    // If no specific path/tag provided, revalidate the home page by default
    if (!path && !tag) {
      revalidatePath('/');
      console.log('Revalidated home page');
    }

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      path: path || '/',
      tag: tag || null
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual testing
 * Usage: GET /api/revalidate?path=/&secret=your_secret
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '/';
    const tag = searchParams.get('tag');
    const secret = searchParams.get('secret');

    // Optional: Add a secret token for security in production
    if (process.env.REVALIDATION_SECRET && secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    // Revalidate specific path
    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    // Revalidate specific cache tag
    if (tag) {
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag}`);
    }

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      path: path,
      tag: tag || null
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}