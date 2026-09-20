-- Add a curated collection of acclaimed animated movies.
-- The NOT EXISTS check keeps this migration safe to run more than once.

INSERT INTO curated_movies (
  title,
  year,
  genre,
  description,
  why_students_like,
  categories
)
SELECT
  new_movie.title,
  new_movie.year,
  new_movie.genre,
  new_movie.description,
  new_movie.why_students_like,
  new_movie.categories
FROM (
  VALUES
    ('Spirited Away', 2001, ARRAY['Animation', 'Fantasy', 'Adventure'], 'A young girl enters a mysterious spirit world and must find the courage to rescue her parents.', 'A beautifully imaginative story about courage, identity, empathy, and growing through unfamiliar challenges.', ARRAY['Animation', 'Award Winner', 'Creativity', 'Adventure', 'Life Lessons']),
    ('Spider-Man: Into the Spider-Verse', 2018, ARRAY['Animation', 'Action', 'Adventure'], 'Teenager Miles Morales discovers his powers and joins Spider-People from other dimensions to save their worlds.', 'Its inventive visual style and message that anyone can rise to a challenge make it especially motivating.', ARRAY['Animation', 'Award Winner', 'Creativity', 'Inspiration', 'Adventure']),
    ('The Lion King', 1994, ARRAY['Animation', 'Drama', 'Adventure'], 'A young lion prince must face his past and reclaim his place in the circle of life.', 'A memorable story about responsibility, friendship, grief, and finding the confidence to lead.', ARRAY['Animation', 'Family', 'Music', 'Life Lessons', 'Adventure']),
    ('Toy Story', 1995, ARRAY['Animation', 'Comedy', 'Adventure'], 'A cowboy doll feels threatened when a flashy new space toy becomes his owner''s favorite.', 'A funny and heartfelt look at friendship, jealousy, teamwork, and adapting to change.', ARRAY['Animation', 'Family', 'Comedy', 'Creativity', 'Life Lessons']),
    ('WALL-E', 2008, ARRAY['Animation', 'Sci-Fi', 'Adventure'], 'A lonely waste-cleaning robot discovers a new purpose after meeting a sleek search robot from space.', 'It combines technology, environmental responsibility, and human connection with remarkably visual storytelling.', ARRAY['Animation', 'Award Winner', 'Sci-Fi', 'Technology', 'Social Commentary']),
    ('Coco', 2017, ARRAY['Animation', 'Fantasy', 'Music'], 'An aspiring musician journeys through the Land of the Dead to uncover the truth about his family history.', 'A moving celebration of family, culture, memory, music, and pursuing a dream with compassion.', ARRAY['Animation', 'Award Winner', 'Family', 'Music', 'Life Lessons']),
    ('Up', 2009, ARRAY['Animation', 'Comedy', 'Adventure'], 'An elderly widower and a young scout fly a house to South America and discover an unexpected adventure.', 'It explores grief, friendship, purpose, and the idea that life''s quiet relationships can be its greatest adventures.', ARRAY['Animation', 'Award Winner', 'Family', 'Inspiration', 'Adventure']),
    ('Ratatouille', 2007, ARRAY['Animation', 'Comedy', 'Adventure'], 'A gifted rat dreams of becoming a chef and forms an unlikely partnership in a famous Paris restaurant.', 'Its message about creativity, mentorship, perseverance, and talent coming from anywhere resonates with students.', ARRAY['Animation', 'Award Winner', 'Creativity', 'Inspiration', 'Comedy']),
    ('How to Train Your Dragon', 2010, ARRAY['Animation', 'Fantasy', 'Adventure'], 'A young Viking befriends an injured dragon and challenges everything his community believes about its enemies.', 'An uplifting story about curiosity, empathy, innovation, and having the courage to question old assumptions.', ARRAY['Animation', 'Family', 'Innovation', 'Inspiration', 'Adventure']),
    ('The Incredibles', 2004, ARRAY['Animation', 'Action', 'Comedy'], 'A family of retired superheroes must work together when a dangerous new threat emerges.', 'Its energetic story balances individuality, collaboration, family expectations, and using strengths responsibly.', ARRAY['Animation', 'Award Winner', 'Family', 'Comedy', 'Life Lessons']),
    ('Princess Mononoke', 1997, ARRAY['Animation', 'Fantasy', 'Adventure'], 'A young warrior becomes caught in a conflict between an industrial settlement and the gods of a forest.', 'A thoughtful, morally complex exploration of environmental conflict, leadership, and seeing humanity on both sides.', ARRAY['Animation', 'Adventure', 'Ethics', 'Social Commentary', 'Creativity']),
    ('Finding Nemo', 2003, ARRAY['Animation', 'Comedy', 'Adventure'], 'An anxious clownfish crosses the ocean to find his missing son with help from an unforgettable companion.', 'A warm story about resilience, trust, friendship, and learning when to protect someone and when to let them grow.', ARRAY['Animation', 'Award Winner', 'Family', 'Comedy', 'Adventure']),
    ('Death Note', 2006, ARRAY['Animation', 'Mystery', 'Psychological Thriller'], 'A brilliant student discovers a supernatural notebook that can kill anyone whose name is written inside it.', 'Its battle of intellect explores justice, power, ethics, and the consequences of believing that good intentions justify dangerous choices.', ARRAY['Animation', 'Psychology', 'Ethics', 'Thriller'])
) AS new_movie(title, year, genre, description, why_students_like, categories)
WHERE NOT EXISTS (
  SELECT 1
  FROM curated_movies existing_movie
  WHERE existing_movie.title = new_movie.title
);
