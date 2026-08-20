<script setup lang="ts">
import {
  LayoutDashboard,
  CheckCircle2,
  StickyNote,
  BarChart3,
  GraduationCap,
} from "@lucide/vue";

const props = defineProps<{
  dailyProgress: boolean;
  quickNotes: boolean;
  pomodoroStats: boolean;
  studyStats: boolean;
}>();

const emit = defineEmits<{
  "update:dailyProgress": [value: boolean];
  "update:quickNotes": [value: boolean];
  "update:pomodoroStats": [value: boolean];
  "update:studyStats": [value: boolean];
}>();

function toggleDailyProgress() {
  emit("update:dailyProgress", !props.dailyProgress);
}

function toggleQuickNotes() {
  emit("update:quickNotes", !props.quickNotes);
}

function togglePomodoroStats() {
  emit("update:pomodoroStats", !props.pomodoroStats);
}

function toggleStudyStats() {
  emit("update:studyStats", !props.studyStats);
}
</script>

<template>
  <section
    class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-xl"
  >
    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10"
      >
        <LayoutDashboard class="h-5 w-5 text-cyan-400" />
      </div>

      <div>
        <h2 class="text-lg font-bold text-white">
          Dashboard
        </h2>

        <p class="text-sm text-white/45">
          Choose which widgets appear on your dashboard.
        </p>
      </div>
    </div>

    <div class="space-y-3">
      <!-- Daily Progress -->
      <div
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div class="flex items-center gap-3">
          <CheckCircle2 class="h-5 w-5 text-emerald-400" />

          <div>
            <p class="font-medium text-white">
              Daily Progress
            </p>

            <p class="text-xs text-white/40">
              Show today's task completion.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="relative inline-flex h-6 w-11 rounded-full border transition-all duration-300"
          :class="
            dailyProgress
              ? 'border-emerald-400/40 bg-emerald-600'
              : 'border-white/10 bg-white/10'
          "
          @click="toggleDailyProgress"
        >
          <span
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="
              dailyProgress
                ? 'translate-x-5'
                : 'translate-x-0'
            "
          />
        </button>
      </div>

      <!-- Quick Notes -->
      <div
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div class="flex items-center gap-3">
          <StickyNote class="h-5 w-5 text-yellow-400" />

          <div>
            <p class="font-medium text-white">
              Quick Notes
            </p>

            <p class="text-xs text-white/40">
              Show your quick notes widget.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="relative inline-flex h-6 w-11 rounded-full border transition-all duration-300"
          :class="
            quickNotes
              ? 'border-yellow-400/40 bg-yellow-600'
              : 'border-white/10 bg-white/10'
          "
          @click="toggleQuickNotes"
        >
          <span
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="
              quickNotes
                ? 'translate-x-5'
                : 'translate-x-0'
            "
          />
        </button>
      </div>

      <!-- Pomodoro Stats -->
      <div
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div class="flex items-center gap-3">
          <BarChart3 class="h-5 w-5 text-cyan-400" />

          <div>
            <p class="font-medium text-white">
              Pomodoro Statistics
            </p>

            <p class="text-xs text-white/40">
              Show your focus statistics.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="relative inline-flex h-6 w-11 rounded-full border transition-all duration-300"
          :class="
            pomodoroStats
              ? 'border-cyan-400/40 bg-cyan-600'
              : 'border-white/10 bg-white/10'
          "
          @click="togglePomodoroStats"
        >
          <span
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="
              pomodoroStats
                ? 'translate-x-5'
                : 'translate-x-0'
            "
          />
        </button>
      </div>

      <!-- Study Stats -->
      <div
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div class="flex items-center gap-3">
          <GraduationCap class="h-5 w-5 text-purple-400" />

          <div>
            <p class="font-medium text-white">
              Study Statistics
            </p>

            <p class="text-xs text-white/40">
              Show study performance.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="relative inline-flex h-6 w-11 rounded-full border transition-all duration-300"
          :class="
            studyStats
              ? 'border-purple-400/40 bg-purple-600'
              : 'border-white/10 bg-white/10'
          "
          @click="toggleStudyStats"
        >
          <span
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="
              studyStats
                ? 'translate-x-5'
                : 'translate-x-0'
            "
          />
        </button>
      </div>
    </div>
  </section>
</template>