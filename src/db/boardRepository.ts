import { initDatabase } from "./database";

import type { Board } from "../types/kanban";

export async function getBoards(): Promise<Board[]> {
  const db = await initDatabase();

  return await db.select<Board[]>(
    `
    SELECT
      id,
      name,
      position,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM boards
    ORDER BY position
    `
  );
}

export async function createBoard(board: Board) {
    const db = await initDatabase();

    await db.execute(
        `
        INSERT INTO boards(
            id,
            name,
            position,
            created_at,
            updated_at
        )
        VALUES(?,?,?,?,?)
        `,
        [
            board.id,
            board.name,
            board.position,
            board.createdAt,
            board.updatedAt,
        ]
    );
}

export async function updateBoard(board: Board) {
    const db = await initDatabase();

    await db.execute(
        `
        UPDATE boards
        SET
            name=?,
            position=?,
            updated_at=?
        WHERE id=?
        `,
        [
            board.name,
            board.position,
            board.updatedAt,
            board.id,
        ]
    );
}

export async function deleteBoard(id: number) {
    const db = await initDatabase();

    await db.execute(
        "DELETE FROM boards WHERE id=?",
        [id]
    );
}

export async function reorderBoards(
    boards: Board[]
) {
    const db = await initDatabase();

    for (const board of boards) {
        await db.execute(
            `
            UPDATE boards
            SET position=?
            WHERE id=?
            `,
            [
                board.position,
                board.id,
            ]
        );
    }
}