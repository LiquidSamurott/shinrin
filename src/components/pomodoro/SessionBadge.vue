<script setup lang="ts">
import type { SessionType } from "../../services/pomodoro/sessions";

const props = defineProps<{
  session: SessionType;
}>();

const colors = {
  focus:
    "bg-blue-500/15 text-blue-400 border-blue-500/30",

  shortBreak:
    "bg-green-500/15 text-green-400 border-green-500/30",

  longBreak:
    "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const labels = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};
</script>

<template>
  <span
    class="rounded-full border px-3 py-1 text-sm font-semibold"
    :class="colors[session]"
  >
    {{ labels[session] }}
  </span>
</template>