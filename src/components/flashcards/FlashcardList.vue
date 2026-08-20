<script setup lang="ts">
import { computed } from "vue";
import { 
  FileText, 
  Sparkles, 
  Clock, 
  Trash2 
} from "@lucide/vue";

import { useFlashcardStore } from "../../stores/flashcardactions/index";

const flashcards = useFlashcardStore();

const cards = computed(() =>
  flashcards.flashcards
    .filter(
      card => card.deckId === flashcards.selectedDeckId
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
);

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim() || "Empty Card";
}

function selectCard(cardId: number) {
  flashcards.selectedFlashcardId = cardId;
}

async function deleteCard(cardId: number) {
  if (!confirm("Delete this flashcard?")) return;
  await flashcards.deleteFlashcard(cardId);
}
</script>

<template>
  <aside class="relative flex h-full w-80 flex-col overflow-hidden border-r border-white/10 bg-slate-950/60 backdrop-blur-xl text-slate-100 select-none">
    <!-- Ambient Background Light Glow -->
    <div class="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-[70px]"></div>

    <!-- Sidebar Header -->
    <div class="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/30 px-6 py-5 backdrop-blur-md">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-400 shadow-inner">
          <FileText class="h-4 w-4" />
        </div>

        <div>
          <h2 class="text-base font-semibold tracking-tight text-white drop-shadow-sm">
            Cards
          </h2>
          <p class="text-xs text-slate-400">
            {{ cards.length }} {{ cards.length === 1 ? 'card' : 'cards' }} in deck
          </p>
        </div>
      </div>
    </div>

    <!-- Flashcards Scroll List -->
    <div class="custom-scrollbar relative z-10 flex-1 space-y-2 overflow-y-auto p-3">
      <!-- Empty State -->
      <div 
        v-if="cards.length === 0"
        class="flex flex-col items-center justify-center p-8 text-center text-slate-500"
      >
        <Sparkles class="h-8 w-8 text-slate-600/60" />
        <p class="mt-2 text-xs font-medium">No cards in this deck yet</p>
      </div>

      <!-- Card Items -->
      <button
        v-for="card in cards"
        :key="card.id"
        @click="selectCard(card.id)"
        :class="[
          'group relative flex w-full flex-col text-left rounded-xl border p-3.5 backdrop-blur-md transition-all duration-200 active:scale-[0.98]',
          flashcards.selectedFlashcardId === card.id
            ? 'border-emerald-400/40 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-lg shadow-emerald-950/50 ring-1 ring-white/20'
            : 'border-white/5 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:bg-white/[0.07] hover:text-white'
        ]"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="line-clamp-2 text-xs font-semibold tracking-tight text-white">
            {{ stripHtml(card.front) }}
          </span>

          <!-- Delete Action Icon -->
          <button
            @click.stop="deleteCard(card.id)"
            class="rounded-md p-1 text-slate-400 opacity-0 transition-all duration-150 hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
            title="Delete card"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- Back Preview snippet if available -->
        <p 
          v-if="card.back"
          class="mt-1.5 line-clamp-1 text-[11px] opacity-75"
          :class="flashcards.selectedFlashcardId === card.id ? 'text-emerald-100' : 'text-slate-400'"
        >
          {{ stripHtml(card.back) }}
        </p>

        <!-- Footer Tag / Timestamp -->
        <div class="mt-2.5 flex items-center gap-1.5 text-[10px] opacity-60">
          <Clock class="h-3 w-3" />
          <span>{{ new Date(card.createdAt).toLocaleDateString() }}</span>
        </div>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Custom Translucent Scrollbar */
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