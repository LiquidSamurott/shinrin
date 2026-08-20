import type { FlashcardStoreContext } from "./context";
import type { Deck } from "../../types/flashcard";

import { generateId } from "../../utils/ids";
import { now } from "../../utils/date";
import * as DeckRepo from "../../db/deckRepository";

export async function createDeck(
  this: FlashcardStoreContext,
  name: string,
  boardId: number | null = null
) {
  const deck: Deck = {
    id: generateId(),

    boardId,

    name,
    description: "",

    position: this.decks.length,

    createdAt: now(),
    updatedAt: now(),
  };

  await DeckRepo.createDeck(deck);

  this.decks.push(deck);
}

export function selectDeck(
    this: FlashcardStoreContext,
    id: number
) {
    this.selectedDeckId = id;
    this.selectedFlashcardId = null;
}

export async function renameDeck(
  this: FlashcardStoreContext,
  id: number,
  name: string
) {
  const deck = this.findDeck(id);

  if (!deck) return;

  deck.name = name;
  deck.updatedAt = now();

  await DeckRepo.updateDeck(deck);
}

export async function deleteDeck(
  this: FlashcardStoreContext,
  id: number
) {
  this.flashcards = this.flashcards.filter(
    card => card.deckId !== id
  );

  this.decks = this.decks.filter(
    deck => deck.id !== id
  );

  await DeckRepo.deleteDeck(id);

  if (this.selectedDeckId === id) {
    this.selectedDeckId =
      this.decks.length
        ? this.decks[0].id
        : 0;
  }
}

export async function reorderDecks(
  this: FlashcardStoreContext,
  decks: Deck[]
) {
  decks.forEach((deck, index) => {
    const existing = this.findDeck(deck.id);

    if (!existing) return;

    existing.position = index;
    existing.updatedAt = now();
  });

  await DeckRepo.reorderDecks(this.decks);
}