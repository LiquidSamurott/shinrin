<script setup lang="ts">
import { computed } from "vue";

import FullCalendar from "@fullcalendar/vue3";
import listPlugin from "@fullcalendar/list";
import { Calendar as CalendarIcon, Sparkles } from "@lucide/vue";

import type { CalendarOptions } from "@fullcalendar/core";

import { useCalendarStore } from "../../stores/calendar";

const calendar = useCalendarStore();

const calendarEvents = computed(() =>
  calendar.expandedEvents.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startDate,
    end: event.endDate ?? undefined,
    allDay: event.allDay,

    backgroundColor:
      event.color ?? "#06b6d4", // Liquid Cyan default

    borderColor:
      event.color ?? "#06b6d4",

    extendedProps: {
      description: event.description,
      location: event.location,
      eventType: event.eventType,
    },
  }))
);

const options = computed<CalendarOptions>(() => ({
  plugins: [listPlugin],

  initialView: "listDay",

  initialDate: new Date(),

  events: calendarEvents.value,

  height: "100%",

  headerToolbar: false,

  eventDisplay: "block",

  noEventsContent: "No events scheduled for today",

  eventClick(info) {
    const event = calendar.events.find(
      (event) => event.id === info.event.id
    );

    if (!event) return;

    calendar.selectEvent(event);
  },
}));
</script>

<template>
  <section
    class="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 border-t-white/20 bg-slate-950/40 p-5 shadow-2xl backdrop-blur-3xl select-none sm:p-6"
  >
    <!-- Specular Top Edge Light Refraction -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>

    <!-- Liquid Refraction Light Orbs -->
    <div class="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl"></div>

    <!-- Header -->
    <div class="relative z-10 mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-400 shadow-inner backdrop-blur-xl"
        >
          <CalendarIcon class="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
        </div>

        <div>
          <h2 class="text-base font-bold tracking-tight text-white drop-shadow-sm">
            Today's Agenda
          </h2>

          <p class="text-xs font-semibold text-slate-300">
            Your schedule for today
          </p>
        </div>
      </div>

      <!-- Action Button / Today Badge -->
      <div
        class="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur-md shadow-sm"
      >
        <Sparkles class="h-3.5 w-3.5 text-cyan-400" />
        <span>Today</span>
      </div>
    </div>

    <!-- Calendar List Container -->
    <div class="relative z-10 min-h-[160px] flex-1 overflow-hidden">
      <FullCalendar
        :options="options"
        class="h-full"
      />
    </div>
  </section>
</template>

<style scoped>
/* FullCalendar Liquid Glass Overrides */
:deep(.fc) {
  height: 100%;
  --fc-border-color: rgba(255, 255, 255, 0.08);
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: transparent;
  --fc-neutral-text-color: #f8fafc;
  --fc-list-event-hover-bg-color: rgba(255, 255, 255, 0.08);

  color: #f8fafc;
  font-size: 0.8125rem;
}

:deep(.fc-list) {
  border: none !important;
  background: transparent;
}

/* Hide Day Cushion Header in listDay View to reduce clutter */
:deep(.fc-list-day-cushion) {
  display: none !important;
}

/* Agenda Event Items Styling */
:deep(.fc-list-event) {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.025);
  transition: all 0.2s ease-in-out;
}

:deep(.fc-list-event:hover) {
  background-color: rgba(255, 255, 255, 0.075) !important;
  transform: translateY(-1px);
}

:deep(.fc-list-event td) {
  border-color: rgba(255, 255, 255, 0.08) !important;
  padding: 0.875rem 0.75rem;
}

:deep(.fc-list-event-graphic) {
  padding-left: 0.75rem !important;
}

:deep(.fc-list-event-dot) {
  border-width: 4px !important;
  box-shadow: 0 0 8px currentColor;
}

:deep(.fc-list-event-time) {
  color: #94a3b8 !important; /* High contrast text */
  font-weight: 600;
  font-size: 0.75rem;
  white-space: nowrap;
}

:deep(.fc-list-event-title) {
  color: #ffffff !important; /* Bright crisp white title */
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Glass Styling for Empty State */
:deep(.fc-list-empty) {
  background: transparent !important;
}

:deep(.fc-list-empty-cushion) {
  display: flex;
  align-items: center;
  justify-content: center;  
  min-height: 140px;
  border-radius: 1rem;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background-color: rgba(255, 255, 255, 0.01);
  color: #94a3b8 !important;
  font-size: 0.8125rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
}
</style>