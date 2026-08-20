<script setup lang="ts">
import { ref, watch } from "vue";
import { Save, Copy, Trash2, X } from "@lucide/vue";
import type { Column } from "../../types/kanban";
import { useKanbanStore } from "../../stores/kanbanactions/kanban";

const props = defineProps<{
  column: Column;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const kanban = useKanbanStore();

const title = ref("");

watch(
  () => props.show,
  (value) => {
    if (value) {
      title.value = props.column.title;
    }
  },
  { immediate: true }
);

function close() {
  emit("close");
}

function save() {
  const trimmed = title.value.trim();
  if (!trimmed) return;
  
  kanban.renameColumn(props.column.id, trimmed);
  close();
}

function duplicate() {
  kanban.duplicateColumn(props.column.id);
  close();
}

function remove() {
  if (!confirm("Delete this column and all its cards?")) return;

  kanban.deleteColumn(props.column.id);
  close();
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
        @click.self="close"
        @keydown.esc="close"
      >
        <div
          class="
            relative
            w-full
            max-w-md
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-slate-900/80
            p-6
            shadow-2xl
            shadow-slate-950/50
            backdrop-blur-2xl
          "
        >
          <!-- Ambient Glass Glow -->
          <div class="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[var(--accent-500)]/10 blur-[80px]"></div>

          <!-- Header -->
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-100">
              Column Settings
            </h2>

            <button
              @click="close"
              class="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Form Input -->
          <div class="mb-6">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Column Name
            </label>

            <input
              v-model="title"
              @keyup.enter="save"
              placeholder="Column name..."
              class="
                accent-border-focus
                w-full
                rounded-2xl
                border
                border-white/10
                bg-slate-950/50
                px-4
                py-3
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
          </div>

          <!-- Action Buttons Stack -->
          <div class="space-y-2.5">
            <!-- Save Button -->
            <button
              @click="save"
              class="
                accent-bg
                accent-bg-hover
                accent-glow
                flex
                w-full
                items-center
                justify-center
                gap-2.5
                rounded-2xl
                py-3
                text-sm
                font-semibold
                text-slate-950
                shadow-lg
                transition-all
                duration-200
                active:scale-[0.98]
              "
            >
              <Save class="h-4 w-4 stroke-[2.5]" />
              <span>Save Changes</span>
            </button>

            <!-- Duplicate Button -->
            <button
              @click="duplicate"
              class="
                group
                flex
                w-full
                items-center
                justify-center
                gap-2.5
                rounded-2xl
                border
                border-white/10
                bg-white/5
                py-3
                text-sm
                font-medium
                text-slate-200
                backdrop-blur-md
                transition-all
                duration-200
                hover:border-white/20
                hover:bg-white/10
                hover:text-white
                active:scale-[0.98]
              "
            >
              <Copy class="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-200" />
              <span>Duplicate Column</span>
            </button>

            <!-- Delete Button -->
            <button
              @click="remove"
              class="
                group
                flex
                w-full
                items-center
                justify-center
                gap-2.5
                rounded-2xl
                border
                border-rose-500/30
                bg-rose-500/10
                py-3
                text-sm
                font-medium
                text-rose-300
                backdrop-blur-md
                transition-all
                duration-200
                hover:border-rose-500/60
                hover:bg-rose-500/25
                hover:text-rose-100
                active:scale-[0.98]
              "
            >
              <Trash2 class="h-4 w-4 text-rose-400 transition-transform duration-200 group-hover:scale-110" />
              <span>Delete Column</span>
            </button>

            <!-- Cancel Button -->
            <button
              @click="close"
              class="
                w-full
                rounded-2xl
                border
                border-transparent
                py-2.5
                text-sm
                font-medium
                text-slate-400
                transition-all
                duration-200
                hover:text-slate-200
                active:scale-[0.98]
              "
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>