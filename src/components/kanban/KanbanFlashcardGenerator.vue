<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  Bot,
  Check,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  X,
  RefreshCw,
} from "@lucide/vue";

import { useFlashcardStore } from "../../stores/flashcardactions/index";
import { useKanbanStore } from "../../stores/kanbanactions/kanban";
import { generateFlashcards as generateFlashcardsAI } from "../../services/flashcardAi";

// Types
interface Flashcard {
  front: string;
  back: string;
}

// Props & Emits
const props = defineProps<{
  show: boolean;
  card?: any;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "success", count: number): void;
}>();

// Stores
const flashcards = useFlashcardStore();
const kanban = useKanbanStore();

// State
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const generatedCards = ref<Flashcard[]>([]);
const selectedCards = ref<Set<number>>(new Set());
const selectedDeckId = ref<number | null>(null);
const deckName = ref("");

// Clean HTML from text
function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Computed
const hasContent = computed(() => {
  const card = props.card || kanban.selectedCard;
  if (!card) return false;
  
  const contentFields = [card.description, card.content];
  return contentFields.some(field => 
    typeof field === "string" && cleanHtml(field).length > 10
  );
});

const selectedCount = computed(() => selectedCards.value.size);
const hasGeneratedCards = computed(() => generatedCards.value.length > 0);
const canGenerate = computed(() => !loading.value && hasContent.value);
const canSave = computed(() => 
  !saving.value && 
  !loading.value && 
  selectedDeckId.value !== null && 
  selectedCount.value > 0
);

// Methods
function getCardContent(): string {
  const card = props.card || kanban.selectedCard;
  if (!card) return "";

  const parts: string[] = [];
  
  // Clean each content part
  if (typeof card.title === "string" && card.title.trim()) {
    parts.push(cleanHtml(card.title));
  }
  
  if (typeof card.description === "string" && card.description.trim()) {
    parts.push(cleanHtml(card.description));
  }
  
  if (typeof card.content === "string" && card.content.trim()) {
    parts.push(cleanHtml(card.content));
  }

  return parts.join("\n\n");
}

function close(): void {
  if (loading.value || saving.value) return;
  resetState();
  emit("close");
}

function resetState(): void {
  generatedCards.value = [];
  selectedCards.value = new Set();
  selectedDeckId.value = null;
  deckName.value = "";
  error.value = "";
}

function toggleCard(index: number): void {
  const newSet = new Set(selectedCards.value);
  if (newSet.has(index)) {
    newSet.delete(index);
  } else {
    newSet.add(index);
  }
  selectedCards.value = newSet;
}

function selectAllCards(): void {
  selectedCards.value = new Set(
    generatedCards.value.map((_, index) => index)
  );
}

function deselectAllCards(): void {
  selectedCards.value = new Set();
}

async function generateFlashcards(): Promise<void> {
  if (!canGenerate.value) {
    if (!hasContent.value) {
      error.value = "This card does not contain enough content.";
    }
    return;
  }

  loading.value = true;
  error.value = "";
  
  try {
    const content = getCardContent();
    
    // Use the AI service to generate flashcards
    const result = await generateFlashcardsAI(content, 8);
    
    // Set the deck name from the AI response
    deckName.value = result.deckName;
    
    // Set the generated cards
    generatedCards.value = result.cards;
    selectAllCards();
    
    // Auto-select first deck if available
    if (flashcards.decks.length > 0 && !selectedDeckId.value) {
      selectedDeckId.value = flashcards.decks[0].id;
    }
  } catch (err) {
    console.error("Generation error:", err);
    error.value = err instanceof Error 
      ? err.message 
      : "Failed to generate flashcards. Please try again.";
  } finally {
    loading.value = false;
  }
}

async function saveFlashcards(): Promise<void> {
  if (!canSave.value) return;

  saving.value = true;
  error.value = "";

  try {
    flashcards.selectedDeckId = selectedDeckId.value!;
    
    const cardsToSave = generatedCards.value.filter(
      (_, index) => selectedCards.value.has(index)
    );

    const savePromises = cardsToSave.map(card =>
      flashcards.createFlashcard(card.front, card.back)
    );
    
    await Promise.all(savePromises);
    
    emit("success", cardsToSave.length);
    resetState();
    emit("close");
  } catch (err) {
    console.error("Save error:", err);
    error.value = err instanceof Error
      ? err.message
      : "Failed to save flashcards. Please try again.";
  } finally {
    saving.value = false;
  }
}

// Watch for deck changes
watch(() => flashcards.decks, (decks) => {
  if (decks.length > 0 && !selectedDeckId.value && hasGeneratedCards.value) {
    selectedDeckId.value = decks[0].id;
  }
}, { immediate: true });

// Reset when modal closes
watch(() => props.show, (isVisible) => {
  if (!isVisible) {
    resetState();
  }
});

