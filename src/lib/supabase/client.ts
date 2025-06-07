/**
 * Supabase Client Configuration for Tap2Go CMS
 * Replaces Neon PostgreSQL for content management
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Client-side Supabase client (for browser usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using Firebase Auth, so disable Supabase auth
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'tap2go-cms',
    },
  },
});

// Server-side Supabase client (for API routes and server actions)
export const supabaseAdmin = supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'tap2go-cms-admin',
      },
    },
  }
) : null;

// Database types (will be generated later)
export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: number;
          title: string;
          slug: string;
          content: string;
          excerpt?: string;
          featured_image_url?: string;
          author_name?: string;
          author_bio?: string;
          author_avatar_url?: string;
          categories?: string[];
          tags?: string[];
          related_restaurants?: string[];
          reading_time?: number;
          is_published: boolean;
          is_featured: boolean;
          seo_data?: Record<string, string | number | boolean>;
          published_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>;
      };
      restaurant_content: {
        Row: {
          id: number;
          restaurant_id: string;
          title: string;
          slug: string;
          content: string;
          content_type: 'story' | 'description' | 'about' | 'gallery';
          featured_image_url?: string;
          gallery_images?: string[];
          is_published: boolean;
          seo_data?: Record<string, string | number | boolean>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurant_content']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['restaurant_content']['Insert']>;
      };
      promotions: {
        Row: {
          id: number;
          title: string;
          slug: string;
          description: string;
          content?: string;
          promotion_type: 'discount' | 'offer' | 'event' | 'announcement';
          discount_percentage?: number;
          discount_amount?: number;
          featured_image_url?: string;
          is_active: boolean;
          is_featured: boolean;
          start_date?: string;
          end_date?: string;
          applicable_restaurants?: string[];
          terms_conditions?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['promotions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['promotions']['Insert']>;
      };
      static_pages: {
        Row: {
          id: number;
          title: string;
          slug: string;
          content: string;
          excerpt?: string;
          page_type: string;
          meta_title?: string;
          meta_description?: string;
          featured_image_url?: string;
          is_published: boolean;
          show_in_navigation: boolean;
          navigation_order?: number;
          seo_data?: Record<string, string | number | boolean>;
          published_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['static_pages']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['static_pages']['Insert']>;
      };
    };
  };
};

// Utility function to check connection
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

// Export configured clients
export { createClient };
