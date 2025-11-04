-- ============================================================================
-- MULTI-TENANT SUPPORT MIGRATION
-- ============================================================================
-- This migration adds user_id columns to all tables and sets up Row Level Security (RLS)
-- to ensure each user can only access their own data.
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard: https://app.supabase.com/project/ukopqhxczcjjyxoxqgqs
-- 2. Navigate to SQL Editor in the left sidebar
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
-- ============================================================================

-- Step 1: Add user_id columns to all tables
-- ============================================================================

-- Add user_id to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to team_members table
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to revenue_data table
ALTER TABLE revenue_data 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to project_type_data table
ALTER TABLE project_type_data 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Note: notifications table already has user_id

-- Step 2: Create indexes for better performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_data_user_id ON revenue_data(user_id);
CREATE INDEX IF NOT EXISTS idx_project_type_data_user_id ON project_type_data(user_id);

-- Step 3: Enable Row Level Security (RLS) on all tables
-- ============================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_type_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if any (to avoid conflicts)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

DROP POLICY IF EXISTS "Users can view their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can update their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete their own team members" ON team_members;

DROP POLICY IF EXISTS "Users can view their own revenue data" ON revenue_data;
DROP POLICY IF EXISTS "Users can insert their own revenue data" ON revenue_data;
DROP POLICY IF EXISTS "Users can update their own revenue data" ON revenue_data;
DROP POLICY IF EXISTS "Users can delete their own revenue data" ON revenue_data;

DROP POLICY IF EXISTS "Users can view their own project type data" ON project_type_data;
DROP POLICY IF EXISTS "Users can insert their own project type data" ON project_type_data;
DROP POLICY IF EXISTS "Users can update their own project type data" ON project_type_data;
DROP POLICY IF EXISTS "Users can delete their own project type data" ON project_type_data;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

-- Step 5: Create RLS Policies
-- ============================================================================

-- Clients Policies
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Projects Policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Team Members Policies
CREATE POLICY "Users can view their own team members"
  ON team_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team members"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team members"
  ON team_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team members"
  ON team_members FOR DELETE
  USING (auth.uid() = user_id);

-- Revenue Data Policies
CREATE POLICY "Users can view their own revenue data"
  ON revenue_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own revenue data"
  ON revenue_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue data"
  ON revenue_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue data"
  ON revenue_data FOR DELETE
  USING (auth.uid() = user_id);

-- Project Type Data Policies
CREATE POLICY "Users can view their own project type data"
  ON project_type_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project type data"
  ON project_type_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project type data"
  ON project_type_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project type data"
  ON project_type_data FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- Your database is now configured for multi-tenant access.
-- Each user will only be able to see and manage their own data.
--
-- NEXT STEPS (OPTIONAL):
-- 1. If you have existing data, you may want to assign it to a specific user
-- 2. To do this, get your admin user ID from Authentication > Users in Supabase
-- 3. Run the following queries (replace YOUR_ADMIN_USER_ID with actual ID):
--
--    UPDATE clients SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
--    UPDATE projects SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
--    UPDATE team_members SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
--    UPDATE revenue_data SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
--    UPDATE project_type_data SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
--
-- 4. (Optional) Make user_id NOT NULL for data integrity:
--
--    ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
--    ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;
--    ALTER TABLE team_members ALTER COLUMN user_id SET NOT NULL;
--    ALTER TABLE revenue_data ALTER COLUMN user_id SET NOT NULL;
--    ALTER TABLE project_type_data ALTER COLUMN user_id SET NOT NULL;
--
-- ============================================================================

-- ============================================================================
-- USER PROFILES TABLE (Add this after the multi-tenant migration)
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ============================================================================
-- PROFILES TABLE COMPLETE!
-- ============================================================================
