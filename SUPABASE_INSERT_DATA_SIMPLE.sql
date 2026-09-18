-- ============================================================================
-- SIMPLE TEST DATA INSERTION FOR bhowmikanindita84@gmail.com
-- Copy and paste this entire script into Supabase SQL Editor and run
-- ============================================================================

-- First, let's get the user ID
-- Replace {USER_ID} below with the actual ID from this query result:
-- SELECT id FROM auth.users WHERE email = 'bhowmikanindita84@gmail.com';

-- For reference, if user ID is: 6c5b0633-ff99-4515-85f7-8d8faa37fdf3
-- Then use that value below

-- ============================================================================
-- STEP 1: INSERT COURSES
-- ============================================================================

INSERT INTO public.courses (user_id, name, color, created_at, updated_at) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Physics 101', '#3B82F6', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Mathematics Advanced', '#EF4444', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Chemistry Lab', '#10B981', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'English Literature', '#F59E0B', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: INSERT TASKS (requires course IDs from previous step)
-- ============================================================================

INSERT INTO public.tasks (user_id, course_id, title, description, type, due_date, status, difficulty, created_at, updated_at)
SELECT
  '6c5b0633-ff99-4515-85f7-8d8faa37fdf3',
  c.id,
  CASE c.name
    WHEN 'Physics 101' THEN 'Chapter 5 Assignment'
    WHEN 'Mathematics Advanced' THEN 'Problem Set 3'
    WHEN 'Chemistry Lab' THEN 'Lab Report'
    WHEN 'English Literature' THEN 'Essay on Shakespeare'
    ELSE 'Task'
  END,
  'Complete your assignment',
  CASE c.name
    WHEN 'Physics 101' THEN 'assignment'
    WHEN 'Mathematics Advanced' THEN 'assignment'
    WHEN 'Chemistry Lab' THEN 'assignment'
    WHEN 'English Literature' THEN 'assignment'
    ELSE 'other'
  END,
  CASE c.name
    WHEN 'Physics 101' THEN NOW() + INTERVAL '2 days'
    WHEN 'Mathematics Advanced' THEN NOW() + INTERVAL '1 day'
    WHEN 'Chemistry Lab' THEN NOW() + INTERVAL '3 days'
    WHEN 'English Literature' THEN NOW() + INTERVAL '4 days'
    ELSE NOW() + INTERVAL '5 days'
  END,
  'pending',
  CASE c.name
    WHEN 'Physics 101' THEN 'medium'
    WHEN 'Mathematics Advanced' THEN 'hard'
    WHEN 'Chemistry Lab' THEN 'medium'
    WHEN 'English Literature' THEN 'easy'
    ELSE 'medium'
  END,
  NOW(),
  NOW()
FROM public.courses c
WHERE c.user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3'
ON CONFLICT DO NOTHING;

-- Add more tasks
INSERT INTO public.tasks (user_id, course_id, title, description, type, due_date, status, difficulty, created_at, updated_at)
SELECT
  '6c5b0633-ff99-4515-85f7-8d8faa37fdf3',
  c.id,
  CASE WHEN c.name = 'Physics 101' THEN 'Midterm Exam'
       WHEN c.name = 'Mathematics Advanced' THEN 'Calculus Quiz'
       WHEN c.name = 'Chemistry Lab' THEN 'Final Exam'
       ELSE 'Quiz' END,
  'Prepare for exam',
  'exam',
  CASE WHEN c.name = 'Physics 101' THEN NOW() + INTERVAL '7 days'
       WHEN c.name = 'Mathematics Advanced' THEN NOW() + INTERVAL '5 days'
       WHEN c.name = 'Chemistry Lab' THEN NOW() + INTERVAL '14 days'
       ELSE NOW() + INTERVAL '10 days' END,
  'pending',
  'hard',
  NOW(),
  NOW()
FROM public.courses c
WHERE c.user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3' AND c.name IN ('Physics 101', 'Mathematics Advanced', 'Chemistry Lab')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: INSERT HABITS
-- ============================================================================

