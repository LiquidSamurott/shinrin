import type { FlashcardStoreContext } from "./context";
import type { Flashcard } from "../../types/flashcard";

import { generateId } from "../../utils/ids";
import { now } from "../../utils/date";

import * as FlashcardRepo from "../../db/flashCardRepository";
import * as Repository from "../../db/flashCardRepository";

export async function createFlashcard(
  this: FlashcardStoreContext,
  front: string,
  back = ""
) {
  if (!this.selectedDeckId) {
    throw new Error("No deck selected.");
  }

  const question = front.trim();
  const answer = back.trim();

  if (!question.length) {
    return;
  }

  const timestamp = now();

  const card: Flashcard = {
    id: generateId(),

    deckId: this.selectedDeckId,

    front: question,
    back: answer,

    tags: [],

    favorite: false,
    archived: false,

    ease: 2.5,
    interval: 0,
    repetitions: 0,

    reviewCount: 0,
    lapses: 0,

    dueDate: undefined,
    lastReviewed: undefined,

    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await FlashcardRepo.createFlashcard(card);

  this.flashcards.push(card);

  this.selectedFlashcardId = card.id;

  return card;
}
export async function updateFlashcard(
  this: FlashcardStoreContext,
  id: number,
  updates: Partial<Flashcard>
) {
  const card = this.findFlashcard(id);

  if (!card) return;

  Object.assign(card, updates);

  card.updatedAt = now();

  await FlashcardRepo.updateFlashcard(card);
}

export async function deleteFlashcard(
  this: FlashcardStoreContext,
  id: number
) {
  this.flashcards = this.flashcards.filter(
    card => card.id !== id
  );

  await FlashcardRepo.deleteFlashcard(id);

  if (this.selectedFlashcardId === id) {
    this.selectedFlashcardId = null;
  }
}

export function selectFlashcard(
  this: FlashcardStoreContext,
  id: number
) {
  this.selectedFlashcardId = id;
}

export function openFlashcard(
  this: FlashcardStoreContext,
  id: number
) {
  this.selectedFlashcardId = id;
}

export function closeFlashcard(
  this: FlashcardStoreContext
) {
  this.selectedFlashcardId = null;
}

export async function toggleFavorite(
  this: FlashcardStoreContext,
  id: number
) {
  const card = this.flashcards.find(c => c.id === id);

  if (!card) return;

  card.favorite = !card.favorite;
  card.updatedAt = now();

  await Repository.updateFlashcard(card);
}
