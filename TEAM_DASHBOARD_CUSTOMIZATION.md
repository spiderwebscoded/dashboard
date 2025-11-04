# Team Dashboard Customization

This guide explains the customizable Team Detail dashboard feature that allows users to add, remove, and rearrange widgets.

## Overview

The Team Detail page now features a fully customizable dashboard where each user can personalize their view of team member information with drag-and-drop widgets.

## Features

### Fixed Header Section
- Always visible at the top
- Team member avatar, name, and role
- Availability badge with color coding
- Edit Member button (opens edit dialog)
- More options menu with delete action
- Back button to return to team list

### Customizable Widget Area

Users can:
- Add widgets from a dropdown menu
- Remove widgets with the X button
- Drag widgets to reorder them
- Edit widget titles by clicking them
- Each user has their own layout per team member

### Available Widget Types

1. **Member Information**
   - Email (generated from name)
   - Phone number
   - Role/Department
   - Join date

2. **Skills**
   - Skills displayed as badges
   - Color-coded for easy recognition
   - Empty state when no skills

3. **Statistics**
   - Current workload percentage with color-coded progress bar
   - Active projects count
   - Completed projects count
   - Visual cards for quick glance

4. **Assigned Projects**
   - Table view of all projects
   - Shows project name, client, status, and progress
   - Clickable rows navigate to project detail
   - Empty state when no projects

5. **Assigned Tasks**
   - List of tasks from assigned projects
   - Shows task title, completion status, and priority
   - Clickable to navigate to task detail
   - Shows first 5 tasks with count of more

6. **Notes**
   - Free-form text area
   - Add personal notes about the team member
   - Auto-saves to database
   - Private to each user

7. **Recent Activity**
   - Timeline of member activities
   - Join date
   - Current project status

## Setup Instructions

### Step 1: Run the Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `team_member_widgets_migration.sql`
5. Click **Run** to execute the migration

### Step 2: Verify the Migration

```sql
SELECT * FROM team_member_widgets LIMIT 1;
```

### Step 3: Use the Feature

1. Navigate to Team page
2. Click on any team member card
3. On first visit, default widgets will be created automatically:
   - Member Information
   - Skills
   - Statistics
   - Assigned Projects

4. Customize your dashboard:
   - Click "Add Widget" to add more widgets
   - Drag widgets by the handle icon to reorder
   - Click X button to remove widgets
   - Click widget titles to rename them

## Database Schema

```sql
team_member_widgets (
  id UUID PRIMARY KEY,
  team_member_id UUID REFERENCES team_members(id),
  user_id UUID REFERENCES auth.users(id),
  widget_type TEXT (checked against valid types),
  title TEXT,
  position INTEGER,
  config JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Widget Types
- `member_info` - Contact and basic information
- `skills` - Skills and competencies
- `statistics` - Workload and project statistics
- `projects` - Assigned projects table
- `tasks` - Assigned tasks list
- `notes` - Personal notes
- `activity` - Recent activity timeline

### Config Field

The `config` JSONB field stores widget-specific data:

**Notes Widget:**
```json
{
  "notes": "Team member notes here..."
}
```

## User Experience

### Adding Widgets
1. Click "Add Widget" button (top right)
2. Select widget type from dropdown
3. Widget appears at the bottom of the grid
4. Automatically saves to database

### Removing Widgets
1. Hover over any widget
2. Click the X button that appears
3. Widget is removed and database updates
4. Toast notification confirms removal

### Reordering Widgets
1. Hover over any widget
2. Drag handle appears on the left
3. Click and drag to new position
4. Drop to reorder
5. Position saved to database automatically

### Editing Widget Titles
1. Click any widget title
2. Input field appears
3. Type new title
4. Click outside to save
5. Title updates in database

### Personalizing Layouts
- Each user has their own layout for each team member
- Changes don't affect other users' views
- Layout persists across sessions
- Syncs across devices

## Data Security

- Row Level Security (RLS) ensures users only see their own widgets
- All queries scoped to authenticated user
- Widgets automatically deleted when team member is removed
- User-specific customization

## Performance

- Optimized queries with proper indexes
- React Query caching for fast navigation
- Optimistic UI updates for instant feedback
- Lazy loading of widget data

## API Reference

### getTeamMemberWidgets(teamMemberId: string)
Fetches all widgets for a team member (current user's layout).

**Returns:** `Promise<TeamMemberWidget[]>`

### createTeamMemberWidget(input: CreateWidgetInput)
Creates a new widget.

**Parameters:**
- `team_member_id`: UUID of the team member
- `widget_type`: Type of widget
- `title`: Widget title
- `position`: Position in grid
- `config`: Optional configuration object

**Returns:** `Promise<TeamMemberWidget>`

### updateTeamMemberWidget(id: string, input: UpdateWidgetInput)
Updates a widget's title, position, or config.

**Returns:** `Promise<TeamMemberWidget>`

### deleteTeamMemberWidget(id: string)
Deletes a widget.

**Returns:** `Promise<void>`

### reorderTeamMemberWidgets(teamMemberId: string, widgetIds: string[])
Updates widget positions after drag-and-drop.

**Returns:** `Promise<void>`

### initializeDefaultWidgets(teamMemberId: string)
Creates default widgets for first-time visitors.

**Returns:** `Promise<void>`

## Troubleshooting

### Widgets Not Saving
1. Check browser console for errors
2. Verify you're authenticated
3. Ensure migration was run successfully
4. Check RLS policies are active

### Default Widgets Not Appearing
- Wait a moment, they initialize automatically
- Refresh the page if needed
- Check console for initialization errors

### Drag-and-Drop Not Working
- Ensure widgets are fully loaded
- Try refreshing the page
- Check that JavaScript is enabled

## Future Enhancements

Potential improvements:
- More widget types (calendar, charts, metrics)
- Widget size customization (full-width, half-width)
- Export/import widget layouts
- Share widget layouts with team
- Widget templates
- Real-time collaboration

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs
3. Verify the migration was executed
4. Ensure RLS policies are active

