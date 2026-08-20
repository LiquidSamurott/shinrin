<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
} from "vue";

import { watchDebounced } from "@vueuse/core";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Check, Pencil, X } from "@lucide/vue";

import { useKanbanStore } from "../../stores/kanbanactions/kanban";

import RichEditor from "../../components/editor/RichEditor.vue";
import CardSidebar from "./CardSidebar.vue";

const kanban = useKanbanStore();

const card = computed(() => kanban.selectedCard);

const editing = ref(false);
const editorContainerRef = ref<HTMLElement | null>(null);

/* -----------------------------
   Math Rendering (Inline KaTeX)
------------------------------ */

function renderMath() {
  if (!editorContainerRef.value) return;

  nextTick(() => {
    if (!editorContainerRef.value) return;

    // Render inline LaTeX expressions enclosed in $...$ or \(...\)
    const elements = editorContainerRef.value.querySelectorAll(
      ".prose, .katex-render-target, p, span, div"
    );

    elements.forEach((el) => {
      // Avoid re-rendering inside already parsed KaTeX elements
      if (el.classList.contains("katex") || el.closest(".katex")) return;

      const text = el.textContent || "";

      // Match $math$ or \(math\) pattern for inline math
      if (/\$(.+?)\$|\\\((.+?)\\\)/.test(text) && el.children.length === 0) {
        try {
          const rendered = text.replace(
            /\$(.+?)\$|\\\((.+?)\\\)/g,
            (_, g1, g2) => {
              const expr = g1 || g2;
              return katex.renderToString(expr, {
                displayMode: false,
                throwOnError: false,
              });
            }
          );
          el.innerHTML = rendered;
        } catch (e) {
          console.error("KaTeX inline render error:", e);
        }
      }
    });
  });
}

/* -----------------------------
   Actions
------------------------------ */

function toggleEditing() {
  editing.value = !editing.value;
  renderMath();
}

function closeModal() {
  editing.value = false;
  kanban.closeCard();
}

function updateTitle(event: Event) {
  if (!card.value) return;

  kanban.renameCard(
    card.value.id,
    (event.target as HTMLInputElement).value
  );
}

function updateDescription(event: Event) {
  if (!card.value) return;

  kanban.updateCardDescription(
    card.value.id,
    (event.target as HTMLTextAreaElement).value
  );
}

/* -----------------------------
   Autosave & Math Watchers
------------------------------ */

watchDebounced(
  () => card.value?.content,
  async (content) => {
    if (!card.value) return;
    if (content == null) return;

    await kanban.updateCardContent(
      card.value.id,
      content
    );

    if (!editing.value) {
      renderMath();
    }
  },
  {
    debounce: 500,
    maxWait: 1500,
  }
);

watch(
  () => card.value?.id,
  () => {
    renderMath();
  }
);

/* -----------------------------
   Keyboard
------------------------------ */

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    closeModal();
  }
}

/* -----------------------------
   Lifecycle
------------------------------ */

watch(
  card,
  (value) => {
    document.body.style.overflow = value ? "hidden" : "";
    if (value) {
      renderMath();
    }
  },
  {
    immediate: true,
  }
);

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  renderMath();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="card"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 sm:p-6 backdrop-blur-md"
        @click.self="closeModal"
      >
        <div
          class="
            relative
            flex
            h-[88vh]
            w-full
            max-w-6xl
            min-h-0
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
          <!-- Ambient Glass Glows -->
          <div class="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[var(--accent-500)]/10 blur-[100px]"></div>
          <div class="pointer-events-none absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-indigo-600/10 blur-[100px]"></div>

          <!-- Main Content Area -->
          <div
            class="
              relative
              z-10
              flex
              flex-1
              min-h-0
              flex-col
              overflow-hidden
              p-6
              sm:p-8
            "
          >
            <!-- Header -->
            <div class="mb-6 flex items-start justify-between gap-4">
              <input
                :value="card.title"
                @input="updateTitle"
                :readonly="!editing"
                placeholder="Card title..."
                :class="[
                  'w-full rounded-xl bg-transparent px-3 py-1.5 text-2xl sm:text-3xl font-bold text-white outline-none placeholder:text-slate-500 transition-all duration-200 -ml-3',
                  editing
                    ? 'border border-white/15 bg-slate-950/40 focus:border-[var(--accent-500)]/60 focus:ring-4 focus:ring-[var(--accent-500)]/10 backdrop-blur-md'
                    : 'border border-transparent hover:border-white/10'
                ]"
              />

              <div class="flex items-center gap-2 shrink-0">
                <!-- Edit Toggle Button -->
                <button
                  @click="toggleEditing"
                  :class="[
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold backdrop-blur-md transition-all duration-200 active:scale-[0.98]',
                    editing
                      ? 'accent-bg accent-bg-hover text-slate-950 shadow-lg accent-glow'
                      : 'border border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white'
                  ]"
                >
                  <component :is="editing ? Check : Pencil" class="h-4 w-4" />
                  <span>{{ editing ? "Done" : "Edit" }}</span>
                </button>

                <!-- Close Modal Button -->
                <button
                  @click="closeModal"
                  class="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-6 shrink-0">
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description
              </label>

              <textarea
                :value="card.description"
                @input="updateDescription"
                :readonly="!editing"
                placeholder="Write a short description..."
                class="
                  accent-border-focus
                  h-24
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-white/10
                  bg-slate-950/40
                  p-4
                  text-sm
                  text-slate-100
                  placeholder:text-slate-500
                  backdrop-blur-md
                  outline-none
                  transition
                  duration-200
                  focus:bg-slate-950/80
                "
              />
            </div>

            <!-- Rich Editor Canvas with Math Container -->
            <div
              ref="editorContainerRef"
              class="
                relative
                flex
                flex-1
                min-h-0
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-slate-950/40
                backdrop-blur-md
              "
            >
              <RichEditor
                v-model="card.content"
                :editable="editing"
                placeholder="Write something or use $E=mc^2$ for inline math..."
                class="flex-1 min-h-0"
              />
            </div>
          </div>

          <!-- Sidebar -->
          <CardSidebar class="relative z-10" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Inline KaTeX styling overrides */
:deep(.katex) {
  font-size: 1.05em;
  color: var(--accent-300, #93c5fd);
}

:deep(.katex-display) {
  margin: 0.5em 0;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>