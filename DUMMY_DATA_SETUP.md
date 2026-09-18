# Adding Dummy Data for Testing

## Quick Setup (5 minutes)

### 1️⃣ Sign Up
- Go to http://localhost:3000/auth/sign-up
- Email: `bhowmikanindita84@gmail.com`
- Password: `DummyPassword123!`
- Confirm via email link

### 2️⃣ Log In
- Go to http://localhost:3000/auth/login
- Use same credentials

### 3️⃣ Add Courses (http://localhost:3000/courses)
| Course | Color |
|--------|-------|
| Physics 101 | Blue |
| Mathematics Advanced | Red |
| Chemistry Lab | Green |
| English Literature | Amber |

### 4️⃣ Add Tasks (http://localhost:3000/tasks)

**Physics 101:**
- Chapter 5 Assignment (Due: 2 days, Medium)
- Midterm Exam (Due: 7 days, Hard)

**Mathematics Advanced:**
- Problem Set 3 (Due: 1 day, Hard)
- Calculus Quiz (Due: 5 days, Medium)

**Chemistry Lab:**
- Lab Report (Due: 3 days, Medium)
- Final Exam (Due: 14 days, Hard)

**English Literature:**
- Shakespeare Essay (Due: 4 days, Easy)

---

## Via SQL (Optional)

1. Get user ID from Supabase dashboard
2. Edit `supabase/migrations/002_seed_dummy_data.sql`
3. Replace `{USER_ID}` with actual UUID
4. Run: `supabase db push`

---

## Features to Test

✅ Dashboard metrics update  
✅ Search and filter work  
✅ Mark tasks complete (builds streak)  
✅ Delete/edit courses and tasks  
✅ Exam countdown shows  
✅ Overdue detection works  

Enjoy! 🚀
