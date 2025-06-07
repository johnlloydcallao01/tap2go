-- WordPress-Style RLS Policies for Tap2Go CMS
-- Run this AFTER the schema script

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published' AND (published_at IS NULL OR published_at <= NOW()));

CREATE POLICY "Public can read published static pages" ON static_pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Public can read post categories" ON post_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read post tags" ON post_tags
  FOR SELECT USING (true);

CREATE POLICY "Public can read media" ON media_library
  FOR SELECT USING (true);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage static pages" ON static_pages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage tags" ON tags
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage post categories" ON post_categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage post tags" ON post_tags
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage media" ON media_library
  FOR ALL USING (auth.role() = 'service_role');
