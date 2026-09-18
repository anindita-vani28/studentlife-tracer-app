-- ============================================================================
-- INSERT TEST DATA FOR bhowmikanindita84@gmail.com
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Get user ID for bhowmikanindita84@gmail.com
WITH target_user AS (
  SELECT id FROM auth.users WHERE email = 'bhowmikanindita84@gmail.com' LIMIT 1
)

-- ============================================================================
-- INSERT COURSES
-- ============================================================================

INSERT INTO courses (user_id, name, color, created_at, updated_at)
SELECT
  target_user.id,
  course_name,
  course_color,
  NOW(),
  NOW()
FROM target_user
CROSS JOIN (
  VALUES
    ('Physics 101', '#3B82F6'),
    ('Mathematics Advanced', '#EF4444'),
    ('Chemistry Lab', '#10B981'),
    ('English Literature', '#F59E0B')
) AS courses(course_name, course_color)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT TASKS
-- ============================================================================

INSERT INTO tasks (user_id, course_id, title, description, type, due_date, status, difficulty, created_at, updated_at)
SELECT
  target_user.id,
  c.id,
  task.title,
  task.description,
  task.type,
  task.due_date,
  'pending',
  task.difficulty,
  NOW(),
  NOW()
FROM target_user
CROSS JOIN courses c
CROSS JOIN (
  VALUES
    ('Physics 101', 'Chapter 5 Assignment', 'Read and complete chapter 5 problems', 'assignment', NOW() + INTERVAL '2 days', 'medium'),
    ('Physics 101', 'Midterm Exam', 'Physics midterm exam', 'exam', NOW() + INTERVAL '7 days', 'hard'),
    ('Mathematics Advanced', 'Problem Set 3', 'Complete problem set 3', 'assignment', NOW() + INTERVAL '1 day', 'hard'),
    ('Mathematics Advanced', 'Calculus Quiz', 'Calculus quiz on limits', 'exam', NOW() + INTERVAL '5 days', 'medium'),
    ('Chemistry Lab', 'Lab Report', 'Write lab report for experiment', 'assignment', NOW() + INTERVAL '3 days', 'medium'),
    ('Chemistry Lab', 'Final Exam', 'Chemistry final exam', 'exam', NOW() + INTERVAL '14 days', 'hard'),
    ('English Literature', 'Essay on Shakespeare', 'Write essay about Shakespeare works', 'assignment', NOW() + INTERVAL '4 days', 'easy')
) AS task(course_name, title, description, type, due_date, difficulty)
WHERE c.user_id = target_user.id AND c.name = task.course_name
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT HABITS
-- ============================================================================

INSERT INTO habits (user_id, name, description, category, goal_value, goal_unit, color, is_active, created_at, updated_at)
SELECT
  target_user.id,
  habit.name,
  habit.description,
  habit.category,
  habit.goal_value,
  habit.goal_unit,
  habit.color,
  TRUE,
  NOW(),
  NOW()
FROM target_user
CROSS JOIN (
  VALUES
    ('Morning Exercise', 'Start your day with 30 minutes of exercise', 'exercise', 30, 'minutes', '#EF4444'),
    ('Study Hours', 'Dedicated study time daily', 'study_hours', 2, 'hours', '#3B82F6'),
    ('Sleep Goal', 'Get at least 8 hours of sleep', 'sleep', 8, 'hours', '#8B5CF6'),
    ('Read', 'Read 20 pages daily', 'reading', 20, 'pages', '#10B981'),
    ('Meditation', 'Daily meditation for mindfulness', 'meditation', 15, 'minutes', '#14B8A6'),
    ('Code Practice', 'Practice coding daily', 'coding', 60, 'minutes', '#F59E0B')
) AS habit(name, description, category, goal_value, goal_unit, color)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT HABIT LOGS (sample data for last 7 days)
-- ============================================================================

INSERT INTO habit_logs (user_id, habit_id, log_date, value, completed, created_at, updated_at)
SELECT
  target_user.id,
  h.id,
  log_date.date,
  log_entry.value,
  TRUE,
  NOW(),
  NOW()
