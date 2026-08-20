import type { FlashcardStoreContext } from "./context";

import * as DeckRepo from "../../db/deckRepository";
import * as FlashcardRepo from "../../db/flashCardRepository";
import * as TagRepo from "../../db/flashCardTagRepository";

export async function initialize(
  this: FlashcardStoreContext
) {
  this.loading = true;

  try {
    this.decks = await DeckRepo.getDecks();
    this.flashcards =
      await FlashcardRepo.getFlashcards();
    this.tags = await TagRepo.getTags();

    if (this.decks.length && this.selectedDeckId === 0) {
      this.selectedDeckId = this.decks[0].id;
    }
  } finally {
    this.loading = false;
  }
}