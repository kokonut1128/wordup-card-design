export interface WordBook {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  tag: string | null;
  is_purchased: boolean;
  price: number | null;
  created_at: string;
  updated_at: string;
  card_count?: number;
}

export interface WordBookCard {
  id: string;
  book_id: string;
  flashcard_id: string;
  position: number;
  added_at: string;
}
