import { initDatabase } from "./database";

import type { Column } from "../types/kanban";

export async function getColumns(): Promise<Column[]> {
  const db = await initDatabase();

  return await db.select<Column[]>(`
    SELECT
      id,
      board_id AS boardId,
      title,
      position,
      color,
      collapsed
    FROM columns
    ORDER BY position
  `);
}

export async function createColumn(
  column: Column
) {
  const db = await initDatabase();

  await db.execute(
    `
    INSERT INTO columns(
      id,
      board_id,
      title,
      position,
      color,
      collapsed
    )
    VALUES(?,?,?,?,?,?)
    `,
    [
      column.id,
      column.boardId,
      column.title,
      column.position,
      column.color ?? null,
      Number(column.collapsed ?? false),
    ]
  );
}

export async function updateColumn(
  column: Column
) {
  const db = await initDatabase();

  await db.execute(
    `
    UPDATE columns
    SET
      board_id=?,
      title=?,
      position=?,
      color=?,
      collapsed=?
    WHERE id=?
    `,
    [
      column.boardId,
      column.title,
      column.position,
      column.color ?? null,
      Number(column.collapsed ?? false),
      column.id,
    ]
  );
}

export async function deleteColumn(
  id: number
) {
  const db = await initDatabase();

  // Find cards in this column
  const cards = await db.select<{ id: number }[]>(`
    SELECT id
    FROM cards
    WHERE column_id=?
  `, [id]);

  // Delete label relations
  for (const card of cards) {
    await db.execute(
      `
      DELETE FROM card_labels
      WHERE card_id=?
      `,
      [card.id]
    );
  }

  // Delete cards
  await db.execute(
    `
    DELETE FROM cards
    WHERE column_id=?
    `,
    [id]
  );

  // Delete column
  await db.execute(
    `
    DELETE FROM columns
    WHERE id=?
    `,
    [id]
  );
}

export async function reorderColumns(
  columns: Column[]
) {
  const db = await initDatabase();

  for (const column of columns) {
    await db.execute(
      `
      UPDATE columns
      SET position=?
      WHERE id=?
      `,
      [
        column.position,
        column.id,
      ]
    );
  }
}