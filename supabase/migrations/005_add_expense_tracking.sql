-- Migration: Add expense tracking system
-- Created: 2026-09-18

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- tuition, books, supplies, tech, software, transport, other
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

-- Create expense_categories table for custom categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_predefined BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable RLS on expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on expense_categories
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expense categories"
  ON expense_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expense categories"
  ON expense_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense categories"
  ON expense_categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expense categories"
  ON expense_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_user_id_date ON expenses(user_id, purchase_date DESC);
CREATE INDEX idx_expenses_user_id_category ON expenses(user_id, category);
CREATE INDEX idx_expense_categories_user_id ON expense_categories(user_id);

-- Insert predefined categories
INSERT INTO expense_categories (name, color, is_predefined) VALUES
  ('Tuition', '#3B82F6', TRUE),
  ('Books & Materials', '#10B981', TRUE),
  ('Technology & Software', '#8B5CF6', TRUE),
  ('Transportation', '#F59E0B', TRUE),
  ('Accommodation', '#EC4899', TRUE),
  ('Lab & Supplies', '#14B8A6', TRUE),
  ('Exams & Certification', '#EF4444', TRUE),
  ('Other', '#6B7280', TRUE);
