-- Add more movies: Stock Market, Laws, Oscar Winners, Award Winners
-- Copy and paste into Supabase SQL Editor and click "Run"

-- ============================================================================
-- STOCK MARKET & FINANCE MOVIES
-- ============================================================================

INSERT INTO curated_movies (title, year, genre, description, why_students_like, categories) VALUES
  ('The Wolf of Wall Street', 2013, '{"Drama", "Biography"}', 'True story of a stockbroker''s rise and fall in the world of high finance.', 'Fascinating look at ambition, greed, and the stock market world. Eye-opening about finance and its dangers.', '{"Stock Market", "Business", "Entrepreneurship", "Inspiration"}'),
  ('Moneyball', 2011, '{"Drama", "Biography"}', 'How a baseball team uses data analytics to compete with bigger budgets.', 'Shows how data-driven decision making revolutionizes business strategy. Inspiring underdog story.', '{"Stock Market", "Business", "Mathematics", "Innovation"}'),
  ('Wall Street', 1987, '{"Drama", "Thriller"}', 'A young stockbroker gets mentored by a ruthless corporate raider.', 'Classic film exploring ambition, money, and ethics in finance. Iconic look at Wall Street culture.', '{"Stock Market", "Business", "Ethics"}'),
  ('The Big Short', 2015, '{"Drama", "Comedy"}', 'The 2008 financial crisis explained through the eyes of investors who saw it coming.', 'Makes complex finance understandable and entertaining. Shows the real impact of financial decisions.', '{"Stock Market", "Finance", "Economics", "Business"}'),
  ('Enron: Smarter Guys in the Room', 2005, '{"Documentary", "Drama"}', 'Documentary about the Enron scandal and corporate fraud.', 'Eye-opening documentary about corporate greed and the importance of ethics in business.', '{"Stock Market", "Business", "Ethics", "Documentaries"}'),
  ('Trading Places', 1983, '{"Comedy", "Drama"}', 'Two wealthy brokers and a street hustler swap lives in a bet.', 'Fun yet insightful look at class, privilege, and how the wealthy operate. Great comedy.', '{"Stock Market", "Business", "Comedy"}'),
  ('Margin Call', 2011, '{"Drama", "Thriller"}', 'A financial crisis unfolds over 24 hours at an investment bank.', 'Tense, intelligent thriller about the financial crisis. Shows real consequences of banking decisions.', '{"Stock Market", "Finance", "Thriller"}'),
  ('Too Big to Fail', 2011, '{"Drama", "History"}', 'The 2008 financial crisis and government efforts to save the economy.', 'Educational look at how the financial system impacts everyone. Important economic history.', '{"Stock Market", "Finance", "Economics", "History"}');

-- ============================================================================
-- LAW & JUSTICE MOVIES
-- ============================================================================

INSERT INTO curated_movies (title, year, genre, description, why_students_like, categories) VALUES
  ('12 Angry Men', 1957, '{"Drama", "Legal"}', 'A jury deliberates on a murder case and must reach unanimous agreement.', 'Classic masterpiece about justice, prejudice, and reasoning. Shows the power of critical thinking.', '{"Law", "Justice", "Education", "Philosophy"}'),
  ('Philadelphia', 1993, '{"Drama", "Legal"}', 'A lawyer fights discrimination when his firm fires him for having AIDS.', 'Powerful story about civil rights, discrimination, and the legal system. Tom Hanks is excellent.', '{"Law", "Justice", "Human Rights", "Inspiration"}'),
  ('To Kill a Mockingbird', 1962, '{"Drama", "Legal"}', 'A lawyer defends a Black man falsely accused of rape in the Deep South.', 'Timeless classic about morality, racism, and standing up for justice. Essential viewing.', '{"Law", "Justice", "History", "Ethics"}'),
  ('A Few Good Men', 1992, '{"Drama", "Legal", "Thriller"}', 'Military lawyers defend two Marines accused of murder.', 'Gripping courtroom drama with iconic performances. Shows importance of truth and justice.', '{"Law", "Justice", "Drama", "Thriller"}'),
  ('Legally Blonde', 2001, '{"Comedy", "Legal"}', 'A sorority girl enrolls in Harvard Law School and becomes a successful lawyer.', 'Funny yet empowering! Shows that intelligence comes in many forms. Great female protagonist.', '{"Law", "Inspiration", "Entrepreneurship", "Comedy"}'),
  ('Spotlight', 2015, '{"Drama", "History"}', 'Journalists investigate abuse by Catholic priests.', 'Oscar winner showing the power of investigation and journalism. Important social impact story.', '{"Law", "Justice", "Investigative", "Award Winner", "Documentaries"}'),
  ('The Trial of the Chicago 7', 2020, '{"Drama", "Legal"}', 'Activists are prosecuted for conspiracy during the 1968 Democratic Convention.', 'Timely legal drama about civil rights and justice. Relevant to modern activism.', '{"Law", "Justice", "History", "Activism"}'),
  ('Anatomy of a Murder', 1959, '{"Drama", "Legal"}', 'A small-town lawyer defends a man accused of murder.', 'Classic courtroom drama exploring complex legal and moral issues. Pioneer in legal cinema.', '{"Law", "Justice", "Philosophy", "Classic"}');

