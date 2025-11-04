-- Migration: Add dashboard_view and theme preferences to profiles table
-- Execute this SQL in your Supabase SQL Editor

-- Add dashboard_view and theme preferences to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dashboard_view TEXT DEFAULT 'grid' 
CHECK (dashboard_view IN ('grid', 'compact', 'list'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' 
CHECK (theme IN ('light', 'dark'));

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_dashboard_view ON profiles(id, dashboard_view);
CREATE INDEX IF NOT EXISTS idx_profiles_theme ON profiles(id, theme);

-- ============================================================================
-- DASHBOARD VIEW PREFERENCE MIGRATION COMPLETE!
-- ============================================================================
-- Users can now have their preferred dashboard view saved:
-- - 'grid': 3-column responsive grid (default)
-- - 'compact': 4-column grid with condensed spacing
-- - 'list': Single column full-width stacked layout
-- ============================================================================

