<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { VueDraggable } from "vue-draggable-plus";
import { 
  Layers, 
  Play, 
  Plus, 
  Tag, 
  Trash2, 
  Star, 
  Clock, 
  Link as LinkIcon, 
  Download, 
  Upload, 
  GripVertical 
} from "@lucide/vue";

import { useFlashcardStore } from "../../stores/flashcardactions";
import { useKanbanStore } from "../../stores/kanbanactions/kanban";
import { useTheme } from "../../composables/useTheme";

import type { Deck } from "../../types/flashcard";

const flashcards = useFlashcardStore();
const kanban = useKanbanStore();
const router = useRouter();

// Theme system hook
useTheme();

const newDeck = ref("");

const decks = computed<Deck[]>({
  get: () =>
    [...flashcards.decks].sort(
      (a, b) => a.position - b.position
    ),

  set: async (value) => {
    await flashcards.reorderDecks(value);
  },
});

async function addDeck() {
  const name = newDeck.value.trim();

  if (!name) return;

  await flashcards.createDeck(
    name,
    kanban.selectedBoardId ?? null
  );

  newDeck.value = "";
}

function selectDeck(deck: Deck) {
  flashcards.selectDeck(deck.id);
}

async function deleteDeck(deck: Deck) {
  if (!confirm(`Delete "${deck.name}"?`)) return;

  await flashcards.deleteDeck(deck.id);
}

function studyDeck() {
  if (!flashcards.selectedDeckId) return;

  flashcards.startStudy();

  router.push("/flashcards/studymode");
}

function createFlashcard() {
  if (!flashcards.selectedDeckId) return;

  flashcards.createFlashcard(
    "New Question"
  );
}

function manageTags() {
  if (!flashcards.selectedDeckId) return;

  console.log("Manage tags");
}

function importDeck() {
  console.log("Import deck");
}

function exportDeck() {
  console.log("Export deck");
}

/* Helpers for Stats / Badges */
function cardCount(deckId: number) {
  return flashcards.flashcards.filter(
    card => card.deckId === deckId
  ).length;
}

function favoriteCount(deckId: number) {
  return flashcards.flashcards.filter(
    card => card.deckId === deckId && card.favorite
  ).length;
}

function dueCount(deckId: number) {
  const now = new Date();
  return flashcards.flashcards.filter(
    card => card.deckId === deckId && card.dueDate && new Date(card.dueDate) <= now
  ).length;
}
</script>

