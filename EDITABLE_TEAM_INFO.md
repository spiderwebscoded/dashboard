# Editable Team Member Information

This guide explains how team member contact information has been made editable in the Team Detail page.

## Overview

Team member information is now fully editable directly from the Member Info widget or through the Edit Member dialog. Changes are automatically saved to the database.

## New Fields Added

### Database Fields
- **email** - Member's email address
- **phone** - Member's phone number  
- **department** - Member's department or team

These fields are optional and can be left blank.

## Features

### Inline Editing (Member Info Widget)
- Click into any field to edit
- Type your changes
- Click away or press Tab to auto-save
- Toast notification confirms save
- Error handling for failed saves

### Bulk Editing (Edit Member Dialog)
- Click "Edit Member" button in header
- Edit all fields in one form
- Includes email, phone, and department
- Click "Save Changes" to update all at once

### Auto-Save Behavior
- Changes save automatically on blur (when you click away)
- No need to click a save button for inline edits
- Instant feedback with toast notifications
- Optimistic UI updates via React Query

## Setup Instructions

### Step 1: Run the Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `team_members_contact_fields_migration.sql`
5. Click **Run** to execute the migration

### Step 2: Verify the Migration

```sql
SELECT 
  id, name, email, phone, department, role 
FROM team_members 
LIMIT 5;
```

You should see the new columns (email, phone, department) with NULL values.

### Step 3: Add Data

1. Navigate to Team page
2. Click any team member
3. In the Member Info widget:
   - Click email field and enter email
   - Click phone field and enter phone
   - Click department field and enter department
4. Click away from each field to auto-save
5. See toast notifications confirming saves

## Usage

### Editing Contact Info (Inline)

**Email:**
1. Click the email input field
2. Type the email address
3. Click away or press Tab
4. ✅ Auto-saved with notification

**Phone:**
1. Click the phone input field
2. Type the phone number (any format)
3. Click away or press Tab
4. ✅ Auto-saved with notification

**Department:**
1. Click the department input field
2. Type the department name
3. Click away or press Tab
4. ✅ Auto-saved with notification

### Editing via Dialog

1. Click "Edit Member" button
2. Form opens with all fields
3. Update any fields including:
   - Name
   - Role
   - Email (NEW)
   - Phone (NEW)
   - Department (NEW)
   - Workload
   - Active Projects
   - Availability
   - Skills
4. Click "Save Changes"
5. All updates saved at once

## Data Validation

- **Email**: HTML5 email validation (format check)
- **Phone**: Free-form text (supports any format)
- **Department**: Free-form text
- All fields are optional

## Files Modified

### 1. Database Schema
**File:** `team_members_contact_fields_migration.sql`
- Added email, phone, department columns
- Added index on email for search performance

### 2. TypeScript Interface
**File:** `src/types/database.ts`
- Added email?, phone?, department? to TeamMember type

### 3. Service Layer
**File:** `src/services/teamService.ts`
- Updated `getTeamMembers()` to map new fields
- Updated `getTeamMemberById()` to map new fields
- Updated `createTeamMember()` to include new fields
- Updated `updateTeamMember()` to handle new fields

### 4. Team Detail Page
**File:** `src/pages/TeamDetail.tsx`
- Imported `updateTeamMember` function
- Added `handleUpdateMemberField()` for auto-save
- Replaced read-only text with Input components
- Auto-save on blur for each field
- Toast notifications for feedback

### 5. Edit Dialog
**File:** `src/components/dashboard/EditTeamMemberDialog.tsx`
- Added email input field
- Added phone input field
- Added department input field
- Updated state initialization
- Updated form submission

## Technical Details

### Auto-Save Implementation

```typescript
const handleUpdateMemberField = (field: keyof TeamMember, value: any) => {
  if (!memberId) return;
  
  updateMemberMutation.mutate(
    { id: memberId, updates: { [field]: value } },
    {
      onSuccess: () => {
        toast({ title: 'Field updated', description: `${field} has been saved.` });
      },
      onError: (error) => {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      },
    }
  );
};
```

### Input Components

Using `defaultValue` instead of `value` to avoid controlled component issues:
```tsx
<Input
  type="email"
  defaultValue={member.email || ''}
  onBlur={(e) => {
    if (e.target.value !== member.email) {
      handleUpdateMemberField('email', e.target.value);
    }
  }}
/>
```

## Benefits

- **Quick Updates**: Edit fields inline without opening dialogs
- **Instant Feedback**: Toast notifications confirm saves
- **Data Persistence**: All changes saved to Supabase
- **User-Friendly**: Familiar input patterns
- **Error Handling**: Clear error messages on failures
- **Optional Fields**: No required contact info

## Troubleshooting

### Fields Not Saving
1. Check browser console for errors
2. Verify you're authenticated
3. Ensure migration was run
4. Check RLS policies

### Email Validation Errors
- Ensure email format is correct (contains @)
- HTML5 validation runs on blur

### Changes Not Appearing
- Hard refresh the page (Ctrl+Shift+R)
- Check network tab for API calls
- Verify Supabase connection

## Future Enhancements

Potential improvements:
- Avatar image upload
- Social media links
- Emergency contact
- Timezone field
- Language preferences
- Custom fields

## Support

If you encounter issues:
1. Check browser console
2. Review Supabase logs
3. Verify migration was executed
4. Test with Edit Member dialog as fallback
