import type { KanbanStoreContext } from "./context";

import { now } from "../../utils/date";
import { generateId } from "../../utils/ids";

import * as LabelRepo from "../../db/labelRepository";
import * as CardRepo from "../../db/cardRepository";

export async function createLabel(
  this: KanbanStoreContext,
  boardId: number,
  name: string,
  color: string
) {
  const label = {
    id: generateId(),
    boardId,
    name,
    color,
    createdAt: now(),
    updatedAt: now(),
  };

  await LabelRepo.createLabel(label);

  this.labels.push(label);
}

export async function renameLabel(
  this: KanbanStoreContext,
  id: number,
  name: string
) {
  const label = this.findLabel(id);

  if (!label) return;

  label.name = name;
  label.updatedAt = now();

  await LabelRepo.updateLabel(label);
}

export async function recolorLabel(
  this: KanbanStoreContext,
  id: number,
  color: string
) {
  const label = this.findLabel(id);

  if (!label) return;

  label.color = color;
  label.updatedAt = now();

  await LabelRepo.updateLabel(label);
}

export async function deleteLabel(
  this: KanbanStoreContext,
  id: number
) {
  await LabelRepo.deleteLabel(id);

  this.labels = this.labels.filter(
    label => label.id !== id
  );

  for (const card of this.cards) {
    if (!card.labels.includes(id)) continue;

    card.labels = card.labels.filter(
      labelId => labelId !== id
    );

    card.updatedAt = now();

    await CardRepo.updateCard(card);
  }
}

export async function toggleCardLabel(
  this: KanbanStoreContext,
  cardId: number,
  labelId: number
) {
  const card = this.findCard(cardId);

  if (!card) return;

  if (card.labels.includes(labelId)) {
    card.labels = card.labels.filter(
      id => id !== labelId
    );
  } else {
    card.labels.push(labelId);
  }

  card.updatedAt = now();

  await CardRepo.updateCard(card);
}

export function labelsForBoard(
  this: KanbanStoreContext,
  boardId: number
) {
  return this.labels
    .filter(label => label.boardId === boardId)
    .sort((a, b) => a.name.localeCompare(b.name));
}