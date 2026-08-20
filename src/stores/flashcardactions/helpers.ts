import type { FlashcardStoreContext } from "./context";

export function findDeck(
    this: FlashcardStoreContext,
    id: number
) {
    return this.decks.find(
        deck => deck.id === id
    );
}

export function findFlashcard(
    this: FlashcardStoreContext,
    id: number
) {
    return this.flashcards.find(
        card => card.id === id
    );
}

export function findTag(
    this: FlashcardStoreContext,
    id: number
) {
    return this.tags.find(
        tag => tag.id === id
    );
}

