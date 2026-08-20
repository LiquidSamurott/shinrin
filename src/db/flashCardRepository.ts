import { initDatabase } from "./database";
import type { Flashcard } from "../types/flashcard";

export async function getFlashcards(): Promise<Flashcard[]> {
  const db = await initDatabase();

  return await db.select<Flashcard[]>(`
    SELECT
      id,
      deck_id AS deckId,

      front,
      back,

      favorite,
      archived,

      ease,
      interval,
      repetitions,

      review_count AS reviewCount,
      lapses,

      due_date AS dueDate,
      last_reviewed AS lastReviewed,

      created_at AS createdAt,
      updated_at AS updatedAt

    FROM flashcards
    ORDER BY created_at
  `);
}

export async function createFlashcard(
  card: Flashcard
) {
  const db = await initDatabase();

  await db.execute(
    `
    INSERT INTO flashcards(
      id,
      deck_id,

      front,
      back,

      favorite,
      archived,

      ease,
      interval,
      repetitions,

      review_count,
      lapses,

      due_date,
      last_reviewed,

      created_at,
      updated_at
    )
    VALUES(
      ?,?,?,?,?,?,
      ?,?,?,?,
      ?,?,?,?,?
    )
    `,
    [
      card.id,
      card.deckId,

      card.front,
      card.back,

      Number(card.favorite),
      Number(card.archived),

      card.ease,
      card.interval,
      card.repetitions,

      card.reviewCount,
      card.lapses,

      card.dueDate ?? null,
      card.lastReviewed ?? null,

      card.createdAt,
      card.updatedAt,
    ]
  );
}

export async function updateFlashcard(
  card: Flashcard
) {
  const db = await initDatabase();

  await db.execute(
    `
    UPDATE flashcards
    SET
      front = ?,
      back = ?,

      favorite = ?,
      archived = ?,

      ease = ?,
      interval = ?,
      repetitions = ?,

      review_count = ?,
      lapses = ?,

      due_date = ?,
      last_reviewed = ?,

      updated_at = ?
    WHERE id = ?
    `,
    [
      card.front,
      card.back,

      Number(card.favorite),
      Number(card.archived),

      card.ease,
      card.interval,
      card.repetitions,

      card.reviewCount,
      card.lapses,

      card.dueDate ?? null,
      card.lastReviewed ?? null,

      card.updatedAt,
      card.id,
    ]
  );
}

export async function deleteFlashcard(
  id: number
) {
  const db = await initDatabase();

  await db.execute(
    `
    DELETE FROM flashcards
    WHERE id = ?
    `,
    [id]
  );
}