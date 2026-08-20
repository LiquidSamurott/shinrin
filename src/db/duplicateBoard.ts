import * as BoardRepo from "./boardRepository";
import * as ColumnRepo from "./columnRepository";
import * as CardRepo from "./cardRepository";
import * as LabelRepo from "./labelRepository";

import { generateId } from "../utils/ids";
import { now } from "../utils/date";

export async function duplicateBoardData(
  boardId: number
) {
  const boards = await BoardRepo.getBoards();
  const columns = await ColumnRepo.getColumns();
  const cards = await CardRepo.getCards();
  const labels = await LabelRepo.getLabels();

  const board = boards.find(
    b => b.id === boardId
  );

  if (!board) return;

  const newBoardId = generateId();

  await BoardRepo.createBoard({
    ...board,
    id: newBoardId,
    name: `${board.name} Copy`,
    position: boards.length,
    createdAt: now(),
    updatedAt: now(),
  });

  /* --------------------------
     Duplicate Labels
  -------------------------- */

  const labelMap = new Map<number, number>();

  const boardLabels = labels.filter(
    l => l.boardId === boardId
  );

  for (const label of boardLabels) {
    const newLabelId = generateId();

    labelMap.set(
      label.id,
      newLabelId
    );

    await LabelRepo.createLabel({
      ...label,
      id: newLabelId,
      boardId: newBoardId,
      createdAt: now(),
      updatedAt: now(),
    });
  }

  /* --------------------------
     Duplicate Columns
  -------------------------- */

  const columnMap = new Map<number, number>();

  const boardColumns = columns.filter(
    c => c.boardId === boardId
  );

  for (const column of boardColumns) {
    const newColumnId = generateId();

    columnMap.set(
      column.id,
      newColumnId
    );

    await ColumnRepo.createColumn({
      ...column,
      id: newColumnId,
      boardId: newBoardId,
    });
  }

  /* --------------------------
     Duplicate Cards
  -------------------------- */

  for (const card of cards.filter(
    c => columnMap.has(c.columnId)
  )) {

    const newCardId = generateId();

    await CardRepo.createCard({
      ...card,
      id: newCardId,
      columnId:
        columnMap.get(card.columnId)!,
      labels: card.labels.map(
        labelId =>
          labelMap.get(labelId) ??
          labelId
      ),
      createdAt: now(),
      updatedAt: now(),
    });
  }
}