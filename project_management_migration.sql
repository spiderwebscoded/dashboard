-- =============================================
-- Project Management System - Database Migration
-- =============================================
-- This migration adds support for project tasks, notes, and calendar events

-- =============================================
-- 1. PROJECT TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_user_id ON project_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_completed ON project_tasks(completed);

-- Enable RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_tasks
CREATE POLICY "Users can view their own project tasks"
  ON project_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project tasks"
  ON project_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project tasks"
  ON project_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project tasks"
  ON project_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 2. PROJECT NOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_user_id ON project_notes(user_id);

-- Enable RLS
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_notes
CREATE POLICY "Users can view their own project notes"
  ON project_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project notes"
  ON project_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project notes"
  ON project_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project notes"
  ON project_notes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. PROJECT CALENDAR EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS project_calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_calendar_events_project_id ON project_calendar_events(project_id);
CREATE INDEX IF NOT EXISTS idx_project_calendar_events_user_id ON project_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_project_calendar_events_date ON project_calendar_events(event_date);

-- Enable RLS
ALTER TABLE project_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_calendar_events
CREATE POLICY "Users can view their own project calendar events"
  ON project_calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project calendar events"
  ON project_calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project calendar events"
  ON project_calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project calendar events"
  ON project_calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 4. UPDATE TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for project_tasks
DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for project_notes
DROP TRIGGER IF EXISTS update_project_notes_updated_at ON project_notes;
CREATE TRIGGER update_project_notes_updated_at
    BEFORE UPDATE ON project_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for project_calendar_events
DROP TRIGGER IF EXISTS update_project_calendar_events_updated_at ON project_calendar_events;
CREATE TRIGGER update_project_calendar_events_updated_at
    BEFORE UPDATE ON project_calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- Make sure to run the multi-tenant migration first if you haven't already

