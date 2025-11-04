-- Migration: Add focus_sessions table for Focus Timer persistence
-- Execute this SQL in your Supabase SQL Editor

-- Create focus_sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_focus_sessions_task_id ON focus_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_start_time ON focus_sessions(task_id, start_time DESC);

-- Enable Row Level Security
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the migration)
DROP POLICY IF EXISTS "Users can view their own focus sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can insert their own focus sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can delete their own focus sessions" ON focus_sessions;

-- RLS Policies: Users can only access their own focus sessions
CREATE POLICY "Users can view their own focus sessions"
  ON focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus sessions"
  ON focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus sessions"
  ON focus_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Verification query (optional - run after migration to verify)
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'focus_sessions'
-- ORDER BY ordinal_position;

