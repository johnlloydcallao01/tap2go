-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Media Folders Table
CREATE TABLE IF NOT EXISTS media_folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES media_folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  file_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Files Table
CREATE TABLE IF NOT EXISTS media_files (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  filename VARCHAR(500) NOT NULL,
  original_filename VARCHAR(500) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type VARCHAR(100) NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_extension VARCHAR(20) NOT NULL,
  
  -- Image/Video specific metadata
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- for videos in seconds
  aspect_ratio DECIMAL(10,4),
  color_palette JSONB,
  
  -- SEO and accessibility
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  title VARCHAR(500),
  
  -- Organization
  folder_id INTEGER REFERENCES media_folders(id) ON DELETE SET NULL,
  folder_path TEXT,
  
  -- Usage tracking
  is_used BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Status and visibility
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'restricted')),
  
  -- Upload metadata
  uploaded_by VARCHAR(255) NOT NULL,
  upload_source VARCHAR(100) DEFAULT 'admin_panel',
  upload_session_id VARCHAR(255),
  
  -- External storage metadata
  cloudinary_public_id VARCHAR(500),
  cloudinary_version VARCHAR(50),
  cloudinary_signature VARCHAR(255),
  storage_provider VARCHAR(50) DEFAULT 'cloudinary',
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by VARCHAR(255),
  
  -- Search
  search_vector tsvector,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Tags Table
CREATE TABLE IF NOT EXISTS media_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media File Tags Relationship
CREATE TABLE IF NOT EXISTS media_file_tags (
  media_file_id INTEGER REFERENCES media_files(id) ON DELETE CASCADE,
  media_tag_id INTEGER REFERENCES media_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (media_file_id, media_tag_id)
);

-- Media Collections Table (for grouping related media)
CREATE TABLE IF NOT EXISTS media_collections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'gallery', 'slideshow', 'product_images', 'blog_images')),
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Collection Items Relationship
CREATE TABLE IF NOT EXISTS media_collection_items (
  id SERIAL PRIMARY KEY,
  collection_id INTEGER REFERENCES media_collections(id) ON DELETE CASCADE,
  media_file_id INTEGER REFERENCES media_files(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  caption TEXT,
  added_by VARCHAR(255),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, media_file_id)
);

