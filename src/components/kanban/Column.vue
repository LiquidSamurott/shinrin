<script setup lang="ts">
import { ref, computed } from "vue";
import { 
  ChevronUp, 
  ChevronDown, 
  MoreVertical, 
  Plus 
} from "@lucide/vue";
import type { Column as KanbanColumn } from "../../types/kanban";
import type { Card as KanbanCard } from "../../types/kanban";
import { useKanbanStore } from "../../stores/kanbanactions/kanban";
import { VueDraggable } from "vue-draggable-plus";

import Card from "./Card.vue";
import CardModal from "./CardModal.vue";
import ColumnModal from "./ColumnModal.vue";

const props = defineProps<{
  column: KanbanColumn;
}>();

const kanban = useKanbanStore();

const newCard = ref("");

const showColumnModal = ref(false);

const cards = computed<KanbanCard[]>({
  get: () => kanban.cardsByColumn(props.column.id),

  set: (value) => {
    kanban.reorderCards(props.column.id, value);
  },
});

function addCard() {
  const title = newCard.value.trim();

  if (!title) return;

  kanban.createCard(props.column.id, title);

  newCard.value = "";
}

function onChange() {
  kanban.recalculateCardPositions(props.column.id);
}

function openCard(card: KanbanCard) {
  kanban.openCard(card.id);
}

function openColumnModal() {
  showColumnModal.value = true;
}

function closeColumnModal() {
  showColumnModal.value = false;
}
</script>

<template>
  <div
    class="
      flex
      w-80
      min-w-80
      shrink-0
      flex-col
      overflow-hidden
      rounded-2xl
      border
      border-white/10
      bg-slate-900/60
      shadow-xl
      shadow-slate-950/40
      backdrop-blur-xl
      transition-all
      duration-300
      ease-in-out
    "
    :class="column.collapsed ? 'h-16 min-h-16' : 'h-auto max-h-[calc(100vh-8rem)]'"
  >
    <!-- Column Header -->
    <div
      class="
        flex
        items-center
        justify-between
        border-b
        border-white/10
        px-4
        py-3.5
        backdrop-blur-md
      "
      :style="{
        backgroundColor: column.color ? column.color + '25' : 'rgba(15, 23, 42, 0.6)'
      }"
    >
      <!-- Expanded State -->
      <template v-if="!column.collapsed">
        <div class="min-w-0 flex-1">
          <h2 class="truncate font-semibold text-slate-100">
            {{ column.title }}
          </h2>

          <p class="text-xs font-medium text-slate-400">
            {{ cards.length }} {{ cards.length === 1 ? 'card' : 'cards' }}
          </p>
        </div>

        <div class="ml-2 flex items-center gap-1 shrink-0">
          <button
            @click="kanban.toggleColumnCollapse(column.id)"
            title="Collapse Column"
            class="
              rounded-xl
              border
              border-white/5
              bg-white/5
              p-2
              text-slate-300
              transition-all
              duration-200
              hover:border-white/15
              hover:bg-white/10
              hover:text-white
              active:scale-95
            "
          >
            <ChevronUp class="h-4 w-4" />
          </button>

          <button
            @click="openColumnModal"
            title="Column Options"
            class="
              rounded-xl
              border
              border-white/5
              bg-white/5
              p-2
              text-slate-300
              transition-all
              duration-200
              hover:border-white/15
              hover:bg-white/10
              hover:text-white
              active:scale-95
            "
          >
            <MoreVertical class="h-4 w-4" />
          </button>
        </div>
      </template>

      <!-- Collapsed State -->
      <template v-else>
        <div class="flex w-full items-center justify-between">
          <button
            @click="kanban.toggleColumnCollapse(column.id)"
            title="Expand Column"
            class="
              rounded-xl
              border
              border-white/5
              bg-white/5
              p-2
              text-slate-300
              transition-all
              duration-200
              hover:border-white/15
              hover:bg-white/10
              hover:text-white
              active:scale-95
            "
          >
            <ChevronDown class="h-4 w-4" />
          </button>

          <div class="flex-1 select-none truncate text-center text-sm font-semibold tracking-wide text-slate-100 px-2">
            {{ column.title }}
            <span class="ml-1 text-xs text-slate-400 font-normal">
              ({{ cards.length }})
            </span>
          </div>

          <button
            @click="openColumnModal"
            title="Column Options"
            class="
              rounded-xl
              border
              border-white/5
              bg-white/5
              p-2
              text-slate-300
              transition-all
              duration-200
              hover:border-white/15
              hover:bg-white/10
              hover:text-white
              active:scale-95
            "
          >
            <MoreVertical class="h-4 w-4" />
          </button>
        </div>
      </template>
    </div>

    <!-- Cards List Container -->
    <VueDraggable
      v-show="!column.collapsed"
      v-model="cards"
      item-key="id"
      :group="{
        name: 'cards',
        pull: true,
        put: true
      }"
      :animation="200"
      ghost-class="opacity-40"
      chosen-class="scale-[1.02]"
      drag-class="rotate-1"
      class="
        flex
        flex-1
        flex-col
        gap-3
        overflow-y-auto
        p-4
      "
      @change="onChange"
    >
      <Card
        v-for="card in cards"
        :key="card.id"
        :card="card"
        @click="openCard(card)"
      />
    </VueDraggable>

    <!-- Column Quick Create Footer -->
    <div
      v-show="!column.collapsed"
      class="
        border-t
        border-white/10
        bg-slate-950/30
        p-4
        backdrop-blur-md
      "
    >
      <input
        v-model="newCard"
        placeholder="Card title..."
        @keyup.enter="addCard"
        class="
          accent-border-focus
          mb-2.5
          w-full
          rounded-xl
          border
          border-white/10
          bg-slate-950/50
          px-3.5
          py-2
          text-sm
          text-slate-100
          placeholder:text-slate-500
          outline-none
          backdrop-blur-md
          transition-all
          duration-200
          focus:bg-slate-950/80
        "
      />

      <button
        @click="addCard"
        class="
          accent-bg
          accent-bg-hover
          accent-glow
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          py-2
          text-sm
          font-semibold
          text-slate-950
          shadow-md
          transition-all
          duration-200
          active:scale-[0.98]
        "
      >
        <Plus class="h-4 w-4 stroke-[2.5]" />
        <span>Add Card</span>
      </button>
    </div>

    <!-- Modals -->
    <ColumnModal
      :show="showColumnModal"
      :column="column"
      @close="closeColumnModal"
    />

    <CardModal />
  </div>
</template>