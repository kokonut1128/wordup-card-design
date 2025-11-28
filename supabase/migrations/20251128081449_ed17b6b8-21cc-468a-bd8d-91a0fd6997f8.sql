-- Add is_favorite column to flashcards table
ALTER TABLE public.flashcards 
ADD COLUMN is_favorite boolean DEFAULT false NOT NULL;