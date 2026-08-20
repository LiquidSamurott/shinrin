<script setup lang="ts">
import { ref, watch } from "vue";
import { Star, Archive, Pencil, Check, X } from "@lucide/vue";

const props = defineProps<{
  title: string;
  editing: boolean;
  favorite?: boolean;
  archived?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:title", value: string): void;
  (e: "toggle-edit"): void;
  (e: "toggle-favorite"): void;
  (e: "toggle-archive"): void;
  (e: "close"): void;
}>();

const localTitle = ref(props.title);

watch(
  () => props.title,
  (value) => {
    localTitle.value = value;
  }
);

function updateTitle() {
  emit("update:title", localTitle.value);
}
</script>

<template>
  <div
    class="flex items-start justify-between gap-4 border-b border-white/10 pb-6"
  >
    <!-- Title Input -->
    <div class="relative flex-1">
      <input
        v-model="localTitle"
        :readonly="!editing"
        @input="updateTitle"
        placeholder="Card title..."
        :class="[
          'w-full rounded-xl bg-transparent px-3 py-1.5 text-2xl sm:text-3xl font-bold text-white outline-none placeholder:text-slate-500 transition-all duration-200 -ml-3',
          editing
            ? 'border border-white/15 bg-slate-950/40 focus:border-[var(--accent-500)]/60 focus:ring-4 focus:ring-[var(--accent-500)]/10 backdrop-blur-md'
            : 'border border-transparent hover:border-white/10'
        ]"
      />
    </div>

    <!-- Actions Control Panel -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Favorite Button -->
      <button
        @click="$emit('toggle-favorite')"
        title="Toggle Favorite"
        :class="[
          'rounded-xl border p-2.5 backdrop-blur-md transition-all duration-200 active:scale-[0.95]',
          favorite
            ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-lg shadow-amber-950/30'
            : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-amber-300'
        ]"
      >
        <Star
          class="h-4 w-4 transition-colors duration-200"
          :class="{ 'fill-amber-400 text-amber-400': favorite }"
        />
      </button>

      <!-- Archive Button -->
      <button
        @click="$emit('toggle-archive')"
        title="Archive Card"
        :class="[
          'rounded-xl border p-2.5 backdrop-blur-md transition-all duration-200 active:scale-[0.95]',
          archived
            ? 'border-purple-500/40 bg-purple-500/15 text-purple-300 shadow-lg shadow-purple-950/30'
            : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200'
        ]"
      >
        <Archive class="h-4 w-4" />
      </button>

      <!-- Edit / Save Toggle Button (Theme Accent Enabled) -->
      <button
        @click="$emit('toggle-edit')"
        :class="[
          'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold backdrop-blur-md transition-all duration-200 active:scale-[0.95]',
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
        @click="$emit('close')"
        title="Close Modal"
        class="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.95]"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>