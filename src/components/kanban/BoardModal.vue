<script setup lang="ts">
import { ref, watch } from "vue";
import type { Board } from "../../types/kanban";
import { useKanbanStore } from "../../stores/kanbanactions/kanban";

const props = defineProps<{
  show: boolean;
  board: Board;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const kanban = useKanbanStore();

const name = ref("");

watch(
  () => props.show,
  (value) => {
    if (value) {
      name.value = props.board.name;
    }
  },
  { immediate: true }
);

function close() {
  emit("close");
}

function renameBoard() {
  const trimmed = name.value.trim();

  if (!trimmed) return;

  kanban.renameBoard(props.board.id, trimmed);
  close();
}

function duplicateBoard() {
  kanban.duplicateBoard(props.board.id);
  close();
}

function deleteBoard() {
  if (!confirm("Delete this board?")) return;

  kanban.deleteBoard(props.board.id);
  close();
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="w-full max-w-[420px] overflow-hidden rounded-2xl border shadow-2xl"
          style="
            background-color: var(--bg-primary);
            border-color: var(--border-color);
          "
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b px-6 py-4"
            style="border-color: var(--border-color)"
          >
            <div>
              <h2
                class="text-xl font-bold"
                style="color: var(--text-primary)"
              >
                Board Settings
              </h2>

              <p
                class="mt-1 text-xs"
                style="color: var(--text-secondary)"
              >
                Manage this board
              </p>
            </div>

            <button
              @click="close"
              class="rounded-lg p-2 transition"
              style="color: var(--text-secondary)"
              @mouseenter="
                ($event.currentTarget as HTMLElement).style.backgroundColor =
                  'var(--bg-elevation-2)'
              "
              @mouseleave="
                ($event.currentTarget as HTMLElement).style.backgroundColor =
                  'transparent'
              "
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="space-y-5 p-6">
            <!-- Board Name -->
            <div>
              <label
                class="mb-2 block text-sm"
                style="color: var(--text-secondary)"
              >
                Board Name
              </label>

              <input
                v-model="name"
                class="w-full rounded-xl border px-4 py-3 outline-none transition"
                style="
                  background-color: var(--bg-elevation-1);
                  border-color: var(--border-color);
                  color: var(--text-primary);
                "
                @focus="
                  ($event.currentTarget as HTMLElement).style.borderColor =
                    'var(--accent-500)'
                "
                @blur="
                  ($event.currentTarget as HTMLElement).style.borderColor =
                    'var(--border-color)'
                "
              />
            </div>

            <!-- Save -->
            <button
              @click="renameBoard"
              class="w-full rounded-xl py-3 font-medium text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style="
                background: linear-gradient(
                  135deg,
                  var(--accent-600),
                  var(--accent-500)
                );
              "
            >
              💾 Save Changes
            </button>

            <!-- Duplicate -->
            <button
              @click="duplicateBoard"
              class="w-full rounded-xl border py-3 font-medium transition-all hover:brightness-110"
              style="
                background-color: var(--bg-elevation-2);
                border-color: var(--border-color);
                color: var(--text-primary);
              "
            >
              📄 Duplicate Board
            </button>

            <!-- Delete -->
            <button
              @click="deleteBoard"
              class="w-full rounded-xl bg-red-600 py-3 font-medium text-white transition-all hover:bg-red-500"
            >
              🗑 Delete Board
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>