// Bonsai Elasticsearch Suggestions API
// GET /api/search/suggestions?q=pizza

import { NextRequest, NextResponse } from 'next/server';
import { getSearchSuggestions, getIntelligentSuggestions, getPopularSearches } from '@/lib/search/bonsaiSearch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // If no query, return popular searches
    if (!query || query.length < 2) {
      const popularSearches = await getPopularSearches();
      return NextResponse.json({
        success: true,
        data: {
          suggestions: popularSearches,
          type: 'popular',
          query: query
        }
      });
    }

    // Get intelligent autocomplete suggestions with fuzzy matching and synonyms
    let suggestions = await getIntelligentSuggestions(query);

    // Fallback to basic suggestions if intelligent search fails
    if (suggestions.length === 0) {
      suggestions = await getSearchSuggestions(query);
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        type: 'intelligent_autocomplete',
        query: query,
        count: suggestions.length
      }
    });

  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Suggestions failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
