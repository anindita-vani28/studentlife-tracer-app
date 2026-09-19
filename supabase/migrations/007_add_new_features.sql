-- ============================================================================
-- MIGRATION 007: Add Internship Tracker, Opportunities, Discussions & Movies
-- ============================================================================

-- ============================================================================
-- 1. INTERNSHIP APPLICATION TRACKER TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS internship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  location TEXT,
  application_date DATE NOT NULL,
  deadline DATE,
  status TEXT NOT NULL CHECK (status IN ('interested', 'applied', 'resume_submitted', 'hr_screening', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn')),
  interview_stage TEXT CHECK (interview_stage IN ('technical', 'behavioral', 'final', null)),
  hr_contact_name TEXT,
  hr_contact_email TEXT,
  hr_contact_phone TEXT,
  job_posting_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internship_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES internship_applications(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_text TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for internship tables
CREATE INDEX idx_internship_applications_user_id ON internship_applications(user_id);
CREATE INDEX idx_internship_applications_status ON internship_applications(status);
CREATE INDEX idx_internship_follow_ups_user_id ON internship_follow_ups(user_id);
CREATE INDEX idx_internship_follow_ups_reminder_date ON internship_follow_ups(reminder_date);

-- RLS Policies for internship_applications
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own internship applications"
  ON internship_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own internship applications"
  ON internship_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own internship applications"
  ON internship_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own internship applications"
  ON internship_applications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for internship_follow_ups
ALTER TABLE internship_follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own internship follow-ups"
  ON internship_follow_ups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own internship follow-ups"
  ON internship_follow_ups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own internship follow-ups"
  ON internship_follow_ups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own internship follow-ups"
  ON internship_follow_ups FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. STUDENT OPPORTUNITY HUB TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hackathon', 'coding_competition', 'olympiad', 'scholarship', 'research', 'volunteering', 'conference', 'internship', 'workshop')),
  eligibility TEXT,
  registration_opens DATE,
  deadline DATE NOT NULL,
  event_date DATE,
  event_type TEXT CHECK (event_type IN ('online', 'in_person', 'hybrid')),
  location TEXT,
  cost_amount DECIMAL(10, 2) DEFAULT 0,
  cost_currency TEXT DEFAULT 'USD',
  official_url TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

-- Indexes for opportunities
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_saved_opportunities_user_id ON saved_opportunities(user_id);

-- RLS Policies for saved_opportunities
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved opportunities"
  ON saved_opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save opportunities"
  ON saved_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave opportunities"
  ON saved_opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. STUDENT DISCUSSION TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS discussion_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discussion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discussion_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
  post_id UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('upvote', 'like', 'helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, comment_id, post_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS discussion_moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('nsfw', 'harassment', 'spam', 'malicious_link', 'offensive')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for discussion tables
CREATE INDEX idx_discussion_posts_user_id ON discussion_posts(user_id);
CREATE INDEX idx_discussion_posts_created ON discussion_posts(created_at);
CREATE INDEX idx_discussion_comments_post_id ON discussion_comments(post_id);
CREATE INDEX idx_discussion_comments_user_id ON discussion_comments(user_id);
CREATE INDEX idx_discussion_reactions_user_id ON discussion_reactions(user_id);
CREATE INDEX idx_moderation_flags_status ON discussion_moderation_flags(status);

-- RLS Policies for discussion_posts
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON discussion_posts FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create posts"
  ON discussion_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON discussion_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON discussion_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for discussion_comments
ALTER TABLE discussion_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON discussion_comments FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create comments"
  ON discussion_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON discussion_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON discussion_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for discussion_reactions
ALTER TABLE discussion_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON discussion_reactions FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create reactions"
  ON discussion_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON discussion_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. CURATED MOVIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS curated_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INTEGER,
  genre TEXT[],
  description TEXT,
  why_students_like TEXT,
  poster_url TEXT,
  imdb_url TEXT,
  duration_minutes INTEGER,
  rating DECIMAL(2, 1),
  categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movie_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES curated_movies(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'want_to_watch' CHECK (status IN ('want_to_watch', 'watching', 'watched')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  watched_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, movie_id)
);

-- Indexes for movies
CREATE INDEX idx_curated_movies_categories ON curated_movies USING GIN(categories);
CREATE INDEX idx_movie_watchlist_user_id ON movie_watchlist(user_id);
CREATE INDEX idx_movie_watchlist_status ON movie_watchlist(status);

-- RLS Policies for movie_watchlist
ALTER TABLE movie_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist"
  ON movie_watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to watchlist"
  ON movie_watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watchlist"
  ON movie_watchlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from watchlist"
  ON movie_watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INSERT SAMPLE OPPORTUNITIES (for demonstration)
-- ============================================================================

INSERT INTO opportunities (title, organizer, category, deadline, event_type, location, description, official_url) VALUES
  ('Google Code Jam 2026', 'Google', 'coding_competition', '2026-10-15', 'online', 'Online', 'Annual competitive programming competition', 'https://codingcompetitions.withgoogle.com'),
  ('HackMIT 2026', 'MIT', 'hackathon', '2026-10-20', 'in_person', 'Cambridge, MA', '48-hour innovation hackathon', 'https://hackmit.org'),
  ('IMO 2026', 'International Mathematical Olympiad', 'olympiad', '2026-07-15', 'in_person', 'Oslo, Norway', 'International Mathematics Olympiad', 'https://imo-official.org'),
  ('Fulbright Scholarship 2027', 'US Department of State', 'scholarship', '2026-12-01', 'online', 'Worldwide', 'Full scholarship for graduate studies abroad', 'https://fulbright.org'),
  ('Summer Research Fellowship', 'NSF', 'research', '2026-03-15', 'in_person', 'Various', 'Research opportunities for undergraduates', 'https://www.nsf.gov'),
  ('Code for Good 2026', 'Tech for Social Good', 'volunteering', '2026-11-01', 'hybrid', 'Multiple Cities', 'Code for social impact projects', 'https://codeforgood.org'),
  ('Tech Leaders Summit 2026', 'Forbes', 'conference', '2026-09-25', 'in_person', 'San Francisco, CA', 'Annual tech leaders conference', 'https://techleaders.forbes.com'),
  ('Janestreet Internship', 'Jane Street', 'internship', '2026-09-30', 'online', 'New York, NY', 'Summer internship program for students', 'https://janestreet.com')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE MOVIES
-- ============================================================================

INSERT INTO curated_movies (title, year, genre, description, why_students_like, categories) VALUES
  ('The Social Network', 2010, '{"Drama", "Biography"}', 'The founding of Facebook and the infamous legal battles that followed.', 'Inspiring story about innovation, ambition, and the power of ideas. Shows entrepreneurship in action.', '{"Technology", "Business", "Entrepreneurship"}'),
  ('The Imitation Game', 2014, '{"Drama", "Biography"}', 'Story of Alan Turing breaking the Enigma code during WWII.', 'Demonstrates brilliant problem-solving, perseverance, and the impact of computational thinking.', '{"Technology", "Science", "History"}'),
  ('Inception', 2010, '{"Sci-Fi", "Action"}', 'A skilled thief who steals corporate secrets through dream-sharing technology.', 'Explores complex ideas about reality, creativity, and problem-solving in innovative ways.', '{"Sci-Fi", "Creativity", "Technology"}'),
  ('Hidden Figures', 2016, '{"Drama", "Biography"}', 'Black female mathematicians at NASA during the Space Race.', 'Inspiring story of brilliance, determination, and overcoming adversity. Shows the power of mathematics.', '{"Science", "Inspiration", "History"}'),
  ('The Martian', 2015, '{"Sci-Fi", "Drama"}', 'An astronaut stranded on Mars uses science and engineering to survive.', 'Showcases problem-solving, resilience, and the practical application of science and engineering.', '{"Science", "Technology", "Inspiration"}'),
  ('Good Will Hunting', 1997, '{"Drama"}', 'A janitor with a gift for mathematics finds mentorship and purpose.', 'Explores the importance of education, mentorship, and finding your path. Deeply motivational.', '{"Education", "Inspiration", "Psychology"}'),
  ('A Beautiful Mind', 2001, '{"Drama", "Biography"}', 'The life of mathematician John Nash and his battle with mental illness.', 'Shows the brilliance of mathematical thinking and importance of support and understanding.', '{"Mathematics", "Science", "Mental Health"}'),
  ('Whiplash', 2014, '{"Drama", "Music"}', 'A talented drummer pursues perfection under a demanding instructor.', 'Shows dedication to craft, the pressure of achievement, and the pursuit of excellence.', '{"Creativity", "Motivation", "Psychology"}'),
  ('Free Solo', 2018, '{"Documentary"}', 'A rock climber prepares for a no-rope ascent of a 3,000-foot cliff.', 'Inspiring documentary about calculated risk-taking, preparation, and pushing human limits.', '{"Motivation", "Documentaries", "Inspiration"}'),
  ('Interstellar', 2014, '{"Sci-Fi", "Drama"}', 'A team of astronauts travels through a wormhole to save humanity.', 'Explores physics, space exploration, and the human spirit. Stunning visuals and deep ideas.', '{"Science", "Technology", "Sci-Fi"}')
ON CONFLICT DO NOTHING;
