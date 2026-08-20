<script setup lang="ts">
import { computed } from "vue";

import {
  Flame,
  Clock3,
  Trophy,
  BarChart3,
  Timer,
} from "@lucide/vue";

import { usePomodoroStore } from "../../stores/pomodoro";

const pomodoro = usePomodoroStore();

const stats = computed(() => pomodoro.stats);

const totalFocusHours = computed(() =>
  (stats.value.totalFocusSeconds / 3600).toFixed(1)
);

const averageFocusMinutes = computed(() => {
  if (stats.value.completedSessions === 0) return 0;

  return Math.round(
    stats.value.totalFocusSeconds /
      stats.value.completedSessions /
      60
  );
});

const completionRate = computed(() => {
  const total =
    stats.value.completedSessions +
    stats.value.interruptedSessions;

  if (total === 0) return 0;

  return Math.round(
    (stats.value.completedSessions / total) * 100
  );
});
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl backdrop-blur-xl"
  >
    <!-- Ambient glow -->
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"
    />

    <!-- Header -->
    <div class="relative mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10"
        >
          <BarChart3 class="h-4.5 w-4.5 text-emerald-400" />
        </div>

        <div>
          <h2 class="text-sm font-semibold text-white">
            Study Stats
          </h2>

          <p class="text-[11px] text-slate-500">
            Pomodoro performance
          </p>
        </div>
      </div>

      <!-- Current streak -->
      <div
        class="flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-500/10 px-2.5 py-1"
      >
        <Flame class="h-3.5 w-3.5 text-orange-400" />

        <span class="text-xs font-semibold text-orange-300">
          {{ stats.currentStreak }}
        </span>
      </div>
    </div>

    <!-- Main stats -->
    <div class="relative grid grid-cols-2 gap-2.5">

      <!-- Completed -->
      <div
        class="rounded-2xl border border-white/5 bg-white/[0.035] p-3"
      >
        <div class="flex items-center gap-1.5">
          <Flame class="h-4 w-4 text-emerald-400" />

          <span class="text-[11px] text-slate-500">
            Completed
          </span>
        </div>

        <p class="mt-1 text-xl font-bold text-white">
          {{ stats.completedSessions }}
        </p>
      </div>

      <!-- Interrupted -->
      <div
        class="rounded-2xl border border-white/5 bg-white/[0.035] p-3"
      >
        <div class="flex items-center gap-1.5">
          <Timer class="h-4 w-4 text-red-400" />

          <span class="text-[11px] text-slate-500">
            Interrupted
          </span>
        </div>

        <p class="mt-1 text-xl font-bold text-white">
          {{ stats.interruptedSessions }}
        </p>
      </div>

      <!-- Focus -->
      <div
        class="rounded-2xl border border-white/5 bg-white/[0.035] p-3"
      >
        <div class="flex items-center gap-1.5">
          <Clock3 class="h-4 w-4 text-cyan-400" />

          <span class="text-[11px] text-slate-500">
            Focus Hours
          </span>
        </div>

        <p class="mt-1 text-xl font-bold text-white">
          {{ totalFocusHours }}
          <span class="text-xs font-normal text-slate-500">
            h
          </span>
        </p>
      </div>

      <!-- Best streak -->
      <div
        class="rounded-2xl border border-white/5 bg-white/[0.035] p-3"
      >
        <div class="flex items-center gap-1.5">
          <Trophy class="h-4 w-4 text-yellow-400" />

          <span class="text-[11px] text-slate-500">
            Best Streak
          </span>
        </div>

        <p class="mt-1 text-xl font-bold text-white">
          {{ stats.longestStreak }}
        </p>
      </div>
    </div>

    <!-- Secondary statistics -->
    <div
      class="relative mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/5 bg-white/[0.025] py-3"
    >
      <div class="text-center">
        <p class="text-[10px] uppercase tracking-wide text-slate-600">
          Today
        </p>

        <p class="mt-1 text-sm font-semibold text-white">
          {{ stats.todaySessions }}
        </p>
      </div>

      <div class="text-center">
        <p class="text-[10px] uppercase tracking-wide text-slate-600">
          Week
        </p>

        <p class="mt-1 text-sm font-semibold text-white">
          {{ stats.weekSessions }}
        </p>
      </div>

      <div class="text-center">
        <p class="text-[10px] uppercase tracking-wide text-slate-600">
          Month
        </p>

        <p class="mt-1 text-sm font-semibold text-white">
          {{ stats.monthSessions }}
        </p>
      </div>
    </div>

    <!-- Bottom metrics -->
    <div class="relative mt-4 space-y-3">

      <!-- Average -->
      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-500">
          Average focus
        </span>

        <span class="text-xs font-semibold text-white">
          {{ averageFocusMinutes }} min
        </span>
      </div>

      <!-- Completion -->
      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <span class="text-xs text-slate-500">
            Completion rate
          </span>

          <span class="text-xs font-semibold text-emerald-400">
            {{ completionRate }}%
          </span>
        </div>

        <div
          class="h-1.5 overflow-hidden rounded-full bg-slate-800"
        >
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            :style="{
              width: `${completionRate}%`,
            }"
          />
        </div>
      </div>

    </div>
  </section>
</template>

