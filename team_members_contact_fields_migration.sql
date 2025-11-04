-- Migration: Add contact fields to team_members table
-- Execute this SQL in your Supabase SQL Editor

-- Add new columns for member contact information
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add index for email searches
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);

-- Verification query (optional - run after migration to verify)
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'team_members'
-- ORDER BY ordinal_position;
