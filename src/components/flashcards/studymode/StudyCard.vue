<script setup lang="ts">
import { computed } from "vue";
import { 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Check, 
  CornerDownLeft 
} from "@lucide/vue";

import RichEditor from "../../../components/editor/RichEditor.vue";
import type { Flashcard } from "../../../types/flashcard";

const props = defineProps<{
  card: Flashcard;
  revealed: boolean;
}>();

const emit = defineEmits<{
  reveal: [];
}>();

const html = computed(() =>
  props.revealed
    ? props.card.back
    : props.card.front
);

function reveal() {
  if (!props.revealed) {
    emit("reveal");
  }
}
</script>

<template>
  <div class="flex h-full w-full items-center justify-center p-4 sm:p-6 select-none">
    <div class="relative w-full max-w-4xl">
      <!-- Ambient Backlight Glow -->
      <div 
        class="pointer-events-none absolute -inset-1 rounded-3xl opacity-30 blur-2xl transition-all duration-500"
        :class="revealed ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'"
      ></div>

      <!-- Main Liquid Glass Card Container -->
      <div
        class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-xl transition-all duration-300"
        :class="{ 'hover:border-emerald-500/40 hover:shadow-emerald-950/20': !revealed }"
      >
        <!-- Header Panel -->
        <div class="flex items-center justify-between border-b border-white/10 bg-slate-900/30 px-6 sm:px-8 py-5 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div 
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 shadow-inner backdrop-blur-md transition-colors duration-300"
              :class="revealed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'"
            >
              <Sparkles v-if="revealed" class="h-4 w-4" />
              <HelpCircle v-else class="h-4 w-4" />
            </div>

            <div>
              <span class="text-xs font-semibold tracking-wider uppercase text-slate-400">
                {{ revealed ? "Answer" : "Question" }}
              </span>

              <h2 class="mt-0.5 text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                {{ card.front.replace(/<[^>]*>/g, "").slice(0, 60) || "Flashcard" }}
              </h2>
            </div>
          </div>

          <!-- Side Badge -->
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-medium backdrop-blur-md shadow-sm transition-all duration-300',
              revealed 
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' 
                : 'border-white/10 bg-white/5 text-slate-300'
            ]"
          >
            <CheckCircle2 v-if="revealed" class="h-3.5 w-3.5 text-emerald-400" />
            <Eye v-else class="h-3.5 w-3.5 text-slate-400" />
            {{ revealed ? "Back Side" : "Front Side" }}
          </span>
        </div>

        <!-- Content Area -->
        <div
          @click="reveal"
          :class="[
            'custom-scrollbar min-h-[380px] sm:min-h-[420px] max-h-[550px] overflow-y-auto p-6 sm:p-10 transition-colors duration-200',
            !revealed ? 'cursor-pointer hover:bg-white/[0.01]' : 'cursor-default'
          ]"
        >
          <RichEditor
            :model-value="html"
            :editable="false"
          />
        </div>

        <!-- Footer Panel -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-slate-900/30 px-6 sm:px-8 py-4 backdrop-blur-md">
          <!-- Keyboard Shortcut Hint -->
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span>Click card or press</span>
            <kbd class="inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-950/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-200 shadow-inner backdrop-blur-md">
              <CornerDownLeft class="h-3 w-3" />
              Space
            </kbd>
            <span>to reveal</span>
          </div>

          <!-- Action State Button / Badge -->
          <button
            v-if="!revealed"
            @click.stop="reveal"
            class="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-900/60 active:scale-[0.98]"
          >
            <Eye class="h-4 w-4" />
            <span>Show Answer</span>
          </button>

          <div
            v-else
            class="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-5 py-2 text-xs font-semibold text-emerald-300 backdrop-blur-md"
          >
            <Check class="h-4 w-4 text-emerald-400" />
            <span>Answer Revealed</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Translucent Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>