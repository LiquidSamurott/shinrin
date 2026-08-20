<script setup lang="ts">
import CalendarView from "../components/calendar/Calendar.vue";
</script>

<template>
  <div class="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-950 p-3 sm:p-6 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
    
    <!-- Ambient Radial Light Sources (Liquid Glass Backdrops) -->
    <div class="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-transparent blur-[140px]"></div>
    <div class="pointer-events-none absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-emerald-900/15 blur-[120px]"></div>
    <div class="pointer-events-none absolute top-1/4 -right-20 h-[400px] w-[400px] rounded-full bg-cyan-900/15 blur-[120px]"></div>

    <!-- Subtle Radial Background Glass Grid Texture -->
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(16,185,129,0.05),rgba(255,255,255,0))]"></div>

    <!-- Main Liquid Glass Viewport Container -->
    <main class="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 shadow-2xl backdrop-blur-2xl">
      <CalendarView />
    </main>

  </div>
</template>

<style scoped>
/* Smooth page entrance transition */
main {
  animation: floatIn 0.5s ease-out;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>