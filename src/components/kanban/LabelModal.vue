<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { X, Plus, Trash2, Tag, Check } from "@lucide/vue";
import { useKanbanStore } from "../../stores/kanbanactions/kanban";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const kanban = useKanbanStore();

const card = computed(() => kanban.selectedCard);
const board = computed(() => kanban.selectedBoard);

const labels = computed(() =>
  board.value
    ? kanban.labelsForBoard(board.value.id)
    : []
);

const newLabel = ref("");
const newColor = ref("#3b82f6");

watch(
  () => props.show,
  (value) => {
    if (!value) {
      newLabel.value = "";
      newColor.value = "#3b82f6";
    }
  }
);

function createLabel() {
  if (!board.value) return;

  const name = newLabel.value.trim();

  if (!name) return;

  kanban.createLabel(
    board.value.id,
    name,
    newColor.value
  );

  newLabel.value = "";
}

function toggleLabel(id: number) {
  if (!card.value) return;

  kanban.toggleCardLabel(
    card.value.id,
    id
  );
}

function rename(id: number, name: string) {
  kanban.renameLabel(id, name);
}

function recolor(id: number, color: string) {
  kanban.recolorLabel(id, color);
}

function remove(id: number) {
  kanban.deleteLabel(id);
}

function close() {
  emit("close");
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
        class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
        @click.self="close"
        @keydown.esc="close"
      >
        <div
          class="
            relative
            w-full
            max-w-xl
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-slate-900/80
            shadow-2xl
            shadow-slate-950/50
            backdrop-blur-2xl
          "
        >
          <!-- Ambient Radial Glow -->
          <div class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[var(--accent-500)]/10 blur-[90px]"></div>

          <!-- Header -->
          <div
            class="
              flex
              items-center
              justify-between
              border-b
              border-white/10
              px-6
              py-4.5
              backdrop-blur-md
            "
          >
            <div class="flex items-center gap-2.5">
              <div class="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300">
                <Tag class="h-4 w-4" />
              </div>
              <h2 class="text-lg font-bold text-slate-100">
                Manage Labels
              </h2>
            </div>

            <button
              @click="close"
              class="
                rounded-xl
                border
                border-white/5
                bg-white/5
                p-2
                text-slate-400
                transition-all
                duration-200
                hover:border-white/15
                hover:bg-white/10
                hover:text-white
                active:scale-95
              "
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Create Label Form -->
          <div class="space-y-3 border-b border-white/10 bg-slate-950/30 p-6 backdrop-blur-md">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Create New Label
            </label>

            <div class="flex items-center gap-3">
              <input
                v-model="newLabel"
                placeholder="Label name..."
                @keyup.enter="createLabel"
                class="
                  accent-border-focus
                  flex-1
                  rounded-2xl
                  border
                  border-white/10
                  bg-slate-950/50
                  px-4
                  py-2.5
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

              <!-- Color Swatch Input -->
              <div class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 shadow-inner transition-transform hover:scale-105 active:scale-95">
                <input
                  v-model="newColor"
                  type="color"
                  class="absolute inset-0 h-12 w-12 cursor-pointer opacity-0"
                />
                <div 
                  class="h-full w-full rounded-2xl transition-colors"
                  :style="{ backgroundColor: newColor }"
                ></div>
              </div>

              <button
                @click="createLabel"
                class="
                  accent-bg
                  accent-bg-hover
                  accent-glow
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  px-5
                  py-2.5
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
                <span>Create</span>
              </button>
            </div>
          </div>

          <!-- Existing Labels List -->
          <div
            class="
              max-h-[380px]
              space-y-2.5
              overflow-y-auto
              p-6
            "
          >
            <div
              v-for="label in labels"
              :key="label.id"
              class="
                group
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-slate-950/40
                p-3
                backdrop-blur-md
                transition-all
                duration-200
                hover:border-white/20
                hover:bg-slate-950/60
              "
            >
              <!-- Checkbox Toggle for Selected Card -->
              <label 
                v-if="card"
                class="relative flex cursor-pointer items-center justify-center"
                title="Toggle on active card"
              >
                <input
                  type="checkbox"
                  :checked="card.labels.includes(label.id)"
                  @change="toggleLabel(label.id)"
                  class="peer sr-only"
                />
                <div class="h-5 w-5 rounded-lg border border-white/20 bg-white/5 transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-500 text-slate-950 flex items-center justify-center">
                  <Check class="h-3.5 w-3.5 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </label>

              <!-- Color Swatch -->
              <div class="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 shadow-sm">
                <input
                  type="color"
                  :value="label.color"
                  @input="
                    recolor(
                      label.id,
                      ($event.target as HTMLInputElement).value
                    )
                  "
                  class="absolute inset-0 h-10 w-10 cursor-pointer opacity-0"
                />
                <div 
                  class="h-full w-full"
                  :style="{ backgroundColor: label.color }"
                ></div>
              </div>

              <!-- Inline Editable Name -->
              <input
                :value="label.name"
                @input="
                  rename(
                    label.id,
                    ($event.target as HTMLInputElement).value
                  )
                "
                class="
                  flex-1
                  rounded-xl
                  bg-transparent
                  px-2
                  py-1
                  text-sm
                  font-medium
                  text-slate-100
                  outline-none
                  transition-colors
                  focus:bg-white/5
                  focus:ring-1
                  focus:ring-white/20
                "
              />

              <!-- Preview Badge -->
              <span
                class="
                  shrink-0
                  rounded-xl
                  border
                  border-white/10
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  shadow-sm
                "
                :style="{
                  backgroundColor: label.color + '25',
                  color: label.color,
                  borderColor: label.color + '40'
                }"
              >
                {{ label.name || 'Untitled' }}
              </span>

              <!-- Delete Button -->
              <button
                @click="remove(label.id)"
                title="Delete Label"
                class="
                  rounded-xl
                  p-2
                  text-slate-500
                  transition-all
                  duration-200
                  hover:bg-rose-500/10
                  hover:text-rose-400
                  active:scale-95
                "
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>

            <!-- Empty State -->
            <div
              v-if="labels.length === 0"
              class="flex flex-col items-center justify-center py-10 text-center"
            >
              <div class="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-500">
                <Tag class="h-6 w-6" />
              </div>
              <p class="text-sm font-medium text-slate-400">
                No labels created yet
              </p>
              <p class="text-xs text-slate-500 mt-1">
                Add your first label above to organize your cards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>