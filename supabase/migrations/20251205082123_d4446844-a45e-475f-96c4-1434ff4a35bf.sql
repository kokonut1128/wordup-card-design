-- Create word_books table
CREATE TABLE public.word_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  tag TEXT DEFAULT 'general',
  is_purchased BOOLEAN NOT NULL DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create word_book_cards linking table (many-to-many)
CREATE TABLE public.word_book_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.word_books(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, flashcard_id)
);

-- Enable RLS
ALTER TABLE public.word_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_book_cards ENABLE ROW LEVEL SECURITY;

-- RLS policies for word_books
CREATE POLICY "Users can view their own books" ON public.word_books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own books" ON public.word_books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" ON public.word_books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" ON public.word_books
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for word_book_cards (based on book ownership)
CREATE POLICY "Users can view cards in their books" ON public.word_book_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.word_books WHERE id = book_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can add cards to their books" ON public.word_book_cards
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.word_books WHERE id = book_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can remove cards from their books" ON public.word_book_cards
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.word_books WHERE id = book_id AND user_id = auth.uid())
  );

-- Add indexes for performance
CREATE INDEX idx_word_books_user_id ON public.word_books(user_id);
CREATE INDEX idx_word_books_tag ON public.word_books(tag);
CREATE INDEX idx_word_book_cards_book_id ON public.word_book_cards(book_id);
CREATE INDEX idx_word_book_cards_flashcard_id ON public.word_book_cards(flashcard_id);

-- Trigger for updated_at
CREATE TRIGGER update_word_books_updated_at
  BEFORE UPDATE ON public.word_books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();