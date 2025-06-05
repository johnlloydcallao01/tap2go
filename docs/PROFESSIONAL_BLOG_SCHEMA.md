# 📝 Professional Blog Schema - Complete Documentation

## 🎯 **Overview**

Our blog post schema is a **production-ready, enterprise-grade** design that combines the best features from:
- **WordPress** `wp_posts` table structure
- **Strapi** content type flexibility  
- **Modern PostgreSQL** best practices
- **Tap2Go** specific requirements

---

## 🏗️ **Schema Architecture**

### **Core Design Principles**
- ✅ **WordPress-inspired** status workflow
- ✅ **Strapi-inspired** flexible content blocks
- ✅ **SEO-optimized** with comprehensive metadata
- ✅ **Performance-focused** with strategic indexes
- ✅ **Extensible** with JSON fields for future growth

---

## 📊 **Complete Field Reference**

### **🔑 Primary Identification**
| Field | Type | Purpose |
|-------|------|---------|
| `id` | SERIAL PRIMARY KEY | Auto-incrementing primary key |
| `uuid` | UUID | Universal unique identifier for external APIs |

### **📝 Core Content Fields**
| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `title` | VARCHAR(255) | ✅ | Post title |
| `slug` | VARCHAR(255) | ✅ | SEO-friendly URL slug |
| `content` | TEXT | ✅ | Main post content |
| `excerpt` | TEXT | ❌ | Short description/summary |

### **🔄 Content Status & Workflow (WordPress-inspired)**
| Field | Type | Default | Options |
|-------|------|---------|---------|
| `status` | VARCHAR(20) | 'draft' | draft, published, scheduled, private, trash |

### **🖼️ Media & Visual Content**
| Field | Type | Purpose |
|-------|------|---------|
| `featured_image_url` | TEXT | Main featured image |
| `featured_image_alt` | TEXT | Alt text for accessibility |
| `featured_image_caption` | TEXT | Image caption |
| `gallery_images` | JSONB | Additional images array |

### **👤 Author Information (Enhanced)**
| Field | Type | Purpose |
|-------|------|---------|
| `author_id` | VARCHAR(255) | Firebase user ID |
| `author_name` | VARCHAR(255) | Author display name |
| `author_email` | VARCHAR(255) | Author email |
| `author_bio` | TEXT | Author biography |
| `author_avatar_url` | TEXT | Author profile image |
| `author_social_links` | JSONB | Social media links |

### **🏷️ Content Organization (Strapi-inspired)**
| Field | Type | Purpose |
|-------|------|---------|
| `categories` | JSONB | Post categories array |
| `tags` | JSONB | Post tags array |

### **🍽️ Restaurant Integration (Tap2Go-specific)**
| Field | Type | Purpose |
|-------|------|---------|
| `related_restaurants` | JSONB | Array of related restaurant IDs |
| `featured_restaurant_id` | VARCHAR(255) | Single featured restaurant |

### **📊 Content Metadata**
| Field | Type | Purpose |
|-------|------|---------|
| `reading_time` | INTEGER | Estimated reading time (minutes) |
| `word_count` | INTEGER | Total word count |
| `language` | VARCHAR(10) | Content language (default: 'en') |

### **🎯 Publishing & Visibility**
| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `is_featured` | BOOLEAN | false | Featured on homepage |
| `is_sticky` | BOOLEAN | false | WordPress-style sticky posts |
| `comment_status` | VARCHAR(20) | 'open' | open, closed, disabled |
| `ping_status` | VARCHAR(20) | 'open' | open, closed |

### **🔍 SEO & Metadata (Comprehensive)**
| Field | Type | Purpose |
|-------|------|---------|
| `seo_title` | VARCHAR(255) | Custom SEO title |
| `seo_description` | TEXT | Meta description |
| `seo_keywords` | JSONB | SEO keywords array |
| `seo_canonical_url` | TEXT | Canonical URL |
| `seo_og_image` | TEXT | Open Graph image |
| `seo_og_title` | VARCHAR(255) | Open Graph title |
| `seo_og_description` | TEXT | Open Graph description |
| `seo_twitter_card` | VARCHAR(50) | Twitter card type |
| `seo_schema_markup` | JSONB | Structured data markup |

