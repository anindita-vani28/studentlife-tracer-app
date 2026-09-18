-- Seed dummy data for testing
-- IMPORTANT: Replace {USER_ID} with actual user ID after signing up

-- Create test courses
INSERT INTO public.courses (user_id, name, color) VALUES
  ('{USER_ID}', 'Physics 101', '#3B82F6'),
  ('{USER_ID}', 'Mathematics Advanced', '#EF4444'),
  ('{USER_ID}', 'Chemistry Lab', '#10B981'),
  ('{USER_ID}', 'English Literature', '#F59E0B');

-- Create test tasks
INSERT INTO public.tasks (user_id, course_id, title, description, type, due_date, difficulty, status) VALUES
  ('{USER_ID}', (SELECT id FROM courses WHERE user_id = '{USER_ID}' AND name = 'Physics 101' LIMIT 1), 
   'Chapter 5 Assignment', 'Complete problems 1-20', 'assignment', NOW() + INTERVAL '2 days', 'medium', 'pending'),
  
  ('{USER_ID}', (SELECT id FROM courses WHERE user_id = '{USER_ID}' AND name = 'Physics 101' LIMIT 1),
   'Midterm Exam', 'Cover chapters 1-5', 'exam', NOW() + INTERVAL '7 days', 'hard', 'pending'),
  
  ('{USER_ID}', (SELECT id FROM courses WHERE user_id = '{USER_ID}' AND name = 'Mathematics Advanced' LIMIT 1),
   'Problem Set 3', 'Calculus integration problems', 'assignment', NOW() + INTERVAL '1 day', 'hard', 'pending'),
  
  ('{USER_ID}', (SELECT id FROM courses WHERE user_id = '{USER_ID}' AND name = 'Chemistry Lab' LIMIT 1),
   'Lab Report', 'Document reaction results', 'assignment', NOW() + INTERVAL '3 days', 'medium', 'pending'),
  
  ('{USER_ID}', (SELECT id FROM courses WHERE user_id = '{USER_ID}' AND name = 'Chemistry Lab' LIMIT 1),
   'Final Exam', 'Lab practical exam', 'exam', NOW() + INTERVAL '14 days', 'hard', 'pending'),
  
  ('{USER_ID}', (SELECT id FROM courses WHERE user_id = '{USER_ID}' AND name = 'English Literature' LIMIT 1),
   'Shakespeare Essay', 'Write 3000-word essay on Hamlet', 'assignment', NOW() + INTERVAL '4 days', 'easy', 'pending');
