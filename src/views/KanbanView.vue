<script setup lang="ts">
import { onMounted } from "vue";

import { useKanbanStore } from "../stores/kanbanactions/kanban";

import BoardSidebar from "../components/kanban/BoardSidebar.vue";
import BoardView from "../components/kanban/BoardView.vue";
import CardModal from "../components/kanban/CardModal.vue";

const kanban = useKanbanStore();

onMounted(() => {
  if (!kanban.boards.length) {
    kanban.initialize();
  }
});
</script>

<template>
  <div class="flex h-full w-full min-w-0 flex-1 overflow-hidden bg-slate-950">
    <BoardSidebar class="shrink-0" />

    <BoardView class="h-full min-w-0 flex-1" />

    <!-- Render modal -->
    <CardModal />
  </div>
</template>