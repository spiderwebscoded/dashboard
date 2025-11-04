# Dynamic Canvas Database Persistence Setup

This guide explains the changes made to enable Dynamic Canvas data persistence in Supabase.

## Overview

The Dynamic Canvas in TaskDetail now saves all content blocks to the Supabase database instead of storing them in local component state. This means your canvas content will persist across browser sessions and devices.

## What Was Changed

### 1. New Service File
**File:** `src/services/taskContentBlockService.ts`

This service handles all database operations for content blocks:
- `getTaskContentBlocks()` - Fetch all blocks for a task
- `createTaskContentBlock()` - Create a new block
- `updateTaskContentBlock()` - Update an existing block
- `deleteTaskContentBlock()` - Delete a block
- `reorderTaskContentBlocks()` - Update block positions after drag-and-drop

### 2. Updated TaskDetail Component
**File:** `src/pages/TaskDetail.tsx`

Changes made:
- Replaced local state with React Query hooks for data fetching
- Added mutations for create, update, delete, and reorder operations
- Implemented real-time save status indicator
- All block operations now persist to the database automatically

### 3. Database Schema
**File:** `task_content_blocks_migration.sql`

New table structure with:
- Support for all block types (text, heading, checklist, code, etc.)
- JSONB metadata field for flexible block-specific data
- Position tracking for drag-and-drop ordering
- Row Level Security (RLS) policies for user data privacy
- Automatic timestamp management

## Setup Instructions

### Step 1: Run the Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `task_content_blocks_migration.sql`
5. Click **Run** to execute the migration

### Step 2: Verify the Migration

After running the migration, verify the table was created:

```sql
SELECT * FROM task_content_blocks LIMIT 1;
```

You should see the table structure with no errors.

### Step 3: Test the Feature

1. Navigate to any task in your dashboard
2. Go to the Task Detail page
3. Add content blocks to the Dynamic Canvas
4. Refresh the page - your content should persist!
5. Try drag-and-drop reordering - positions are saved automatically

## Features

### Manual Save with Batch Operations
- Changes are stored locally until you click "Save Canvas"
- All modifications are batched and saved in a single operation
- Save status is displayed at the bottom of the canvas:
  - "You have unsaved changes" (yellow) - Changes pending save
  - "Saving changes..." (blue) - Changes being written to the database  
  - "All changes saved" (green) - All changes are persisted
- Unsaved changes badge appears in canvas header
- Browser warns you before leaving with unsaved changes

### Block Types Supported
- Text blocks
- Heading 1 & 2
- Bullet lists
- Checklists
- Code blocks
- Quotes
- Links
- Images

### Data Security
- Row Level Security (RLS) ensures users can only see their own content blocks
- All queries are scoped to the authenticated user
- Content is automatically associated with the current user

### Performance
- Optimistic UI updates for instant feedback
- Database queries are optimized with proper indexes
- React Query handles caching and background refreshes

## Database Schema Details

```sql
task_content_blocks (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES project_tasks(id),
  user_id UUID REFERENCES auth.users(id),
  type TEXT (checked against valid block types),
  content TEXT,
  metadata JSONB,
  position INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Metadata Structure

The `metadata` JSONB field stores block-specific data:

**Checklist/List blocks:**
```json
{
  "items": [
    {
      "id": "1",
      "text": "Item text",
      "checked": false
    }
  ]
}
```

**Code blocks:**
```json
{
  "language": "javascript"
}
```

**Link blocks:**
```json
{
  "url": "https://example.com"
}
```

## Troubleshooting

### Content Not Saving
1. Check browser console for errors
2. Verify you're authenticated
3. Ensure the migration was run successfully
4. Check Supabase RLS policies are active

### Permission Errors
- Ensure RLS policies were created correctly
- Verify your user is authenticated
- Check that `user_id` matches the authenticated user

### Migration Errors
If the migration fails:
1. Check if the `project_tasks` table exists
2. Verify `uuid_generate_v4()` extension is enabled
3. Ensure you have admin permissions in Supabase

## Future Enhancements

Potential improvements:
- Version history for content blocks
- Collaborative editing with real-time updates
- Templates for common canvas layouts
- Export canvas to PDF/Markdown
- Rich text formatting
- File uploads for images

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify the migration was executed successfully
4. Ensure all RLS policies are active

