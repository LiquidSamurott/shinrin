import type { FlashcardStoreContext } from "../context";
import { finishStudy } from "./finishStudy";

export function nextCard(
  this: FlashcardStoreContext
) {
  this.studyRevealed = false;

  this.currentStudyIndex++;

  if (
    this.currentStudyIndex >=
    this.studyQueue.length
  ) {
    finishStudy.call(this);
  }
}