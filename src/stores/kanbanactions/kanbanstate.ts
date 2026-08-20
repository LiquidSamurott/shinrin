import type { Board, Column, Card, Label } from "../../types/kanban";

export interface KanbanState {
  boards: Board[];
  columns: Column[];
  cards: Card[];
  labels: Label[];

  selectedBoardId: number | null;
  selectedCardId: number | null;

  search: string;
  favoritesOnly: boolean;

  loading: boolean;
  error: string;
}

export const createState = (): KanbanState => ({
  boards: [],
  columns: [],
  cards: [],
  labels: [],

  selectedBoardId: null,
  selectedCardId: null,

  search: "",
  favoritesOnly: false,

  loading: false,
  error: "",
});