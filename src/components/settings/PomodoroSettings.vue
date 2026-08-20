<script setup lang="ts">
import {
  Flame,
  Coffee,
  Clock,
  PlayCircle,
} from "@lucide/vue";

import { usePomodoroStore } from "../../stores/pomodoro";

const pomodoro = usePomodoroStore();
</script>

<template>
  <section
    class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-xl"
  >
    <div class="mb-6 flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-xl
               border border-emerald-400/20 bg-emerald-500/10"
      >
        <Clock class="h-5 w-5 text-emerald-400" />
      </div>

      <div>
        <h2 class="font-bold text-white">
          Pomodoro Timer
        </h2>

        <p class="text-xs text-white/50">
          Customize your focus and break durations.
        </p>
      </div>
    </div>

    <!-- Durations -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <!-- Focus -->
      <div>
        <label
          class="mb-2 flex items-center gap-2 text-xs font-semibold text-white/70"
        >
          <Flame class="h-4 w-4 text-emerald-400" />
          Focus
        </label>

        <div class="relative">
          <input
            :value="pomodoro.timers.focus / 60"
            type="number"
            min="1"
            @change="
              pomodoro.setFocusMinutes(
                Number(($event.target as HTMLInputElement).value)
              )
            "
            class="w-full rounded-xl border border-white/10
                   bg-white/[0.06] px-4 py-3 pr-10
                   text-white outline-none
                   transition focus:border-emerald-500
                   focus:ring-2 focus:ring-emerald-500/20"
          />

          <span class="absolute right-3 top-3 text-xs text-white/40">
            min
          </span>
        </div>
      </div>

      <!-- Short Break -->
      <div>
        <label
          class="mb-2 flex items-center gap-2 text-xs font-semibold text-white/70"
        >
          <Coffee class="h-4 w-4 text-teal-400" />
          Short Break
        </label>

        <div class="relative">
          <input
            :value="pomodoro.timers.shortBreak / 60"
            type="number"
            min="1"
            @change="
              pomodoro.setShortBreakMinutes(
                Number(($event.target as HTMLInputElement).value)
              )
            "
            class="w-full rounded-xl border border-white/10
                   bg-white/[0.06] px-4 py-3 pr-10
                   text-white outline-none
                   transition focus:border-teal-500
                   focus:ring-2 focus:ring-teal-500/20"
          />

          <span class="absolute right-3 top-3 text-xs text-white/40">
            min
          </span>
        </div>
      </div>

      <!-- Long Break -->
      <div>
        <label
          class="mb-2 flex items-center gap-2 text-xs font-semibold text-white/70"
        >
          <Clock class="h-4 w-4 text-cyan-400" />
          Long Break
        </label>

        <div class="relative">
          <input
            :value="pomodoro.timers.longBreak / 60"
            type="number"
            min="1"
            @change="
              pomodoro.setLongBreakMinutes(
                Number(($event.target as HTMLInputElement).value)
              )
            "
            class="w-full rounded-xl border border-white/10
                   bg-white/[0.06] px-4 py-3 pr-10
                   text-white outline-none
                   transition focus:border-cyan-500
                   focus:ring-2 focus:ring-cyan-500/20"
          />

          <span class="absolute right-3 top-3 text-xs text-white/40">
            min
          </span>
        </div>
      </div>
    </div>

    <div class="my-6 h-px bg-white/10"></div>

    <!-- Toggles -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Coffee class="h-5 w-5 text-emerald-400" />

          <div>
            <p class="text-sm font-medium text-white">
              Auto Start Breaks
            </p>

            <p class="text-xs text-white/40">
              Automatically start the next break.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="
            pomodoro.setAutoStartBreaks(
              !pomodoro.autoStartBreaks
            )
          "
          :class="[
            'relative h-6 w-11 rounded-full border transition',
            pomodoro.autoStartBreaks
              ? 'border-emerald-400/40 bg-emerald-600'
              : 'border-white/10 bg-white/10'
          ]"
        >
          <span
            :class="[
              'absolute top-0.5 h-5 w-5 rounded-full bg-white transition',
              pomodoro.autoStartBreaks
                ? 'left-5'
                : 'left-0.5'
            ]"
          />
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <PlayCircle class="h-5 w-5 text-emerald-400" />

          <div>
            <p class="text-sm font-medium text-white">
              Auto Start Focus
            </p>

            <p class="text-xs text-white/40">
              Automatically start the next focus session.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="
            pomodoro.setAutoStartFocus(
              !pomodoro.autoStartFocus
            )
          "
          :class="[
            'relative h-6 w-11 rounded-full border transition',
            pomodoro.autoStartFocus
              ? 'border-emerald-400/40 bg-emerald-600'
              : 'border-white/10 bg-white/10'
          ]"
        >
          <span
            :class="[
              'absolute top-0.5 h-5 w-5 rounded-full bg-white transition',
              pomodoro.autoStartFocus
                ? 'left-5'
                : 'left-0.5'
            ]"
          />
        </button>
      </div>
    </div>
  </section>
</template>

