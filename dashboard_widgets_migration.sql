-- Migration: Add dashboard_widgets table for customizable Dashboard page
-- Execute this SQL in your Supabase SQL Editor

-- Create dashboard_widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN (
    'recent_tasks',
    'active_projects',
    'team_overview',
    'client_list',
    'revenue_chart',
    'quick_stats',
    'activity_feed',
    'calendar',
    'focus_timer',
    'notes'
  )),
  title TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  position INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_position ON dashboard_widgets(user_id, position);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_dashboard_widgets_updated_at ON dashboard_widgets;
CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Policy: Users can view their own dashboard widgets
DROP POLICY IF EXISTS "Users can view their own dashboard widgets" ON dashboard_widgets;
CREATE POLICY "Users can view their own dashboard widgets"
  ON dashboard_widgets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own dashboard widgets
DROP POLICY IF EXISTS "Users can insert their own dashboard widgets" ON dashboard_widgets;
CREATE POLICY "Users can insert their own dashboard widgets"
  ON dashboard_widgets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own dashboard widgets
DROP POLICY IF EXISTS "Users can update their own dashboard widgets" ON dashboard_widgets;
CREATE POLICY "Users can update their own dashboard widgets"
  ON dashboard_widgets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own dashboard widgets
DROP POLICY IF EXISTS "Users can delete their own dashboard widgets" ON dashboard_widgets;
CREATE POLICY "Users can delete their own dashboard widgets"
  ON dashboard_widgets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON dashboard_widgets TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verification query (run this to check if everything is set up correctly)
-- SELECT * FROM dashboard_widgets LIMIT 1;
