import type { KanbanState } from "./kanbanstate";
import type { Board, Column, Card } from "../../types/kanban";

export const getters = {
  selectedBoard(state: KanbanState): Board | undefined {
    return state.boards.find(
      board => board.id === state.selectedBoardId
    );
  },

  selectedCard(state: KanbanState): Card | undefined {
    return state.cards.find(
      card => card.id === state.selectedCardId
    );
  },

  boardColumns(state: KanbanState): Column[] {
    return state.columns
      .filter(column => column.boardId === state.selectedBoardId)
      .sort((a, b) => a.position - b.position);
  },

  cardsByColumn:
    (state: KanbanState) =>
    (columnId: number): Card[] => {

      const query = state.search
        .trim()
        .toLowerCase();

      return state.cards
        .filter(card => {

          if (card.columnId !== columnId)
            return false;

          if (
            state.favoritesOnly &&
            !card.favorite
          )
            return false;

          if (!query)
            return true;

          if (
            card.title
              .toLowerCase()
              .includes(query)
          )
            return true;

          if (
            card.description
              .toLowerCase()
              .includes(query)
          )
            return true;

          return state.labels
            .filter(label =>
              card.labels.includes(label.id)
            )
            .some(label =>
              label.name
                .toLowerCase()
                .includes(query)
            );
        })
        .sort((a, b) => a.position - b.position);
    },
};