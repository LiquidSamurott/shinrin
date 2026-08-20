<script setup lang="ts">
import PomodoroTimer from "../components/pomodoro/PomodoroTimer.vue";
</script>

<template>
  <div class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 p-4 sm:p-8 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
    
    <!-- Ambient Radial Light Glows (Liquid Glass Lighting) -->
    <div class="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-600/20 via-teal-500/10 to-transparent blur-[120px]"></div>
    <div class="pointer-events-none absolute -bottom-32 -left-20 h-[400px] w-[400px] rounded-full bg-emerald-900/15 blur-[100px]"></div>
    <div class="pointer-events-none absolute top-1/3 -right-20 h-[350px] w-[350px] rounded-full bg-cyan-900/15 blur-[100px]"></div>

    <!-- Subtle Radial Background Texture -->
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(16,185,129,0.06),rgba(255,255,255,0))]"></div>

    <!-- Centered Glass App Window -->
    <main class="relative z-10 w-full max-w-md">
      <PomodoroTimer />
    </main>

  </div>
</template>

<style scoped>
/* Smooth page entry animation */
main {
  animation: floatIn 0.5s ease-out;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>