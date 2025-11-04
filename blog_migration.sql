-- Migration: Blog System with Posts, Tags, and Related Posts
-- Execute this SQL in your Supabase SQL Editor

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_post_tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post_id ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id ON blog_post_tags(tag_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the migration)
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can increment view count" ON blog_posts;
DROP POLICY IF EXISTS "Public can view all tags" ON blog_tags;
DROP POLICY IF EXISTS "Authenticated users can create tags" ON blog_tags;
DROP POLICY IF EXISTS "Public can view post tags" ON blog_post_tags;
DROP POLICY IF EXISTS "Users can manage tags for their posts" ON blog_post_tags;

-- RLS Policies for blog_posts
-- Public can read published posts
CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Users can view their own posts (including drafts)
CREATE POLICY "Users can view their own posts"
  ON blog_posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own posts
CREATE POLICY "Users can insert their own posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON blog_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON blog_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for blog_tags
-- Anyone can view tags
CREATE POLICY "Public can view all tags"
  ON blog_tags FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create tags
CREATE POLICY "Authenticated users can create tags"
  ON blog_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for blog_post_tags
-- Public can view post-tag relationships for published posts
CREATE POLICY "Public can view post tags"
  ON blog_post_tags FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE blog_posts.id = blog_post_tags.post_id 
      AND (blog_posts.status = 'published' OR blog_posts.user_id = auth.uid())
    )
  );

-- Users can manage tags for their own posts
CREATE POLICY "Users can manage tags for their posts"
  ON blog_post_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE blog_posts.id = blog_post_tags.post_id 
      AND blog_posts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE blog_posts.id = blog_post_tags.post_id 
      AND blog_posts.user_id = auth.uid()
    )
  );

-- Create function to get related posts by shared tags
CREATE OR REPLACE FUNCTION get_related_posts(
  p_post_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  featured_image TEXT,
  author_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER,
  shared_tag_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    bp.id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.featured_image,
    bp.author_name,
    bp.published_at,
    bp.view_count,
    COUNT(DISTINCT bpt2.tag_id) as shared_tag_count
  FROM blog_posts bp
  INNER JOIN blog_post_tags bpt2 ON bp.id = bpt2.post_id
  WHERE bp.id != p_post_id
    AND bp.status = 'published'
    AND bpt2.tag_id IN (
      SELECT tag_id 
      FROM blog_post_tags 
      WHERE post_id = p_post_id
    )
  GROUP BY bp.id, bp.title, bp.slug, bp.excerpt, bp.featured_image, 
           bp.author_name, bp.published_at, bp.view_count
  ORDER BY shared_tag_count DESC, bp.published_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_related_posts TO authenticated, anon;

