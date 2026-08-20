import type {
  Board,
  Column,
  Card,
  Label,
} from "../../types/kanban";

export interface KanbanStoreContext {
  boards: Board[];
  columns: Column[];
  cards: Card[];
  labels: Label[];

  selectedBoardId: number | null;
  selectedCardId: number | null;

  loading: boolean;
  error: string;

  boardColumns: Column[];
  cardsByColumn(columnId: number): Card[];

  findBoard(id: number): Board | undefined;
  findColumn(id: number): Column | undefined;
  findCard(id: number): Card | undefined;
  findLabel(id: number): Label | undefined;

  touchCard(id: number): void;

  search: string;
  favoritesOnly: boolean;

  recalculateCardPositions(columnId: number): void;
  recalculateColumnPositions(): void;
  recalculateBoardPositions(): void;

  // Label actions
}