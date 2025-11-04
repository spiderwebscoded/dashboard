# Multi-Tenant Dashboard Setup Guide

## 🎯 What This Does

Transforms your dashboard into a multi-tenant system where:
- Each user has their own isolated dashboard
- Users can only see and manage their own data (clients, projects, team members, revenue)
- New users can sign up and get their own workspace automatically
- Admin keeps their own separate workspace

## 📋 Implementation Steps

### Step 1: Run the SQL Migration in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/project/ukopqhxczcjjyxoxqgqs

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Open the file `supabase_migration.sql` in your project
   - Copy the **entire contents** (includes multi-tenant tables AND profiles table)
   - Paste into the Supabase SQL editor
   - Click **"Run"** or press `Ctrl+Enter`

4. **Verify Success**
   - You should see "Success. No rows returned" message
   - This creates:
     - ✅ Multi-tenant support with user_id columns
     - ✅ Row Level Security policies
     - ✅ Profiles table for display names
     - ✅ All necessary indexes and triggers

### Step 2: Handle Existing Data (If You Have Any)

If you already have data in your database that you want to keep:

1. **Get Your User ID**
   - In Supabase Dashboard, go to **Authentication** → **Users**
   - Find your account
   - Click on it and copy the **User UID** (looks like: `123e4567-e89b-12d3-a456-426614174000`)

2. **Assign Existing Data to Admin**
   - Go back to SQL Editor
   - Run these queries (replace `YOUR_ADMIN_USER_ID` with the actual UID):

```sql
UPDATE clients SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
UPDATE projects SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
UPDATE team_members SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
UPDATE revenue_data SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
UPDATE project_type_data SET user_id = 'YOUR_ADMIN_USER_ID' WHERE user_id IS NULL;
```

3. **Make user_id Required (Optional but Recommended)**
   - After assigning all data, run:

```sql
ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE team_members ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE revenue_data ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE project_type_data ALTER COLUMN user_id SET NOT NULL;
```

### Step 3: Test the Multi-Tenant Setup

1. **Test with a New User**
   - Go to your app at `/login`
   - Click "Don't have an account? Sign up"
   - Create a new test account
   - Add some clients, projects, or team members

2. **Verify Data Isolation**
   - Log out
   - Log in with a different account
   - Verify you can't see the first user's data
   - Each user should only see their own data

3. **Test Admin Account**
   - Go to `/admin-login`
   - Log in with admin credentials
   - Verify admin has their own separate data

## ✅ What Changed in the Code

### Database (Supabase)
- ✅ Added `user_id` column to all tables
- ✅ Created `profiles` table for user display names
- ✅ Enabled Row Level Security (RLS) on all tables
- ✅ Created policies to isolate user data
- ✅ Added indexes for performance
- ✅ Auto-update timestamp triggers

### TypeScript Types (`src/integrations/supabase/types.ts`)
- ✅ Added `user_id: string | null` to all table types

### Services (Auto-filters by user)
- ✅ `clientService.ts` - Filters clients by logged-in user
- ✅ `projectService.ts` - Filters projects by logged-in user
- ✅ `teamService.ts` - Filters team members by logged-in user
- ✅ `analyticsService.ts` - Filters analytics by logged-in user

### Authentication & Profiles
- ✅ `Login.tsx` - Added display name field on sign-up
- ✅ `AuthContext.tsx` - Fetches and stores user profiles
- ✅ `Header.tsx` - Displays user's display name instead of "Spiderwebscoded"

## 🔒 Security Features

**Row Level Security (RLS)** ensures:
- Users can only SELECT their own data
- Users can only INSERT data with their own user_id
- Users can only UPDATE their own data
- Users can only DELETE their own data

Even if there's a bug in the application code, the database prevents unauthorized access.

## 🚀 How Users Will Experience It

### For New Users:
1. Go to `/login`
2. Click "Sign up"
3. **Enter display name** (e.g., "John Doe")
4. Create account with email/password
5. See personalized welcome message with their name
6. Automatically get a fresh, empty dashboard
7. Their name appears in the header instead of "Spiderwebscoded"
8. Add their own clients, projects, and team members

### For Existing Admin:
- Admin account keeps working normally
- Has their own isolated workspace
- Existing data (if assigned) stays with admin
- Can create a profile to show custom name

### For All Users:
- Each user sees only their own data
- Personalized welcome messages with their display name
- Display name shown in header and notifications
- No way to access other users' information
- Clean, isolated workspace per user

## 📊 Testing Checklist

- [ ] SQL migration runs without errors
- [ ] Can create new user accounts
- [ ] New users see empty dashboard (no data)
- [ ] New users can add clients/projects/team members
- [ ] Different users can't see each other's data
- [ ] Admin account still works
- [ ] Existing data (if any) assigned to correct user

## 🆘 Troubleshooting

### "User not authenticated" errors
- Make sure you're logged in
- Check that authentication is working
- Clear browser cache and try again

### Can't see any data after migration
- You need to assign existing data to a user (Step 2)
- Or create new data while logged in

### RLS policies not working
- Verify RLS is enabled: Check in Supabase Dashboard → Database → Tables
- Check policies exist: Go to table → Policies tab

### Need to disable RLS temporarily (debugging only)
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

Remember to re-enable:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## 🎉 Success!

Once setup is complete, you have a fully functional multi-tenant SaaS dashboard where:
- ✅ Each user gets their own isolated workspace
- ✅ Data is secure at the database level
- ✅ Users can sign up and start using immediately
- ✅ Scales to unlimited users

## 📝 Notes

- User IDs are automatically handled by the application
- No manual user management needed
- RLS provides database-level security
- Works with Supabase authentication out of the box

---

**Need Help?** Check the Supabase logs in your dashboard or browser console for specific error messages.
