import { initDatabase } from "./database";
import type { Label } from "../types/kanban";

export async function getLabels(): Promise<Label[]> {
  const db = await initDatabase();

  return await db.select<Label[]>(
    `
    SELECT
      id,
      board_id AS boardId,
      name,
      color,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM labels
    ORDER BY name
    `
  );
}

export async function createLabel(label: Label) {
  const db = await initDatabase();

  await db.execute(
    `
    INSERT INTO labels(
      id,
      board_id,
      name,
      color,
      created_at,
      updated_at
    )
    VALUES(?,?,?,?,?,?)
    `,
    [
      label.id,
      label.boardId,
      label.name,
      label.color,
      label.createdAt,
      label.updatedAt,
    ]
  );
}

export async function updateLabel(label: Label) {
  const db = await initDatabase();

  await db.execute(
    `
    UPDATE labels
    SET
      name=?,
      color=?,
      updated_at=?
    WHERE id=?
    `,
    [
      label.name,
      label.color,
      label.updatedAt,
      label.id,
    ]
  );
}

export async function deleteLabel(id: number) {
  const db = await initDatabase();

  await db.execute(
    `DELETE FROM card_labels WHERE label_id=?`,
    [id]
  );

  await db.execute(
    `DELETE FROM labels WHERE id=?`,
    [id]
  );
}

/* -----------------------------
   Card ↔ Label relationships
------------------------------*/

export async function getCardLabels(
  cardId: number
): Promise<number[]> {
  const db = await initDatabase();

  const rows = await db.select<{ label_id: number }[]>(
    `
    SELECT label_id
    FROM card_labels
    WHERE card_id = ?
    `,
    [cardId]
  );

  return rows.map(r => r.label_id);
}

export async function setCardLabels(
  cardId: number,
  labels: number[]
) {
  const db = await initDatabase();

  await db.execute(
    `
    DELETE FROM card_labels
    WHERE card_id = ?
    `,
    [cardId]
  );

  for (const labelId of labels) {
    await db.execute(
      `
      INSERT INTO card_labels(
        card_id,
        label_id
      )
      VALUES (?, ?)
      `,
      [cardId, labelId]
    );
  }
}