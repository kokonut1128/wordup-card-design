-- Add tags and difficulty level to flashcards table
ALTER TABLE flashcards ADD COLUMN tags text[] DEFAULT '{}';
ALTER TABLE flashcards ADD COLUMN difficulty_level text DEFAULT 'intermediate';

-- Add index for better filtering performance
CREATE INDEX idx_flashcards_tags ON flashcards USING GIN(tags);
CREATE INDEX idx_flashcards_difficulty ON flashcards(difficulty_level);

COMMENT ON COLUMN flashcards.tags IS 'Topic tags for the flashcard (e.g., business, travel, daily)';
COMMENT ON COLUMN flashcards.difficulty_level IS 'Difficulty level: beginner, intermediate, advanced';