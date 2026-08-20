import type {
  Deck,
  Flashcard,
  FlashcardTag,
} from "../../types/flashcard";

export interface FlashcardState {
  decks: Deck[];
  flashcards: Flashcard[];
  tags: FlashcardTag[];

  studyQueue: Flashcard[];
  currentStudyIndex: number;

  studyFinished: boolean;
  studyRevealed: boolean;

  selectedDeckId: number;
  selectedFlashcardId: number | null;

  search: string;
  favoritesOnly: boolean;

  selectedTagIds: number[];

  loading: boolean;
  error: string;
  studyStartedAt?: string;
  studyEndedAt?: string;

  studyStats: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  
}

export const createState = (): FlashcardState => ({
  decks: [],
  flashcards: [],
  tags: [],

  selectedDeckId: 0,
  selectedFlashcardId: null,

  search: "",
  favoritesOnly: false,
  studyQueue: [],
  currentStudyIndex: 0,

  studyFinished: false,
  studyRevealed: false,


  selectedTagIds: [],

  loading: false,
  error: "",
  studyStartedAt: undefined,
  studyEndedAt: undefined,

  studyStats: {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  },
});