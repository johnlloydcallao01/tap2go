// Bonsai OpenSearch Search Service for Tap2Go
// Provides advanced search functionality for restaurants and menu items (Elasticsearch-compatible API)

import { bonsaiClient, INDICES } from '@/lib/bonsai';
import { Restaurant } from '@/types';

// Search interfaces
export interface SearchFilters {
  cuisine?: string[];
  minRating?: number;
  maxDeliveryFee?: number;
  isOpen?: boolean;
  location?: {
    lat: number;
    lng: number;
    radius?: string; // e.g., "5km"
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export interface SearchOptions {
  from?: number;
  size?: number;
  sortBy?: 'relevance' | 'rating' | 'distance' | 'deliveryTime';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  restaurants: Restaurant[];
  total: number;
  aggregations?: {
    cuisines: Array<{ key: string; count: number }>;
    avgRating: number;
    priceRanges: Array<{ key: string; count: number }>;
  };
}

// Main search function
export const searchRestaurants = async (
  query: string,
  filters: SearchFilters = {},
  options: SearchOptions = {}
): Promise<SearchResult> => {
  try {
    const {
      from = 0,
      size = 20,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = options;

    // Build Elasticsearch query
    const searchBody: {
      from: number;
      size: number;
      query: {
        bool: {
          must: unknown[];
          filter: unknown[];
          should?: unknown[];
          minimum_should_match?: number;
        };
      };
      aggs: Record<string, unknown>;
      sort?: Record<string, unknown>[];
    } = {
      from,
      size,
      query: {
        bool: {
          must: [],
          filter: [],
          should: []
        }
      },
      aggs: {
        cuisines: {
          terms: { field: 'cuisine', size: 20 }
        },
        avgRating: {
          avg: { field: 'rating' }
        },
        priceRanges: {
          range: {
            field: 'deliveryFee',
            ranges: [
              { key: 'free', to: 1 },
              { key: 'low', from: 1, to: 50 },
              { key: 'medium', from: 50, to: 100 },
              { key: 'high', from: 100 }
            ]
          }
        }
      }
    };

    // Add intelligent text search if query provided
    if (query && query.trim()) {
      const trimmedQuery = query.trim();

      // Multi-strategy intelligent search
      searchBody.query.bool.should = [
        // Strategy 1: Exact phrase matching (highest priority)
        {
          multi_match: {
            query: trimmedQuery,
            fields: ['name^5', 'description^3', 'cuisine^2'],
            type: 'phrase',
            boost: 3.0
          }
        },
        // Strategy 2: Fuzzy multi-match (handles typos like "brger" -> "burger")
        {
          multi_match: {
            query: trimmedQuery,
            fields: [
              'name^4',           // Boost restaurant name
              'description^2.5',  // Boost description
              'cuisine^2',        // Boost cuisine
              'address.street',   // Include address
              'address.city'
            ],
            fuzziness: 'AUTO',    // Auto-determine edit distance
            operator: 'or',
            boost: 2.0
          }
        },
        // Strategy 3: Wildcard matching for partial words
        {
          query_string: {
            query: `*${trimmedQuery.toLowerCase()}*`,
            fields: ['name^2', 'cuisine^1.5'],
            boost: 1.5
          }
        },
        // Strategy 4: Individual word matching with fuzzy
        ...trimmedQuery.split(' ').map(word => ({
          fuzzy: {
            name: {
              value: word,
              fuzziness: word.length > 4 ? 2 : 1, // More fuzziness for longer words
              boost: 1.0
            }
          }
        })),
        // Strategy 5: Cuisine fuzzy matching
        {
          fuzzy: {
            cuisine: {
              value: trimmedQuery,
              fuzziness: 'AUTO',
              boost: 1.2
            }
          }
        }
      ];

      // Set minimum should match for relevance
      searchBody.query.bool.minimum_should_match = 1;
    } else {
      // If no query, match all
      searchBody.query.bool.must.push({
        match_all: {}
      });
    }

    // Add filters
    if (filters.cuisine && filters.cuisine.length > 0) {
      searchBody.query.bool.filter.push({
        terms: { cuisine: filters.cuisine }
      });
    }

    if (filters.minRating) {
      searchBody.query.bool.filter.push({
        range: { rating: { gte: filters.minRating } }
      });
    }

    if (filters.maxDeliveryFee) {
      searchBody.query.bool.filter.push({
        range: { deliveryFee: { lte: filters.maxDeliveryFee } }
      });
    }

    if (filters.isOpen !== undefined) {
      searchBody.query.bool.filter.push({
        term: { isOpen: filters.isOpen }
      });
    }

    // Add geo-distance filter
    if (filters.location) {
      searchBody.query.bool.filter.push({
        geo_distance: {
          distance: filters.location.radius || '10km',
          location: {
            lat: filters.location.lat,
            lon: filters.location.lng
          }
        }
      });
    }

    // Add price range filter
    if (filters.priceRange) {
      const priceFilter: Record<string, number> = {};
      if (filters.priceRange.min !== undefined) {
        priceFilter.gte = filters.priceRange.min;
      }
      if (filters.priceRange.max !== undefined) {
        priceFilter.lte = filters.priceRange.max;
      }
      if (Object.keys(priceFilter).length > 0) {
        searchBody.query.bool.filter.push({
          range: { deliveryFee: priceFilter }
        });
      }
    }

    // Add sorting
    const sort: Record<string, unknown>[] = [];
    
    if (sortBy === 'relevance') {
      sort.push({ _score: { order: sortOrder } });
    } else if (sortBy === 'rating') {
      sort.push({ rating: { order: sortOrder } });
    } else if (sortBy === 'distance' && filters.location) {
      sort.push({
        _geo_distance: {
          location: {
            lat: filters.location.lat,
            lon: filters.location.lng
          },
          order: sortOrder,
          unit: 'km'
        }
      });
    }

    // Always add secondary sorts for consistency
    if (sortBy !== 'rating') {
      sort.push({ rating: { order: 'desc' } });
    }
    sort.push({ _score: { order: 'desc' } });

    searchBody.sort = sort;

    // Execute search
    const response = await bonsaiClient.search({
      index: INDICES.RESTAURANTS,
      body: searchBody
    });

    // Process results
    const restaurants: Restaurant[] = response.body.hits.hits.map((hit: {
      _id: string;
      _source: Restaurant;
      _score?: number;
    }) => ({
      id: hit._id,
      ...hit._source,
      _score: hit._score // Include relevance score
    }));

    const total = typeof response.body.hits.total === 'object'
      ? response.body.hits.total.value || 0
      : response.body.hits.total || 0;

    // Process aggregations with type safety
    const aggregations = {
      cuisines: (response.body.aggregations?.cuisines as { buckets: Array<{ key: string; doc_count: number }> })?.buckets?.map((bucket) => ({
        key: bucket.key,
        count: bucket.doc_count
      })) || [],
      avgRating: (response.body.aggregations?.avgRating as { value: number })?.value || 0,
      priceRanges: (response.body.aggregations?.priceRanges as { buckets: Array<{ key: string; doc_count: number }> })?.buckets?.map((bucket) => ({
        key: bucket.key,
        count: bucket.doc_count
      })) || []
    };

    return {
      restaurants,
      total,
      aggregations
    };

  } catch (error) {
    console.error('Bonsai search error:', error);
    throw new Error('Search failed. Please try again.');
  }
};

// Intelligent Auto-complete suggestions with fuzzy matching
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  try {
    if (!query || query.length < 2) return [];

    // Multi-strategy intelligent search for suggestions
    const response = await bonsaiClient.search({
      index: INDICES.RESTAURANTS,
      body: {
        size: 0, // We only want aggregations, not documents
        query: {
          bool: {
            should: [
              // Strategy 1: Fuzzy matching on restaurant names (handles typos like "brger" -> "burger")
              {
                fuzzy: {
                  name: {
                    value: query,
                    fuzziness: 'AUTO', // Elasticsearch auto-determines edit distance
                    prefix_length: 1,  // First character must match
                    max_expansions: 50 // Limit expansions for performance
                  }
                }
              },
              // Strategy 2: Wildcard matching for partial words
              {
                wildcard: {
                  'name.keyword': {
                    value: `*${query.toLowerCase()}*`,
                    boost: 0.8
                  }
                }
              },
              // Strategy 3: Fuzzy matching on cuisine types
              {
                fuzzy: {
                  cuisine: {
                    value: query,
                    fuzziness: 'AUTO',
                    boost: 0.6
                  }
                }
              },
              // Strategy 4: N-gram matching for partial matches
              {
                match: {
                  name: {
                    query: query,
                    fuzziness: 'AUTO',
                    operator: 'or',
                    boost: 1.2
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        // Get unique suggestions using aggregations
        aggs: {
          suggestions: {
            terms: {
              field: 'name.keyword',
              size: 10,
              order: { _count: 'desc' }
            }
          },
          cuisine_suggestions: {
            terms: {
              field: 'cuisine',
              size: 5,
              order: { _count: 'desc' }
            }
          }
        }
      }
    });

    // Extract restaurant name suggestions
    const nameSuggestions = (response.body.aggregations?.suggestions as { buckets: Array<{ key: string }> })?.buckets?.map(
      (bucket) => bucket.key
    ) || [];

    // Extract cuisine suggestions
    const cuisineSuggestions = (response.body.aggregations?.cuisine_suggestions as { buckets: Array<{ key: string }> })?.buckets?.map(
      (bucket) => bucket.key
    ) || [];

    // Combine and deduplicate suggestions
    const allSuggestions = [...nameSuggestions, ...cuisineSuggestions];
    const uniqueSuggestions = [...new Set(allSuggestions)];

    // If no fuzzy matches found, try even more aggressive matching
    if (uniqueSuggestions.length === 0) {
      return await getFallbackSuggestions(query);
    }

    return uniqueSuggestions.slice(0, 8); // Limit to 8 suggestions
  } catch (error) {
    console.error('Suggestion error:', error);
    // Fallback to basic suggestions
    return await getFallbackSuggestions(query);
  }
};

// Fallback suggestions for very fuzzy or no matches
const getFallbackSuggestions = async (query: string): Promise<string[]> => {
  try {
    // Ultra-aggressive fuzzy search as fallback
    const response = await bonsaiClient.search({
      index: INDICES.RESTAURANTS,
      body: {
        size: 10,
        query: {
          bool: {
            should: [
              // Very loose fuzzy matching
              {
                fuzzy: {
                  name: {
                    value: query,
                    fuzziness: 2, // Allow up to 2 character differences
                    prefix_length: 0, // No prefix requirement
                    max_expansions: 100
                  }
                }
              },
              // Phonetic matching (sounds like)
              {
                match: {
                  name: {
                    query: query,
                    fuzziness: 2,
                    operator: 'or'
                  }
                }
              }
            ]
          }
        },
        _source: ['name', 'cuisine']
      }
    });

    const suggestions = response.body.hits.hits.map((hit: { _source: { name: string } }) => hit._source.name);
    return [...new Set(suggestions)]; // Remove duplicates
  } catch (error) {
    console.error('Fallback suggestion error:', error);
    return [];
  }
};

// Search by location (nearby restaurants)
export const searchNearbyRestaurants = async (
  lat: number,
  lng: number,
  radius: string = '5km',
  limit: number = 20
): Promise<Restaurant[]> => {
  try {
    const response = await bonsaiClient.search({
      index: INDICES.RESTAURANTS,
      body: {
        size: limit,
        query: {
          bool: {
            filter: [
              {
                geo_distance: {
                  distance: radius,
                  location: { lat, lon: lng }
                }
              },
              {
                term: { isOpen: true }
              }
            ]
          }
        },
        sort: [
          {
            _geo_distance: {
              location: { lat, lon: lng },
              order: 'asc',
              unit: 'km'
            }
          },
          { rating: { order: 'desc' } }
        ]
      }
    });

    return response.body.hits.hits.map((hit: {
      _id: string;
      _source: Restaurant;
      sort: number[];
    }) => ({
      id: hit._id,
      ...hit._source,
      distance: hit.sort[0] // Distance in km
    }));
  } catch (error) {
    console.error('Nearby search error:', error);
    throw new Error('Location search failed. Please try again.');
  }
};

// Intelligent synonym and spelling correction
const getQuerySynonyms = (query: string): string[] => {
  const synonymMap: Record<string, string[]> = {
    // Food synonyms
    'burger': ['hamburger', 'cheeseburger', 'sandwich'],
    'pizza': ['pie', 'flatbread'],
    'chinese': ['asian', 'oriental'],
    'italian': ['pasta', 'spaghetti'],
    'mexican': ['tex-mex', 'latino'],
    'indian': ['curry', 'spicy'],
    'japanese': ['sushi', 'ramen', 'asian'],
    'thai': ['asian', 'spicy'],
    'coffee': ['cafe', 'espresso', 'latte'],
    'dessert': ['sweet', 'cake', 'ice cream'],
    'healthy': ['salad', 'organic', 'fresh'],
    'fast': ['quick', 'express'],

    // Common misspellings
    'brger': ['burger', 'hamburger'],
    'piza': ['pizza'],
    'chiken': ['chicken'],
    'resturant': ['restaurant'],
    'restraunt': ['restaurant'],
    'restaraunt': ['restaurant'],
    'chinse': ['chinese'],
    'itallian': ['italian'],
    'mexcan': ['mexican'],
    'japenese': ['japanese'],
    'cofee': ['coffee'],
    'desrt': ['dessert'],
    'helthy': ['healthy']
  };

  const lowerQuery = query.toLowerCase();
  return synonymMap[lowerQuery] || [];
};

// Enhanced search with synonyms and intelligent matching
export const getIntelligentSuggestions = async (query: string): Promise<string[]> => {
  try {
    if (!query || query.length < 2) return [];

    const synonyms = getQuerySynonyms(query);
    const searchTerms = [query, ...synonyms];

    // Search with multiple strategies including synonyms
    const response = await bonsaiClient.search({
      index: INDICES.RESTAURANTS,
      body: {
        size: 0,
        query: {
          bool: {
            should: [
              // Original query strategies
              ...searchTerms.flatMap(term => [
                {
                  fuzzy: {
                    name: {
                      value: term,
                      fuzziness: 'AUTO',
                      prefix_length: 1,
                      max_expansions: 50,
                      boost: term === query ? 2.0 : 1.0 // Boost original query
                    }
                  }
                },
                {
                  wildcard: {
                    'name.keyword': {
                      value: `*${term.toLowerCase()}*`,
                      boost: term === query ? 1.5 : 0.8
                    }
                  }
                },
                {
                  match: {
                    cuisine: {
                      query: term,
                      fuzziness: 'AUTO',
                      boost: term === query ? 1.2 : 0.8
                    }
                  }
                }
              ])
            ],
            minimum_should_match: 1
          }
        },
        aggs: {
          suggestions: {
            terms: {
              field: 'name.keyword',
              size: 8,
              order: { _count: 'desc' }
            }
          },
          cuisine_suggestions: {
            terms: {
              field: 'cuisine',
              size: 4,
              order: { _count: 'desc' }
            }
          }
        }
      }
    });

    const nameSuggestions = (response.body.aggregations?.suggestions as { buckets: Array<{ key: string }> })?.buckets?.map(
      (bucket) => bucket.key
    ) || [];

    const cuisineSuggestions = (response.body.aggregations?.cuisine_suggestions as { buckets: Array<{ key: string }> })?.buckets?.map(
      (bucket) => bucket.key
    ) || [];

    const allSuggestions = [...nameSuggestions, ...cuisineSuggestions];
    return [...new Set(allSuggestions)].slice(0, 8);

  } catch (error) {
    console.error('Intelligent suggestions error:', error);
    return [];
  }
};

// Popular searches and trending
export const getPopularSearches = async (): Promise<string[]> => {
  // This would typically come from analytics data
  // For now, return common food delivery searches
  return [
    'Pizza',
    'Burger',
    'Chinese',
    'Italian',
    'Fast food',
    'Healthy',
    'Dessert',
    'Coffee',
    'Sushi',
    'Mexican'
  ];
};
