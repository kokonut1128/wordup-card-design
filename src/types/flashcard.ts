export interface Flashcard {
  id: string;
  front: string;
  back: string;
  phonetic?: string;
  chineseDefinition?: string;
  englishDefinition?: string;
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];
  imageUrl?: string;
  exampleSentence1?: string;
  exampleTranslation1?: string;
  exampleSentence2?: string;
  exampleTranslation2?: string;
  exampleSentence3?: string;
  exampleTranslation3?: string;
  exampleSource1?: string;
  exampleSource2?: string;
  exampleSource3?: string;
  isFavorite?: boolean;
  createdAt: number;
  lastReviewed?: number;
}