FROM target_user
CROSS JOIN habits h
CROSS JOIN (
  VALUES
    (NOW()::DATE, 30),
    (NOW()::DATE - INTERVAL '1 day', 30),
    (NOW()::DATE - INTERVAL '2 days', 25),
    (NOW()::DATE - INTERVAL '3 days', 35),
    (NOW()::DATE - INTERVAL '4 days', 30),
    (NOW()::DATE - INTERVAL '5 days', 40),
    (NOW()::DATE - INTERVAL '6 days', 30)
) AS log_date(date, value)
CROSS JOIN (VALUES (30)) AS log_entry(value)
WHERE h.user_id = target_user.id AND h.category = 'exercise'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT EXPENSES
-- ============================================================================

INSERT INTO expenses (user_id, category, description, amount, currency, purchase_date, vendor, notes, created_at, updated_at)
SELECT
  target_user.id,
  expense.category,
  expense.description,
  expense.amount,
  'USD',
  expense.purchase_date,
  expense.vendor,
  expense.notes,
  NOW(),
  NOW()
FROM target_user
CROSS JOIN (
  VALUES
    ('tuition', 'Fall Semester Tuition', 5000.00, NOW()::DATE - INTERVAL '30 days', 'University', 'Full semester tuition'),
    ('books', 'Physics Textbook', 120.50, NOW()::DATE - INTERVAL '25 days', 'Amazon', 'Essential textbook for Physics 101'),
    ('books', 'Calculus Textbook', 95.00, NOW()::DATE - INTERVAL '25 days', 'Barnes & Noble', 'Mathematics textbook'),
    ('tech', 'Scientific Calculator', 45.99, NOW()::DATE - INTERVAL '20 days', 'Best Buy', 'TI-84 Plus calculator'),
    ('supplies', 'Lab Notebook & Supplies', 25.00, NOW()::DATE - INTERVAL '15 days', 'Campus Store', 'Lab materials'),
    ('transport', 'Monthly Transit Pass', 80.00, NOW()::DATE - INTERVAL '10 days', 'Transit Authority', 'Campus to home'),
    ('software', 'Subscription - MATLAB', 60.00, NOW()::DATE - INTERVAL '5 days', 'MathWorks', 'Annual student license'),
    ('exams', 'SAT Test Registration', 200.00, NOW()::DATE - INTERVAL '2 days', 'College Board', 'SAT exam fee')
) AS expense(category, description, amount, purchase_date, vendor, notes)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT MOOD LOG
-- ============================================================================

INSERT INTO mood_log (user_id, mood, energy_level, stress_level, notes, created_at, updated_at)
SELECT
  target_user.id,
  'motivated',
  4,
  3,
  'Feeling motivated to start the semester with good energy',
  NOW(),
  NOW()
FROM target_user
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT CAREER GOAL
-- ============================================================================

INSERT INTO career_goals (user_id, career_title, target_salary, expected_salary_after_5yr, industry, location, graduation_year, notes, created_at, updated_at)
SELECT
  target_user.id,
  'Software Engineer',
  70000,
  100000,
  'Technology',
  'San Francisco, CA',
  2027,
  'Interested in full-stack development. Target companies: Google, Microsoft, Apple',
  NOW(),
  NOW()
FROM target_user
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFY DATA WAS INSERTED
-- ============================================================================

SELECT 'Test data insertion complete!' as status;

-- Count inserted records
SELECT
  (SELECT COUNT(*) FROM courses WHERE user_id = (SELECT id FROM auth.users WHERE email = 'bhowmikanindita84@gmail.com')) as courses_count,
  (SELECT COUNT(*) FROM tasks WHERE user_id = (SELECT id FROM auth.users WHERE email = 'bhowmikanindita84@gmail.com')) as tasks_count,
  (SELECT COUNT(*) FROM habits WHERE user_id = (SELECT id FROM auth.users WHERE email = 'bhowmikanindita84@gmail.com')) as habits_count,
  (SELECT COUNT(*) FROM habit_logs WHERE user_id = (SELECT id FROM auth.users WHERE email = 'bhowmikanindita84@gmail.com')) as habit_logs_count,
  (SELECT COUNT(*) FROM expenses WHERE user_id = (SELECT id FROM auth.users WHERE email = 'bhowmikanindita84@gmail.com')) as expenses_count,
  (SELECT COUNT(*) FROM mood_log WHERE user_id = (SELECT id FROM auth.users WHERE email = 'bhowmikanindita84@gmail.com')) as mood_logs_count,
  (SELECT COUNT(*) FROM career_goals WHERE user_id = (SELECT id FROM auth.users WHERE email = 'bhowmikanindita84@gmail.com')) as career_goals_count;