-- ============================================================================
-- OSCAR WINNERS & AWARD-WINNING MOVIES
-- ============================================================================

INSERT INTO curated_movies (title, year, genre, description, why_students_like, categories) VALUES
  ('Parasite', 2019, '{"Drama", "Thriller"}', 'A poor family schemes their way into employment with a wealthy household.', 'Oscar Best Picture winner! Brilliant social commentary wrapped in a thrilling story.', '{"Award Winner", "Inspiration", "Creativity", "Social Commentary"}'),
  ('Oppenheimer', 2023, '{"Drama", "Biography", "History"}', 'The life of J. Robert Oppenheimer and the development of the atomic bomb.', 'Oscar Best Picture winner! Explores science, ethics, and the atomic age brilliantly.', '{"Science", "History", "Award Winner", "Ethics"}'),
  ('CODA', 2021, '{"Drama", "Music"}', 'A hearing girl is the only hearing member of a deaf family.', 'Oscar Best Picture winner! Heartwarming story about identity, family, and following dreams.', '{"Award Winner", "Inspiration", "Music", "Family"}'),
  ('Nomadland', 2020, '{"Drama", "Adventure"}', 'A woman in her 60s leaves her small town to live as a van nomad.', 'Oscar Best Picture winner! Meditative and deeply human story about resilience and freedom.', '{"Award Winner", "Inspiration", "Documentaries", "Adventure"}'),
  ('Everything Everywhere All at Once', 2022, '{"Sci-Fi", "Drama", "Comedy"}', 'A woman explores alternate universes to prevent catastrophe.', 'Oscar winner for Best Picture! Creative, mind-bending, and deeply emotional all at once.', '{"Sci-Fi", "Award Winner", "Creativity", "Inspiration"}'),
  ('Schindler''s List', 1993, '{"Drama", "History"}', 'A businessman saves hundreds of Jewish refugees during the Holocaust.', 'Oscar Best Picture winner. Powerful, emotional, and important historical film.', '{"History", "Award Winner", "Inspiration", "Ethics"}'),
  ('Forrest Gump', 1994, '{"Drama", "Comedy"}', 'A man with low IQ achieves extraordinary things through determination.', 'Oscar Best Picture winner! Inspiring story about perseverance and finding your path.', '{"Inspiration", "Award Winner", "Comedy", "Life Lessons"}'),
  ('The Shawshank Redemption', 1994, '{"Drama", "Thriller"}', 'Two inmates form an unbreakable bond while imprisoned.', 'Widely considered one of the greatest films ever made. Inspiring, hopeful, and masterfully crafted.', '{"Inspiration", "Drama", "Thriller", "Award Winner"}');

-- ============================================================================
-- VERIFICATION - Count total movies
-- ============================================================================

SELECT 
  COUNT(*) as total_movies,
  COUNT(DISTINCT title) as unique_titles
FROM curated_movies;

-- Show all categories in movies
SELECT DISTINCT
  unnest(categories) as category,
  COUNT(*) as movie_count
FROM curated_movies
GROUP BY category
ORDER BY movie_count DESC;

