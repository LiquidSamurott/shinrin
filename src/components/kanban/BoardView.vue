<script setup lang="ts">
import { computed, ref } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { 
  Settings, 
  Plus, 
  Search, 
  Star, 
  X, 
  Columns3,
  LayoutGrid
} from "@lucide/vue";

import { useKanbanStore } from "../../stores/kanbanactions/kanban";
import type { Column as KanbanColumn } from "../../types/kanban";

import Column from "./Column.vue";
import BoardModal from "./BoardModal.vue";

const kanban = useKanbanStore();

const showBoardModal = ref(false);

function openBoardModal() {
  showBoardModal.value = true;
}

function closeBoardModal() {
  showBoardModal.value = false;
}

/** Safe column creation guard */
function handleAddColumn(title: string = "New Column") {
  if (!kanban.selectedBoard?.id) return;
  kanban.createColumn(title);
}

const columns = computed<KanbanColumn[]>({
  get: () => kanban.boardColumns,
  set: (value) => {
    kanban.reorderColumns(value);
  },
});

function onColumnChange() {
  kanban.recalculateColumnPositions();
}

/**
 * Dynamic accent color resolution:
 * Uses custom board palette if set, otherwise falls back to active theme accent variable.
 */
const activeAccentColor = computed(() => {
  return kanban.selectedBoard?.palette || 'var(--accent-500)';
});
</script>

