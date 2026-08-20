<script setup lang="ts">
import { computed } from "vue";
import {
  Play,
  Pause,
  Square,
  SkipForward,
} from "@lucide/vue";

import { usePomodoroStore } from "../../stores/pomodoro";

const pomodoro = usePomodoroStore();

const running = computed(() => pomodoro.running);
const paused = computed(() => pomodoro.pause);

function start() {
  pomodoro.start();
}

function pause() {
  pomodoro.pause();
}

function resume() {
  pomodoro.resume();
}

function stop() {
  pomodoro.stop();
}

function skip() {
  pomodoro.skip();
}
</script>

<template>
  <div class="flex items-center justify-center gap-3">

    <!-- Start -->
    <button
      v-if="!running && !paused"
      @click="start"
      class="rounded-xl bg-blue-600 p-3 transition hover:bg-blue-500"
      title="Start"
    >
      <Play />
    </button>

    <!-- Pause -->
    <button
      v-else-if="running"
      @click="pause"
      class="rounded-xl bg-yellow-600 p-3 transition hover:bg-yellow-500"
      title="Pause"
    >
      <Pause />
    </button>

    <!-- Resume -->
    <button
      v-else
      @click="resume"
      class="rounded-xl bg-green-600 p-3 transition hover:bg-green-500"
      title="Resume"
    >
      <Play />
    </button>

    <!-- Stop -->
    <button
      @click="stop"
      class="rounded-xl bg-red-600 p-3 transition hover:bg-red-500"
      title="Stop"
    >
      <Square />
    </button>

    <!-- Skip -->
    <button
      @click="skip"
      class="rounded-xl bg-slate-700 p-3 transition hover:bg-slate-600"
      title="Skip Session"
    >
      <SkipForward />
    </button>

  </div>
</template>