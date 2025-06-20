// Learning Search System - Tracks and learns from user behavior
// This adds real learning capabilities to our search

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Track search events for learning
export interface SearchEvent {
  query: string;
  results: number;
  clickedResult?: string;
  userId?: string;
  timestamp: Date;
  sessionId: string;
  resultPosition?: number; // Which result was clicked
}

// Learning analytics data
export interface SearchLearning {
  popularQueries: Array<{ query: string; count: number; successRate: number }>;
  failedQueries: Array<{ query: string; count: number; suggestions: string[] }>;
  userPatterns: Array<{ pattern: string; improvement: string }>;
  synonymsLearned: Record<string, string[]>;
}

// Track search behavior (learns from user actions)
export const trackSearchEvent = async (event: SearchEvent): Promise<void> => {
  try {
    await addDoc(collection(db, 'search_analytics'), {
      ...event,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error tracking search event:', error);
  }
};

// Learn popular queries (adapts to user behavior)
export const getPopularQueriesLearned = async (): Promise<string[]> => {
  try {
    // Get queries from last 30 days with high success rates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const q = query(
      collection(db, 'search_analytics'),
      where('timestamp', '>=', thirtyDaysAgo),
      where('results', '>', 0), // Only successful searches
      orderBy('timestamp', 'desc'),
      limit(1000)
    );

    const snapshot = await getDocs(q);
    const queryCount: Record<string, number> = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const searchQuery = data.query.toLowerCase().trim();
      queryCount[searchQuery] = (queryCount[searchQuery] || 0) + 1;
    });

    // Return top queries sorted by frequency
    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query);

  } catch (error) {
    console.error('Error getting learned popular queries:', error);
    return ['Pizza', 'Burger', 'Chinese', 'Italian']; // Fallback
  }
};

// Learn failed queries and suggest corrections
export const learnFromFailedQueries = async (): Promise<Record<string, string[]>> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const q = query(
      collection(db, 'search_analytics'),
      where('timestamp', '>=', sevenDaysAgo),
      where('results', '==', 0), // Failed searches
      limit(500)
    );

    const snapshot = await getDocs(q);
    const failedQueries: Record<string, number> = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const searchQuery = data.query.toLowerCase().trim();
      failedQueries[searchQuery] = (failedQueries[searchQuery] || 0) + 1;
    });

    // For each failed query, try to find similar successful queries
    const learnedSynonyms: Record<string, string[]> = {};
    
    for (const [failedQuery, count] of Object.entries(failedQueries)) {
      if (count >= 3) { // Only learn from queries that failed multiple times
        const suggestions = await findSimilarSuccessfulQueries(failedQuery);
        if (suggestions.length > 0) {
          learnedSynonyms[failedQuery] = suggestions;
        }
      }
    }

    return learnedSynonyms;
  } catch (error) {
    console.error('Error learning from failed queries:', error);
    return {};
  }
};

// Find similar successful queries using edit distance
const findSimilarSuccessfulQueries = async (failedQuery: string): Promise<string[]> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const q = query(
      collection(db, 'search_analytics'),
      where('timestamp', '>=', thirtyDaysAgo),
      where('results', '>', 0), // Successful searches
      limit(1000)
    );

    const snapshot = await getDocs(q);
    const successfulQueries: string[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      successfulQueries.push(data.query.toLowerCase().trim());
    });

    // Find queries with edit distance <= 2
    const similarQueries = successfulQueries.filter(successQuery => {
      const distance = levenshteinDistance(failedQuery, successQuery);
      return distance <= 2 && distance > 0;
    });

    // Return unique suggestions
    return [...new Set(similarQueries)].slice(0, 3);
  } catch (error) {
    console.error('Error finding similar queries:', error);
    return [];
  }
};

// Calculate edit distance between two strings
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

// Learn user search patterns
export const getUserSearchPatterns = async (userId: string): Promise<string[]> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const q = query(
      collection(db, 'search_analytics'),
      where('userId', '==', userId),
      where('timestamp', '>=', thirtyDaysAgo),
      where('results', '>', 0),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    const userQueries: Record<string, number> = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const searchQuery = data.query.toLowerCase().trim();
      userQueries[searchQuery] = (userQueries[searchQuery] || 0) + 1;
    });

    // Return user's most frequent searches
    return Object.entries(userQueries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([query]) => query);

  } catch (error) {
    console.error('Error getting user search patterns:', error);
    return [];
  }
};

// Enhanced suggestions with learning
export const getLearnedSuggestions = async (
  query: string, 
  userId?: string
): Promise<string[]> => {
  try {
    // Combine multiple learning sources
    const [
      popularQueries,
      learnedSynonyms,
      userPatterns
    ] = await Promise.all([
      getPopularQueriesLearned(),
      learnFromFailedQueries(),
      userId ? getUserSearchPatterns(userId) : Promise.resolve([])
    ]);

    // Check if query matches learned synonyms
    const synonymSuggestions = learnedSynonyms[query.toLowerCase()] || [];
    
    // Filter popular queries that match the input
    const popularMatches = popularQueries.filter(popular => 
      popular.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(popular.toLowerCase())
    );

    // User-specific suggestions
    const userMatches = userPatterns.filter(pattern =>
      pattern.toLowerCase().includes(query.toLowerCase())
    );

    // Combine and prioritize suggestions
    const allSuggestions = [
      ...synonymSuggestions,      // Learned corrections (highest priority)
      ...userMatches,             // User patterns (medium priority)
      ...popularMatches           // Popular queries (lowest priority)
    ];

    // Remove duplicates and return top 8
    return [...new Set(allSuggestions)].slice(0, 8);

  } catch (error) {
    console.error('Error getting learned suggestions:', error);
    return [];
  }
};
