import { now } from "../../utils/date";
import { generateId } from "../../utils/ids";

import type { KanbanStoreContext } from "./context";
import type { Card } from "../../types/kanban";

import * as CardRepo from "../../db/cardRepository";

function createEmptyCard(
  columnId: number,
  title: string,
  position: number
): Card {
  return {
    id: generateId(),
    columnId,
    title,
    description: "",
    content: "",
    labels: [],
    dueDate: undefined,
    favorite: false,
    archived: false,
    position,
    createdAt: now(),
    updatedAt: now(),
  };
}

export async function createCard(
  this: KanbanStoreContext,
  columnId: number,
  title: string
) {
  const card = createEmptyCard(
    columnId,
    title,
    this.cardsByColumn(columnId).length
  );

  await CardRepo.createCard(card);

  this.cards.push(card);
}

export async function renameCard(
  this: KanbanStoreContext,
  id: number,
  title: string
) {
  const card = this.findCard(id);

  if (!card) return;

  card.title = title;
  card.updatedAt = now();

  await CardRepo.updateCard(card);
}

export async function updateCardDescription(
  this: KanbanStoreContext,
  id: number,
  description: string
) {
  const card = this.findCard(id);

  if (!card) return;

  card.description = description;
  card.updatedAt = now();

  await CardRepo.updateCard(card);
}

export async function updateCardContent(
  this: KanbanStoreContext,
  id: number,
  content: string
) {
  const card = this.findCard(id);

  if (!card) return;

  card.content = content;
  card.updatedAt = now();

  await CardRepo.updateCard(card);
}

export async function openCard(
  this: KanbanStoreContext,
  id: number
) {
  this.selectedCardId = id;
}

export async function closeCard(
  this: KanbanStoreContext
) {
  this.selectedCardId = null;
}

export async function moveCard(
  this: KanbanStoreContext,
  cardId: number,
  columnId: number,
  position: number
) {
  const card = this.findCard(cardId);

  if (!card) return;

  card.columnId = columnId;
  card.position = position;
  card.updatedAt = now();

  await CardRepo.updateCard(card);
}

export async function reorderCards(
  this: KanbanStoreContext,
  columnId: number,
  cards: Card[]
) {
  for (const [index, card] of cards.entries()) {
    const existing = this.findCard(card.id);

    if (!existing) continue;

    existing.columnId = columnId;
    existing.position = index;
    existing.updatedAt = now();

    await CardRepo.updateCard(existing);
  }
}

export async function toggleFavorite(
  this: KanbanStoreContext,
  id: number
) {
  const card = this.findCard(id);

  if (!card) return;

  card.favorite = !card.favorite;
  card.updatedAt = now();

  await CardRepo.updateCard(card);
}

export async function deleteCard(
  this: KanbanStoreContext,
  id: number
) {
  const card = this.findCard(id);

  if (!card) return;

  const columnId = card.columnId;

  await CardRepo.deleteCard(id);

  this.cards = this.cards.filter(
    c => c.id !== id
  );

  this.recalculateCardPositions(columnId);

  if (this.selectedCardId === id) {
    this.selectedCardId = null;
  }
}