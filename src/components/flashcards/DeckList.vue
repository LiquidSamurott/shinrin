<script setup lang="ts">
import { ref, computed } from "vue";
import { 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  FolderOpen,
  Plus
} from "@lucide/vue";
import { useFlashcardStore } from "../../stores/flashcardactions/index";

const flashcards = useFlashcardStore();

// Local state for editing
const editingDeckId = ref<number | null>(null);
const editingDeckName = ref("");
const showDeleteConfirm = ref<number | null>(null);

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

// Start renaming
function startRename(deckId: number, currentName: string) {
  editingDeckId.value = deckId;
  editingDeckName.value = currentName;
}

// Cancel renaming
function cancelRename() {
  editingDeckId.value = null;
  editingDeckName.value = "";
}

// Save renamed deck
async function saveRename() {
  if (editingDeckId.value === null) return;
  const name = editingDeckName.value.trim();
  if (!name) return;
  
  await flashcards.renameDeck(editingDeckId.value, name);
  cancelRename();
}

// Delete deck
async function deleteDeck(deckId: number) {
  await flashcards.deleteDeck(deckId);
  showDeleteConfirm.value = null;
}

// Handle Enter key for rename
function handleRenameKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    saveRename();
  } else if (event.key === "Escape") {
    cancelRename();
  }
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
          v-if="flashcards.decks.length === 0"
          @click="flashcards.createDeck('New Deck')"
          class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
        >
          <Plus class="inline h-3.5 w-3.5 mr-1" />
          New Deck
        </button>
      </div>

      <!-- Deck Selector / Current Deck -->
      <div class="relative">
        <!-- Current deck display with actions -->
        <div v-if="flashcards.selectedDeckId" class="flex items-center gap-2">
          <!-- Rename input or display -->
          <div v-if="editingDeckId === flashcards.selectedDeckId" class="flex-1">
            <div class="flex items-center gap-1">
              <input
                v-model="editingDeckName"
                @keydown="handleRenameKeydown"
                @blur="saveRename"
                class="flex-1 rounded-lg border border-indigo-500/30 bg-slate-800 px-2 py-1 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="Deck name..."
                autofocus
              />
              <button
                @click="saveRename"
                class="rounded-lg p-1 text-emerald-400 transition hover:bg-emerald-500/20"
                title="Save"
              >
                <Check class="h-4 w-4" />
              </button>
              <button
                @click="cancelRename"
                class="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                title="Cancel"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Deck display with actions -->
          <div v-else class="flex flex-1 items-center gap-2">
            <FolderOpen class="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <span class="flex-1 truncate text-sm font-medium text-white">
              {{ currentDeckName }}
            </span>
            <div class="flex items-center gap-0.5">
              <button
                @click="startRename(flashcards.selectedDeckId!, currentDeckName)"
                class="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                title="Rename deck"
              >
                <Pencil class="h-3.5 w-3.5" />
              </button>
              <button
                @click="showDeleteConfirm = flashcards.selectedDeckId"
                class="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-400"
                title="Delete deck"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- No deck selected -->
        <div v-else class="text-sm text-slate-400">
          No deck selected
        </div>
      </div>

      <!-- Delete confirmation -->
      <div
        v-if="showDeleteConfirm !== null"
        class="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3"
      >
        <p class="text-sm text-rose-300">
          Delete "{{ currentDeckName }}" and all its flashcards?
        </p>
        <div class="mt-2 flex items-center gap-2">
          <button
            @click="deleteDeck(showDeleteConfirm)"
            class="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-400"
          >
            Delete
          </button>
          <button
            @click="showDeleteConfirm = null"
            class="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </button>
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
  </aside>
</template>