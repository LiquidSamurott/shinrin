<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import { RouterView } from "vue-router";

</script>

<template>
  <div class="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
    <Sidebar />
      <!-- Fixed: Changed bg-slate-900 to bg-slate-950 and added relative/w-full to ensure full bleed -->
      <main class="relative flex min-w-0 flex-1 w-full overflow-hidden bg-slate-950">
        <RouterView />
      </main>
  </div>
</template>