<script setup lang="ts">
import { ref, computed } from "vue";
import { 
  FolderOpen,
  Plus,
  Settings
} from "@lucide/vue";
import { useFlashcardStore } from "../../stores/flashcardactions/index";
import DeckSettingsModal from "./DeckSettingsModal.vue";

const flashcards = useFlashcardStore();

// Modal State
const isModalOpen = ref(false);
const activeModalDeckId = ref<number | null>(null);

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

// Get the current deck name
const currentDeckName = computed(() => {
  const deck = flashcards.decks.find(d => d.id === flashcards.selectedDeckId);
  return deck?.name || "Select a deck";
});

// Open Modal Helper
function openDeckSettings(deckId: number) {
  activeModalDeckId.value = deckId;
  isModalOpen.value = true;
}
</script>

<template>
  <aside
    class="flex w-80 flex-col border-r border-slate-800 bg-slate-900 select-none"
  >
    <!-- Header with Deck Selector and Actions -->
    <div class="border-b border-slate-800 p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xl font-bold text-white">
          Flashcards
        </h2>
        <button
          @click="flashcards.createDeck('New Deck')"
          class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
        >
          <Plus class="inline h-3.5 w-3.5 mr-1" />
          New Deck
        </button>
      </div>

      <!-- Decks List Bar -->
      <div
        v-if="flashcards.decks.length > 0"
        class="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        <div
          v-for="d in flashcards.decks"
          :key="d.id"
          class="group flex shrink-0 items-center rounded-md transition"
          :class="
            flashcards.selectedDeckId === d.id
              ? 'bg-indigo-600'
              : 'bg-slate-800'
          "
        >
          <!-- Select Deck -->
          <button
            type="button"
            @click="flashcards.selectedDeckId = d.id"
            class="rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition"
            :class="
              flashcards.selectedDeckId === d.id
                ? 'text-white'
                : 'text-slate-400 hover:text-white'
            "
          >
            {{ d.name }}
          </button>

          <!-- Edit Deck Settings Button -->
          <button
            type="button"
            @click.stop="openDeckSettings(d.id)"
            class="mr-0.5 rounded p-1 text-slate-400 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
            title="Deck Settings"
          >
            <Settings class="h-3 w-3" />
          </button>
        </div>
      </div>

      <!-- Current Deck Display -->
      <div class="relative">
        <div v-if="flashcards.selectedDeckId" class="flex items-center justify-between">
          <div class="flex flex-1 items-center gap-2 truncate pr-2">
            <FolderOpen class="h-4 w-4 text-indigo-400 shrink-0" />
            <span class="truncate text-sm font-medium text-white">
              {{ currentDeckName }}
            </span>
          </div>

          <div class="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              @click="openDeckSettings(flashcards.selectedDeckId)"
              class="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              title="Deck Settings"
            >
              <Settings class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div v-else class="text-sm text-slate-400">
          No deck selected
        </div>
      </div>
    </div>

    <!-- Card Counter -->
    <div class="flex items-center justify-between border-b border-slate-800 px-5 py-2.5">
      <span class="text-xs font-medium text-slate-400">
        {{ cards.length }} card{{ cards.length !== 1 ? 's' : '' }}
      </span>
      <button
        v-if="flashcards.selectedDeckId"
        @click="flashcards.createFlashcard('', '')"
        class="rounded-lg bg-indigo-600/20 px-2.5 py-1 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600/30"
      >
        + Add Card
      </button>
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

    <!-- Deck Settings Modal -->
    <DeckSettingsModal
      :is-open="isModalOpen"
      :deck-id="activeModalDeckId"
      @close="isModalOpen = false"
    />
  </aside>
</template>