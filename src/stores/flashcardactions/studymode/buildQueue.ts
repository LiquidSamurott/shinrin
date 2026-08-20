import type { FlashcardStoreContext } from "../context";

export function buildQueue(
  this: FlashcardStoreContext
) {
  const today = new Date();

  this.studyQueue = this.flashcards
    .filter(card => {
      // only current deck
      if (card.deckId !== this.selectedDeckId)
        return false;

      // ignore archived
      if (card.archived)
        return false;

      // new card
      if (!card.dueDate)
        return true;

      // due today
      return new Date(card.dueDate) <= today;
    })
    .sort((a, b) => {
      // newest first
      return a.createdAt.localeCompare(b.createdAt);
    });
}