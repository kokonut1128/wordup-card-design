import { useState, useEffect } from 'react';
import { Flashcard } from '@/types/flashcard';

const STORAGE_KEY = 'flashcards';

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcard = (front: string, back: string, additionalData?: Partial<Flashcard>) => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front,
      back,
      createdAt: Date.now(),
      ...additionalData,
    };
    setFlashcards([...flashcards, newCard]);
  };

  const updateFlashcard = (id: string, front: string, back: string, additionalData?: Partial<Flashcard>) => {
    setFlashcards(flashcards.map(card => 
      card.id === id ? { ...card, front, back, ...additionalData } : card
    ));
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards(flashcards.filter(card => card.id !== id));
  };

  const markAsReviewed = (id: string) => {
    setFlashcards(flashcards.map(card =>
      card.id === id ? { ...card, lastReviewed: Date.now() } : card
    ));
  };

  return {
    flashcards,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    markAsReviewed,
  };
};
