-- Add correct_streak column to track consecutive correct answers
ALTER TABLE public.user_flashcard_progress 
ADD COLUMN IF NOT EXISTS correct_streak integer NOT NULL DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.user_flashcard_progress.correct_streak IS 'Number of consecutive correct answers in quiz mode';