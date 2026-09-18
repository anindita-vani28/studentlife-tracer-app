-- ============================================================================
-- ONLY CREATE MISSING TABLES (habits, expenses, mood, career)
-- Tables for courses and tasks already exist
-- ============================================================================

-- ============================================================================
-- MOOD TRACKING (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mood_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  energy_level INT CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INT CHECK (stress_level >= 1 AND stress_level <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT,
  weather_api_key TEXT,
  preferred_study_duration INT DEFAULT 60,
  preferred_break_duration INT DEFAULT 15,
  enable_weather_recommendations BOOLEAN DEFAULT TRUE,
  enable_mood_recommendations BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS mood_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mood log" ON mood_log;
DROP POLICY IF EXISTS "Users can insert their own mood log" ON mood_log;
DROP POLICY IF EXISTS "Users can update their own mood log" ON mood_log;
DROP POLICY IF EXISTS "Users can delete their own mood log" ON mood_log;

CREATE POLICY "Users can view their own mood log" ON mood_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mood log" ON mood_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mood log" ON mood_log FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mood log" ON mood_log FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

CREATE POLICY "Users can view their own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mood_log_user_id_created_at ON mood_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- HABIT TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  goal_value NUMERIC NOT NULL DEFAULT 1,
  goal_unit TEXT NOT NULL DEFAULT 'hours',
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  value NUMERIC NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_id, log_date)
);

ALTER TABLE IF EXISTS habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own habits" ON habits;
DROP POLICY IF EXISTS "Users can insert their own habits" ON habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON habits;

CREATE POLICY "Users can view their own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON habits FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can insert their own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can update their own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can delete their own habit logs" ON habit_logs;

CREATE POLICY "Users can view their own habit logs" ON habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habit logs" ON habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habit logs" ON habit_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habit logs" ON habit_logs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id_active ON habits(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id_date ON habit_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id_date ON habit_logs(habit_id, log_date DESC);

-- ============================================================================
-- EXPENSE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  purchase_date DATE NOT NULL,
  vendor TEXT,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_predefined BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expense_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own expense categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can insert their own expense categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can update their own expense categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can delete their own expense categories" ON expense_categories;

CREATE POLICY "Users can view their own expense categories" ON expense_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expense categories" ON expense_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expense categories" ON expense_categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expense categories" ON expense_categories FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id_date ON expenses(user_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id_category ON expenses(user_id, category);
CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON expense_categories(user_id);

-- ============================================================================
-- CAREER PLANNING & ROI
-- ============================================================================

CREATE TABLE IF NOT EXISTS career_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  career_title TEXT NOT NULL,
  target_salary NUMERIC DEFAULT 0,
  expected_salary_after_5yr NUMERIC DEFAULT 0,
  industry TEXT,
  location TEXT,
  graduation_year INT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_title TEXT NOT NULL,
  industry TEXT,
  entry_level_salary NUMERIC,
  mid_level_salary NUMERIC,
  senior_level_salary NUMERIC,
  country TEXT DEFAULT 'USA',
  year_updated INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS salary_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own career goals" ON career_goals;
DROP POLICY IF EXISTS "Users can insert their own career goals" ON career_goals;
DROP POLICY IF EXISTS "Users can update their own career goals" ON career_goals;
DROP POLICY IF EXISTS "Users can delete their own career goals" ON career_goals;

CREATE POLICY "Users can view their own career goals" ON career_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own career goals" ON career_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own career goals" ON career_goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own career goals" ON career_goals FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view salary data" ON salary_data;
CREATE POLICY "Anyone can view salary data" ON salary_data FOR SELECT USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_career_goals_user_id ON career_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_data_career_title ON salary_data(career_title);

-- Insert salary data (only if not already present)
INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Software Engineer', 'Technology', 70000, 100000, 140000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Software Engineer');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Data Scientist', 'Technology', 75000, 105000, 145000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Data Scientist');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Product Manager', 'Technology', 80000, 120000, 160000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Product Manager');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Business Analyst', 'Finance', 60000, 85000, 120000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Business Analyst');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Accountant', 'Finance', 55000, 75000, 110000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Accountant');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Teacher', 'Education', 45000, 55000, 70000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Teacher');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Nurse', 'Healthcare', 65000, 80000, 110000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Nurse');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Doctor', 'Healthcare', 150000, 200000, 250000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Doctor');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Lawyer', 'Law', 130000, 160000, 200000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Lawyer');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Consultant', 'Consulting', 75000, 110000, 160000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Consultant');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'Marketing Manager', 'Marketing', 65000, 90000, 130000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'Marketing Manager');

INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated)
SELECT 'UX Designer', 'Design', 70000, 95000, 130000, 2026
WHERE NOT EXISTS (SELECT 1 FROM salary_data WHERE career_title = 'UX Designer');

-- ============================================================================
-- ALL MISSING TABLES CREATED SUCCESSFULLY
-- ============================================================================
