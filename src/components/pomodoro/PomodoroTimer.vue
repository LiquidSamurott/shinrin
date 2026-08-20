<script setup lang="ts">
import { ref, computed } from "vue";
import { Timer, Flame, Clock, Settings2 } from "@lucide/vue";

import { usePomodoroStore } from "../../stores/pomodoro";

import PomodoroProgress from "./PomodoroProgress.vue";
import PomodoroControls from "./PomodoroControls.vue";
import PomodoroSettings from "../settings/PomodoroSettings.vue";
import SessionBadge from "./SessionBadge.vue";

const pomodoro = usePomodoroStore();
const showSettings = ref(false);



// --- CIRCLE TIMER CALCULATIONS ---
const radius = 110;
const circumference = 2 * Math.PI * radius;

const strokeDashoffset = computed(() => {
  const progress = Math.max(0, Math.min(1, pomodoro.progress || 0));
  return circumference * (1 - progress);
});

// Dynamic session background theme switch
const isBreak = computed(() =>
  pomodoro.currentSession?.toLowerCase().includes("break")
);
</script>

<template>
  <div class="relative mx-auto w-full max-w-sm select-none p-4 sm:max-w-md">
    <!-- Dynamic Ambient Background Glow -->
    <div
      class="pointer-events-none absolute -inset-2 rounded-3xl opacity-25 blur-3xl transition-all duration-700"
      :class="isBreak ? 'bg-gradient-to-r from-teal-500 to-cyan-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'"
    ></div>

    <!-- Main Liquid Glass Card -->
    <div class="relative z-10 w-full rounded-3xl border border-white/10 border-t-white/20 bg-slate-950/60 p-6 shadow-2xl backdrop-blur-3xl transition-all duration-300">
      
      <!-- Top Specular Highlight Edge -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>

      <!-- Top Bar: Title & Settings Toggle -->
      <div class="mb-5 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-emerald-400 shadow-inner backdrop-blur-md">
            <Timer class="h-5 w-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          <h1 class="text-lg font-bold tracking-tight text-white drop-shadow-sm">
            Pomodoro Timer
          </h1>
        </div>

        <!-- Settings Toggle Button -->
        <button
          @click="showSettings = !showSettings"
          :class="[
            'flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 backdrop-blur-md active:scale-95',
            showSettings 
              ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-md' 
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white'
          ]"
          title="Toggle Settings"
        >
          <Settings2 class="h-4 w-4" />
        </button>
      </div>

      <!-- Main Layout Body -->
      <div class="flex flex-col items-center gap-5">
        
        <!-- Session Status Badge -->
        <SessionBadge :session="pomodoro.currentSession" />

        <!-- Liquid Circular Timer Display Container -->
        <div class="relative flex h-60 w-60 items-center justify-center sm:h-64 sm:w-64">
          <!-- SVG Glass Ring Canvas -->
          <svg class="h-full w-full -rotate-90 transform" viewBox="0 0 260 260">
            <!-- Background Track Ring -->
            <circle
              cx="130"
              cy="130"
              :r="radius"
              class="stroke-white/10"
              stroke-width="10"
              fill="transparent"
            />

            <!-- Progress Arc Ring -->
            <circle
              cx="130"
              cy="130"
              :r="radius"
              :class="isBreak ? 'stroke-teal-400 drop-shadow-[0_0_12px_rgba(45,212,191,0.6)]' : 'stroke-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]'"
              stroke-width="10"
              stroke-linecap="round"
              fill="transparent"
              :style="{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.4s ease-out, stroke 0.5s ease'
              }"
            />
          </svg>

          <!-- Dead-Centered Timer Overlay -->
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <!-- Active Mode Icon Pill -->
            <div
              class="mb-2 flex h-8 w-8 items-center justify-center rounded-xl border shadow-inner backdrop-blur-md transition-colors duration-500"
              :class="isBreak ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
            >
              <Clock v-if="isBreak" class="h-4 w-4 animate-pulse" />
              <Flame v-else class="h-4 w-4 animate-pulse" />
            </div>

            <!-- Formatted Countdown Display -->
            <PomodoroProgress
              :progress="pomodoro.progress"
              :time="pomodoro.formattedTime"
            />
          </div>
        </div>

        <!-- Timer Control Buttons -->
        <PomodoroControls />

        <!-- Settings Container -->
        <Transition name="fade-slide">
          <div v-if="showSettings" class="w-full">
            <PomodoroSettings />
          </div>
        </Transition>

      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-in-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>