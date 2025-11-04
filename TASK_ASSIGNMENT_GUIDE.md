# Task & Project Assignment System - Implementation Guide

## Overview

A comprehensive assignment system that allows intuitive assignment of tasks and projects to team members with automatic statistics updates. Team member workloads and active project counts are calculated in real-time based on actual assignments.

## ✅ What Was Implemented

### 1. Database Schema (`task_assignment_migration.sql`)

#### Added to project_tasks Table
- `assigned_to` column: UUID reference to team_members
- Index for faster queries on assigned_to field
- Foreign key constraint with ON DELETE SET NULL

#### Created project_team_members Junction Table
- Many-to-many relationship for project assignments
- Fields: id, project_id, team_member_id, role, created_at
- Unique constraint on (project_id, team_member_id)
- Indexes on both foreign keys
- RLS policies for user-specific access

#### Created calculate_team_member_stats Function
- PostgreSQL function to calculate statistics
- Returns: task_count, completed_task_count, active_project_count, workload
- Workload formula: active tasks * 20, capped at 100%
- Efficient query using LEFT JOINs

### 2. Team Statistics Service (`src/services/teamStatsService.ts`)

**Core Functions:**
- `calculateTeamMemberStats(memberId)` - Uses DB function to calculate stats
- `updateTeamMemberStats(memberId)` - Updates team member record with new stats
- `updateAllTeamStats()` - Bulk update for all team members
- `getTeamMemberStats(memberId)` - Get stats without updating

**Statistics Calculated:**
- Active task count (incomplete tasks)
- Completed task count  
- Active project count (from project assignments)
- Workload percentage (based on task count: 1 task = 20%, max 100%)

### 3. Updated Project Task Service (`src/services/projectTaskService.ts`)

**Updated Interface:**
```typescript
export interface ProjectTask {
  // ... existing fields
  assigned_to?: string | null;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  } | null;
}
```

**New Functions:**
- `assignTaskToMember(taskId, memberId)` - Assign task to team member
- `getTasksForTeamMember(memberId)` - Get all tasks assigned to member

**Updated Functions:**
- `getProjectTasks()` - Now includes assignee data via JOIN

### 4. Updated Project Service (`src/services/projectService.ts`)

**New Functions:**
- `assignTeamToProject(projectId, teamMemberIds)` - Assign multiple members to project
- `getProjectWithTeam(projectId)` - Get project with full team data
- `getProjectsForTeamMember(memberId)` - Get all projects member is assigned to

### 5. Team Member Selector Component (`src/components/tasks/TeamMemberSelector.tsx`)

**Features:**
- Dropdown showing all team members
- Avatar for each member
- Current workload percentage displayed
- "Unassigned" option to clear assignment
- Loading state
- Proper truncation for long names

**Props:**
- `value`: Current assigned member ID
- `onChange`: Callback when selection changes
- `placeholder`: Custom placeholder text
- `className`: Additional CSS classes

### 6. Quick Assign Button Component (`src/components/tasks/QuickAssignButton.tsx`)

**Features:**
- Displays current assignee avatar or UserPlus icon
- Dropdown menu with all team members
- Shows workload percentage for each member
- Check mark for currently assigned member
- Unassign option
- Auto-updates statistics after assignment
- Loading state during mutation
- Toast notifications
- Event propagation handled for nested clicks

**Props:**
- `taskId`: Task ID to assign
- `currentAssignee`: Current assignee object (if any)
- `onAssignmentChange`: Callback after successful assignment

### 7. Updated Tasks Page (`src/pages/Tasks.tsx`)

**Table View Changes:**
- Added "Assigned To" column header
- Added QuickAssignButton in table cells
- Updated colSpan from 7 to 8 for empty states
- Assignment button stops event propagation

**List View Changes:**
- Shows assignee avatar and name inline
- Small avatar (4x4) with name
- Only displays if task has assignee

**Import Additions:**
- Avatar components
- QuickAssignButton component

### 8. Updated Team Detail Page (`src/pages/TeamDetail.tsx`)

**Task Filtering:**
- Changed from project-based filtering to direct assignment filtering
- Now uses: `task.assigned_to === memberId`
- Shows only tasks directly assigned to the member
- More accurate representation of member's workload

