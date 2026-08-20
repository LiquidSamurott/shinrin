import type { FlashcardStoreContext } from "../context";

export function revealAnswer(
  this: FlashcardStoreContext
) {
  this.studyRevealed = true;
}