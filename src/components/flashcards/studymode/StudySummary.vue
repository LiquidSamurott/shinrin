<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { 
  Trophy, 
  RotateCcw, 
  ArrowLeft, 
  Timer, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Award 
} from "@lucide/vue";

import { useFlashcardStore } from "../../../stores/flashcardactions";

const router = useRouter();
const flashcards = useFlashcardStore();

const total = computed(() => flashcards.studyQueue.length);

const studied = computed(() => flashcards.currentStudyIndex);

const duration = computed(() => {
  if (!flashcards.studyStartedAt) return "0:00";

  const start = new Date(flashcards.studyStartedAt);
  const end = flashcards.studyEndedAt
    ? new Date(flashcards.studyEndedAt)
    : new Date();

  const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
});

function restart() {
  flashcards.startStudy();
}

function finish() {
  flashcards.studyFinished = false;
  router.push("/flashcards");
}
</script>

<template>
  <div class="relative flex flex-1 flex-col items-center justify-center p-6 sm:p-12 select-none">
    <!-- Ambient Background Light Glow -->
    <div class="pointer-events-none absolute h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]"></div>

    <!-- Main Container -->
    <div class="relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/70 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
      <!-- Header Banner -->
      <div class="flex flex-col items-center text-center">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-inner">
          <Trophy class="h-8 w-8" />
        </div>

        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
          Session Complete!
        </h1>
        <p class="mt-1.5 text-sm text-slate-400">
          Great job! Here is a summary of your study performance.
        </p>
      </div>

      <!-- Overview Stats (Cards Studied & Time) -->
      <div class="mt-8 grid grid-cols-2 gap-4">
        <!-- Cards Studied -->
        <div class="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
            <Award class="h-5 w-5" />
          </div>
          <div>
            <div class="text-xs font-medium text-slate-400">Cards Studied</div>
            <div class="text-xl sm:text-2xl font-bold text-white">
              {{ studied }} <span class="text-sm font-normal text-slate-500">/ {{ total }}</span>
            </div>
          </div>
        </div>

        <!-- Duration -->
        <div class="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-400">
            <Timer class="h-5 w-5" />
          </div>
          <div>
            <div class="text-xs font-medium text-slate-400">Time Elapsed</div>
            <div class="text-xl sm:text-2xl font-bold text-white">
              {{ duration }}
            </div>
          </div>
        </div>
      </div>

      <!-- SRS Response Breakdown -->
      <div class="mt-6">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Rating Breakdown
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <!-- Again -->
          <div class="flex flex-col items-center rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 backdrop-blur-md">
            <div class="flex items-center gap-1.5 text-rose-400">
              <RotateCcw class="h-3.5 w-3.5" />
              <span class="text-xs font-medium">Again</span>
            </div>
            <div class="mt-1 text-2xl font-bold text-rose-300">
              {{ flashcards.studyStats.again }}
            </div>
          </div>

          <!-- Hard -->
          <div class="flex flex-col items-center rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 backdrop-blur-md">
            <div class="flex items-center gap-1.5 text-amber-400">
              <Flame class="h-3.5 w-3.5" />
              <span class="text-xs font-medium">Hard</span>
            </div>
            <div class="mt-1 text-2xl font-bold text-amber-300">
              {{ flashcards.studyStats.hard }}
            </div>
          </div>

          <!-- Good -->
          <div class="flex flex-col items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 backdrop-blur-md">
            <div class="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 class="h-3.5 w-3.5" />
              <span class="text-xs font-medium">Good</span>
            </div>
            <div class="mt-1 text-2xl font-bold text-emerald-300">
              {{ flashcards.studyStats.good }}
            </div>
          </div>

          <!-- Easy -->
          <div class="flex flex-col items-center rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3.5 backdrop-blur-md">
            <div class="flex items-center gap-1.5 text-blue-400">
              <Zap class="h-3.5 w-3.5" />
              <span class="text-xs font-medium">Easy</span>
            </div>
            <div class="mt-1 text-2xl font-bold text-blue-300">
              {{ flashcards.studyStats.easy }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          @click="restart"
          class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-900/60 active:scale-[0.98]"
        >
          <RotateCcw class="h-4 w-4" />
          <span>Study Again</span>
        </button>

        <button
          @click="finish"
          class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98]"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>Back to Decks</span>
        </button>
      </div>
    </div>
  </div>
</template>