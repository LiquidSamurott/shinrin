<script setup lang="ts">
import { computed } from "vue";

import RichEditor from "../editor/RichEditor.vue";

import { useFlashcardStore } from "../../stores/flashcardactions/index";

const flashcards = useFlashcardStore();

const card = computed(() =>
  flashcards.flashcards.find(
    c =>
      c.id === flashcards.selectedFlashcardId
  )
);
</script>

<template>
  <div
    class="flex flex-1 flex-col"
    v-if="card"
  >
    <div
      class="
        border-b
        border-slate-800
        px-6
        py-4
      "
    >
      <h2 class="text-xl font-bold">
        Edit Flashcard
      </h2>
    </div>

    <div
      class="grid flex-1 grid-cols-2 gap-6 p-6"
    >
      <div>
        <h3 class="mb-3 font-semibold">
          Front
        </h3>

        <RichEditor
          v-model="card.front"
        />
      </div>

      <div>
        <h3 class="mb-3 font-semibold">
          Back
        </h3>

        <RichEditor
          v-model="card.back"
        />
      </div>
    </div>
  </div>

  <div
    v-else
    class="
      flex
      flex-1
      items-center
      justify-center
      text-slate-500
    "
  >
    Select a flashcard
  </div>
</template>