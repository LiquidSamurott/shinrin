import type { Flashcard } from "../../../types/flashcard";

function tomorrow(days: number) {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return date.toISOString();
}

export function scheduleAgain(card: Flashcard) {
  card.interval = 1;

  card.repetitions = 0;

  card.ease = Math.max(1.3, card.ease - 0.2);

  card.lapses++;

  card.reviewCount++;

  card.lastReviewed = new Date().toISOString();

  card.dueDate = tomorrow(1);
}

export function scheduleHard(card: Flashcard) {
  card.interval = Math.max(
    1,
    Math.round(card.interval * 1.2)
  );

  card.ease = Math.max(
    1.3,
    card.ease - 0.15
  );

  card.repetitions++;

  card.reviewCount++;

  card.lastReviewed = new Date().toISOString();

  card.dueDate = tomorrow(card.interval);
}

export function scheduleGood(card: Flashcard) {
  card.interval = Math.max(
    1,
    Math.round(card.interval * card.ease)
  );

  card.repetitions++;

  card.reviewCount++;

  card.lastReviewed = new Date().toISOString();

  card.dueDate = tomorrow(card.interval);
}

export function scheduleEasy(card: Flashcard) {
  card.interval = Math.max(
    1,
    Math.round(card.interval * card.ease * 1.3)
  );

  card.ease += 0.05;

  card.repetitions++;

  card.reviewCount++;

  card.lastReviewed = new Date().toISOString();

  card.dueDate = tomorrow(card.interval);
}