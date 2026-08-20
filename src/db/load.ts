import * as BoardRepo from "./boardRepository";
import * as ColumnRepo from "./columnRepository";
import * as CardRepo from "./cardRepository";
import * as LabelRepo from "./labelRepository";

import * as DeckRepo from "./deckRepository";
import * as FlashcardRepo from "./flashCardRepository";
import * as FlashcardTagRepo from "./flashCardTagRepository";

export async function loadDatabase() {
  return {
    // Kanban
    boards: await BoardRepo.getBoards(),
    columns: await ColumnRepo.getColumns(),
    cards: await CardRepo.getCards(),
    labels: await LabelRepo.getLabels(),

    // Flashcards
    decks: await DeckRepo.getDecks(),
    flashcards: await FlashcardRepo.getFlashcards(),
    tags: await FlashcardTagRepo.getTags(),
  };
}