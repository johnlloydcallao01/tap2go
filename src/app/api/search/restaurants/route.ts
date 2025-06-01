// Bonsai Elasticsearch Search API for Restaurants
// GET /api/search/restaurants?q=pizza&cuisine=italian&lat=14.5995&lng=120.9842

import { NextRequest, NextResponse } from 'next/server';
import { searchRestaurants, SearchFilters, SearchOptions, getSearchSuggestions } from '@/lib/search/bonsaiSearch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get search parameters
    const query = searchParams.get('q') || '';
    const cuisine = searchParams.get('cuisine');
    const minRating = searchParams.get('minRating');
    const maxDeliveryFee = searchParams.get('maxDeliveryFee');
    const isOpen = searchParams.get('isOpen');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const sortBy = searchParams.get('sortBy') as 'relevance' | 'rating' | 'distance' | 'deliveryTime';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filters
    const filters: SearchFilters = {};

    if (cuisine) {
      filters.cuisine = cuisine.split(',');
    }

    if (minRating) {
      filters.minRating = parseFloat(minRating);
    }

    if (maxDeliveryFee) {
      filters.maxDeliveryFee = parseFloat(maxDeliveryFee);
    }

    if (isOpen !== null) {
      filters.isOpen = isOpen === 'true';
    }

    if (lat && lng) {
      filters.location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: radius || '10km'
      };
    }

    // Build options
    const options: SearchOptions = {
      from: (page - 1) * limit,
      size: limit,
      sortBy: sortBy || 'relevance'
    };

    // Perform search
    const results = await searchRestaurants(query, filters, options);

    // Return results
    return NextResponse.json({
      success: true,
      data: {
        restaurants: results.restaurants,
        pagination: {
          page,
          limit,
          total: results.total,
          pages: Math.ceil(results.total / limit)
        },
        aggregations: results.aggregations,
        query: {
          text: query,
          filters,
          options
        }
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/search/restaurants - Advanced search with complex filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, options } = body;

    // Validate input
    if (!query && !filters) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Either query or filters must be provided'
        },
        { status: 400 }
      );
    }

    // Perform search
    const results = await searchRestaurants(query || '', filters || {}, options || {});

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Advanced search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
