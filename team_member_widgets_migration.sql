-- Migration: Add team_member_widgets table for customizable Team Detail dashboard
-- Execute this SQL in your Supabase SQL Editor

-- Create team_member_widgets table
CREATE TABLE IF NOT EXISTS team_member_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('member_info', 'skills', 'notes', 'activity', 'tasks')),
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_member_widgets_member_id ON team_member_widgets(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_widgets_user_id ON team_member_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_widgets_position ON team_member_widgets(team_member_id, user_id, position);

-- Enable Row Level Security
ALTER TABLE team_member_widgets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the migration)
DROP POLICY IF EXISTS "Users can view their own widgets" ON team_member_widgets;
DROP POLICY IF EXISTS "Users can insert their own widgets" ON team_member_widgets;
DROP POLICY IF EXISTS "Users can update their own widgets" ON team_member_widgets;
DROP POLICY IF EXISTS "Users can delete their own widgets" ON team_member_widgets;

-- RLS Policies: Users can only access their own widgets
CREATE POLICY "Users can view their own widgets"
  ON team_member_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widgets"
  ON team_member_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widgets"
  ON team_member_widgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widgets"
  ON team_member_widgets FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_team_member_widgets_updated_at ON team_member_widgets;
CREATE TRIGGER update_team_member_widgets_updated_at
  BEFORE UPDATE ON team_member_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verification query (optional - run after migration to verify)
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'team_member_widgets'
-- ORDER BY ordinal_position;

