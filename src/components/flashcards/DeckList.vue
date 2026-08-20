<script setup lang="ts">
import { computed } from "vue";
import { useFlashcardStore } from "../../stores/flashcardactions/index";

const flashcards = useFlashcardStore();

const cards = computed(() => {
  if (!flashcards.selectedDeckId) return [];

  return flashcards.flashcards
    .filter(card => card.deckId === flashcards.selectedDeckId)
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });
});
</script>

<template>
  <aside
    class="flex w-80 flex-col border-r border-slate-800 bg-slate-900 select-none"
  >
    <!-- Header with Card Counter -->
    <div class="flex items-center justify-between border-b border-slate-800 p-5">
      <h2 class="text-xl font-bold text-white">
        Flashcards
      </h2>
      <span
        v-if="cards.length > 0"
        class="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400"
      >
        {{ cards.length }}
      </span>
    </div>

    <!-- Flashcards List -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <button
        v-for="card in cards"
        :key="card.id"
        type="button"
        @click="flashcards.selectedFlashcardId = card.id"
        class="group w-full rounded-lg border p-3 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        :class="
          flashcards.selectedFlashcardId === card.id
            ? 'border-indigo-500/50 bg-indigo-600/10 text-white shadow-sm'
            : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
        "
      >
        <p class="line-clamp-2 text-sm font-medium leading-snug">
          {{ card.front || "Untitled Flashcard" }}
        </p>
      </button>

      <!-- Empty State -->
      <div
        v-if="cards.length === 0"
        class="flex h-48 flex-col items-center justify-center p-4 text-center"
      >
        <p class="text-sm font-medium text-slate-400">
          No flashcards found
        </p>
        <p class="mt-1 text-xs text-slate-500">
          {{ flashcards.selectedDeckId ? "Add a card to this deck to get started." : "Select a deck to view flashcards." }}
        </p>
      </div>
    </div>
  </aside>
</template>