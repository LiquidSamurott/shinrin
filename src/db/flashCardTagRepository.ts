import { initDatabase } from "./database";
import type { FlashcardTag } from "../types/flashcard";

export async function getTags(): Promise<FlashcardTag[]> {
  const db = await initDatabase();

  return await db.select<FlashcardTag[]>(`
    SELECT
      id,
      deck_id AS deckId,
      name,
      color,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM flashcard_tags
    ORDER BY name
  `);
}

export async function createTag(
  tag: FlashcardTag
): Promise<void> {
  const db = await initDatabase();

  await db.execute(
    `
      INSERT INTO flashcard_tags (
        id,
        deck_id,
        name,
        color,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      tag.id,
      tag.deckId,
      tag.name,
      tag.color,
      tag.createdAt,
      tag.updatedAt,
    ]
  );
}

export async function updateTag(
  tag: FlashcardTag
): Promise<void> {
  const db = await initDatabase();

  await db.execute(
    `
      UPDATE flashcard_tags
      SET
        name = ?,
        color = ?,
        updated_at = ?
      WHERE id = ?
    `,
    [
      tag.name,
      tag.color,
      tag.updatedAt,
      tag.id,
    ]
  );
}

export async function deleteTag(
  id: number
): Promise<void> {
  const db = await initDatabase();

  await db.execute(
    `DELETE FROM flashcard_tags WHERE id = ?`,
    [id]
  );
}