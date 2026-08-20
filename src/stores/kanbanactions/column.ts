import type { KanbanStoreContext } from "./context";
import type { Column } from "../../types/kanban";

import { now } from "../../utils/date";
import { generateId } from "../../utils/ids";

import * as ColumnRepo from "../../db/columnRepository";
import * as CardRepo from "../../db/cardRepository";

export async function createColumn(
  this: KanbanStoreContext,
  title: string
) {
  const column: Column = {
    id: generateId(),
    boardId: this.selectedBoardId,
    title,
    position: this.boardColumns.length,
    color: "#1e293b",
    collapsed: false,
  };

  await ColumnRepo.createColumn(column);

  this.columns.push(column);
}

export async function renameColumn(
  this: KanbanStoreContext,
  id: number,
  title: string
) {
  const column = this.findColumn(id);

  if (!column) return;

  column.title = title;

  await ColumnRepo.updateColumn(column);
}

export async function duplicateColumn(
  this: KanbanStoreContext,
  id: number
) {
  const column = this.findColumn(id);

  if (!column) return;

  const newColumnId = generateId();

  const newColumn: Column = {
    ...column,
    id: newColumnId,
    title: `${column.title} Copy`,
    position: this.boardColumns.length,
  };

  await ColumnRepo.createColumn(newColumn);

  this.columns.push(newColumn);

  const cards = this.cardsByColumn(column.id);

  for (const [index, card] of cards.entries()) {
    const newCard = {
      ...card,
      id: generateId(),
      columnId: newColumnId,
      position: index,
      createdAt: now(),
      updatedAt: now(),
    };

    await CardRepo.createCard(newCard);

    this.cards.push(newCard);
  }
}

export async function deleteColumn(
  this: KanbanStoreContext,
  id: number
) {
  this.cards = this.cards.filter(
    card => card.columnId !== id
  );

  this.columns = this.columns.filter(
    column => column.id !== id
  );

  await ColumnRepo.deleteColumn(id);

  this.recalculateColumnPositions();
}

export async function setColumnColor(
  this: KanbanStoreContext,
  id: number,
  color: string
) {
  const column = this.findColumn(id);

  if (!column) return;

  column.color = color;

  await ColumnRepo.updateColumn(column);
}

export async function toggleColumnCollapse(
  this: KanbanStoreContext,
  id: number
) {
  const column = this.findColumn(id);

  if (!column) return;

  column.collapsed = !column.collapsed;

  await ColumnRepo.updateColumn(column);
}

export async function moveColumn(
  this: KanbanStoreContext,
  id: number,
  position: number
) {
  const column = this.findColumn(id);

  if (!column) return;

  column.position = position;

  await ColumnRepo.updateColumn(column);

  this.recalculateColumnPositions();
}

export async function reorderColumns(
  this: KanbanStoreContext,
  columns: Column[]
) {
  columns.forEach((column, index) => {
    const existing = this.findColumn(column.id);

    if (!existing) return;

    existing.position = index;
  });

  this.recalculateColumnPositions();

  await ColumnRepo.reorderColumns(this.columns);
}