<script setup lang="ts">
import { 
  RotateCcw, 
  Flame, 
  CheckCircle2, 
  Zap 
} from "@lucide/vue";

const emit = defineEmits<{
  again: [];
  hard: [];
  good: [];
  easy: [];
}>();
</script>

<template>
  <div class="flex flex-col items-center select-none">
    <!-- Rating Buttons Row -->
    <div class="mt-8 flex flex-wrap justify-center gap-3.5 sm:gap-4">
      <!-- Again -->
      <button
        @click="emit('again')"
        class="group relative flex min-w-[140px] sm:min-w-[160px] flex-col items-center rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 sm:px-6 py-4 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:border-rose-500/40 hover:bg-rose-500/20 hover:shadow-lg hover:shadow-rose-950/40 active:scale-[0.97]"
      >
        <div class="flex items-center gap-2 text-rose-400 group-hover:text-rose-300">
          <RotateCcw class="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" />
          <span class="text-base sm:text-lg font-semibold tracking-wide">
            Again
          </span>
        </div>

        <span class="mt-1 text-xs font-medium text-rose-300/70 group-hover:text-rose-200">
          1 day
        </span>
      </button>

      <!-- Hard -->
      <button
        @click="emit('hard')"
        class="group relative flex min-w-[140px] sm:min-w-[160px] flex-col items-center rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 sm:px-6 py-4 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:border-amber-500/40 hover:bg-amber-500/20 hover:shadow-lg hover:shadow-amber-950/40 active:scale-[0.97]"
      >
        <div class="flex items-center gap-2 text-amber-400 group-hover:text-amber-300">
          <Flame class="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          <span class="text-base sm:text-lg font-semibold tracking-wide">
            Hard
          </span>
        </div>

        <span class="mt-1 text-xs font-medium text-amber-300/70 group-hover:text-amber-200">
          2 days
        </span>
      </button>

      <!-- Good -->
      <button
        @click="emit('good')"
        class="group relative flex min-w-[140px] sm:min-w-[160px] flex-col items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 sm:px-6 py-4 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/40 hover:bg-emerald-500/20 hover:shadow-lg hover:shadow-emerald-950/40 active:scale-[0.97]"
      >
        <div class="flex items-center gap-2 text-emerald-400 group-hover:text-emerald-300">
          <CheckCircle2 class="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          <span class="text-base sm:text-lg font-semibold tracking-wide">
            Good
          </span>
        </div>

        <span class="mt-1 text-xs font-medium text-emerald-300/70 group-hover:text-emerald-200">
          4 days
        </span>
      </button>

      <!-- Easy -->
      <button
        @click="emit('easy')"
        class="group relative flex min-w-[140px] sm:min-w-[160px] flex-col items-center rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 sm:px-6 py-4 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:border-blue-500/40 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-950/40 active:scale-[0.97]"
      >
        <div class="flex items-center gap-2 text-blue-400 group-hover:text-blue-300">
          <Zap class="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          <span class="text-base sm:text-lg font-semibold tracking-wide">
            Easy
          </span>
        </div>

        <span class="mt-1 text-xs font-medium text-blue-300/70 group-hover:text-blue-200">
          7 days
        </span>
      </button>
    </div>

    <!-- Keyboard Shortcuts Legend -->
    <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400/80">
      <span class="text-slate-500">Shortcuts:</span>

      <div class="inline-flex items-center gap-1.5">
        <kbd class="rounded-md border border-white/10 bg-slate-900/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-300 shadow-inner backdrop-blur-md">1</kbd>
        <span>Again</span>
      </div>

      <div class="inline-flex items-center gap-1.5">
        <kbd class="rounded-md border border-white/10 bg-slate-900/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-300 shadow-inner backdrop-blur-md">2</kbd>
        <span>Hard</span>
      </div>

      <div class="inline-flex items-center gap-1.5">
        <kbd class="rounded-md border border-white/10 bg-slate-900/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-300 shadow-inner backdrop-blur-md">3</kbd>
        <span>Good</span>
      </div>

      <div class="inline-flex items-center gap-1.5">
        <kbd class="rounded-md border border-white/10 bg-slate-900/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-300 shadow-inner backdrop-blur-md">4</kbd>
        <span>Easy</span>
      </div>
    </div>
  </div>
</template>