import type { KanbanStoreContext } from "./context";
import type { Board, Column, Card } from "../../types/kanban";

import { generateId } from "../../utils/ids";
import { now } from "../../utils/date";

import * as BoardRepo from "../../db/boardRepository";
import * as ColumnRepo from "../../db/columnRepository";
import * as CardRepo from "../../db/cardRepository";

export async function createBoard(
  this: KanbanStoreContext,
  name: string
) {
  const board: Board = {
    id: generateId(),
    name,
    position: this.boards.length,
    createdAt: now(),
    updatedAt: now(),
  };

  await BoardRepo.createBoard(board);

  this.boards.push(board);
}


export async function renameBoard(
  this: KanbanStoreContext,
  id: number,
  name: string
) {
  const board = this.findBoard(id);

  if (!board) return;

  board.name = name;
  board.updatedAt = now();

  await BoardRepo.updateBoard(board);
}

export async function reorderBoards(
  this: KanbanStoreContext,
  boards: Board[]
) {
  boards.forEach((board, index) => {
    const existing = this.findBoard(board.id);

    if (!existing) return;

    existing.position = index;
    existing.updatedAt = now();
  });

  await BoardRepo.reorderBoards(this.boards);
}

export async function deleteBoard(
  this: KanbanStoreContext,
  id: number
) {
  const columnIds = this.columns
    .filter(c => c.boardId === id)
    .map(c => c.id);

  this.cards = this.cards.filter(
    c => !columnIds.includes(c.columnId)
  );

  this.columns = this.columns.filter(
    c => c.boardId !== id
  );

  this.boards = this.boards.filter(
    b => b.id !== id
  );

  await BoardRepo.deleteBoard(id);

  this.recalculateBoardPositions();

  if (this.selectedBoardId === id) {
    this.selectedBoardId =
      this.boards.length
        ? this.boards[0].id
        : 0;
  }
}
export async function duplicateBoard(
  this: KanbanStoreContext,
  id: number
) {
  const board = this.findBoard(id);

  if (!board) return;

  const boardId = generateId();

  const newBoard: Board = {
    ...board,
    id: boardId,
    name: `${board.name} Copy`,
    position: this.boards.length,
    createdAt: now(),
    updatedAt: now(),
  };

  await BoardRepo.createBoard(newBoard);

  this.boards.push(newBoard);

  const columnMap = new Map<number, number>();

  const columns = this.columns
    .filter(c => c.boardId === id)
    .sort((a, b) => a.position - b.position);

  for (const column of columns) {
    const newColumnId = generateId();

    columnMap.set(column.id, newColumnId);

    const newColumn: Column = {
      ...column,
      id: newColumnId,
      boardId: boardId,
    };

    await ColumnRepo.createColumn(newColumn);

    this.columns.push(newColumn);
  }

  const cards = this.cards
    .filter(card =>
      columnMap.has(card.columnId)
    )
    .sort((a, b) => a.position - b.position);

  for (const card of cards) {
    const newCard: Card = {
      ...card,
      id: generateId(),
      columnId: columnMap.get(card.columnId)!,
      labels: [...card.labels],
      createdAt: now(),
      updatedAt: now(),
    };

    await CardRepo.createCard(newCard);

    this.cards.push(newCard);
  }
}

export function selectBoard(
  this: KanbanStoreContext,
  id: number
) {
  const board = this.findBoard(id);

  if (!board) return;

  this.selectedBoardId = id;
  this.selectedCardId = null;
}