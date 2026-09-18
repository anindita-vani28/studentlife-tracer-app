-- Migration: Add mood tracking and user preferences
-- Created: 2026-09-18

-- Create mood_log table to track user moods over time
CREATE TABLE IF NOT EXISTS mood_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL, -- energetic, tired, stressed, distracted, motivated, neutral, focused, overwhelmed
  energy_level INT CHECK (energy_level >= 1 AND energy_level <= 5), -- 1-5 scale
  stress_level INT CHECK (stress_level >= 1 AND stress_level <= 5), -- 1-5 scale
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table for storing study preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT, -- for weather API: city name or lat,lng
  weather_api_key TEXT, -- encrypted, or use app's key
  preferred_study_duration INT DEFAULT 60, -- minutes per session
  preferred_break_duration INT DEFAULT 15, -- minutes
  enable_weather_recommendations BOOLEAN DEFAULT TRUE,
  enable_mood_recommendations BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on mood_log
ALTER TABLE mood_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mood log"
  ON mood_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood log"
  ON mood_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood log"
  ON mood_log FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood log"
  ON mood_log FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_mood_log_user_id_created_at ON mood_log(user_id, created_at DESC);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
