<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  Layers,
  Timer,
  Bot,
  Settings,
  Trees,
} from "@lucide/vue";

// Separated into main navigation and system links for clearer structure
const mainNavItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Kanban", path: "/kanban", icon: Kanban },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Flashcards", path: "/flashcards", icon: Layers },
  { name: "Pomodoro", path: "/pomodoro", icon: Timer },
  { name: "Assistant", path: "/assistant", icon: Bot },
];

const systemNavItems = [
  { name: "Settings", path: "/settings", icon: Settings },
];
</script>

<template>
  <aside
    class="flex h-full w-72 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/95 text-slate-100 select-none backdrop-blur-md"
  >
    <!-- Brand / Header (Taller with extra vertical padding) -->
    <div class="flex h-24 items-center gap-4 border-b border-slate-800/80 px-7">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-950/40">
        <Trees class="h-6 w-6" />
      </div>
      <div>
        <h2 class="text-lg font-bold tracking-tight text-white">
          Shinrin
        </h2>
        <p class="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Workspace
        </p>
      </div>
    </div>

    <!-- Navigation List (More padding & larger gaps between items) -->
    <nav class="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col justify-between">
      <!-- Main Links Group -->
      <div class="space-y-3">
        <RouterLink
          v-for="item in mainNavItems"
          :key="item.path"
          :to="item.path"
          v-slot="{ isActive }"
          class="block"
        >
          <div
            :class="[
              'group relative flex items-center gap-4 rounded-xl px-4 py-4 text-base font-medium transition-all duration-150',
              isActive
                ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-md shadow-blue-950/40'
                : 'border border-transparent text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
            ]"
          >
            <!-- Active Left Pill Indicator -->
            <span
              v-if="isActive"
              class="absolute left-0 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-blue-500"
            ></span>

            <!-- Lucide Icon -->
            <component
              :is="item.icon"
              :class="[
                'h-5 w-5 shrink-0 transition-colors duration-150',
                isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
              ]"
            />

            <span>{{ item.name }}</span>
          </div>
        </RouterLink>
      </div>

      <!-- Footer / System Links Group (Separated to the bottom with top border) -->
      <div class="pt-5 border-t border-slate-800/80 space-y-3 mt-6">
        <RouterLink
          v-for="item in systemNavItems"
          :key="item.path"
          :to="item.path"
          v-slot="{ isActive }"
          class="block"
        >
          <div
            :class="[
              'group relative flex items-center gap-4 rounded-xl px-4 py-4 text-base font-medium transition-all duration-150',
              isActive
                ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-md shadow-blue-950/40'
                : 'border border-transparent text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
            ]"
          >
            <span
              v-if="isActive"
              class="absolute left-0 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-blue-500"
            ></span>

            <component
              :is="item.icon"
              :class="[
                'h-5 w-5 shrink-0 transition-colors duration-150',
                isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
              ]"
            />

            <span>{{ item.name }}</span>
          </div>
        </RouterLink>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
/* Custom Scrollbar for navigation */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.4);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.7);
}
</style>