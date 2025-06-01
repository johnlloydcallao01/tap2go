// Learning Search API - Tracks user behavior and learns patterns
// POST /api/search/learn - Track search events
// GET /api/search/learn - Get learned insights

import { NextRequest, NextResponse } from 'next/server';
import { 
  trackSearchEvent, 
  getLearnedSuggestions,
  getPopularQueriesLearned,
  learnFromFailedQueries,
  getUserSearchPatterns,
  SearchEvent 
} from '@/lib/search/learningSearch';

// Track search behavior for learning
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...eventData } = body;

    switch (action) {
      case 'track_search':
        await handleTrackSearch(eventData);
        return NextResponse.json({ success: true, message: 'Search event tracked' });
      
      case 'track_click':
        await handleTrackClick(eventData);
        return NextResponse.json({ success: true, message: 'Click event tracked' });
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Learning API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process learning event' },
      { status: 500 }
    );
  }
}

// Get learned insights and suggestions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');

    switch (type) {
      case 'suggestions':
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Query parameter required for suggestions' },
            { status: 400 }
          );
        }
        const suggestions = await getLearnedSuggestions(query, userId || undefined);
        return NextResponse.json({
          success: true,
          data: { suggestions, type: 'learned', query }
        });

      case 'popular':
        const popularQueries = await getPopularQueriesLearned();
        return NextResponse.json({
          success: true,
          data: { queries: popularQueries, type: 'popular_learned' }
        });

      case 'failed':
        const failedLearning = await learnFromFailedQueries();
        return NextResponse.json({
          success: true,
          data: { synonyms: failedLearning, type: 'failed_learning' }
        });

      case 'user_patterns':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'userId parameter required for user patterns' },
            { status: 400 }
          );
        }
        const userPatterns = await getUserSearchPatterns(userId);
        return NextResponse.json({
          success: true,
          data: { patterns: userPatterns, type: 'user_patterns' }
        });

      case 'analytics':
        const [popular, failed, userPatternsData] = await Promise.all([
          getPopularQueriesLearned(),
          learnFromFailedQueries(),
          userId ? getUserSearchPatterns(userId) : Promise.resolve([])
        ]);
        
        return NextResponse.json({
          success: true,
          data: {
            analytics: {
              popularQueries: popular,
              learnedSynonyms: failed,
              userPatterns: userPatternsData,
              totalLearnings: Object.keys(failed).length
            }
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Learning insights API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get learning insights' },
      { status: 500 }
    );
  }
}

// Handle search tracking
async function handleTrackSearch(eventData: {
  query: string;
  results?: number;
  userId?: string;
  sessionId?: string;
}) {
  const searchEvent: SearchEvent = {
    query: eventData.query,
    results: eventData.results || 0,
    userId: eventData.userId,
    timestamp: new Date(),
    sessionId: eventData.sessionId || generateSessionId()
  };

  await trackSearchEvent(searchEvent);
}

// Handle click tracking
async function handleTrackClick(eventData: {
  query: string;
  totalResults?: number;
  clickedResult?: string;
  position?: number;
  userId?: string;
  sessionId?: string;
}) {
  const clickEvent: SearchEvent = {
    query: eventData.query,
    results: eventData.totalResults || 0,
    clickedResult: eventData.clickedResult,
    resultPosition: eventData.position,
    userId: eventData.userId,
    timestamp: new Date(),
    sessionId: eventData.sessionId || generateSessionId()
  };

  await trackSearchEvent(clickEvent);
}

// Generate session ID for tracking
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
