import type { FlashcardStoreContext } from "../flashcardactions/context";

import type { FlashcardTag } from "../../types/flashcard";

import { generateId } from "../../utils/ids";
import { now } from "../../utils/date";

export function createTag(
    this: FlashcardStoreContext,
    name: string,
    color: string
) {

    const tag: FlashcardTag = {

        id: generateId(),

        deckId: this.selectedDeckId,

        name,

        color,

        createdAt: now(),

        updatedAt: now(),
    };

    this.tags.push(tag);
}