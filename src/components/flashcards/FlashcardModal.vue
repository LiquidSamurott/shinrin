<script setup lang="ts">
import { computed } from "vue";

import RichEditor from "../editor/RichEditor.vue";
import { useFlashcardStore } from "../../stores/flashcardactions";

const flashcards = useFlashcardStore();

const card = computed(() => flashcards.selectedFlashcard);

function close() {
  flashcards.closeFlashcard();
}

async function remove() {
  if (!card.value) return;

  await flashcards.deleteFlashcard(card.value.id);
  flashcards.closeFlashcard();
}

async function save() {
  if (!card.value) return;

  await flashcards.updateFlashcard(card.value.id, {
    front: card.value.front,
    back: card.value.back,
  });

  flashcards.closeFlashcard();
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="card"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="flex h-[90vh] w-[1400px] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        >
          <!-- Header -->
          <header
            class="flex items-center justify-between border-b border-slate-800 px-6 py-4"
          >
            <div>
              <h2 class="text-2xl font-bold text-white">
                Edit Flashcard
              </h2>

              <p class="mt-1 text-sm text-slate-400">
                Edit the front and back of your flashcard.
              </p>
            </div>

            <button
              class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              @click="close"
            >
              ✕
            </button>
          </header>

          <!-- Body -->
          <div class="grid flex-1 grid-cols-2 gap-6 overflow-hidden p-6">

            <!-- Front -->
            <section class="flex min-h-0 flex-col">

              <div class="mb-3 flex items-center justify-between">
                <h3 class="font-semibold text-white">
                  Front
                </h3>

                <span class="text-xs text-slate-500">
                  Question
                </span>
              </div>

              <div
                class="flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
              >
                <RichEditor
                  v-model="card.front"
                  placeholder="Type the question..."
                />
              </div>

            </section>

            <!-- Back -->
            <section class="flex min-h-0 flex-col">

              <div class="mb-3 flex items-center justify-between">
                <h3 class="font-semibold text-white">
                  Back
                </h3>

                <span class="text-xs text-slate-500">
                  Answer
                </span>
              </div>

              <div
                class="flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
              >
                <RichEditor
                  v-model="card.back"
                  placeholder="Type the answer..."
                />
              </div>

            </section>

          </div>

          <!-- Metadata -->
          <div
            class="flex flex-wrap items-center gap-3 border-t border-slate-800 px-6 py-4"
          >
            <span
              class="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300"
            >
              ⭐ {{ card.favorite ? "Favorite" : "Normal" }}
            </span>

            <span
              class="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300"
            >
              Interval: {{ card.interval }} day{{ card.interval === 1 ? "" : "s" }}
            </span>

            <span
              class="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300"
            >
              Ease: {{ card.ease.toFixed(2) }}
            </span>

            <span
              class="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300"
            >
              Reviews: {{ card.reviewCount }}
            </span>

            <span
              class="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300"
            >
              Lapses: {{ card.lapses }}
            </span>
          </div>

          <!-- Footer -->
          <footer
            class="flex items-center justify-between border-t border-slate-800 px-6 py-4"
          >
            <button
              @click="remove"
              class="rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-500"
            >
              Delete Flashcard
            </button>

            <div class="flex gap-3">

              <button
                @click="close"
                class="rounded-lg bg-slate-700 px-5 py-2 text-white transition hover:bg-slate-600"
              >
                Cancel
              </button>

              <button
                @click="save"
                class="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-500"
              >
                Save Changes
              </button>

            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>