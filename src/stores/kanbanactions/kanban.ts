import { defineStore } from "pinia";

import { createState } from "./kanbanstate";
import { getters } from "./getters";

import * as Helpers from "./helpers";
import * as Boards from "./board";
import * as Columns from "./column";
import * as Cards from "./card";
import * as LabelActions from "./label";

import { loadDatabase } from "../../db/load";

export const useKanbanStore = defineStore("kanban", {
  state: createState,

  getters,

  actions: {
    ...Helpers,
    ...Boards,
    ...Columns,
    ...Cards,
    ...LabelActions,

    async load() {
      const data = await loadDatabase();

      this.boards = data.boards;
      this.columns = data.columns;
      this.cards = data.cards;
      this.labels = data.labels;

      this.selectedBoardId =
        this.boards.length > 0
          ? this.boards[0].id
          : null;
    },
  },
});