-- Media Usage Tracking Table
CREATE TABLE IF NOT EXISTS media_usage (
  id SERIAL PRIMARY KEY,
  media_file_id INTEGER REFERENCES media_files(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL, -- 'blog_post', 'menu_item', 'restaurant', 'promotion', etc.
  entity_id VARCHAR(255) NOT NULL,
  usage_type VARCHAR(50) NOT NULL, -- 'featured_image', 'gallery', 'thumbnail', 'background', etc.
  usage_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Processing Jobs Table (for async operations)
CREATE TABLE IF NOT EXISTS media_processing_jobs (
  id SERIAL PRIMARY KEY,
  media_file_id INTEGER REFERENCES media_files(id) ON DELETE CASCADE,
  job_type VARCHAR(100) NOT NULL, -- 'thumbnail_generation', 'optimization', 'format_conversion', etc.
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  parameters JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_folder_id ON media_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_mime_type ON media_files(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_status ON media_files(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_media_files_visibility ON media_files(visibility);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_file_size ON media_files(file_size);
CREATE INDEX IF NOT EXISTS idx_media_files_dimensions ON media_files(width, height) WHERE width IS NOT NULL AND height IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_files_usage ON media_files(is_used, usage_count);
CREATE INDEX IF NOT EXISTS idx_media_files_cloudinary ON media_files(cloudinary_public_id) WHERE cloudinary_public_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_files_deleted_at ON media_files(deleted_at) WHERE deleted_at IS NOT NULL;

-- Search index
CREATE INDEX IF NOT EXISTS idx_media_files_search ON media_files USING gin(search_vector);

-- Folder indexes
CREATE INDEX IF NOT EXISTS idx_media_folders_parent_id ON media_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_path ON media_folders(path);
CREATE INDEX IF NOT EXISTS idx_media_folders_slug ON media_folders(slug);

-- Tag indexes
CREATE INDEX IF NOT EXISTS idx_media_tags_slug ON media_tags(slug);
CREATE INDEX IF NOT EXISTS idx_media_tags_usage_count ON media_tags(usage_count DESC);

-- Collection indexes
CREATE INDEX IF NOT EXISTS idx_media_collections_slug ON media_collections(slug);
CREATE INDEX IF NOT EXISTS idx_media_collections_type ON media_collections(type);
CREATE INDEX IF NOT EXISTS idx_media_collection_items_sort ON media_collection_items(collection_id, sort_order);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_media_usage_entity ON media_usage(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_type ON media_usage(usage_type);

-- Processing jobs indexes
CREATE INDEX IF NOT EXISTS idx_media_processing_jobs_status ON media_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_media_processing_jobs_type ON media_processing_jobs(job_type);

-- Functions
CREATE OR REPLACE FUNCTION update_media_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.filename, '') || ' ' ||
        COALESCE(NEW.original_filename, '') || ' ' ||
        COALESCE(NEW.alt_text, '') || ' ' ||
        COALESCE(NEW.caption, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.title, '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_folder_stats()
RETURNS TRIGGER AS $$
DECLARE
    folder_id_to_update INTEGER;
BEGIN
    -- Determine which folder to update
    IF TG_OP = 'DELETE' THEN
        folder_id_to_update := OLD.folder_id;
    ELSE
        folder_id_to_update := NEW.folder_id;
    END IF;

    -- Update folder statistics
    IF folder_id_to_update IS NOT NULL THEN
        UPDATE media_folders
        SET
            file_count = (
                SELECT COUNT(*)
                FROM media_files
                WHERE folder_id = folder_id_to_update
                AND deleted_at IS NULL
            ),
            total_size = (
                SELECT COALESCE(SUM(file_size), 0)
                FROM media_files
                WHERE folder_id = folder_id_to_update
                AND deleted_at IS NULL
            ),
            updated_at = NOW()
        WHERE id = folder_id_to_update;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE media_tags
        SET usage_count = usage_count + 1, updated_at = NOW()
        WHERE id = NEW.media_tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE media_tags
        SET usage_count = GREATEST(usage_count - 1, 0), updated_at = NOW()
        WHERE id = OLD.media_tag_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_media_usage_tracking()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage count and last used timestamp
    UPDATE media_files
    SET
        usage_count = (
            SELECT COUNT(*)
            FROM media_usage
            WHERE media_file_id = NEW.media_file_id
        ),
        is_used = true,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.media_file_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_media_files_search_vector ON media_files;
DROP TRIGGER IF EXISTS update_media_files_updated_at ON media_files;
DROP TRIGGER IF EXISTS update_media_folders_updated_at ON media_folders;
DROP TRIGGER IF EXISTS update_media_tags_updated_at ON media_tags;
DROP TRIGGER IF EXISTS update_media_collections_updated_at ON media_collections;
DROP TRIGGER IF EXISTS update_folder_stats_on_file_change ON media_files;
DROP TRIGGER IF EXISTS update_tag_usage_on_tag_assignment ON media_file_tags;
DROP TRIGGER IF EXISTS update_usage_tracking_on_usage_insert ON media_usage;

CREATE TRIGGER update_media_files_search_vector
    BEFORE INSERT OR UPDATE ON media_files
    FOR EACH ROW EXECUTE FUNCTION update_media_search_vector();

CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON media_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_folders_updated_at
    BEFORE UPDATE ON media_folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_tags_updated_at
    BEFORE UPDATE ON media_tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_collections_updated_at
    BEFORE UPDATE ON media_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folder_stats_on_file_change
    AFTER INSERT OR UPDATE OR DELETE ON media_files
    FOR EACH ROW EXECUTE FUNCTION update_folder_stats();

CREATE TRIGGER update_tag_usage_on_tag_assignment
    AFTER INSERT OR DELETE ON media_file_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER update_usage_tracking_on_usage_insert
    AFTER INSERT ON media_usage
    FOR EACH ROW EXECUTE FUNCTION update_media_usage_tracking();

-- Helper Functions
CREATE OR REPLACE FUNCTION soft_delete_media_file(
    file_id INTEGER,
    user_id VARCHAR(255) DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE media_files
    SET
        deleted_at = NOW(),
        deleted_by = user_id,
        status = 'deleted',
        updated_at = NOW()
    WHERE id = file_id AND deleted_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_media_file(
    file_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE media_files
    SET
        deleted_at = NULL,
        deleted_by = NULL,
        status = 'active',
        updated_at = NOW()
    WHERE id = file_id AND deleted_at IS NOT NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION permanent_delete_media_file(
    file_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
    -- Delete usage tracking
    DELETE FROM media_usage WHERE media_file_id = file_id;

    -- Delete tag associations
    DELETE FROM media_file_tags WHERE media_file_id = file_id;

    -- Delete collection associations
    DELETE FROM media_collection_items WHERE media_file_id = file_id;

    -- Delete processing jobs
    DELETE FROM media_processing_jobs WHERE media_file_id = file_id;

    -- Delete the file record
    DELETE FROM media_files WHERE id = file_id AND deleted_at IS NOT NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_folder_path(folder_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    folder_path TEXT := '';
    current_folder RECORD;
    parent_id INTEGER;
BEGIN
    IF folder_id IS NULL THEN
        RETURN '/';
    END IF;

    SELECT id, name, parent_id INTO current_folder
    FROM media_folders WHERE id = folder_id;

    IF NOT FOUND THEN
        RETURN '/';
    END IF;

    folder_path := current_folder.name;
    parent_id := current_folder.parent_id;

    WHILE parent_id IS NOT NULL LOOP
        SELECT name, parent_id INTO current_folder
        FROM media_folders WHERE id = parent_id;

        IF FOUND THEN
            folder_path := current_folder.name || '/' || folder_path;
            parent_id := current_folder.parent_id;
        ELSE
            EXIT;
        END IF;
    END LOOP;

    RETURN '/' || folder_path;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION track_media_usage(
    file_id INTEGER,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    usage_type VARCHAR(50),
    context JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO media_usage (media_file_id, entity_type, entity_id, usage_type, usage_context)
    VALUES (file_id, entity_type, entity_id, usage_type, context)
    ON CONFLICT (media_file_id, entity_type, entity_id) DO UPDATE SET
        usage_type = EXCLUDED.usage_type,
        usage_context = EXCLUDED.usage_context,
        created_at = NOW();

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Views
CREATE OR REPLACE VIEW active_media_files AS
SELECT
    mf.*,
    mf2.name as folder_name,
    get_folder_path(mf.folder_id) as full_folder_path,
    ARRAY(
        SELECT mt.name
        FROM media_tags mt
        JOIN media_file_tags mft ON mt.id = mft.media_tag_id
        WHERE mft.media_file_id = mf.id
    ) as tags
FROM media_files mf
LEFT JOIN media_folders mf2 ON mf.folder_id = mf2.id
WHERE mf.deleted_at IS NULL
ORDER BY mf.created_at DESC;

CREATE OR REPLACE VIEW media_library_stats AS
SELECT
    COUNT(*) as total_files,
    COUNT(*) FILTER (WHERE file_type LIKE 'image/%') as total_images,
    COUNT(*) FILTER (WHERE file_type LIKE 'video/%') as total_videos,
    COUNT(*) FILTER (WHERE file_type LIKE 'application/%' OR file_type LIKE 'text/%') as total_documents,
    SUM(file_size) as total_size,
    AVG(file_size) as average_file_size,
    COUNT(*) FILTER (WHERE is_used = true) as used_files,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as files_last_30_days
FROM media_files
WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW folder_hierarchy AS
WITH RECURSIVE folder_tree AS (
    -- Base case: root folders
    SELECT
        id,
        name,
        parent_id,
        path,
        file_count,
        total_size,
        0 as level,
        ARRAY[id] as path_ids,
        name::TEXT as full_path
    FROM media_folders
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case: child folders
    SELECT
        mf.id,
        mf.name,
        mf.parent_id,
        mf.path,
        mf.file_count,
        mf.total_size,
        ft.level + 1,
        ft.path_ids || mf.id,
        ft.full_path || '/' || mf.name::TEXT
    FROM media_folders mf
    JOIN folder_tree ft ON mf.parent_id = ft.id
)
SELECT * FROM folder_tree ORDER BY full_path;

-- Sample Data (Default Folders)
INSERT INTO media_folders (name, slug, description, path, is_system) VALUES
('Restaurant Images', 'restaurant-images', 'Images of restaurant interiors, exteriors, and ambiance', '/restaurant-images', true),
('Menu Items', 'menu-items', 'Food photography and menu item images', '/menu-items', true),
('Promotional Banners', 'promotional-banners', 'Marketing banners and promotional materials', '/promotional-banners', true),
('Blog Images', 'blog-images', 'Images for blog posts and articles', '/blog-images', true),
('User Avatars', 'user-avatars', 'Profile pictures and user avatars', '/user-avatars', true),
('Documents', 'documents', 'PDF files, menus, and other documents', '/documents', true),
('Videos', 'videos', 'Promotional videos and cooking tutorials', '/videos', true),
('Logos & Branding', 'logos-branding', 'Company logos and branding materials', '/logos-branding', true),
('Social Media', 'social-media', 'Images optimized for social media platforms', '/social-media', true),
('Temp Uploads', 'temp-uploads', 'Temporary upload folder for processing', '/temp-uploads', true)
ON CONFLICT (slug) DO NOTHING;

-- Sample Tags
INSERT INTO media_tags (name, slug, description, color) VALUES
('food', 'food', 'Food and cuisine related images', '#F59E0B'),
('restaurant', 'restaurant', 'Restaurant and venue images', '#EF4444'),
('promotion', 'promotion', 'Promotional and marketing content', '#8B5CF6'),
('blog', 'blog', 'Blog and article related media', '#06B6D4'),
('menu', 'menu', 'Menu items and food photography', '#10B981'),
('interior', 'interior', 'Interior design and ambiance', '#F97316'),
('exterior', 'exterior', 'Building exterior and outdoor spaces', '#84CC16'),
('staff', 'staff', 'Staff and team photos', '#EC4899'),
('event', 'event', 'Events and special occasions', '#6366F1'),
('seasonal', 'seasonal', 'Seasonal content and decorations', '#14B8A6')
ON CONFLICT (slug) DO NOTHING;

-- Sample Collections
INSERT INTO media_collections (name, slug, description, type) VALUES
('Homepage Gallery', 'homepage-gallery', 'Featured images for homepage display', 'gallery'),
('Restaurant Showcase', 'restaurant-showcase', 'Best restaurant photos for marketing', 'gallery'),
('Menu Highlights', 'menu-highlights', 'Featured menu items', 'product_images'),
('Blog Featured Images', 'blog-featured-images', 'Hero images for blog posts', 'blog_images'),
('Social Media Kit', 'social-media-kit', 'Images ready for social media posting', 'general')
ON CONFLICT (slug) DO NOTHING;

-- Security Settings
ALTER TABLE media_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_file_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_collection_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_processing_jobs DISABLE ROW LEVEL SECURITY;

-- Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Admin and authenticated user permissions
GRANT ALL ON media_files TO authenticated;
GRANT ALL ON media_folders TO authenticated;
GRANT ALL ON media_tags TO authenticated;
GRANT ALL ON media_file_tags TO authenticated;
GRANT ALL ON media_collections TO authenticated;
GRANT ALL ON media_collection_items TO authenticated;
GRANT ALL ON media_usage TO authenticated;
GRANT ALL ON media_processing_jobs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Public read access for active media
GRANT SELECT ON media_files TO anon;
GRANT SELECT ON media_folders TO anon;
GRANT SELECT ON media_tags TO anon;
GRANT SELECT ON media_file_tags TO anon;
GRANT SELECT ON media_collections TO anon;
GRANT SELECT ON media_collection_items TO anon;
