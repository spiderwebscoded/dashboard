-- Migration: Add task and project assignment system with team member statistics
-- Execute this SQL in your Supabase SQL Editor

-- Step 1: Add assigned_to column to project_tasks table
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);

-- Step 2: Create project_team_members junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, team_member_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_member ON project_team_members(team_member_id);

-- Step 3: Enable Row Level Security on project_team_members
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their project team members
DROP POLICY IF EXISTS "Users can view their project team members" ON project_team_members;
CREATE POLICY "Users can view their project team members"
  ON project_team_members FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can manage their project team members
DROP POLICY IF EXISTS "Users can manage their project team members" ON project_team_members;
CREATE POLICY "Users can manage their project team members"
  ON project_team_members FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Step 4: Create function to calculate team member statistics
CREATE OR REPLACE FUNCTION calculate_team_member_stats(member_id UUID)
RETURNS TABLE(
  task_count BIGINT,
  completed_task_count BIGINT,
  active_project_count BIGINT,
  workload INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pt.id) FILTER (WHERE NOT pt.completed) as task_count,
    COUNT(DISTINCT pt.id) FILTER (WHERE pt.completed) as completed_task_count,
    COUNT(DISTINCT ptm.project_id) as active_project_count,
    CASE 
      WHEN COUNT(DISTINCT pt.id) FILTER (WHERE NOT pt.completed) = 0 THEN 0
      ELSE LEAST(100, (COUNT(DISTINCT pt.id) FILTER (WHERE NOT pt.completed) * 20)::INTEGER)
    END as workload
  FROM team_members tm
  LEFT JOIN project_tasks pt ON pt.assigned_to = tm.id
  LEFT JOIN project_team_members ptm ON ptm.team_member_id = tm.id
  WHERE tm.id = member_id
  GROUP BY tm.id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON project_team_members TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verification queries (commented out - uncomment to test)
-- SELECT * FROM project_tasks LIMIT 1;
-- SELECT * FROM project_team_members LIMIT 1;
-- SELECT * FROM calculate_team_member_stats('your-member-id-here');
