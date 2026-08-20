// types/flashcard.ts

export interface Deck {
  id: number;

  boardId: number | null;

  name: string;
  description: string;

  position: number;

  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: number;

  deckId: number;

  front: string;
  back: string;

  tags: number[];

  favorite: boolean;
  archived: boolean;

  ease: number;
  interval: number;
  repetitions: number;

  reviewCount: number;
  lapses: number;

  dueDate?: string;
  lastReviewed?: string;

  createdAt: string;
  updatedAt: string;
}

export interface FlashcardTag {
  id: number;
  deckId: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}