## Setup Instructions

### Step 1: Run the Migration

1. Open Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste contents of `task_assignment_migration.sql`
5. Click **Run**

### Step 2: Verify Setup

```sql
-- Check assigned_to column exists
SELECT assigned_to FROM project_tasks LIMIT 1;

-- Check junction table exists
SELECT * FROM project_team_members LIMIT 1;

-- Test the stats function
SELECT * FROM calculate_team_member_stats('your-member-id');
```

### Step 3: Test the Feature

1. Navigate to **Tasks** page
2. Find a task in table view
3. Hover over a task row
4. Click the avatar/user icon in "Assigned To" column
5. Select a team member from dropdown
6. Verify toast notification appears
7. Check team member's detail page for updated stats

## How to Use

### Assigning Tasks

#### Method 1: Table View (Quick Assign)
1. Go to Tasks page
2. Switch to Table view
3. Find task in list
4. Click avatar/user icon in "Assigned To" column
5. Select team member from dropdown
6. Task is instantly assigned with stats update

#### Method 2: Task Detail Page
(To be implemented - TeamMemberSelector can be added to TaskDetail)

### Assigning Projects

#### Method 1: Team Detail Page
1. View team member profile
2. See list of assigned projects
3. Projects filter based on project_team_members table

#### Method 2: Project Detail Page  
(To be implemented - multi-select for team assignment)

### Viewing Assignments

#### Tasks Page
- **Table View**: See assignee in dedicated column
- **List View**: See assignee avatar and name inline

#### Team Member Detail Page
- See all assigned tasks in "Assigned Tasks" section
- See all assigned projects in "Active Projects" section
- View calculated statistics (workload, project count)

## Features

### ✅ Quick Assignment
- One-click assignment from task table
- Dropdown shows all available team members
- Real-time workload display helps prevent overloading

### ✅ Visual Feedback
- Assignee avatars displayed everywhere
- Current assignment highlighted with check mark
- Workload badges show capacity (0-100%)

### ✅ Auto-Statistics Updates
- Workload recalculated after each assignment
- Active project count updates automatically
- Task completion updates stats
- Efficient database calculations

### ✅ Unassignment Support
- "Unassigned" option in dropdown
- Clears assignment and updates stats
- Null handling throughout system

### ✅ Smart Filtering
- TeamDetail page shows only directly assigned tasks
- More accurate than project-based filtering
- Efficient queries with proper JOINs

### ✅ Database-Backed
- All assignments persist to Supabase
- RLS policies ensure security
- Proper foreign key constraints
- Cascading deletes handled properly

## Workload Calculation

### Formula
```
Workload = MIN(100, active_tasks * 20)
```

**Examples:**
- 0 tasks = 0% workload
- 1 task = 20% workload
- 2 tasks = 40% workload
- 3 tasks = 60% workload
- 4 tasks = 80% workload
- 5+ tasks = 100% workload (capped)

**Factors:**
- Only counts incomplete tasks
- Completed tasks don't affect workload
- Project count shown separately as `activeProjects`

## Data Flow

### Assignment Flow
```
1. User clicks assign button
2. QuickAssignButton mutation triggered
3. assignTaskToMember() updates database
4. Old assignee stats updated (if exists)
5. New assignee stats updated
6. React Query cache invalidated
7. UI refreshes with new data
8. Toast notification shown
```

### Statistics Update Flow
```
1. updateTeamMemberStats(memberId) called
2. calculate_team_member_stats() SQL function runs
3. Counts tasks and projects for member
4. Calculates workload percentage
5. Updates team_members table
6. React Query refetches data
7. UI shows updated statistics
```

## Technical Details

### TypeScript Interfaces

**ProjectTask:**
```typescript
{
  id: string;
  assigned_to?: string | null;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  } | null;
  // ... other fields
}
```

**TeamMemberStats:**
```typescript
{
  task_count: number;
  completed_task_count: number;
  active_project_count: number;
  workload: number;
}
```

### Database Relationships

```
team_members (1) ──< (many) project_tasks [assigned_to]
team_members (many) >──< (many) projects [via project_team_members]
```

### Query Performance

- Indexes on all foreign keys
- Efficient JOINs with proper relationships
- React Query caching reduces API calls
- Optimistic UI updates where possible

