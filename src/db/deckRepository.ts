import { initDatabase } from "./database";
import type { Deck } from "../types/flashcard";

export async function getDecks(): Promise<Deck[]> {
    const db = await initDatabase();

    return await db.select<Deck[]>(`
        SELECT
            id,
            board_id AS boardId,
            name,
            description,
            position,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM decks
        ORDER BY position
    `);
}

export async function createDeck(
    deck: Deck
) {
    console.log("Creating deck:", deck);
    const db = await initDatabase();

    await db.execute(
        `
        INSERT INTO decks(
            id,
            board_id,
            name,
            description,
            position,
            created_at,
            updated_at
        )
        VALUES(?,?,?,?,?,?,?)
        `,
        [
            deck.id,
            deck.boardId,
            deck.name,
            deck.description,
            deck.position,
            deck.createdAt,
            deck.updatedAt,
        ]
    );
}

export async function updateDeck(
    deck: Deck
) {
    const db = await initDatabase();

    await db.execute(
        `
        UPDATE decks
        SET
            name=?,
            description=?,
            position=?,
            updated_at=?
        WHERE id=?
        `,
        [
            deck.name,
            deck.description,
            deck.position,
            deck.updatedAt,
            deck.id,
        ]
    );
}

export async function deleteDeck(
    id: number
) {
    const db = await initDatabase();

    await db.execute(
        "DELETE FROM decks WHERE id=?",
        [id]
    );
}

export async function reorderDecks(
  decks: Deck[]
) {
  const db = await initDatabase();

  for (const deck of decks) {
    await db.execute(
      `
      UPDATE decks
      SET position = ?
      WHERE id = ?
      `,
      [
        deck.position,
        deck.id,
      ]
    );
  }
}