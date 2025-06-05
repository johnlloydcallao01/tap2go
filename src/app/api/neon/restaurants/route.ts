/**
 * Neon Restaurant Content API Routes
 * CRUD operations for restaurant content in PostgreSQL
 */

import { NextRequest, NextResponse } from 'next/server';
import { RestaurantContentOps } from '@/lib/neon/operations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firebaseId = searchParams.get('firebaseId');
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let result;

    if (firebaseId) {
      // Get specific restaurant by Firebase ID
      result = await RestaurantContentOps.getByFirebaseId(firebaseId);
      
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Restaurant content not found' },
          { status: 404 }
        );
      }
    } else if (slug) {
      // Get specific restaurant by slug
      result = await RestaurantContentOps.getBySlug(slug);
      
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Restaurant content not found' },
          { status: 404 }
        );
      }
    } else {
      // List all restaurants
      result = await RestaurantContentOps.list(limit, offset);
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Restaurant content GET error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch restaurant content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.firebase_id || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'firebase_id and slug are required' },
        { status: 400 }
      );
    }

    // Create restaurant content
    const result = await RestaurantContentOps.create({
      firebase_id: body.firebase_id,
      slug: body.slug,
      story: body.story,
      long_description: body.long_description,
      hero_image_url: body.hero_image_url,
      gallery_images: body.gallery_images || [],
      awards: body.awards || [],
      certifications: body.certifications || [],
      special_features: body.special_features || [],
      social_media: body.social_media || {},
      seo_data: body.seo_data || {},
      is_published: body.is_published || false,
      published_at: body.is_published ? new Date() : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Restaurant content created successfully',
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('Restaurant content POST error:', error);
    
    // Handle unique constraint violations
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Restaurant content already exists',
          message: 'A restaurant with this Firebase ID or slug already exists'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create restaurant content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Restaurant content ID is required' },
        { status: 400 }
      );
    }

    // Update restaurant content
    const result = await RestaurantContentOps.update(id, updateData);

    return NextResponse.json({
      success: true,
      message: 'Restaurant content updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Restaurant content PUT error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update restaurant content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Restaurant content ID is required' },
        { status: 400 }
      );
    }

    await RestaurantContentOps.delete(parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Restaurant content deleted successfully'
    });

  } catch (error) {
    console.error('Restaurant content DELETE error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete restaurant content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
