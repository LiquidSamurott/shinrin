<script setup lang="ts">
import { ref, computed } from "vue";

import {
  CalendarDays,
  Clock3,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Briefcase,
  Coffee,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "@lucide/vue";

import { useCalendarStore } from "../../stores/calendar";

const calendar = useCalendarStore();

/* ==========================================
   Collapse State
========================================== */

const isCollapsed = ref(false);

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

/* ==========================================
   Event Counts
========================================== */

const totalEvents = computed(() => calendar.events.length);
const todayEvents = computed(() => calendar.todayEvents);
const upcomingEvents = computed(() => calendar.upcomingEvents);

/* ==========================================
   Event Types
========================================== */

const eventTypes = [
  { key: "study", label: "Study", icon: BookOpen, color: "text-blue-400", glow: "shadow-blue-500/20" },
  { key: "exam", label: "Exams", icon: GraduationCap, color: "text-amber-400", glow: "shadow-amber-500/20" },
  { key: "assignment", label: "Assignments", icon: ClipboardList, color: "text-emerald-400", glow: "shadow-emerald-500/20" },
  { key: "meeting", label: "Meetings", icon: Briefcase, color: "text-purple-400", glow: "shadow-purple-500/20" },
  { key: "holiday", label: "Holiday", icon: PartyPopper, color: "text-rose-400", glow: "shadow-rose-500/20" },
  { key: "pomodoro", label: "Pomodoro", icon: Coffee, color: "text-teal-400", glow: "shadow-teal-500/20" },
] as const;

const counts = computed(() => {
  return eventTypes.map((type) => ({
    ...type,
    count: calendar.events.filter((event) => event.eventType === type.key).length,
  }));
});

/* Helper to format dates cleanly */
function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
</script>

<template>
  <aside
    :class="[
      'relative flex h-full flex-col border-r border-white/10 bg-slate-950/40 backdrop-blur-3xl transition-all duration-300 ease-in-out select-none',
      isCollapsed ? 'w-20 p-3' : 'w-80 p-5'
    ]"
  >
    <!-- Liquid Ambient Refraction Orbs -->
    <div class="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl"></div>
    <div class="pointer-events-none absolute top-1/2 -right-20 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl"></div>

    <!-- Edge Specular Highlight Line (Liquid Glass Border Accent) -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

    <!-- Toggle Collapse Button -->
    <button
      @click="toggleSidebar"
      class="absolute -right-3.5 top-6 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-white/90 shadow-xl shadow-black/40 backdrop-blur-xl transition hover:scale-110 hover:border-emerald-400/50 hover:text-emerald-400 active:scale-95"
      :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
    >
      <ChevronRight v-if="isCollapsed" class="h-4 w-4" />
      <ChevronLeft v-else class="h-4 w-4" />
    </button>

    <!-- Scrollable Content Wrapper -->
    <div class="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden pr-0.5">

      <!-- COLLAPSED VIEW (Mini Glass Icons Strip) -->
      <template v-if="isCollapsed">
        <div class="flex flex-col items-center gap-6 pt-2">
          <!-- Total Count Badge -->
          <div class="flex flex-col items-center gap-1.5" title="Total Events">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-emerald-400 shadow-inner backdrop-blur-xl">
              <Sparkles class="h-5 w-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <span class="text-xs font-bold text-white/90">{{ totalEvents }}</span>
          </div>

          <div class="h-px w-8 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

          <!-- Category Icons with Mini Glass Badges -->
          <div class="flex flex-col gap-3.5">
            <div
              v-for="item in counts"
              :key="item.key"
              class="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-lg backdrop-blur-xl transition hover:scale-105 hover:border-white/20 hover:bg-white/[0.08]"
              :title="`${item.label}: ${item.count}`"
            >
              <component :is="item.icon" :class="['h-5 w-5', item.color]" />
              <span
                v-if="item.count > 0"
                class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500 text-[10px] font-black text-slate-950 shadow-md shadow-emerald-950/50"
              >
                {{ item.count }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- EXPANDED VIEW -->
      <template v-else>
        <!-- Statistics Section -->
        <section>
          <h2 class="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
            Overview
          </h2>

          <div class="grid grid-cols-2 gap-3">
            <!-- Total Events Card -->
            <div class="group relative overflow-hidden rounded-2xl border border-white/10 border-t-white/20 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:from-white/[0.12] hover:to-white/[0.04]">
              <div class="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/5 blur-xl group-hover:bg-white/10"></div>
              <p class="text-xs font-medium text-white/60">Total Events</p>
              <p class="mt-2 text-2xl font-black tracking-tight text-white drop-shadow-md">
                {{ totalEvents }}
              </p>
            </div>

            <!-- Today Events Card -->
            <div class="group relative overflow-hidden rounded-2xl border border-emerald-500/30 border-t-emerald-400/40 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 p-4 shadow-xl shadow-emerald-950/20 backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/50 hover:from-emerald-500/30 hover:to-emerald-500/10">
              <div class="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-emerald-400/20 blur-xl group-hover:bg-emerald-400/30"></div>
              <p class="text-xs font-semibold text-emerald-300/90">Today</p>
              <p class="mt-2 text-2xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                {{ todayEvents.length }}
              </p>
            </div>
          </div>
        </section>

        <!-- Categories / Event Types -->
        <section>
          <h2 class="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
            Categories
          </h2>

          <div class="space-y-2">
            <div
              v-for="item in counts"
              :key="item.key"
              class="group flex items-center justify-between rounded-2xl border border-white/10 border-t-white/15 bg-white/[0.03] px-3.5 py-2.5 shadow-md backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-lg"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner">
                  <component :is="item.icon" :class="['h-4 w-4 transition-transform duration-300 group-hover:scale-110', item.color]" />
                </div>
                <span class="text-sm font-semibold text-white/90 group-hover:text-white">
                  {{ item.label }}
                </span>
              </div>

              <span class="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white/90 shadow-inner group-hover:border-white/30 group-hover:bg-white/20">
                {{ item.count }}
              </span>
            </div>
          </div>
        </section>

        <!-- Today's Schedule -->
        <section>
          <h2 class="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
            <Clock3 class="h-3.5 w-3.5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            Today
          </h2>

          <div v-if="todayEvents.length" class="space-y-2.5">
            <div
              v-for="event in todayEvents"
              :key="event.id"
              class="group relative overflow-hidden rounded-2xl border border-white/10 border-t-white/20 bg-gradient-to-r from-slate-900/60 to-slate-900/30 p-3.5 shadow-lg backdrop-blur-xl transition duration-300 hover:border-emerald-500/40 hover:bg-slate-900/80"
            >
              <!-- Glowing Left Accent Bar -->
              <div class="absolute left-0 top-0 h-full w-1 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>

              <h3 class="pl-1 text-sm font-bold text-white transition-colors group-hover:text-emerald-300">
                {{ event.title }}
              </h3>

              <p class="mt-1 pl-1 text-xs font-medium text-white/50">
                {{ formatDate(event.startDate) }}
              </p>
            </div>
          </div>

          <p v-else class="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-4 text-center text-xs font-medium text-white/40 backdrop-blur-md">
            Nothing scheduled today.
          </p>
        </section>

        <!-- Upcoming Events -->
        <section>
          <h2 class="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
            <CalendarDays class="h-3.5 w-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
            Upcoming
          </h2>

          <div v-if="upcomingEvents.length" class="space-y-2.5">
            <div
              v-for="event in upcomingEvents"
              :key="event.id"
              class="group relative overflow-hidden rounded-2xl border border-white/10 border-t-white/20 bg-gradient-to-r from-slate-900/60 to-slate-900/30 p-3.5 shadow-lg backdrop-blur-xl transition duration-300 hover:border-cyan-500/40 hover:bg-slate-900/80"
            >
              <!-- Glowing Left Accent Bar -->
              <div class="absolute left-0 top-0 h-full w-1 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>

              <h3 class="pl-1 text-sm font-bold text-white transition-colors group-hover:text-cyan-300">
                {{ event.title }}
              </h3>

              <p class="mt-1 pl-1 text-xs font-medium text-white/50">
                {{ formatDate(event.startDate) }}
              </p>
            </div>
          </div>

          <p v-else class="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-4 text-center text-xs font-medium text-white/40 backdrop-blur-md">
            No upcoming events.
          </p>
        </section>
      </template>

    </div>
  </aside>
</template>

<style scoped>
/* Liquid Glass Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>