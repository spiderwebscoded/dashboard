-- Migration: Add analytics_widgets table for customizable Analytics Dashboard
-- Execute this SQL in your Supabase SQL Editor

-- Create analytics_widgets table
CREATE TABLE IF NOT EXISTS analytics_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('stat', 'bar_chart', 'pie_chart', 'line_chart', 'area_chart', 'list', 'summary')),
  title TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  position INTEGER NOT NULL DEFAULT 0,
  data_source TEXT NOT NULL CHECK (data_source IN ('manual', 'team', 'projects', 'clients', 'tasks', 'revenue')),
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_widgets_user_id ON analytics_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_widgets_position ON analytics_widgets(user_id, position);

-- Enable Row Level Security
ALTER TABLE analytics_widgets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the migration)
DROP POLICY IF EXISTS "Users can view their own widgets" ON analytics_widgets;
DROP POLICY IF EXISTS "Users can insert their own widgets" ON analytics_widgets;
DROP POLICY IF EXISTS "Users can update their own widgets" ON analytics_widgets;
DROP POLICY IF EXISTS "Users can delete their own widgets" ON analytics_widgets;

-- RLS Policies: Users can only access their own widgets
CREATE POLICY "Users can view their own widgets"
  ON analytics_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widgets"
  ON analytics_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widgets"
  ON analytics_widgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widgets"
  ON analytics_widgets FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_analytics_widgets_updated_at ON analytics_widgets;
CREATE TRIGGER update_analytics_widgets_updated_at
  BEFORE UPDATE ON analytics_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verification query (optional - run after migration to verify)
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'analytics_widgets'
-- ORDER BY ordinal_position;
