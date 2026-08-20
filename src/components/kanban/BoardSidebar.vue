<script setup lang="ts">
import { ref, computed } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import {
  LayoutGrid,
  Plus,
  GripVertical,
} from "@lucide/vue";

import { useKanbanStore } from "../../stores/kanbanactions/kanban";
import type { Board } from "../../types/kanban";

const kanban = useKanbanStore();

const newBoard = ref("");

/* ==========================================
   Boards
========================================== */

const boards = computed<Board[]>({
  get: () =>
    [...kanban.boards].sort(
      (a, b) => a.position - b.position
    ),

  set: (value) => {
    kanban.reorderBoards(value);
  },
});

/* ==========================================
   Board Reordering
========================================== */

function onBoardChange() {
  kanban.recalculateBoardPositions();
}

/* ==========================================
   Create Board
========================================== */

function addBoard() {
  const name = newBoard.value.trim();

  if (!name) return;

  kanban.createBoard(name);

  newBoard.value = "";
}
</script>

<template>
  <aside
    class="
      relative
      flex
      h-full
      w-72
      flex-col
      overflow-hidden
      border-r
      border-white/10
      bg-slate-950/60
      text-slate-100
      backdrop-blur-xl
      select-none
    "
  >
    <!-- ==========================================
         Ambient Accent Glow
    =========================================== -->

    <div
      class="
        pointer-events-none
        absolute
        -left-12
        -top-12
        h-48
        w-48
        rounded-full
        blur-[80px]
      "
      style="
        background: color-mix(
          in srgb,
          var(--accent-500) 12%,
          transparent
        );
      "
    ></div>

    <div
      class="
        pointer-events-none
        absolute
        -bottom-20
        -right-20
        h-56
        w-56
        rounded-full
        blur-[100px]
      "
      style="
        background: color-mix(
          in srgb,
          var(--accent-600) 8%,
          transparent
        );
      "
    ></div>

    <!-- ==========================================
         Header
    =========================================== -->

    <div
      class="
        relative
        z-10
        flex
        shrink-0
        items-center
        justify-between
        border-b
        border-white/10
        bg-slate-900/30
        px-6
        py-5
        backdrop-blur-md
      "
    >
      <div class="flex items-center gap-2.5">

        <!-- Icon -->

        <div
          class="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            border
            border-white/10
            bg-white/5
            shadow-inner
          "
          style="color: var(--accent-400)"
        >
          <LayoutGrid class="h-4 w-4" />
        </div>

        <!-- Title -->

        <div>
          <h2
            class="
              text-base
              font-semibold
              tracking-tight
              text-white
              drop-shadow-sm
            "
          >
            Boards
          </h2>

          <p class="text-xs text-slate-400">
            {{ boards.length }}
            {{ boards.length === 1 ? "board" : "boards" }}
            total
          </p>
        </div>
      </div>
    </div>

    <!-- ==========================================
         Board List
    =========================================== -->

    <VueDraggable
      v-model="boards"
      item-key="id"
      :animation="200"
      ghost-class="ghost-board"
      chosen-class="chosen-board"
      drag-class="drag-board"
      handle=".board-drag-handle"
      @change="onBoardChange"
      class="
        custom-scrollbar
        relative
        z-10
        flex-1
        space-y-2.5
        overflow-y-auto
        p-4
      "
    >
      <div
        v-for="board in boards"
        :key="board.id"
        class="board-item group"
        :class="{
          'board-item-selected':
            board.id === kanban.selectedBoardId,
        }"
        @click="kanban.selectBoard(board.id)"
      >
        <!-- Board Name -->

        <span class="truncate pr-2">
          {{ board.name }}
        </span>

        <!-- Drag Handle -->

        <button
          type="button"
          class="
            board-drag-handle
            cursor-grab
            rounded-md
            p-1
            text-slate-500
            opacity-0
            transition-all
            duration-150
            hover:text-slate-300
            active:cursor-grabbing
            group-hover:opacity-100
          "
          :class="{
            '!opacity-100 text-white/70':
              board.id === kanban.selectedBoardId,
          }"
          @click.stop
        >
          <GripVertical class="h-4 w-4" />
        </button>
      </div>
    </VueDraggable>

    <!-- ==========================================
         Add Board Footer
    =========================================== -->

    <div
      class="
        relative
        z-10
        shrink-0
        border-t
        border-white/10
        bg-slate-900/30
        p-4
        backdrop-blur-md
      "
    >
      <div class="space-y-2.5">

        <!-- Board Name -->

        <input
          v-model="newBoard"
          placeholder="Board name..."
          @keyup.enter="addBoard"
          class="
            board-name-input
            w-full
            rounded-xl
            border
            border-white/10
            bg-slate-950/60
            px-3.5
            py-2.5
            text-sm
            text-slate-100
            outline-none
            backdrop-blur-md
            transition
            duration-200
            placeholder:text-slate-500
          "
        />

        <!-- Create Board -->

        <button
          type="button"
          @click="addBoard"
          class="create-board-button"
        >
          <Plus class="h-4 w-4" />

          <span>
            Create Board
          </span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* ==========================================
   Board Item
