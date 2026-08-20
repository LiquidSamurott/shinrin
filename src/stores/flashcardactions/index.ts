import { defineStore } from "pinia";

import { createState } from "./flashcardstate";
import { getters } from "./getters";

import * as DeckActions from "./deck";
import * as FlashcardActions from "./flashcards";
import * as TagActions from "./tag";
import * as Helpers from "./helpers";
import * as Initialize from "./initialize";
import * as StudyActions from "./studymode";


import { loadDatabase } from "../../db/load";

export const useFlashcardStore = defineStore("flashcards", {
  state: createState,

  getters,

  actions: {
    ...Helpers,
    ...DeckActions,
    ...FlashcardActions,
    ...TagActions,
    ...Initialize,
    ...StudyActions,

    async load() {
      const data = await loadDatabase();

      this.decks = data.decks;
      this.flashcards = data.flashcards;
      this.tags = data.tags;

      if (this.decks.length > 0) {
        this.selectedDeckId = this.decks[0].id;
      }
    },
  },
});