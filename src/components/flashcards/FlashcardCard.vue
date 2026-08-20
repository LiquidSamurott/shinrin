<script setup lang="ts">
import type { Flashcard } from "../../types/flashcard";

defineProps<{
  card: Flashcard;
  selected?: boolean;
}>();

const emit = defineEmits<{
  open: [];
  favorite: [];
}>();
</script>

<template>
  <div
    @click="emit('open')"
    class="
      cursor-pointer
      rounded-xl
      border
      p-4
      transition
      hover:border-emerald-500
    "
    :class="
      selected
        ? 'border-emerald-500 bg-emerald-950'
        : 'border-slate-700 bg-slate-900'
    "
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1">
        <h3 v-html="card.front"></h3>

        <div v-html="card.back"></div>
      </div>

      <button
        @click.stop="emit('favorite')"
        class="text-xl hover:scale-110 transition"
      >
        {{ card.favorite ? "⭐" : "☆" }}
      </button>
    </div>

    <!-- Footer -->
    <div class="mt-4 flex items-center justify-between">
      <span
        class="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-400"
      >
        {{ card.interval }} day{{ card.interval === 1 ? "" : "s" }}
      </span>

      <button
        @click.stop="emit('open')"
        class="
          rounded-lg
          bg-emerald-600
          px-3
          py-1
          text-xs
          font-medium
          text-white
          hover:bg-emerald-500
          transition
        "
      >
        Edit
      </button>
    </div>
  </div>
</template>