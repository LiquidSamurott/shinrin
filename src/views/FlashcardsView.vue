<script setup lang="ts">
import { onMounted } from "vue";

import { useFlashcardStore } from "../stores/flashcardactions";

import DeckSidebar from "../components/flashcards/DeckSidebar.vue";
import FlashcardList from "../components/flashcards/FlashcardList.vue";
import FlashcardModal from "../components/flashcards/FlashcardModal.vue";

const flashcards = useFlashcardStore();

onMounted(async () => {
  if (!flashcards.decks.length) {
    await flashcards.initialize();
  }
});
</script>

<template>
  <div class="flex h-full w-full min-w-0 flex-1 overflow-hidden bg-slate-950 text-slate-100 select-none selection:bg-blue-500/30 selection:text-blue-200">
    <!-- Sidebar Container -->
    <DeckSidebar class="shrink-0" />

    <!-- Main Flashcard Canvas -->
    <FlashcardList class="h-full min-w-0 flex-1" />

    <!-- Modals -->
    <FlashcardModal />
  </div>
</template>