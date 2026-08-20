import type { FlashcardStoreContext } from "../context";

export function finishStudy(
  this: FlashcardStoreContext
) {
  this.studyFinished = true;

  this.studyEndedAt =
    new Date().toISOString();
}