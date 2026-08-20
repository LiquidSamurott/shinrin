import type { KanbanStoreContext } from "./context";

import { now } from "../../utils/date";

import * as BoardRepo from "../../db/boardRepository";
import * as ColumnRepo from "../../db/columnRepository";
import * as CardRepo from "../../db/cardRepository";

export function findBoard(
  this: KanbanStoreContext,
  id: number
) {
  return this.boards.find(board => board.id === id);
}

export function findColumn(
  this: KanbanStoreContext,
  id: number
) {
  return this.columns.find(column => column.id === id);
}

export function findLabel(
  this: KanbanStoreContext,
  id: number
) {
  return this.labels.find(label => label.id === id);
}

export function findCard(
  this: KanbanStoreContext,
  id: number
) {
  return this.cards.find(card => card.id === id);
}

export function touchBoard(
  this: KanbanStoreContext,
  id: number
) {
  const board = this.findBoard(id);

  if (!board) return;

  board.updatedAt = now();
}

export function touchCard(
  this: KanbanStoreContext,
  id: number
) {
  const card = this.findCard(id);

  if (!card) return;

  card.updatedAt = now();
}

export async function recalculateColumnPositions(
  this: KanbanStoreContext
) {
  this.boardColumns.forEach((column, index) => {
    column.position = index;
  });

  await ColumnRepo.reorderColumns(this.boardColumns);
}

export async function recalculateBoardPositions(
  this: KanbanStoreContext
) {
  this.boards
    .sort((a, b) => a.position - b.position)
    .forEach((board, index) => {
      board.position = index;
    });

  await BoardRepo.reorderBoards(this.boards);
}

export async function recalculateCardPositions(
  this: KanbanStoreContext,
  columnId: number
) {
  this.cardsByColumn(columnId).forEach((card, index) => {
    card.position = index;
    card.updatedAt = now();
  });

  await CardRepo.reorderCards(
    this.cardsByColumn(columnId)
  );
}

export function initialize(
  this: KanbanStoreContext
) {
  // No longer needed once SQLite is used.
}