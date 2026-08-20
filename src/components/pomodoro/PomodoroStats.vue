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
  <div
    class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl"
  >
    <div class="mb-6 flex items-center gap-3">
      <BarChart3 class="h-6 w-6 text-emerald-400" />

      <div>
        <h2 class="text-xl font-bold text-white">
          Productivity Dashboard
        </h2>

        <p class="text-sm text-slate-400">
          Lifetime Pomodoro statistics
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">

      <div class="rounded-2xl bg-slate-800/60 p-4">
        <div class="flex items-center gap-2 text-emerald-400">
          <Flame class="h-5 w-5"/>
          <span class="text-sm">Completed</span>
        </div>

        <div class="mt-2 text-3xl font-bold text-white">
          {{ stats.completedSessions }}
        </div>
      </div>

      <div class="rounded-2xl bg-slate-800/60 p-4">
        <div class="flex items-center gap-2 text-red-400">
          <Timer class="h-5 w-5"/>
          <span class="text-sm">Interrupted</span>
        </div>

        <div class="mt-2 text-3xl font-bold text-white">
          {{ stats.interruptedSessions }}
        </div>
      </div>

      <div class="rounded-2xl bg-slate-800/60 p-4">
        <div class="flex items-center gap-2 text-cyan-400">
          <Clock3 class="h-5 w-5"/>
          <span class="text-sm">Focus Hours</span>
        </div>

        <div class="mt-2 text-3xl font-bold text-white">
          {{ totalFocusHours }}
        </div>
      </div>

      <div class="rounded-2xl bg-slate-800/60 p-4">
        <div class="flex items-center gap-2 text-yellow-400">
          <Trophy class="h-5 w-5"/>
          <span class="text-sm">Best Streak</span>
        </div>

        <div class="mt-2 text-3xl font-bold text-white">
          🔥 {{ stats.longestStreak }}
        </div>
      </div>

    </div>

    <div class="my-6 h-px bg-white/10"></div>

    <div class="space-y-4">

      <div class="flex justify-between">
        <span class="text-slate-400">
          Current Streak
        </span>

        <span class="font-semibold text-orange-400">
          🔥 {{ stats.currentStreak }}
        </span>
      </div>

      <div class="flex justify-between">
        <span class="text-slate-400">
          Today's Sessions
        </span>

        <span class="font-semibold text-white">
          {{ stats.todaySessions }}
        </span>
      </div>

      <div class="flex justify-between">
        <span class="text-slate-400">
          This Week
        </span>

        <span class="font-semibold text-white">
          {{ stats.weekSessions }}
        </span>
      </div>

      <div class="flex justify-between">
        <span class="text-slate-400">
          This Month
        </span>

        <span class="font-semibold text-white">
          {{ stats.monthSessions }}
        </span>
      </div>

      <div class="flex justify-between">
        <span class="text-slate-400">
          Average Focus Session
        </span>

        <span class="font-semibold text-white">
          {{ averageFocusMinutes }} min
        </span>
      </div>

      <div class="flex justify-between">
        <span class="text-slate-400">
          Completion Rate
        </span>

        <span class="font-semibold text-emerald-400">
          {{ completionRate }}%
        </span>
      </div>

    </div>

    <div class="mt-6">

      <div class="mb-2 flex justify-between text-sm">
        <span class="text-slate-400">
          Success Rate
        </span>

        <span class="text-white">
          {{ completionRate }}%
        </span>
      </div>

      <div
        class="h-3 overflow-hidden rounded-full bg-slate-800"
      >
        <div
          class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
          :style="{
            width: completionRate + '%'
          }"
        />
      </div>

    </div>
  </div>
</template>