# Testing Guide — Student Life AI Assistant

## 🧪 Manual Testing Flow

### Step 1: Sign Up (Test auth signup)
1. Go to **http://localhost:3000**
2. Click "Sign up" or go directly to http://localhost:3000/auth/sign-up
3. Enter credentials:
   - **Email**: `bhowmikanindita84@gmail.com`
   - **Password**: `DummyPassword123!`
4. Click "Sign up"
5. ✅ You should see a success message

**Note**: You don't need to verify email to proceed in development mode.

---

### Step 2: Verify Login (Test auth login)
1. Click the logout button if you're already signed in
2. Go to http://localhost:3000/auth/login
3. Enter same credentials:
   - **Email**: `bhowmikanindita84@gmail.com`
   - **Password**: `DummyPassword123!`
4. Click "Login"
5. ✅ You should be redirected to `/dashboard`

---

### Step 3: Add Dummy Courses (Test course management)

**Via Web UI (Easiest)**:
1. On dashboard, click "Courses" in the nav
2. Click "Add Course" button
3. Fill in and add these 4 courses:

| Name | Color |
|------|-------|
| Physics 101 | Blue (#3B82F6) |
| Mathematics Advanced | Red (#EF4444) |
| Chemistry Lab | Green (#10B981) |
| English Literature | Amber (#F59E0B) |

4. ✅ All 4 courses should appear in the list

---

### Step 4: Add Dummy Tasks (Test task management)

**Via Web UI**:
1. Click "Tasks" in the navigation
2. Click "Add Task" button
3. Add these 7 tasks:

**Physics 101:**
- Title: `Chapter 5 Assignment`
  - Type: Assignment
  - Difficulty: Medium
  - Due: 2 days from now
  
- Title: `Midterm Exam`
  - Type: Exam
  - Difficulty: Hard
  - Due: 7 days from now

**Mathematics Advanced:**
- Title: `Problem Set 3`
  - Type: Assignment
  - Difficulty: Hard
  - Due: 1 day from now

- Title: `Calculus Quiz`
  - Type: Exam
  - Difficulty: Medium
  - Due: 5 days from now

**Chemistry Lab:**
- Title: `Lab Report`
  - Type: Assignment
  - Difficulty: Medium
  - Due: 3 days from now

- Title: `Final Exam`
  - Type: Exam
  - Difficulty: Hard
  - Due: 14 days from now

**English Literature:**
- Title: `Essay on Shakespeare`
  - Type: Assignment
  - Difficulty: Easy
  - Due: 4 days from now

4. ✅ All 7 tasks should appear in the list

---

### Step 5: Test Dashboard Features

1. Go to "Dashboard"
2. You should see:
   - ✅ **Due Today** section (shows tasks due in next 24 hours)
   - ✅ **Due This Week** section (shows tasks due in next 7 days)
   - ✅ **Upcoming Exam** widget (shows next exam with countdown)
   - ✅ **Study Streak** (starts at 0, increases when you mark tasks complete)
   - ✅ **Completion Rate** (percentage of completed tasks)
   - ✅ **Course Progress** bars (shows completed vs pending tasks per course)

---

### Step 6: Test Task Filtering

1. Go to "Tasks"
2. Test **Search**:
   - Type "Physics" → should show only Physics tasks
   - Type "Exam" → should show only exam tasks
3. Test **Status Filter**:
   - Select "Pending" → shows all pending tasks
   - Select "Done" → shows completed tasks (should be empty)
4. Test **Difficulty Filter**:
   - Select "Hard" → shows only hard tasks
   - Select "Easy" → shows easy tasks

---

### Step 7: Test Task Completion

1. In the Tasks list, check a task checkbox to mark it complete
2. ✅ Task status should change to "Done"
3. Go to Dashboard
4. ✅ Completion rate should increase
5. ✅ Study Streak should increase if it's the first completed task of the day

---

### Step 8: Test Logout

1. Click the user email or logout button
2. ✅ You should be redirected to login page
3. Try accessing `/dashboard` directly
4. ✅ Should redirect you to `/login`

---

## 🚀 Automated Dummy Data Insertion (Alternative)

If you prefer to use SQL instead of manual UI entry:

1. Get your user ID from Supabase dashboard:
   - Go to https://app.supabase.com
   - Select project
   - Click "Authentication" → "Users"
   - Find your user and copy the ID

2. Update `scripts/insert-dummy-data.sql`:
   - Replace `6c5b0633-ff99-4515-85f7-8d8faa37fdf3` with your actual user ID (3 occurrences)

3. Run the SQL in Supabase:
   - Go to Supabase dashboard → SQL Editor
   - Create new query
   - Copy-paste contents of `scripts/insert-dummy-data.sql`
   - Click "Run"

4. Go back to your app and refresh
5. ✅ All courses and tasks should appear

---

## ✅ Checklist

- [ ] Signup works
- [ ] Login works
- [ ] Can add courses
- [ ] Can add tasks
- [ ] Dashboard displays stats
- [ ] Task search works
- [ ] Task filters work
- [ ] Can mark tasks complete
- [ ] Study streak updates
- [ ] Completion rate updates
- [ ] Logout works

---

## 📝 Notes

- The app uses **local browser storage** for sessions (no persistence across server restarts)
- Database changes **persist** in Supabase
- Times are in **local timezone**
- "Due today" = due within next 24 hours
- "Due this week" = due within next 7 days