<template>
  <section class="relative flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden bg-slate-950 text-slate-100 select-none selection:bg-[var(--accent-500)]/30 selection:text-white">
    <!-- Ambient Background Light Orbs -->
    <div 
      class="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full opacity-20 blur-[120px] transition-colors duration-500"
      :style="{ backgroundColor: activeAccentColor }"
    ></div>
    <div 
      class="pointer-events-none absolute top-1/2 right-10 h-96 w-96 rounded-full opacity-10 blur-[120px] transition-colors duration-500"
      :style="{ backgroundColor: 'var(--accent-600)' }"
    ></div>
    <div 
      class="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full opacity-15 blur-[100px] transition-colors duration-500"
      :style="{ backgroundColor: activeAccentColor }"
    ></div>

    <!-- Header Panel -->
    <header class="relative z-10 flex h-16 w-full shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/40 px-4 sm:px-8 backdrop-blur-xl">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-semibold tracking-tight text-white drop-shadow-sm">
          {{ kanban.selectedBoard?.name || 'Kanban Board' }}
        </h1>

        <span class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-medium text-slate-300 shadow-inner backdrop-blur-md">
          <Columns3 
            class="h-3.5 w-3.5 transition-colors duration-300"
            :style="{ color: activeAccentColor }"
          />
          {{ columns.length }} {{ columns.length === 1 ? 'column' : 'columns' }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Settings Button -->
        <button
          :disabled="!kanban.selectedBoard"
          @click="openBoardModal"
          class="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Settings class="h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:rotate-45" />
          <span>Board Settings</span>
        </button>

        <!-- Dynamic Accent Add Column Button -->
        <button
          :disabled="!kanban.selectedBoard"
          @click="handleAddColumn('New Column')"
          class="group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
          :style="{ 
            backgroundColor: activeAccentColor,
            boxShadow: kanban.selectedBoard 
              ? `0 10px 25px color-mix(in srgb, ${activeAccentColor} 30%, transparent)` 
              : 'none' 
          }"
        >
          <Plus class="h-4 w-4 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
          <span>Add Column</span>
        </button>
      </div>
    </header>

    <!-- Search & Filters Glass Toolbar -->
    <div class="relative z-10 shrink-0 border-b border-white/5 bg-slate-900/20 px-4 sm:px-8 py-3 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <!-- Search Input -->
        <div class="group relative flex-1 max-w-md">
          <Search 
            class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors duration-200"
            :style="{ color: kanban.search ? activeAccentColor : undefined }"
          />

          <input
            v-model="kanban.search"
            type="text"
            placeholder="Search cards, descriptions, or labels..."
            class="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 backdrop-blur-md outline-none transition duration-200 focus:bg-slate-950/80"
            :style="kanban.search ? {
              borderColor: `color-mix(in srgb, ${activeAccentColor} 50%, transparent)`,
              boxShadow: `0 0 0 1px color-mix(in srgb, ${activeAccentColor} 30%, transparent)`
            } : {}"
          />
        </div>

        <!-- Filter Buttons -->
        <div class="flex items-center gap-2">
          <button
            @click="kanban.favoritesOnly = !kanban.favoritesOnly"
            :class="[
              'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium backdrop-blur-md transition-all duration-200 active:scale-[0.98]',
              kanban.favoritesOnly
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-lg shadow-amber-950/40'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
            ]"
          >
            <Star
              class="h-4 w-4 transition-colors duration-200"
              :class="kanban.favoritesOnly ? 'fill-amber-400 text-amber-400' : 'text-slate-400'"
            />
            Favorites
          </button>

          <!-- Clear Filters -->
          <button
            v-if="kanban.search || kanban.favoritesOnly"
            @click="
              kanban.search = '';
              kanban.favoritesOnly = false;
            "
            class="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-400 backdrop-blur-md transition duration-200 hover:bg-white/10 hover:text-slate-200 active:scale-[0.98]"
          >
            <X class="h-3.5 w-3.5" />
            Clear filters
          </button>
        </div>
      </div>
    </div>

    <!-- Columns Liquid Canvas -->
    <div class="custom-scrollbar relative z-10 flex-1 w-full overflow-x-auto overflow-y-hidden">
      <!-- Empty Canvas Callout -->
      <div 
        v-if="!kanban.selectedBoard || columns.length === 0"
        class="flex h-full w-full flex-col items-center justify-center p-8 text-center"
      >
        <div class="mb-4 rounded-3xl border border-white/10 bg-slate-900/60 p-5 text-slate-400 shadow-2xl backdrop-blur-2xl">
          <LayoutGrid class="h-10 w-10 text-slate-500" />
        </div>

        <template v-if="!kanban.selectedBoard">
          <h3 class="text-lg font-bold text-slate-200">No board selected</h3>
          <p class="mt-1 max-w-sm text-sm text-slate-400">Create or select a board from the sidebar to get started.</p>
        </template>

        <template v-else>
          <h3 class="text-lg font-bold text-slate-200">No columns in this board</h3>
          <p class="mt-1 max-w-sm text-sm text-slate-400">Get started by adding your first column to organize cards and tasks.</p>
          
          <button
            @click="handleAddColumn('To Do')"
            class="mt-6 group inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-slate-950 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            :style="{ 
              backgroundColor: activeAccentColor,
              boxShadow: `0 12px 30px color-mix(in srgb, ${activeAccentColor} 40%, transparent)` 
            }"
          >
            <Plus class="h-5 w-5 stroke-[2.5]" />
            <span>Create First Column</span>
          </button>
        </template>
      </div>

      <!-- Draggable Columns -->
      <VueDraggable
        v-else
        v-model="columns"
        item-key="id"
        :animation="200"
        ghost-class="ghost-column"
        chosen-class="chosen-column"
        drag-class="drag-column"
        handle=".column-drag-handle"
        @change="onColumnChange"
        class="flex h-full min-w-full w-max items-start gap-6 p-6 sm:p-8"
      >
        <Column
          v-for="column in columns"
          :key="column.id"
          :column="column"
        />
      </VueDraggable>
    </div>

    <!-- Board Modal -->
    <BoardModal
      v-if="kanban.selectedBoard"
      :show="showBoardModal"
      :board="kanban.selectedBoard"
      @close="closeBoardModal"
    />
  </section>
</template>

<style scoped>
/* Liquid Glass Drag & Drop styles */
.ghost-column {
  opacity: 0.35;
  background-color: rgba(15, 23, 42, 0.4) !important;
  border: 2px dashed rgba(255, 255, 255, 0.25) !important;
  backdrop-filter: blur(12px);
  border-radius: 1.25rem;
}

.chosen-column {
  cursor: grabbing !important;
}

.drag-column {
  opacity: 0.95;
  transform: rotate(2deg) scale(1.02);
  box-shadow: 
    0 25px 30px -5px rgba(0, 0, 0, 0.7), 
    0 0 30px rgba(255, 255, 255, 0.1);
  cursor: grabbing !important;
}

/* Translucent glass scrollbar using theme accent variable on hover */
.custom-scrollbar::-webkit-scrollbar {
  height: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  border: 2px solid rgba(15, 23, 42, 0.4);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--accent-500) 60%, white 20%);
}
</style>