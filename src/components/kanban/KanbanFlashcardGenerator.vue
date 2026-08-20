<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Bot,
  Check,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  X,
} from "@lucide/vue";

import { useFlashcardStore } from "../../stores/flashcardactions/index";
import { useKanbanStore } from "../../stores/kanbanactions/kanban";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

const flashcards = useFlashcardStore();
const kanban = useKanbanStore();

const loading = ref(false);
const saving = ref(false);
const error = ref("");

const generatedCards = ref<
  {
    front: string;
    back: string;
  }[]
>([]);

const selectedCards = ref(new Set<number>());

const selectedDeckId = ref<number | null>(null);

const hasContent = computed(() => {
  const card = kanban.selectedCard;

  if (!card) return false;

  if (typeof card.description === "string" && card.description.trim()) {
    return true;
  }

  if (typeof card.content === "string" && card.content.trim()) {
    return true;
  }

  return false;
});

function getCardContent() {
  const card = kanban.selectedCard;

  if (!card) return "";

  const parts: string[] = [];

  if (typeof card.title === "string" && card.title.trim()) {
    parts.push(card.title.trim());
  }

  if (
    typeof card.description === "string" &&
    card.description.trim()
  ) {
    parts.push(card.description.trim());
  }

  if (
    typeof card.content === "string" &&
    card.content.trim()
  ) {
    parts.push(card.content.trim());
  }

  return parts.join("\n\n");
}

function close() {
  if (loading.value || saving.value) return;

  emit("close");
}

function toggleCard(index: number) {
  if (selectedCards.value.has(index)) {
    selectedCards.value.delete(index);
  } else {
    selectedCards.value.add(index);
  }

  selectedCards.value = new Set(selectedCards.value);
}

async function generateFlashcards() {
  if (!hasContent.value) {
    error.value = "This card does not contain enough content.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const content = getCardContent();

    /*
     * Replace this section with your Ollama / local AI
     * generation call.
     *
     * Expected result:
     *
     * [
     *   {
     *     front: "Question",
     *     back: "Answer"
     *   }
     * ]
     */

    const result = await generateWithAI(content);

    generatedCards.value = result;

    selectedCards.value = new Set(
      result.map((_, index) => index)
    );
  } catch (err) {
    console.error(err);

    error.value =
      err instanceof Error
        ? err.message
        : "Failed to generate flashcards.";
  } finally {
    loading.value = false;
  }
}

async function generateWithAI(
  content: string
): Promise<
  {
    front: string;
    back: string;
  }[]
> {
  /*
   * Temporary implementation.
   *
   * Replace this with your actual AI/Ollama request.
   */

  const sentences = content
    .split(/[.!?]\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  return sentences.slice(0, 5).map(sentence => ({
    front: `What is the key idea of: "${sentence.slice(0, 80)}..."?`,
    back: sentence,
  }));
}

async function saveFlashcards() {
  if (
    !selectedDeckId.value ||
    selectedCards.value.size === 0
  ) {
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    flashcards.selectedDeckId = selectedDeckId.value;

    const cardsToSave = generatedCards.value.filter(
      (_, index) => selectedCards.value.has(index)
    );

    for (const card of cardsToSave) {
      await flashcards.createFlashcard(
        card.front,
        card.back
      );
    }

    window.alert(
      `${cardsToSave.length} flashcard${
        cardsToSave.length === 1 ? "" : "s"
      } uploaded to the deck.`
    );

    generatedCards.value = [];
    selectedCards.value = new Set();
    selectedDeckId.value = null;

    emit("close");
  } catch (err) {
    console.error(err);

    error.value =
      err instanceof Error
        ? err.message
        : "Failed to save flashcards.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
    <div class="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-400">
            <Sparkles class="h-5 w-5" />
          </div>
          <div>
            <h2 class="font-semibold text-white">Generate Flashcards</h2>
            <p class="text-xs text-slate-500">Turn this card's content into study material</p>
          </div>
        </div>
        <button type="button" @click="close" :disabled="loading || saving" class="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white disabled:opacity-40">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div class="mb-2 flex items-center gap-2">
            <Bot class="h-4 w-4 text-fuchsia-400" />
            <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">AI Generator</span>
          </div>
          <p class="text-sm leading-6 text-slate-400">
            Generate study flashcards automatically from the selected Kanban card's content.
          </p>
        </div>

        <button v-if="!generatedCards.length" type="button" @click="generateFlashcards" :disabled="loading || !hasContent" class="flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-3 text-sm font-medium text-fuchsia-300 transition hover:bg-fuchsia-500/15 disabled:cursor-not-allowed disabled:opacity-40">
          <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
          <Sparkles v-else class="h-4 w-4" />
          {{ loading ? "Generating..." : "Generate Flashcards" }}
        </button>

        <div v-if="!hasContent && !generatedCards.length" class="mt-3 text-center text-xs text-slate-600">
          Add some content to the Kanban card before generating flashcards.
        </div>

        <div v-if="generatedCards.length">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-white">Generated Cards</h3>
              <p class="text-xs text-slate-500">Select the cards you want to save.</p>
            </div>
            <button type="button" @click="generateFlashcards" :disabled="loading" class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white">
              <RotateCcw class="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>

          <div class="space-y-2">
            <button v-for="(flashcard, index) in generatedCards" :key="index" type="button" @click="toggleCard(index)" class="flex w-full gap-3 rounded-xl border p-4 text-left transition" :class="selectedCards.has(index) ? 'border-fuchsia-500/30 bg-fuchsia-500/[0.06]' : 'border-white/10 bg-white/[0.02] opacity-60'">
              <div class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border" :class="selectedCards.has(index) ? 'border-fuchsia-400 bg-fuchsia-500 text-white' : 'border-white/20'">
                <Check v-if="selectedCards.has(index)" class="h-3.5 w-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-white">{{ flashcard.front }}</p>
                <p class="mt-2 text-xs leading-5 text-slate-400">{{ flashcard.back }}</p>
              </div>
            </button>
          </div>

          <div class="mt-5">
            <label class="mb-2 block text-xs font-medium text-slate-400">Save to deck</label>
            <select v-model="selectedDeckId" class="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-fuchsia-500/40">
              <option :value="null" disabled>Select a deck</option>
              <option v-for="deck in flashcards.decks" :key="deck.id" :value="deck.id">{{ deck.name }}</option>
            </select>
          </div>
        </div>

        <div v-if="error" class="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">
          {{ error }}
        </div>
      </div>

      <div v-if="generatedCards.length" class="flex items-center justify-between border-t border-white/10 px-6 py-4">
        <p class="text-xs text-slate-500">{{ selectedCards.size }} selected</p>
        <button type="button" @click="saveFlashcards" :disabled="saving || loading || !selectedDeckId || selectedCards.size === 0" class="flex items-center gap-2 rounded-xl bg-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-40">
          <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
          {{ saving ? "Saving..." : "Add to Deck" }}
        </button>
      </div>
    </div>
  </div>
</template>
