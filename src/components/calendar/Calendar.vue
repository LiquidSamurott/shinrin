<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
} from "vue";

import FullCalendar from "@fullcalendar/vue3";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";

import type {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  DatesSetArg,
  EventDropArg,
} from "@fullcalendar/core";

import { useCalendarStore } from "../../stores/calendar.ts";
import { useTheme } from "../../composables/useTheme";

import CalendarToolbar from "./CalendarToolbar.vue";
import CalendarEventModal from "./CalendarEventModal.vue";
import CalendarDayPopover from "./CalendarDayPopover.vue";

/* ==========================================
   Store & Theme System
========================================== */

const calendar = useCalendarStore();

// Initialize theme watchers and CSS variables globally
useTheme();

/* ==========================================
   Calendar Reference
========================================== */

const calendarRef =
  ref<InstanceType<typeof FullCalendar> | null>(null);

/* ==========================================
   Modal & Popover State
========================================== */

const showEventModal = ref(false);
const showDayPopover = ref(false);
const selectedDay = ref<Date>(new Date());

/* ==========================================
   Events
========================================== */

const calendarEvents = computed(() => {
  return calendar.expandedEvents.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startDate,
    end: event.endDate ?? undefined,
    allDay: event.allDay,
    // Only pass custom colors if explicitly defined on the event.
    // If undefined, FullCalendar uses the CSS --fc-event-bg-color theme variable.
    backgroundColor: event.color ?? undefined,
    borderColor: event.color ?? undefined,
    extendedProps: {
      originalId: event.originalId,
      occurrence: event.occurrence,
      description: event.description,
      location: event.location,
      eventType: event.eventType,
    },
  }));
});

/* ==========================================
   Event Handlers
========================================== */

function handleEventClick(info: EventClickArg) {
  const event = calendar.events.find((e) => e.id === info.event.id);
  if (!event) return;

  calendar.selectEvent(event);
  showEventModal.value = true;
}

function handleDayClick(info: { date: Date }) {
  selectedDay.value = info.date;
  calendar.selectedDate = info.date;
  showDayPopover.value = true;
}