// Reset when card changes
watch(() => props.card, () => {
  resetState();
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="show" 
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div class="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <!-- Header -->
            <header class="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-400">
                  <Sparkles class="h-5 w-5" />
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-white">
                    Generate Flashcards
                  </h2>
                  <p class="text-xs text-slate-500">
                    Turn card content into study material
                  </p>
                </div>
              </div>
              <button
                type="button"
                @click="close"
                :disabled="loading || saving"
                class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
                aria-label="Close modal"
              >
                <X class="h-5 w-5" />
              </button>
            </header>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6">
              <!-- Info Banner -->
              <div class="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div class="flex items-center gap-2">
                  <Bot class="h-4 w-4 text-fuchsia-400" />
                  <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    AI Generator
                  </span>
                </div>
                <p class="mt-1 text-sm leading-6 text-slate-400">
                  Generate study flashcards automatically from the selected Kanban card's content.
                </p>
              </div>

              <!-- Deck Name Preview -->
              <div v-if="deckName && hasGeneratedCards" class="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span class="text-xs text-slate-500">Suggested deck name:</span>
                <span class="ml-2 text-sm font-medium text-white">{{ deckName }}</span>
              </div>

              <!-- Generate Button -->
              <button
                v-if="!hasGeneratedCards"
                type="button"
                @click="generateFlashcards"
                :disabled="!canGenerate"
                class="flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-3 text-sm font-medium text-fuchsia-300 transition-colors hover:bg-fuchsia-500/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
                <Sparkles v-else class="h-4 w-4" />
                {{ loading ? "Generating..." : "Generate Flashcards" }}
              </button>

              <!-- No Content Message -->
              <div 
                v-if="!hasContent && !hasGeneratedCards" 
                class="mt-3 text-center text-xs text-slate-600"
              >
                Add content to the Kanban card before generating flashcards.
              </div>

              <!-- Generated Cards -->
              <div v-if="hasGeneratedCards" class="mt-4">
                <div class="mb-3 flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-semibold text-white">
                      Generated Cards
                    </h3>
                    <p class="text-xs text-slate-500">
                      {{ selectedCount }} of {{ generatedCards.length }} selected
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="selectAllCards"
                      class="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      @click="deselectAllCards"
                      class="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                      None
                    </button>
                    <button
                      type="button"
                      @click="generateFlashcards"
                      :disabled="loading"
                      class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
                    >
                      <RefreshCw v-if="loading" class="h-3.5 w-3.5 animate-spin" />
                      <RotateCcw v-else class="h-3.5 w-3.5" />
                      {{ loading ? "Regenerating..." : "Regenerate" }}
                    </button>
                  </div>
                </div>

                <!-- Card List -->
                <div class="space-y-2">
                  <button
                    v-for="(flashcard, index) in generatedCards"
                    :key="index"
                    type="button"
                    @click="toggleCard(index)"
                    class="group flex w-full gap-3 rounded-xl border p-4 text-left transition-all"
                    :class="[
                      selectedCards.has(index)
                        ? 'border-fuchsia-500/30 bg-fuchsia-500/[0.06] hover:bg-fuchsia-500/[0.10]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]',
                    ]"
                  >
                    <div
                      class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
                      :class="[
                        selectedCards.has(index)
                          ? 'border-fuchsia-400 bg-fuchsia-500 text-white'
                          : 'border-white/20 group-hover:border-white/40',
                      ]"
                    >
                      <Check v-if="selectedCards.has(index)" class="h-3.5 w-3.5" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-white">
                        {{ flashcard.front }}
                      </p>
                      <p class="mt-1 text-xs leading-5 text-slate-400 line-clamp-2">
                        {{ flashcard.back }}
                      </p>
                    </div>
                  </button>
                </div>

                <!-- Deck Selection -->
                <div class="mt-6">
                  <label class="mb-2 block text-xs font-medium text-slate-400">
                    Save to deck
                  </label>
                  <select
                    v-model="selectedDeckId"
                    class="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-fuchsia-500/40 focus:ring-1 focus:ring-fuchsia-500/20"
                  >
                    <option :value="null" disabled>Select a deck</option>
                    <option
                      v-for="deck in flashcards.decks"
                      :key="deck.id"
                      :value="deck.id"
                    >
                      {{ deck.name }}
                    </option>
                  </select>
                  <p v-if="flashcards.decks.length === 0" class="mt-2 text-xs text-amber-400/70">
                    No decks available. Create a deck first to save flashcards.
                  </p>
                </div>
              </div>

              <!-- Error Message -->
              <Transition
                enter-active-class="transition-all duration-200"
                leave-active-class="transition-all duration-150"
                enter-from-class="opacity-0 -translate-y-2"
                leave-to-class="opacity-0 -translate-y-2"
              >
                <div v-if="error" class="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">
                  {{ error }}
                </div>
              </Transition>
            </div>

            <!-- Footer -->
            <footer 
              v-if="hasGeneratedCards" 
              class="flex items-center justify-between border-t border-white/10 px-6 py-4"
            >
              <p class="text-xs text-slate-500">
                {{ selectedCount }} card{{ selectedCount !== 1 ? 's' : '' }} selected
              </p>
              <button
                type="button"
                @click="saveFlashcards"
                :disabled="!canSave"
                class="flex items-center gap-2 rounded-xl bg-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
                {{ saving ? "Saving..." : "Add to Deck" }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Primary line-clamp implementation with standard property */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  box-orient: vertical;
  overflow: hidden;
}

/* Fallback for browsers that don't support display: -webkit-box */
@supports not (display: -webkit-box) {
  .line-clamp-2 {
    display: block;
    max-height: 2.6em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* Fallback for browsers that support -webkit-box but not line-clamp */
@supports (display: -webkit-box) and (not (line-clamp: 2)) {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>