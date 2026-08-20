import type { FlashcardStoreContext } from "../context";

import { scheduleCard } from "./scheduleCard";
import { nextCard } from "./nextCard";

export type StudyGrade =
  | "again"
  | "hard"
  | "good"
  | "easy";

export function gradeCard(
  this: FlashcardStoreContext,
  grade: StudyGrade
) {
  const card =
    this.studyQueue[this.currentStudyIndex];

  if (!card) return;

  scheduleCard(card, grade);

  switch (grade) {
    case "again":
      this.studyStats.again++;
      break;

    case "hard":
      this.studyStats.hard++;
      break;

    case "good":
      this.studyStats.good++;
      break;

    case "easy":
      this.studyStats.easy++;
      break;
  }

  nextCard.call(this);
}