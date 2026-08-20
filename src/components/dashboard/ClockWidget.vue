<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { Clock } from "@lucide/vue";

const now = ref(new Date());

let timer: number | null = null;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
});

const time = computed(() =>
  now.value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
);

const date = computed(() =>
  now.value.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
);

const timezone = computed(() =>
  Intl.DateTimeFormat("id-ID", {
    timeZoneName: "short",
  })
    .formatToParts(now.value)
    .find((part) => part.type === "timeZoneName")
    ?.value ?? "WIB"
);
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-white/10 border-t-white/20 bg-slate-950/40 p-6 shadow-2xl backdrop-blur-3xl select-none"
  >
    <!-- Specular Edge Highlight -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>

    <!-- Liquid Ambient Refraction Orbs -->
    <div class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl"></div>
    <div class="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-cyan-500/15 blur-2xl"></div>

    <div class="relative z-10 flex flex-col gap-3">
      <!-- Top Bar: Date & Status Badge -->
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium capitalize text-white/60">
          {{ date }}
        </span>

        <!-- Live Pulse Indicator -->
        <div class="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 shadow-inner backdrop-blur-md">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          LIVE
        </div>
      </div>

      <!-- Main Monospaced Digital Display -->
      <div class="flex items-baseline gap-2">
        <h2 class="font-mono text-4xl font-black tracking-tight text-white tabular-nums drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] sm:text-5xl">
          {{ time }}
        </h2>
      </div>

      <!-- Footer: Timezone Badge -->
      <div class="flex items-center gap-2 pt-1">
        <div class="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-400 backdrop-blur-md">
          <Clock class="h-3.5 w-3.5" />
        </div>
        <span class="text-xs font-semibold text-white/50">
          <strong class="text-white/80 font-bold">{{ timezone }}</strong> · Local time
        </span>
      </div>
    </div>
  </section>
</template>