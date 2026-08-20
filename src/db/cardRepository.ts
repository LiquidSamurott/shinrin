import { initDatabase } from "./database";
import type { Card } from "../types/kanban";

type CardRow =
  Omit<Card, "labels" | "favorite" | "archived"> & {
    favorite: number;
    archived: number;
  };

export async function getCards(): Promise<Card[]> {
  const db = await initDatabase();

  const rows = await db.select<CardRow[]>(`
    SELECT
      id,
      column_id AS columnId,
      title,
      description,
      content,
      favorite,
      archived,
      due_date AS dueDate,
      created_at AS createdAt,
      updated_at AS updatedAt,
      position
    FROM cards
    ORDER BY position
  `);

  const cards: Card[] = [];

  for (const row of rows) {
    const labels = await db.select<{ label_id: number }[]>(
      `
      SELECT label_id
      FROM card_labels
      WHERE card_id = ?
      `,
      [row.id]
    );

    cards.push({
      ...row,
      content: row.content
        ? JSON.parse(row.content as string)
        : "",
      favorite: Boolean(row.favorite),
      archived: Boolean(row.archived),
      labels: labels.map(l => l.label_id),
    });
  }

  return cards;
}

export async function createCard(card: Card) {
  const db = await initDatabase();

  await db.execute(
    `
    INSERT INTO cards(
      id,
      column_id,
      title,
      description,
      content,
      favorite,
      archived,
      due_date,
      created_at,
      updated_at,
      position
    )
    VALUES(?,?,?,?,?,?,?,?,?,?,?)
    `,
    [
      card.id,
      card.columnId,
      card.title,
      card.description,
      JSON.stringify(card.content),
      Number(card.favorite),
      Number(card.archived),
      card.dueDate ?? null,
      card.createdAt,
      card.updatedAt,
      card.position,
    ]
  );

  for (const labelId of card.labels) {
    await db.execute(
      `
      INSERT INTO card_labels(
        card_id,
        label_id
      )
      VALUES(?,?)
      `,
      [
        card.id,
        labelId,
      ]
    );
  }
}

export async function updateCard(card: Card) {
  const db = await initDatabase();

  await db.execute(
    `
    UPDATE cards
    SET
      column_id=?,
      title=?,
      description=?,
      content=?,
      favorite=?,
      archived=?,
      due_date=?,
      updated_at=?,
      position=?
    WHERE id=?
    `,
    [
      card.columnId,
      card.title,
      card.description,
      JSON.stringify(card.content),
      Number(card.favorite),
      Number(card.archived),
      card.dueDate ?? null,
      card.updatedAt,
      card.position,
      card.id,
    ]
  );

  // Remove old labels
  await db.execute(
    `
    DELETE FROM card_labels
    WHERE card_id=?
    `,
    [card.id]
  );

  // Insert new labels
  for (const labelId of card.labels) {
    await db.execute(
      `
      INSERT INTO card_labels(
        card_id,
        label_id
      )
      VALUES(?,?)
      `,
      [
        card.id,
        labelId,
      ]
    );
  }
}

export async function deleteCard(id: number) {
  const db = await initDatabase();

  await db.execute(
    "DELETE FROM card_labels WHERE card_id=?",
    [id]
  );

  await db.execute(
    "DELETE FROM cards WHERE id=?",
    [id]
  );
}

export async function reorderCards(
  cards: Card[]
) {
  const db = await initDatabase();

  for (const card of cards) {
    await db.execute(
      `
      UPDATE cards
      SET
        column_id=?,
        position=?,
        updated_at=?
      WHERE id=?
      `,
      [
        card.columnId,
        card.position,
        card.updatedAt,
        card.id,
      ]
    );
  }
}