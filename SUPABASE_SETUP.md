# Supabase Setup Guide

## Initial Setup (Already Done)
- Supabase project created
- Environment variables configured in `.env.local`

## Database Schema Migration

To set up the database tables, follow these steps:

### Option 1: Using Supabase Dashboard (Recommended for Manual Setup)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy the entire contents of `supabase/migrations/001_create_courses_and_tasks.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press `Cmd+Enter`)
7. Wait for completion (you should see "Success" message)

### Option 2: Using Supabase CLI (For Local Development)

```bash
# If you have the Supabase CLI installed
supabase db push
```

## What Was Created

### Tables
- **courses**: Stores student courses/subjects
  - Columns: id, user_id, name, color, created_at, updated_at
  
- **tasks**: Stores assignments, exams, and other tasks
  - Columns: id, user_id, course_id, title, description, type, due_date, status, difficulty, created_at, updated_at

### Security (Row Level Security - RLS)
- All tables have RLS enabled
- Each user can only view, insert, update, and delete their own data
- Courses are automatically deleted when a user is deleted
- Tasks are automatically deleted when their course is deleted

### Indexes
- Created indexes on frequently queried columns for better performance
- Indexes on: user_id, course_id, due_date, status

## Verify Setup

After running the migration, verify it worked:

1. Go to **Table Editor** in Supabase dashboard
2. You should see two new tables:
   - `courses`
   - `tasks`
3. Click on each table to verify the columns are correct

## Next Steps

Once the schema is created:
1. Step 5 will build the UI for managing courses and tasks
2. Step 6 will build the dashboard to display them