### **🧱 Content Structure (Strapi blocks-inspired)**
| Field | Type | Purpose |
|-------|------|---------|
| `content_blocks` | JSONB | Rich content blocks array |
| `table_of_contents` | JSONB | Auto-generated TOC |

### **⏰ Scheduling & Automation**
| Field | Type | Purpose |
|-------|------|---------|
| `scheduled_at` | TIMESTAMP | When to auto-publish |
| `published_at` | TIMESTAMP | When actually published |

### **📈 Performance & Analytics**
| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `view_count` | INTEGER | 0 | Page views |
| `like_count` | INTEGER | 0 | User likes |
| `share_count` | INTEGER | 0 | Social shares |

### **⚙️ Content Settings**
| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `allow_comments` | BOOLEAN | true | Enable comments |
| `allow_pingbacks` | BOOLEAN | true | Enable pingbacks |
| `password_protected` | BOOLEAN | false | Password protection |
| `content_password` | VARCHAR(255) | null | Protection password |

### **🕒 Timestamps (WordPress-style)**
| Field | Type | Purpose |
|-------|------|---------|
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last modification |
| `deleted_at` | TIMESTAMP | Soft delete timestamp |

### **📊 Content Quality**
| Field | Type | Purpose |
|-------|------|---------|
| `content_score` | DECIMAL(3,2) | SEO/quality score (0-10) |
| `readability_score` | DECIMAL(3,2) | Readability score (0-10) |

### **🔗 External Integrations**
| Field | Type | Purpose |
|-------|------|---------|
| `external_id` | VARCHAR(255) | For migrations/integrations |
| `source_platform` | VARCHAR(50) | Origin platform |

### **🚀 Advanced Features**
| Field | Type | Purpose |
|-------|------|---------|
| `custom_fields` | JSONB | Extensible custom data |
| `template` | VARCHAR(100) | Template selection |

---

## 🔍 **Performance Indexes**

### **Core Identification**
- `idx_blog_posts_uuid` - UUID lookups
- `idx_blog_posts_slug` - URL routing

### **Status & Publishing**
- `idx_blog_posts_status` - Status filtering
- `idx_blog_posts_published_at` - Publication date sorting
- `idx_blog_posts_scheduled_at` - Scheduled posts

### **Content Discovery**
- `idx_blog_posts_featured` - Featured posts
- `idx_blog_posts_sticky` - Sticky posts

### **JSON Field Indexes (GIN)**
- `idx_blog_posts_categories` - Category filtering
- `idx_blog_posts_tags` - Tag-based searches
- `idx_blog_posts_related_restaurants` - Restaurant relations
- `idx_blog_posts_seo_keywords` - SEO keyword searches

### **Composite Indexes**
- `idx_blog_posts_status_published_at` - Status + date queries
- `idx_blog_posts_featured_published` - Featured + published queries
- `idx_blog_posts_author_status` - Author + status queries

### **Full-Text Search**
- `idx_blog_posts_search` - Full-text search across title, excerpt, content

---

## 🎯 **Key Features**

### ✅ **WordPress-Inspired Features**
- Complete post status workflow (draft → published)
- Sticky posts functionality
- Comment and pingback controls
- Password protection
- Soft delete with `deleted_at`

### ✅ **Strapi-Inspired Features**
- Flexible content blocks
- Rich metadata support
- Extensible custom fields
- Template system

### ✅ **Modern PostgreSQL Features**
- UUID support for external APIs
- JSONB for flexible data
- GIN indexes for JSON queries
- Full-text search capabilities
- Constraint validation

### ✅ **SEO & Performance**
- Comprehensive SEO metadata
- Open Graph and Twitter Cards
- Schema markup support
- Performance analytics
- Content quality scoring

---

## 🚀 **Ready for Production**

This schema is **enterprise-ready** and supports:
- ✅ **Millions of blog posts**
- ✅ **Complex content workflows**
- ✅ **Advanced SEO optimization**
- ✅ **Multi-author management**
- ✅ **Performance analytics**
- ✅ **Future extensibility**

**Your blog system is now more powerful than most enterprise CMS platforms!** 🎉