## Integration Points

### Already Integrated:
✅ Tasks page table view - Quick assign button
✅ Tasks page list view - Assignee display
✅ Team detail page - Filtered assigned tasks
✅ Auto-stats updates on assignment

### Future Integration Opportunities:
- Task detail page - Assignment section
- Task creation form - Assign during creation
- Project detail page - Team management interface
- Project creation - Assign team during creation
- Bulk assignment tool - Assign multiple tasks at once
- Workload balancer - Suggest assignments based on capacity

## Error Handling

### Validation
- User authentication checked on all operations
- Foreign key constraints prevent invalid assignments
- Null handling for unassigned state

### Error Messages
- Toast notifications for all errors
- Descriptive error messages
- Console logging for debugging
- Graceful degradation on failures

## Security

### Row Level Security (RLS)
- project_team_members table protected by RLS
- Users can only assign to their own projects
- Users can only assign their own team members
- Proper CASCADE deletes when members/projects removed

### Data Integrity
- Foreign key constraints ensure valid references
- Unique constraints prevent duplicate assignments
- ON DELETE SET NULL for task assignments
- ON DELETE CASCADE for project assignments

## Performance Considerations

### Optimizations
- Batch stats updates possible with updateAllTeamStats()
- Indexes on all foreign keys
- React Query caching layer
- Efficient SQL function for calculations

### Scalability
- Junction table handles many-to-many efficiently
- Stats calculation scales with team size
- Proper indexing supports large datasets

## Troubleshooting

### Tasks Not Showing Assignee
- Verify migration ran successfully
- Check assigned_to column exists
- Ensure team_members table has data
- Check RLS policies are active

### Statistics Not Updating
- Verify calculate_team_member_stats function exists
- Check function permissions
- Ensure updateTeamMemberStats is called after assignments
- Review console for error messages

### Assignment Dropdown Empty
- Ensure team members exist
- Check team-members query is successful
- Verify RLS policies allow access
- Check authentication state

### Workload Calculation Incorrect
- Review SQL function logic
- Check task completion states
- Verify assigned_to field values
- Run calculate_team_member_stats manually

## Future Enhancements

Potential improvements:
- **Smart Assignment Suggestions**: AI-powered recommendations based on skills and workload
- **Capacity Planning**: Visual workload distribution charts
- **Assignment History**: Track who was assigned and when
- **Bulk Operations**: Assign multiple tasks to one member
- **Team Balancing**: Auto-balance workload across team
- **Assignment Rules**: Auto-assign based on criteria
- **Notifications**: Alert members when tasks assigned
- **Time Estimates**: Factor task duration into workload
- **Skills Matching**: Suggest members based on required skills
- **Approval Workflow**: Require manager approval for assignments

## Files Created/Modified

### Created:
1. `task_assignment_migration.sql` - Database schema
2. `src/services/teamStatsService.ts` - Statistics calculations
3. `src/components/tasks/TeamMemberSelector.tsx` - Dropdown selector
4. `src/components/tasks/QuickAssignButton.tsx` - Quick assign UI
5. `TASK_ASSIGNMENT_GUIDE.md` - This documentation

### Modified:
1. `src/services/projectTaskService.ts` - Assignment functions
2. `src/services/projectService.ts` - Team assignment functions
3. `src/pages/Tasks.tsx` - Assignment column and UI
4. `src/pages/TeamDetail.tsx` - Direct assignment filtering

## Benefits

✅ **Intuitive UX**: One-click assignment with visual feedback
✅ **Real-time Stats**: Automatic workload calculations
✅ **Prevent Overload**: See workload before assigning
✅ **Clear Visibility**: Know who's working on what
✅ **Database-Backed**: Reliable persistence
✅ **Type-Safe**: Full TypeScript support
✅ **Accessible**: Keyboard navigation and screen readers
✅ **Secure**: RLS policies protect data
✅ **Performant**: Indexed queries and caching
✅ **Scalable**: Handles growing teams and projects

## Conclusion

The task and project assignment system provides a professional, efficient way to manage team workloads with real-time statistics and intuitive UI. The database-backed approach ensures reliability while the React Query integration provides excellent UX with caching and optimistic updates.
