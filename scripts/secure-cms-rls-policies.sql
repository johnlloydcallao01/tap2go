-- ===================================================================
-- PROFESSIONAL CMS ROW-LEVEL SECURITY POLICIES
-- Secure, enterprise-grade RLS policies for CMS tables
-- ===================================================================

-- ENABLE ROW-LEVEL SECURITY (Professional Standard)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- BLOG POSTS POLICIES
-- ===================================================================

-- Public read access for published posts (frontend)
CREATE POLICY "Public can read published posts" ON blog_posts
    FOR SELECT USING (
        status = 'published' 
        AND published_at <= NOW() 
        AND deleted_at IS NULL
    );

-- Admin full access (CMS dashboard)
CREATE POLICY "Admin full access to posts" ON blog_posts
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
        OR auth.jwt() ->> 'app_metadata' ->> 'role' = 'admin'
    );

-- Author can manage their own posts
CREATE POLICY "Authors can manage own posts" ON blog_posts
    FOR ALL USING (
        auth.uid()::text = author_id
        OR auth.jwt() ->> 'email' = author_email
    );

-- Editor can manage all posts
CREATE POLICY "Editors can manage all posts" ON blog_posts
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'editor'
        OR auth.jwt() ->> 'user_metadata' ->> 'role' = 'editor'
        OR auth.jwt() ->> 'app_metadata' ->> 'role' = 'editor'
    );

-- ===================================================================
-- STATIC PAGES POLICIES
-- ===================================================================

-- Public read access for published pages (frontend)
CREATE POLICY "Public can read published pages" ON static_pages
    FOR SELECT USING (
        status = 'published' 
        AND deleted_at IS NULL
    );

-- Admin full access (CMS dashboard)
CREATE POLICY "Admin full access to pages" ON static_pages
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
        OR auth.jwt() ->> 'app_metadata' ->> 'role' = 'admin'
    );

-- Author can manage their own pages
CREATE POLICY "Authors can manage own pages" ON static_pages
    FOR ALL USING (
        auth.uid()::text = author_id
        OR auth.jwt() ->> 'email' = author_email
    );

-- Editor can manage all pages
CREATE POLICY "Editors can manage all pages" ON static_pages
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'editor'
        OR auth.jwt() ->> 'user_metadata' ->> 'role' = 'editor'
        OR auth.jwt() ->> 'app_metadata' ->> 'role' = 'editor'
    );

-- ===================================================================
-- CATEGORIES POLICIES
-- ===================================================================

-- Public read access (frontend)
CREATE POLICY "Public can read categories" ON categories
    FOR SELECT USING (true);

-- Admin and editors can manage categories
CREATE POLICY "Admin and editors can manage categories" ON categories
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'editor')
        OR auth.jwt() ->> 'user_metadata' ->> 'role' IN ('admin', 'editor')
        OR auth.jwt() ->> 'app_metadata' ->> 'role' IN ('admin', 'editor')
    );

-- ===================================================================
-- TAGS POLICIES
-- ===================================================================

-- Public read access (frontend)
CREATE POLICY "Public can read tags" ON tags
    FOR SELECT USING (true);

-- Admin and editors can manage tags
CREATE POLICY "Admin and editors can manage tags" ON tags
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'editor')
        OR auth.jwt() ->> 'user_metadata' ->> 'role' IN ('admin', 'editor')
        OR auth.jwt() ->> 'app_metadata' ->> 'role' IN ('admin', 'editor')
    );

-- ===================================================================
-- RELATIONSHIP TABLES POLICIES
-- ===================================================================

-- Post-Categories relationship
CREATE POLICY "Public can read post categories" ON post_categories
    FOR SELECT USING (true);

CREATE POLICY "Admin and editors can manage post categories" ON post_categories
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'editor')
        OR auth.jwt() ->> 'user_metadata' ->> 'role' IN ('admin', 'editor')
        OR auth.jwt() ->> 'app_metadata' ->> 'role' IN ('admin', 'editor')
    );

-- Post-Tags relationship
CREATE POLICY "Public can read post tags" ON post_tags
    FOR SELECT USING (true);

CREATE POLICY "Admin and editors can manage post tags" ON post_tags
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'editor')
        OR auth.jwt() ->> 'user_metadata' ->> 'role' IN ('admin', 'editor')
        OR auth.jwt() ->> 'app_metadata' ->> 'role' IN ('admin', 'editor')
    );

-- ===================================================================
-- SERVICE ROLE BYPASS (For server-side operations)
-- ===================================================================

-- Allow service role to bypass RLS for admin operations
CREATE POLICY "Service role bypass" ON blog_posts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass" ON static_pages
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass" ON categories
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass" ON tags
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass" ON post_categories
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass" ON post_tags
    FOR ALL USING (auth.role() = 'service_role');

-- ===================================================================
-- GRANT PERMISSIONS
-- ===================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON blog_posts TO authenticated;
GRANT SELECT ON static_pages TO authenticated;
GRANT SELECT ON categories TO authenticated;
GRANT SELECT ON tags TO authenticated;
GRANT SELECT ON post_categories TO authenticated;
GRANT SELECT ON post_tags TO authenticated;

-- Grant full permissions to service role (for admin operations)
GRANT ALL ON blog_posts TO service_role;
GRANT ALL ON static_pages TO service_role;
GRANT ALL ON categories TO service_role;
GRANT ALL ON tags TO service_role;
GRANT ALL ON post_categories TO service_role;
GRANT ALL ON post_tags TO service_role;

-- ===================================================================
-- VERIFICATION
-- ===================================================================

SELECT 'SUCCESS: Professional RLS policies enabled for CMS!' as status;

-- Show enabled policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('blog_posts', 'static_pages', 'categories', 'tags', 'post_categories', 'post_tags')
ORDER BY tablename, policyname;