<template>
  <aside class="relative flex h-full w-80 flex-col overflow-hidden border-r border-white/10 bg-slate-950/60 backdrop-blur-xl text-slate-100 select-none">
    <!-- Ambient Theme Refraction Glow -->
    <div 
      class="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full opacity-15 blur-[80px] transition-colors duration-500"
      :style="{ backgroundColor: 'var(--accent-500)' }"
    ></div>

    <!-- Header -->
    <div class="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/30 px-6 py-5 backdrop-blur-md">
      <div class="flex items-center gap-2.5">
        <div 
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 shadow-inner transition-colors duration-300"
          :style="{ color: 'var(--accent-400)' }"
        >
          <Layers class="h-4 w-4" />
        </div>
        <div>
          <h2 class="text-base font-semibold tracking-tight text-white drop-shadow-sm">
            Decks
          </h2>
          <p class="text-xs text-slate-400">
            {{ decks.length }} {{ decks.length === 1 ? 'deck' : 'decks' }} total
          </p>
        </div>
      </div>
    </div>

    <!-- Action Toolbar -->
    <div class="relative z-10 space-y-2 border-b border-white/10 bg-slate-900/20 p-3 backdrop-blur-md">
      <button
        type="button"
        @click="studyDeck"
        :disabled="!flashcards.selectedDeckId"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        :style="{
          backgroundColor: 'var(--accent-600)',
          boxShadow: '0 8px 20px -4px color-mix(in srgb, var(--accent-600) 50%, transparent)'
        }"
      >
        <Play class="h-4 w-4 fill-current" />
        <span>Study Deck</span>
      </button>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="createFlashcard"
          :disabled="!flashcards.selectedDeckId"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus class="h-3.5 w-3.5" :style="{ color: 'var(--accent-400)' }" />
          <span>New Card</span>
        </button>

        <button
          type="button"
          @click="manageTags"
          :disabled="!flashcards.selectedDeckId"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Tag class="h-3.5 w-3.5 text-blue-400" />
          <span>Tags</span>
        </button>
      </div>
    </div>

    <!-- Deck List -->
    <VueDraggable
      v-model="decks"
      item-key="id"
      :animation="200"
      ghost-class="ghost-deck"
      chosen-class="chosen-deck"
      drag-class="drag-deck"
      handle=".deck-drag-handle"
      class="custom-scrollbar relative z-10 flex-1 space-y-2.5 overflow-y-auto p-3"
    >
      <div
        v-for="deck in decks"
        :key="deck.id"
        @click="selectDeck(deck)"
        :class="[
          'group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer backdrop-blur-md',
          flashcards.selectedDeckId === deck.id
            ? 'border-white/20 text-white shadow-lg ring-1 ring-white/20'
            : 'border-white/5 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:bg-white/[0.07] hover:text-white'
        ]"
        :style="
          flashcards.selectedDeckId === deck.id
            ? {
                backgroundColor: 'color-mix(in srgb, var(--accent-600) 80%, rgba(15, 23, 42, 0.8))',
                boxShadow: '0 8px 20px -4px color-mix(in srgb, var(--accent-600) 40%, transparent)'
              }
            : {}
        "
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold tracking-tight text-white">
              {{ deck.name }}
            </h3>

            <p
              v-if="deck.description"
              class="mt-1 line-clamp-2 text-xs text-slate-300/80"
            >
              {{ deck.description }}
            </p>
          </div>

          <div class="flex items-center gap-1">
            <!-- Delete Button -->
            <button
              type="button"
              @click.stop="deleteDeck(deck)"
              class="rounded-lg p-1 text-slate-400 opacity-0 transition-all duration-150 hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
              title="Delete deck"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>

            <!-- Drag Handle -->
            <button
              type="button"
              class="deck-drag-handle p-1 text-slate-500 opacity-0 transition-opacity duration-150 hover:text-slate-300 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
              :class="{ '!opacity-100 text-white/70': flashcards.selectedDeckId === deck.id }"
            >
              <GripVertical class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <!-- Badges Bar -->
        <div class="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
          <!-- Card Count -->
          <span class="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300 backdrop-blur-md">
            {{ cardCount(deck.id) }} cards
          </span>

          <!-- Favorites Count -->
          <span
            v-if="favoriteCount(deck.id) > 0"
            class="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-amber-300"
          >
            <Star class="h-3 w-3 fill-amber-400 text-amber-400" />
            {{ favoriteCount(deck.id) }}
          </span>

          <!-- Due Count -->
          <span
            v-if="dueCount(deck.id) > 0"
            class="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-rose-300"
          >
            <Clock class="h-3 w-3 text-rose-400" />
            {{ dueCount(deck.id) }} Due
          </span>

          <!-- Linked Board Badge -->
          <span
            v-if="deck.boardId"
            class="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 text-cyan-300"
          >
            <LinkIcon class="h-3 w-3 text-cyan-400" />
            Linked
          </span>
        </div>
      </div>
    </VueDraggable>

    <!-- Footer -->
    <div class="relative z-10 shrink-0 space-y-2 border-t border-white/10 bg-slate-900/30 p-4 backdrop-blur-md">
      <input
        v-model="newDeck"
        placeholder="Deck name..."
        @keyup.enter="addDeck"
        class="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 backdrop-blur-md outline-none transition duration-200 focus:border-white/20 focus:bg-slate-950 focus:ring-2"
        :style="{ '--tw-ring-color': 'var(--accent-500)' }"
      />

      <button
        type="button"
        @click="addDeck"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
        :style="{
          backgroundColor: 'var(--accent-600)',
          boxShadow: '0 8px 20px -4px color-mix(in srgb, var(--accent-600) 40%, transparent)'
        }"
      >
        <Plus class="h-4 w-4" />
        <span>Create Deck</span>
      </button>

      <div class="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          @click="importDeck"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98]"
        >
          <Upload class="h-3.5 w-3.5 text-slate-400" />
          <span>Import</span>
        </button>

        <button
          type="button"
          @click="exportDeck"
          :disabled="!flashcards.selectedDeckId"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download class="h-3.5 w-3.5 text-slate-400" />
          <span>Export</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Liquid Glass Drag & Drop styles */
.ghost-deck {
  opacity: 0.35;
  background-color: rgba(15, 23, 42, 0.4) !important;
  border: 1px dashed rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(8px);
}

.chosen-deck {
  cursor: grabbing !important;
}

.drag-deck {
  opacity: 0.95;
  transform: scale(1.02) rotate(1deg);
  box-shadow: 
    0 15px 25px -5px rgba(0, 0, 0, 0.5), 
    0 0 15px color-mix(in srgb, var(--accent-500) 30%, transparent);
  cursor: grabbing !important;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>