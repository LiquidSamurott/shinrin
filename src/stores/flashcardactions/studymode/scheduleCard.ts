import type { Flashcard } from "../../../types/flashcard";

import {
  scheduleAgain,
  scheduleHard,
  scheduleGood,
  scheduleEasy,
} from "./scheduler";

export type StudyGrade =
  | "again"
  | "hard"
  | "good"
  | "easy";

export function scheduleCard(
  card: Flashcard,
  grade: StudyGrade
) {
  switch (grade) {
    case "again":
      scheduleAgain(card);
      break;

    case "hard":
      scheduleHard(card);
      break;

    case "good":
      scheduleGood(card);
      break;

    case "easy":
      scheduleEasy(card);
      break;

    default:
      throw new Error(`Unknown study grade: ${grade}`);
  }

  card.updatedAt = new Date().toISOString();

  return card;
}