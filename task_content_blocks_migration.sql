-- Migration: Add task_content_blocks table for Dynamic Canvas persistence
-- Execute this SQL in your Supabase SQL Editor

-- Create task_content_blocks table
CREATE TABLE IF NOT EXISTS task_content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'heading', 'heading2', 'checklist', 'code', 'quote', 'image', 'link', 'list')),
  content TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_content_blocks_task_id ON task_content_blocks(task_id);
CREATE INDEX IF NOT EXISTS idx_task_content_blocks_user_id ON task_content_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_task_content_blocks_position ON task_content_blocks(task_id, position);

-- Enable Row Level Security
ALTER TABLE task_content_blocks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the migration)
DROP POLICY IF EXISTS "Users can view their own content blocks" ON task_content_blocks;
DROP POLICY IF EXISTS "Users can insert their own content blocks" ON task_content_blocks;
DROP POLICY IF EXISTS "Users can update their own content blocks" ON task_content_blocks;
DROP POLICY IF EXISTS "Users can delete their own content blocks" ON task_content_blocks;

-- RLS Policies: Users can only access their own content blocks
CREATE POLICY "Users can view their own content blocks"
  ON task_content_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content blocks"
  ON task_content_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content blocks"
  ON task_content_blocks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content blocks"
  ON task_content_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on task_content_blocks
DROP TRIGGER IF EXISTS update_task_content_blocks_updated_at ON task_content_blocks;
CREATE TRIGGER update_task_content_blocks_updated_at
  BEFORE UPDATE ON task_content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verification query (optional - run after migration to verify)
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'task_content_blocks'
-- ORDER BY ordinal_position;

