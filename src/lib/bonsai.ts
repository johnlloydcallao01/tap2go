// Bonsai OpenSearch Configuration
// Free Sandbox Plan: 125MB, 35K documents, full OpenSearch features (Elasticsearch-compatible)

import { Client } from '@opensearch-project/opensearch';

// Environment variables validation
const BONSAI_HOST = process.env.BONSAI_HOST;
const BONSAI_USERNAME = process.env.BONSAI_USERNAME;
const BONSAI_PASSWORD = process.env.BONSAI_PASSWORD;
const BONSAI_URL = process.env.BONSAI_URL;

if (!BONSAI_HOST && !BONSAI_URL) {
  throw new Error('Missing Bonsai configuration. Please set BONSAI_HOST + credentials or BONSAI_URL in .env.local');
}

// Create Elasticsearch client
export const bonsaiClient = new Client({
  // Option 1: Separate host and auth (more secure)
  ...(BONSAI_HOST && {
    node: BONSAI_HOST,
    auth: {
      username: BONSAI_USERNAME!,
      password: BONSAI_PASSWORD!
    }
  }),
  
  // Option 2: Single URL with embedded credentials (simpler)
  ...(BONSAI_URL && !BONSAI_HOST && {
    node: BONSAI_URL
  }),

  // Connection settings
  requestTimeout: 30000,
  pingTimeout: 3000,
  maxRetries: 3,
  
  // SSL settings (Bonsai uses HTTPS)
  ssl: {
    rejectUnauthorized: true
  }
});

// Test connection function
export const testBonsaiConnection = async (): Promise<boolean> => {
  try {
    await bonsaiClient.ping();
    console.log('✅ Bonsai Elasticsearch connection successful');
    return true;
  } catch (error) {
    console.error('❌ Bonsai Elasticsearch connection failed:', error);
    return false;
  }
};

// Get cluster info
export const getBonsaiClusterInfo = async () => {
  try {
    const info = await bonsaiClient.info();
    console.log('📊 Bonsai Cluster Info:', {
      name: info.body.cluster_name,
      version: info.body.version.number,
      lucene_version: info.body.version.lucene_version
    });
    return info.body;
  } catch (error) {
    console.error('Error getting cluster info:', error);
    throw error;
  }
};

// Index names for Tap2Go
export const INDICES = {
  RESTAURANTS: 'tap2go_restaurants',
  MENU_ITEMS: 'tap2go_menu_items',
  CATEGORIES: 'tap2go_categories',
  REVIEWS: 'tap2go_reviews'
} as const;

// Index settings and mappings
export const RESTAURANT_INDEX_CONFIG = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0, // Free tier: single node
    analysis: {
      analyzer: {
        restaurant_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'stop']
        }
      }
    }
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      name: { 
        type: 'text', 
        analyzer: 'restaurant_analyzer',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' }
        }
      },
      description: { 
        type: 'text', 
        analyzer: 'restaurant_analyzer' 
      },
      cuisine: { 
        type: 'keyword' // For exact matching and aggregations
      },
      rating: { type: 'float' },
      reviewCount: { type: 'integer' },
      deliveryTime: { type: 'keyword' },
      deliveryFee: { type: 'float' },
      minimumOrder: { type: 'float' },
      isOpen: { type: 'boolean' },
      featured: { type: 'boolean' },
      location: { type: 'geo_point' }, // For geo-search
      address: {
        type: 'object',
        properties: {
          street: { type: 'text' },
          city: { type: 'keyword' },
          state: { type: 'keyword' },
          zipCode: { type: 'keyword' },
          country: { type: 'keyword' }
        }
      },
      operatingHours: {
        type: 'object',
        properties: {
          monday: { type: 'object' },
          tuesday: { type: 'object' },
          wednesday: { type: 'object' },
          thursday: { type: 'object' },
          friday: { type: 'object' },
          saturday: { type: 'object' },
          sunday: { type: 'object' }
        }
      },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    }
  }
};

// Initialize indices
export const initializeBonsaiIndices = async () => {
  try {
    // Check if restaurant index exists
    const restaurantExists = await bonsaiClient.indices.exists({
      index: INDICES.RESTAURANTS
    });

    if (!restaurantExists.body) {
      console.log('Creating restaurants index...');
      await bonsaiClient.indices.create({
        index: INDICES.RESTAURANTS,
        body: RESTAURANT_INDEX_CONFIG as Record<string, unknown> // Type assertion for OpenSearch compatibility
      });
      console.log('✅ Restaurants index created');
    } else {
      console.log('✅ Restaurants index already exists');
    }

    return true;
  } catch (error) {
    console.error('Error initializing indices:', error);
    throw error;
  }
};

// Export client for use in other files
export default bonsaiClient;