async function handleEventDrop(info: EventDropArg) {
  const event = calendar.getEvent(info.event.id);

  if (!event) {
    info.revert();
    return;
  }

  try {
    await calendar.updateEvent({
      ...event,
      startDate: info.event.start!.toISOString(),
      endDate: info.event.end ? info.event.end.toISOString() : null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    info.revert();
  }
}

async function handleEventResize(info: any) {
  const event = calendar.getEvent(info.event.id);

  if (!event) {
    info.revert();
    return;
  }

  try {
    await calendar.updateEvent({
      ...event,
      startDate: info.event.start!.toISOString(),
      endDate: info.event.end ? info.event.end.toISOString() : null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    info.revert();
  }
}

function handleDatesSet(info: DatesSetArg) {
  calendar.selectedDate = info.start;
}

/* ==========================================
   Toolbar Actions
========================================== */

function today() {
  calendar.goToday();
  calendarRef.value?.getApi().today();
}

function next() {
  calendar.next();
  calendarRef.value?.getApi().next();
}

function previous() {
  calendar.previous();
  calendarRef.value?.getApi().prev();
}

function changeView(
  view:
    | "dayGridMonth"
    | "timeGridWeek"
    | "timeGridDay"
    | "listWeek"
    | "multiMonthYear"
) {
  calendar.setView(view);
  calendarRef.value?.getApi().changeView(view);
}

function handleDateSelect(info: DateSelectArg) {
  calendar.clearSelection();

  const start = new Date(info.start);
  let end = new Date(start);

  if (info.allDay) {
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else {
    end.setHours(end.getHours() + 1);
  }

  calendar.selectedDate = start;

  calendar.newEventDefaults = {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    allDay: info.allDay,
  };

  showEventModal.value = true;
}

function newEvent() {
  calendar.clearSelection();
  showEventModal.value = true;
}

function closeModal() {
  showEventModal.value = false;
  calendar.clearSelection();
}

/* ==========================================
   Calendar Options
========================================== */

const options = computed<CalendarOptions>(() => ({
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    listPlugin,
    interactionPlugin,
    multiMonthPlugin,
  ],
  initialView: calendar.currentView,
  events: calendarEvents.value,
  selectable: true,
  editable: true,
  eventStartEditable: true,
  eventDurationEditable: true,
  eventResizableFromStart: true,
  selectMirror: true,
  weekends: true,
  dayMaxEvents: true,
  nowIndicator: true,
  height: "100%",
  headerToolbar: false,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  dateClick: handleDayClick,
  datesSet: handleDatesSet,
}));

/* ==========================================
   Lifecycle
========================================== */

onMounted(async () => {
  if (!calendar.loaded) {
    await calendar.load();
  }
});
</script>

<template>
  <div class="relative flex h-full w-full overflow-hidden bg-slate-950 select-none">
    <!-- Ambient Background Lighting Orbs (Theme reactive) -->
    <div 
      class="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full opacity-15 blur-[120px] transition-colors duration-500"
      :style="{ backgroundColor: 'var(--accent-500)' }"
    ></div>
    <div 
      class="pointer-events-none absolute -bottom-32 right-1/4 h-96 w-96 rounded-full opacity-15 blur-[120px] transition-colors duration-500"
      :style="{ backgroundColor: 'var(--accent-600)' }"
    ></div>

    <!-- Day Popover Component -->
    <CalendarDayPopover
      v-if="showDayPopover"
      :date="selectedDay"
      @close="showDayPopover = false"
    />

    <!-- Main Content Area -->
    <div class="relative z-10 flex flex-1 flex-col overflow-hidden">
      <!-- Toolbar -->
      <CalendarToolbar
        :current-view="calendar.currentView"
        :current-date="calendar.selectedDate"
        @today="today"
        @next="next"
        @previous="previous"
        @change-view="changeView"
        @new-event="newEvent"
      />

      <!-- Glass Calendar Canvas Container -->
      <div class="flex-1 overflow-hidden p-4">
        <div class="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 border-t-white/20 bg-slate-950/30 p-2 shadow-2xl backdrop-blur-2xl">
          <!-- Top Specular Highlight Edge -->
          <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <FullCalendar
            ref="calendarRef"
            :options="options"
            class="h-full"
          />
        </div>
      </div>
    </div>

    <!-- Event Modal -->
    <CalendarEventModal
      :open="showEventModal"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
/* ==========================================
   FullCalendar Dynamic Theme Overrides
========================================== */

:deep(.fc) {
  height: 100%;
  --fc-border-color: rgba(255, 255, 255, 0.08);
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: rgba(255, 255, 255, 0.02);
  --fc-neutral-text-color: rgba(255, 255, 255, 0.9);

  /* Toolbar & Buttons */
  --fc-button-bg-color: rgba(255, 255, 255, 0.05);
  --fc-button-border-color: rgba(255, 255, 255, 0.1);
  --fc-button-hover-bg-color: rgba(255, 255, 255, 0.12);
  --fc-button-hover-border-color: rgba(255, 255, 255, 0.2);
  --fc-button-active-bg-color: var(--accent-600);
  --fc-button-active-border-color: var(--accent-400);

  /* Events */
  --fc-event-bg-color: color-mix(in srgb, var(--accent-500) 80%, transparent);
  --fc-event-border-color: color-mix(in srgb, var(--accent-400) 40%, transparent);
  --fc-event-text-color: #ffffff;

  /* Today highlight */
  --fc-today-bg-color: color-mix(in srgb, var(--accent-500) 10%, transparent);

  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8125rem;
}

/* Hide Default Toolbar */
:deep(.fc-toolbar) {
  display: none;
}

/* Column Headers */
:deep(.fc-col-header-cell) {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
  padding: 8px 0;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Grid Lines & Borders */
:deep(.fc-scrollgrid),
:deep(.fc-scrollgrid td),
:deep(.fc-scrollgrid th) {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

/* Day Cells */
:deep(.fc-daygrid-day) {
  background: rgba(255, 255, 255, 0.01);
  transition: background-color 0.2s ease;
}

:deep(.fc-daygrid-day:hover) {
  background: rgba(255, 255, 255, 0.04);
}

:deep(.fc-daygrid-day-number) {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  padding: 0.5rem;
  font-size: 0.75rem;
}

/* Selection Highlight (when dragging over cells) */
:deep(.fc-highlight) {
  background: color-mix(in srgb, var(--accent-500) 20%, transparent) !important;
}

/* Today Cell Highlight */
:deep(.fc-day-today) {
  background: color-mix(in srgb, var(--accent-500) 10%, transparent) !important;
  box-shadow: inset 0 0 12px color-mix(in srgb, var(--accent-500) 18%, transparent);
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  color: var(--accent-400);
  font-weight: 800;
}

/* Events Styling */
:deep(.fc-event) {
  border-radius: 8px;
  padding: 2px 8px;
  cursor: grab;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

:deep(.fc-event:hover) {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  opacity: 0.95;
}

:deep(.fc-event.fc-event-dragging) {
  cursor: grabbing;
  opacity: 0.8;
  transform: scale(1.03);
}

/* Drag Mirror / Preview */
:deep(.fc-event-mirror) {
  background-color: var(--accent-500) !important;
  border-color: var(--accent-400) !important;
}

/* Day grid event dot */
:deep(.fc-daygrid-event-dot) {
  border-color: var(--accent-400) !important;
}

/* TimeGrid Styling */
:deep(.fc-timegrid-slot) {
  border-color: rgba(255, 255, 255, 0.05) !important;
  height: 2.5rem;
}

:deep(.fc-timegrid-axis-cframe),
:deep(.fc-timegrid-axis) {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  font-weight: 500;
}

:deep(.fc-timegrid-now-indicator-line) {
  border-color: var(--accent-400);
  border-width: 2px;
}

:deep(.fc-timegrid-now-indicator-arrow) {
  border-color: var(--accent-400);
}

/* List View */
:deep(.fc-list) {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

:deep(.fc-list-day-cframe) {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(12px);
}

:deep(.fc-list-event:hover td) {
  background: rgba(255, 255, 255, 0.06) !important;
}

/* Glass Scrollbars */
:deep(.fc-scroller::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.fc-scroller::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.fc-scroller::-webkit-scrollbar-thumb:hover) {
  background: color-mix(in srgb, var(--accent-500) 60%, white 20%);
}

:deep(.fc-scroller::-webkit-scrollbar-track) {
  background: transparent;
}
</style>