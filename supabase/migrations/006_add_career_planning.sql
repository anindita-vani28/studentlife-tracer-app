-- Migration: Add career planning and ROI calculation
-- Created: 2026-09-18

-- Create career_goals table
CREATE TABLE IF NOT EXISTS career_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  career_title TEXT NOT NULL,
  target_salary NUMERIC DEFAULT 0, -- annual salary in USD
  expected_salary_after_5yr NUMERIC DEFAULT 0,
  industry TEXT,
  location TEXT,
  graduation_year INT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create salary_data table for realistic salary benchmarks
CREATE TABLE IF NOT EXISTS salary_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_title TEXT NOT NULL,
  industry TEXT,
  entry_level_salary NUMERIC, -- starting salary
  mid_level_salary NUMERIC,   -- after 5 years
  senior_level_salary NUMERIC, -- after 10 years
  country TEXT DEFAULT 'USA',
  year_updated INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on career_goals
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own career goals"
  ON career_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career goals"
  ON career_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career goals"
  ON career_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career goals"
  ON career_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Salary data is public (no RLS, anyone can read for research)
-- But we'll add RLS anyway for consistency
ALTER TABLE salary_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view salary data"
  ON salary_data FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can modify salary data"
  ON salary_data FOR INSERT
  WITH CHECK (FALSE);

-- Create indexes
CREATE INDEX idx_career_goals_user_id ON career_goals(user_id);
CREATE INDEX idx_salary_data_career_title ON salary_data(career_title);

-- Insert sample salary data for common careers
INSERT INTO salary_data (career_title, industry, entry_level_salary, mid_level_salary, senior_level_salary, year_updated) VALUES
  ('Software Engineer', 'Technology', 70000, 100000, 140000, 2026),
  ('Data Scientist', 'Technology', 75000, 105000, 145000, 2026),
  ('Product Manager', 'Technology', 80000, 120000, 160000, 2026),
  ('Business Analyst', 'Finance', 60000, 85000, 120000, 2026),
  ('Accountant', 'Finance', 55000, 75000, 110000, 2026),
  ('Teacher', 'Education', 45000, 55000, 70000, 2026),
  ('Nurse', 'Healthcare', 65000, 80000, 110000, 2026),
  ('Doctor', 'Healthcare', 150000, 200000, 250000, 2026),
  ('Lawyer', 'Law', 130000, 160000, 200000, 2026),
  ('Consultant', 'Consulting', 75000, 110000, 160000, 2026),
  ('Marketing Manager', 'Marketing', 65000, 90000, 130000, 2026),
  ('UX Designer', 'Design', 70000, 95000, 130000, 2026);
