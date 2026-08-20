import type { FlashcardState } from "./flashcardstate";

import type {
    Deck,
    Flashcard,
    FlashcardTag,
} from "../../types/flashcard";

export const getters = {

    selectedDeck(
        state: FlashcardState
    ): Deck | undefined {

        return state.decks.find(
            d => d.id === state.selectedDeckId
        );
    },

    selectedFlashcard(
        state: FlashcardState
    ): Flashcard | undefined {

        return state.flashcards.find(
            c => c.id === state.selectedFlashcardId
        );
    },

    deckFlashcards(
        state: FlashcardState
    ): Flashcard[] {

        return state.flashcards.filter(
            c => c.deckId === state.selectedDeckId
        );
    },

    tagsForDeck:
        (state: FlashcardState) =>
        (deckId: number): FlashcardTag[] => {

            return state.tags.filter(
                t => t.deckId === deckId
            );
        },
    currentStudyCard(state: FlashcardState) {
        return state.studyQueue[state.currentStudyIndex];
    }
};