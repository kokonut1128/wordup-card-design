export interface WordBook {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  tag: string;
  is_purchased: boolean;
  price?: number;
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