INSERT INTO public.habits (user_id, name, description, category, goal_value, goal_unit, color, is_active, created_at, updated_at) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Morning Exercise', 'Daily morning workout', 'exercise', 30, 'minutes', '#EF4444', TRUE, NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Study Hours', 'Dedicated study time', 'study_hours', 2, 'hours', '#3B82F6', TRUE, NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Sleep Goal', '8 hours of sleep', 'sleep', 8, 'hours', '#8B5CF6', TRUE, NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Reading', 'Daily reading practice', 'reading', 20, 'pages', '#10B981', TRUE, NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Meditation', 'Mindfulness meditation', 'meditation', 15, 'minutes', '#14B8A6', TRUE, NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Code Practice', 'Daily coding', 'coding', 60, 'minutes', '#F59E0B', TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: INSERT HABIT LOGS (last 7 days)
-- ============================================================================

INSERT INTO public.habit_logs (user_id, habit_id, log_date, value, completed, created_at, updated_at)
SELECT
  '6c5b0633-ff99-4515-85f7-8d8faa37fdf3',
  h.id,
  (NOW()::DATE - (ROW_NUMBER() OVER (ORDER BY h.id) - 1) * INTERVAL '1 day')::DATE,
  CASE WHEN h.category = 'exercise' THEN 30
       WHEN h.category = 'study_hours' THEN 2
       WHEN h.category = 'sleep' THEN 8
       WHEN h.category = 'reading' THEN 20
       WHEN h.category = 'meditation' THEN 15
       WHEN h.category = 'coding' THEN 60
       ELSE 1 END,
  TRUE,
  NOW(),
  NOW()
FROM public.habits h
CROSS JOIN (SELECT generate_series(1, 7)) AS days(day)
WHERE h.user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: INSERT EXPENSES
-- ============================================================================

INSERT INTO public.expenses (user_id, category, description, amount, currency, purchase_date, vendor, notes, created_at, updated_at) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'tuition', 'Fall Semester Tuition', 5000.00, 'USD', NOW()::DATE - INTERVAL '30 days', 'University', 'Full semester', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'books', 'Physics Textbook', 120.50, 'USD', NOW()::DATE - INTERVAL '25 days', 'Amazon', 'Essential textbook', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'books', 'Calculus Textbook', 95.00, 'USD', NOW()::DATE - INTERVAL '25 days', 'Barnes & Noble', 'Math textbook', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'tech', 'Scientific Calculator', 45.99, 'USD', NOW()::DATE - INTERVAL '20 days', 'Best Buy', 'TI-84 Plus', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'lab', 'Lab Notebook & Supplies', 25.00, 'USD', NOW()::DATE - INTERVAL '15 days', 'Campus Store', 'Lab materials', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'transport', 'Monthly Transit Pass', 80.00, 'USD', NOW()::DATE - INTERVAL '10 days', 'Transit Authority', 'Campus to home', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'software', 'MATLAB License', 60.00, 'USD', NOW()::DATE - INTERVAL '5 days', 'MathWorks', 'Annual student', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'exams', 'SAT Test Fee', 200.00, 'USD', NOW()::DATE - INTERVAL '2 days', 'College Board', 'SAT exam', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: INSERT MOOD LOG
-- ============================================================================

INSERT INTO public.mood_log (user_id, mood, energy_level, stress_level, notes, created_at, updated_at) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'motivated', 4, 3, 'Feeling great about starting semester', NOW(), NOW()),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'energetic', 5, 2, 'Great study session today', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'focused', 4, 2, 'Good productivity', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 7: INSERT CAREER GOAL
-- ============================================================================

INSERT INTO public.career_goals (user_id, career_title, target_salary, expected_salary_after_5yr, industry, location, graduation_year, notes, created_at, updated_at) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Software Engineer', 70000, 100000, 'Technology', 'San Francisco, CA', 2027, 'Full-stack development. Target: Google, Microsoft, Apple', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION - Count inserted records
-- ============================================================================

SELECT
  'DATA INSERTION COMPLETE' as status,
  (SELECT COUNT(*) FROM courses WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3') as courses_count,
  (SELECT COUNT(*) FROM tasks WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3') as tasks_count,
  (SELECT COUNT(*) FROM habits WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3') as habits_count,
  (SELECT COUNT(*) FROM habit_logs WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3') as habit_logs_count,
  (SELECT COUNT(*) FROM expenses WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3') as expenses_count,
  (SELECT COUNT(*) FROM mood_log WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3') as mood_logs_count,
  (SELECT COUNT(*) FROM career_goals WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3') as career_goals_count;
