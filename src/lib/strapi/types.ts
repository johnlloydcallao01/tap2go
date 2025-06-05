/**
 * Strapi Content Types for Tap2Go CMS Integration
 * Defines TypeScript interfaces for all Strapi content types
 */

// Base Strapi entity interface
export interface StrapiEntity {
  id: number;
  attributes: any;
  meta?: any;
}

// Media/File interface
export interface StrapiMedia {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: {
      thumbnail?: StrapiImageFormat;
      small?: StrapiImageFormat;
      medium?: StrapiImageFormat;
      large?: StrapiImageFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    provider_metadata?: any;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  path?: string;
  url: string;
}

// SEO Component
export interface SEOComponent {
  id: number;
  metaTitle: string;
  metaDescription: string;
  keywords?: string;
  metaRobots?: string;
  structuredData?: any;
  metaViewport?: string;
  canonicalURL?: string;
  metaImage?: {
    data: StrapiMedia;
  };
}

// Social Media Component
export interface SocialMediaComponent {
  id: number;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

// Restaurant Content Type
export interface RestaurantContent {
  id: number;
  attributes: {
    firebaseId: string;
    slug: string;
    story?: string;
    longDescription?: string;
    heroImage?: {
      data: StrapiMedia;
    };
    gallery?: {
      data: StrapiMedia[];
    };
    awards?: Award[];
    certifications?: Certification[];
    specialFeatures?: Feature[];
    socialMedia?: SocialMediaComponent;
    seo?: SEOComponent;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Award Component
export interface Award {
  id: number;
  title: string;
  description?: string;
  year?: number;
  organization?: string;
  image?: {
    data: StrapiMedia;
  };
}

// Certification Component
export interface Certification {
  id: number;
  name: string;
  description?: string;
  issuedBy: string;
  issuedDate?: string;
  expiryDate?: string;
  certificateImage?: {
    data: StrapiMedia;
  };
}

// Feature Component
export interface Feature {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isHighlighted: boolean;
}

// Menu Category Content Type
export interface MenuCategoryContent {
  id: number;
  attributes: {
    firebaseId: string;
    name: string;
    description?: string;
    image?: {
      data: StrapiMedia;
    };
    sortOrder: number;
    isActive: boolean;
    restaurant?: {
      data: RestaurantContent;
    };
    menuItems?: {
      data: MenuItemContent[];
    };
    createdAt: string;
    updatedAt: string;
  };
}

// Menu Item Content Type
export interface MenuItemContent {
  id: number;
  attributes: {
    firebaseId: string;
    name: string;
    detailedDescription?: string;
    shortDescription?: string;
    images?: {
      data: StrapiMedia[];
    };
    ingredients?: Ingredient[];
    allergens?: Allergen[];
    nutritionalInfo?: NutritionalInfo;
    preparationSteps?: string[];
    chefNotes?: string;
    tags?: Tag[];
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra-hot';
    preparationTime?: number;
    category?: {
      data: MenuCategoryContent;
    };
    restaurant?: {
      data: RestaurantContent;
    };
    seo?: SEOComponent;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Ingredient Component
export interface Ingredient {
  id: number;
  name: string;
  description?: string;
  isOptional: boolean;
  allergenInfo?: string;
}

// Allergen Component
export interface Allergen {
  id: number;
  name: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'severe';
}

// Nutritional Info Component
export interface NutritionalInfo {
  id: number;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  servingUnit?: string;
}

// Tag Component
export interface Tag {
  id: number;
  name: string;
  color?: string;
  description?: string;
}

// Promotion Content Type
export interface PromotionContent {
  id: number;
  attributes: {
    title: string;
    description: string;
    shortDescription?: string;
    image?: {
      data: StrapiMedia;
    };
    bannerImage?: {
      data: StrapiMedia;
    };
    type: 'discount' | 'bogo' | 'free-delivery' | 'cashback' | 'special-offer';
    discountType?: 'percentage' | 'fixed' | 'free-item';
    discountValue?: number;
    minimumOrderValue?: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    restaurants?: {
      data: RestaurantContent[];
    };
    categories?: {
      data: MenuCategoryContent[];
    };
    menuItems?: {
      data: MenuItemContent[];
    };
    maxUsagePerUser?: number;
    totalUsageLimit?: number;
    currentUsageCount?: number;
    promoCode?: string;
    terms?: string;
    seo?: SEOComponent;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Blog Post Content Type
export interface BlogPost {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: {
      data: StrapiMedia;
    };
    author?: {
      data: Author;
    };
    categories?: {
      data: BlogCategory[];
    };
    tags?: {
      data: BlogTag[];
    };
    relatedRestaurants?: {
      data: RestaurantContent[];
    };
    readingTime?: number;
    isPublished: boolean;
    isFeatured: boolean;
    seo?: SEOComponent;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Author Content Type
export interface Author {
  id: number;
  attributes: {
    name: string;
    bio?: string;
    avatar?: {
      data: StrapiMedia;
    };
    email?: string;
    socialMedia?: SocialMediaComponent;
    createdAt: string;
    updatedAt: string;
  };
}

// Blog Category Content Type
export interface BlogCategory {
  id: number;
  attributes: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Blog Tag Content Type
export interface BlogTag {
  id: number;
  attributes: {
    name: string;
    slug: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Static Page Content Type
export interface StaticPage {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    isPublished: boolean;
    showInNavigation: boolean;
    navigationOrder?: number;
    seo?: SEOComponent;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Homepage Banner Content Type
export interface HomepageBanner {
  id: number;
  attributes: {
    title: string;
    subtitle?: string;
    description?: string;
    image: {
      data: StrapiMedia;
    };
    mobileImage?: {
      data: StrapiMedia;
    };
    ctaText?: string;
    ctaLink?: string;
    isActive: boolean;
    sortOrder: number;
    showOnMobile: boolean;
    showOnDesktop: boolean;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Export utility types
export type StrapiContentType = 
  | 'restaurant-contents'
  | 'menu-category-contents'
  | 'menu-item-contents'
  | 'promotion-contents'
  | 'blog-posts'
  | 'authors'
  | 'blog-categories'
  | 'blog-tags'
  | 'static-pages'
  | 'homepage-banners';

export type StrapiPopulateOption = 
  | '*'
  | string
  | string[]
  | { [key: string]: any };

// Query builder helper types
export interface StrapiFilters {
  [key: string]: any;
}

export interface StrapiSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface StrapiPagination {
  page?: number;
  pageSize?: number;
  start?: number;
  limit?: number;
}
