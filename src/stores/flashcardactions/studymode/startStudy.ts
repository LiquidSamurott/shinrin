import type { FlashcardStoreContext } from "../context";
import { buildQueue } from "./buildQueue";
export function startStudy(
  this: FlashcardStoreContext
) {
  buildQueue.call(this);

  this.currentStudyIndex = 0;

  this.studyFinished = false;

  this.studyRevealed = false;

  this.studyStartedAt = new Date().toISOString();

  this.studyStats = {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  };
}