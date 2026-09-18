# Supabase Migrations Setup Guide

The errors you're seeing on the Habits, Expenses, and Analytics pages are because **the database tables haven't been created yet**. Follow these steps to set up the complete database:

## ✅ Step-by-Step Setup

### 1. Open Supabase Dashboard
- Go to: https://app.supabase.com
- Select your project: `studentlife-tracer-app`

### 2. Navigate to SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"** button

### 3. Copy and Paste All Migrations
- Open the file: `SUPABASE_SETUP_MIGRATIONS.sql` (in your project root)
- Copy ALL the SQL code
- Paste it into the Supabase SQL Editor
- Click **"Run"** button

### 4. Verify Tables Were Created
After running, you should see:
- ✅ `courses` table created
- ✅ `tasks` table created
- ✅ `mood_log` table created
- ✅ `user_preferences` table created
- ✅ `habits` table created
- ✅ `habit_logs` table created
- ✅ `expenses` table created
- ✅ `expense_categories` table created
- ✅ `career_goals` table created
- ✅ `salary_data` table created (with 12 careers)

All RLS policies and indexes will also be created automatically.

---

## 🧪 Test After Setup

### 1. Sign Up (if not already)
- Go to http://localhost:3000/auth/sign-up
- Use: `bhowmikanindita84@gmail.com` / `DummyPassword123!`

### 2. Add Dummy Data

**Add a Course:**
1. Go to http://localhost:3000/courses
2. Click "➕ Add Course"
3. Name: "Physics 101", Color: Blue
4. Click "Create Course"

**Add a Task:**
1. Go to http://localhost:3000/tasks
2. Click "➕ Add Task"
3. Select "Physics 101", Title: "Chapter 5 Assignment"
4. Due date: 2 days from today
5. Click "Add Task"

**Add a Habit:**
1. Go to http://localhost:3000/habits
2. Click "➕ Add Habit"
3. Name: "Morning Exercise", Category: "Exercise"
4. Goal: 30 minutes
5. Click "Create Habit"

**Add an Expense:**
1. Go to http://localhost:3000/expenses
2. Click "➕ Add Expense"
3. Category: "Books & Materials"
4. Amount: $150, Description: "Physics Textbook"
5. Click "Add Expense"

**Set Career Goal:**
1. Go to http://localhost:3000/analytics
2. Click "➕ Set Career Goal"
3. Career: "Software Engineer"
4. Salary: $70000
5. Click "Set Career Goal"

---

## 🔧 If Issues Persist

### Issue: "User doesn't have permission"
**Solution**: Check that RLS policies are enabled. Run the SQL again - the policies are included.

### Issue: "Table already exists"
**Solution**: This is fine! The `IF NOT EXISTS` clause prevents errors if you run it again.

### Issue: "No data showing in Habits/Expenses page"
**Solution**: 
1. Make sure you added at least one item via the UI
2. Check browser console for errors (F12)
3. Verify you're logged in

### Issue: Can't see the courses in task dropdown
**Solution**: You need to create at least one course first (via the Courses page)

---

## 📊 What Each Table Does

| Table | Purpose |
|-------|---------|
| `courses` | Your academic courses |
| `tasks` | Assignments, exams, etc. |
| `mood_log` | Daily mood tracking |
| `user_preferences` | Study settings |
| `habits` | Daily habits (exercise, sleep, etc.) |
| `habit_logs` | Daily habit records |
| `expenses` | Education spending |
| `expense_categories` | Expense types |
| `career_goals` | Your career target |
| `salary_data` | Career salary benchmarks |

---

## ✨ After Setup

The app will work fully with:
- ✅ Courses & tasks management
- ✅ Mood tracking with AI recommendations
- ✅ Habit tracking with streaks
- ✅ Expense tracking
- ✅ Education ROI analytics

Enjoy!
