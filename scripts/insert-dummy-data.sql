-- Dummy data insertion for bhowmikanindita84@gmail.com
-- User ID: 6c5b0633-ff99-4515-85f7-8d8faa37fdf3
-- Created: 2026-09-18

-- Insert courses
INSERT INTO courses (user_id, name, color) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Physics 101', '#3B82F6'),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Mathematics Advanced', '#EF4444'),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'Chemistry Lab', '#10B981'),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', 'English Literature', '#F59E0B')
RETURNING id, name;

-- Then insert tasks using the course IDs returned above
-- Note: Update the course_id values below after getting them from the courses insert

-- Physics 101 (first course ID)
INSERT INTO tasks (user_id, course_id, title, description, type, difficulty, due_date, status) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', (SELECT id FROM courses WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3' AND name = 'Physics 101' LIMIT 1), 'Chapter 5 Assignment', 'Complete this assignment', 'assignment', 'medium', NOW() + INTERVAL '2 days', 'pending'),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', (SELECT id FROM courses WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3' AND name = 'Physics 101' LIMIT 1), 'Midterm Exam', 'Complete this exam', 'exam', 'hard', NOW() + INTERVAL '7 days', 'pending');

-- Mathematics Advanced
INSERT INTO tasks (user_id, course_id, title, description, type, difficulty, due_date, status) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', (SELECT id FROM courses WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3' AND name = 'Mathematics Advanced' LIMIT 1), 'Problem Set 3', 'Complete this assignment', 'assignment', 'hard', NOW() + INTERVAL '1 day', 'pending'),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', (SELECT id FROM courses WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3' AND name = 'Mathematics Advanced' LIMIT 1), 'Calculus Quiz', 'Complete this exam', 'exam', 'medium', NOW() + INTERVAL '5 days', 'pending');

-- Chemistry Lab
INSERT INTO tasks (user_id, course_id, title, description, type, difficulty, due_date, status) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', (SELECT id FROM courses WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3' AND name = 'Chemistry Lab' LIMIT 1), 'Lab Report', 'Complete this assignment', 'assignment', 'medium', NOW() + INTERVAL '3 days', 'pending'),
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', (SELECT id FROM courses WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3' AND name = 'Chemistry Lab' LIMIT 1), 'Final Exam', 'Complete this exam', 'exam', 'hard', NOW() + INTERVAL '14 days', 'pending');

-- English Literature
INSERT INTO tasks (user_id, course_id, title, description, type, difficulty, due_date, status) VALUES
  ('6c5b0633-ff99-4515-85f7-8d8faa37fdf3', (SELECT id FROM courses WHERE user_id = '6c5b0633-ff99-4515-85f7-8d8faa37fdf3' AND name = 'English Literature' LIMIT 1), 'Essay on Shakespeare', 'Complete this assignment', 'assignment', 'easy', NOW() + INTERVAL '4 days', 'pending');