========================================== */

.board-item {
  position: relative;

  display: flex;

  align-items: center;

  justify-content: space-between;

  cursor: pointer;

  border: 1px solid rgba(255, 255, 255, 0.05);

  border-radius: 0.75rem;

  padding: 0.625rem 0.875rem;

  background: rgba(255, 255, 255, 0.03);

  color: rgb(203 213 225);

  font-size: 0.875rem;

  font-weight: 500;

  backdrop-filter: blur(12px);

  transition:
    background 200ms ease,
    border-color 200ms ease,
    color 200ms ease,
    box-shadow 200ms ease,
    transform 200ms ease;
}

/* ==========================================
   Board Hover
========================================== */

.board-item:hover {
  border-color: rgba(255, 255, 255, 0.15);

  background: rgba(255, 255, 255, 0.07);

  color: white;
}

/* ==========================================
   Selected Board
========================================== */

.board-item-selected {
  border-color: color-mix(
    in srgb,
    var(--accent-400) 40%,
    transparent
  );

  background: linear-gradient(
    90deg,
    var(--accent-600),
    color-mix(
      in srgb,
      var(--accent-600) 70%,
      #0f172a
    )
  );

  color: white;

  box-shadow:
    0 10px 30px
      color-mix(
        in srgb,
        var(--accent-600) 25%,
        transparent
      ),
    0 0 0 1px
      color-mix(
        in srgb,
        var(--accent-400) 15%,
        transparent
      );
}

.board-item-selected:hover {
  background: linear-gradient(
    90deg,
    var(--accent-500),
    var(--accent-600)
  );
}

/* ==========================================
   Create Board Button
========================================== */

.create-board-button {
  display: inline-flex;

  width: 100%;

  align-items: center;

  justify-content: center;

  gap: 0.5rem;

  border: 1px solid
    color-mix(
      in srgb,
      var(--accent-400) 30%,
      transparent
    );

  border-radius: 0.75rem;

  padding: 0.625rem 1rem;

  background: linear-gradient(
    90deg,
    var(--accent-600),
    color-mix(
      in srgb,
      var(--accent-600) 75%,
      #0f172a
    )
  );

  color: white;

  font-size: 0.875rem;

  font-weight: 500;

  box-shadow:
    0 10px 25px
      color-mix(
        in srgb,
        var(--accent-600) 20%,
        transparent
      );

  transition:
    background 200ms ease,
    box-shadow 200ms ease,
    transform 200ms ease;
}

.create-board-button:hover {
  background: linear-gradient(
    90deg,
    var(--accent-500),
    var(--accent-600)
  );

  box-shadow:
    0 10px 30px
      color-mix(
        in srgb,
        var(--accent-500) 30%,
        transparent
      );
}

.create-board-button:active {
  transform: scale(0.98);
}

/* ==========================================
   Board Name Input
========================================== */

.board-name-input:focus {
  border-color: color-mix(
    in srgb,
    var(--accent-500) 60%,
    transparent
  );

  background: rgba(2, 6, 23, 0.8);

  box-shadow:
    0 0 0 4px
      color-mix(
        in srgb,
        var(--accent-500) 10%,
        transparent
      );
}

/* ==========================================
   Drag & Drop
========================================== */

.ghost-board {
  opacity: 0.35;

  background-color: rgba(
    15,
    23,
    42,
    0.4
  ) !important;

  border: 1px dashed
    color-mix(
      in srgb,
      var(--accent-400) 40%,
      transparent
    ) !important;

  backdrop-filter: blur(8px);
}

.chosen-board {
  cursor: grabbing !important;
}

.drag-board {
  opacity: 0.95;

  transform:
    scale(1.02)
    rotate(1deg);

  box-shadow:
    0 15px 25px -5px
      rgba(0, 0, 0, 0.5),
    0 0 15px
      color-mix(
        in srgb,
        var(--accent-500) 25%,
        transparent
      );

  cursor: grabbing !important;
}

/* ==========================================
   Scrollbar
========================================== */

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
  background: color-mix(
    in srgb,
    var(--accent-500) 35%,
    rgba(255, 255, 255, 0.1)
  );
}
</style>