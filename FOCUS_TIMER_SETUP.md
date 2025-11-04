# Focus Timer Supabase Integration

This guide explains how the Focus Timer in TaskDetail has been integrated with Supabase for persistent storage.

## Overview

The Focus Timer now saves all focus sessions to the Supabase database instead of storing them in local component state. This means your focus sessions will persist across browser sessions and devices.

## What Was Changed

### 1. New Service File
**File:** `src/services/focusSessionService.ts`

This service handles all database operations for focus sessions:
- `getFocusSessions()` - Fetch all sessions for a task
- `createFocusSession()` - Create a new session when timer stops
- `deleteFocusSession()` - Delete a session from history

### 2. Updated TaskDetail Component
**File:** `src/pages/TaskDetail.tsx`

Changes made:
- Replaced local state with React Query hooks for data fetching
- Added mutations for create and delete operations
- Updated `stopTimeTracking()` to save sessions to database
- Updated `deleteSession()` to use mutation
- Updated UI to use database field names (snake_case)

### 3. Database Schema
**File:** `focus_sessions_migration.sql`

New table structure with:
- Task and user relationships with cascade delete
- Start time, end time, and duration tracking
- Automatic timestamp management
- Row Level Security (RLS) policies for user data privacy
- Indexes for performance

## Setup Instructions

### Step 1: Run the Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `focus_sessions_migration.sql`
5. Click **Run** to execute the migration

### Step 2: Verify the Migration

After running the migration, verify the table was created:

```sql
SELECT * FROM focus_sessions LIMIT 1;
```

You should see the table structure with no errors.

### Step 3: Test the Feature

1. Navigate to any task in your dashboard
2. Go to the Task Detail page
3. Start a focus session using the Focus Timer
4. Work on your task
5. Stop the timer - your session is saved!
6. Refresh the page - your focus history persists!

## Features

### Persistent Storage
- All focus sessions are saved to Supabase
- Sessions persist across browser sessions and devices
- No data loss when closing the browser

### Session Tracking
- Records start time, end time, and duration
- Displays total focused time across all sessions
- Shows individual session details in history
- Supports deleting individual sessions

### Data Security
- Row Level Security (RLS) ensures users only see their own sessions
- All queries are scoped to the authenticated user
- Sessions automatically associated with the current user
- Cascade delete when task is removed

### Performance
- Optimized database queries with proper indexes
- React Query handles caching and background refreshes
- Real-time UI updates

## Database Schema Details

```sql
focus_sessions (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES project_tasks(id),
  user_id UUID REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER (in seconds),
  created_at TIMESTAMP WITH TIME ZONE
)
```

### Session Data Structure

Each focus session stores:
- **start_time**: When the timer was started
- **end_time**: When the timer was stopped
- **duration**: Total time in seconds
- **task_id**: Associated task
- **user_id**: User who created the session

## Usage

### Starting a Focus Session
1. Click "Start Focus Session" button
2. Timer begins counting
3. Work on your task
4. Session is held in memory (not saved yet)

### Stopping a Focus Session
1. Click "Stop Session" button
2. Session is saved to database
3. Appears in "Recent Sessions" list
4. Updates total focused time

### Viewing Session History
- Sessions displayed in reverse chronological order (newest first)
- Shows duration and time range for each session
- Total focused time displayed at top

### Deleting a Session
1. Hover over a session in the list
2. Click the delete (trash) icon
3. Session removed from database and UI

## Troubleshooting

### Sessions Not Saving
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

## API Reference

### getFocusSessions(taskId: string)
Fetches all focus sessions for a specific task.

**Returns:** `Promise<FocusSession[]>`

### createFocusSession(input: CreateFocusSessionInput)
Creates a new focus session.

**Parameters:**
- `task_id`: UUID of the task
- `start_time`: ISO timestamp
- `end_time`: ISO timestamp
- `duration`: Number of seconds

**Returns:** `Promise<FocusSession>`

### deleteFocusSession(id: string)
Deletes a focus session by ID.

**Returns:** `Promise<void>`

## Future Enhancements

Potential improvements:
- Daily/weekly/monthly statistics
- Focus time goals and tracking
- Pomodoro timer integration
- Break reminders
- Export sessions to CSV
- Charts and analytics
- Team focus time leaderboards

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify the migration was executed successfully
4. Ensure all RLS policies are active

