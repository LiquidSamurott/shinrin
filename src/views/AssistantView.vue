<script setup lang="ts">
import AIAssistant from "../components/assistant/AIAssistant.vue";
</script>

<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-slate-900 text-slate-100 antialiased">

    <!-- Main Content Canvas -->
    <main class="relative flex-1 overflow-hidden p-4 md:p-6 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <div class="mx-auto h-full max-w-7xl overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-2xl backdrop-blur-xl">
        <AIAssistant />
      </div>
    </main>
  </div>
</template>