-- Migration: Add custom_analytics table for rich, visualized analytics data
-- Execute this SQL in your Supabase SQL Editor

-- Create custom_analytics table
CREATE TABLE IF NOT EXISTS custom_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  chart_type TEXT NOT NULL CHECK (chart_type IN ('stat', 'bar_chart', 'pie_chart', 'line_chart', 'area_chart')),
  data_points JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_analytics_user_id ON custom_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_analytics_created_at ON custom_analytics(user_id, created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_custom_analytics_updated_at ON custom_analytics;
CREATE TRIGGER update_custom_analytics_updated_at
  BEFORE UPDATE ON custom_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE custom_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Policy: Users can view their own custom analytics
DROP POLICY IF EXISTS "Users can view their own custom analytics" ON custom_analytics;
CREATE POLICY "Users can view their own custom analytics"
  ON custom_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own custom analytics
DROP POLICY IF EXISTS "Users can insert their own custom analytics" ON custom_analytics;
CREATE POLICY "Users can insert their own custom analytics"
  ON custom_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own custom analytics
DROP POLICY IF EXISTS "Users can update their own custom analytics" ON custom_analytics;
CREATE POLICY "Users can update their own custom analytics"
  ON custom_analytics
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own custom analytics
DROP POLICY IF EXISTS "Users can delete their own custom analytics" ON custom_analytics;
CREATE POLICY "Users can delete their own custom analytics"
  ON custom_analytics
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON custom_analytics TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verification query (run this to check if everything is set up correctly)
-- SELECT * FROM custom_analytics LIMIT 1;
