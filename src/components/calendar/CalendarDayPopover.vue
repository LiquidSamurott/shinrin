<script setup lang="ts">
import { computed } from "vue";

import { useCalendarStore } from "../../stores/calendar";
import { useTheme } from "../../composables/useTheme";

const props = defineProps<{
  date: Date;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", id: string): void;
  (e: "create", date: Date): void;
}>();

const calendar = useCalendarStore();
const { selectedPalette } = useTheme();

/* ==========================================
   Events for selected day
========================================== */

const dayEvents = computed(() => {
  return calendar.eventsForSelectedDate.filter((event) => {
    const eventDate = new Date(event.startDate);

    return (
      eventDate.getFullYear() === props.date.getFullYear() &&
      eventDate.getMonth() === props.date.getMonth() &&
      eventDate.getDate() === props.date.getDate()
    );
  });
});

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function selectEvent(id: string) {
  emit("select", id);
}

function createEvent() {
  emit("create", props.date);
}
</script>

<template>
  <div
    class="absolute z-50 w-80 overflow-hidden rounded-2xl border border-white/10 border-t-white/20 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-200"
  >
    <!-- Top Specular Highlight Edge -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
    ></div>

    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-semibold text-slate-100">
        {{ props.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) }}
      </h3>

      <button
        @click="emit('close')"
        class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        ✕
      </button>
    </div>

    <!-- Events List -->
    <div v-if="dayEvents.length" class="mb-3 max-h-60 overflow-y-auto pr-1">
      <div
        v-for="event in dayEvents"
        :key="event.id"
        @click="selectEvent(event.id)"
        class="group relative mb-2 flex cursor-pointer items-center justify-between overflow-hidden rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-md transition-all duration-200 hover:border-white/15 hover:bg-white/10"
      >
        <!-- Event Color Accent Strip -->
        <div
          class="absolute left-0 top-0 bottom-0 w-1 transition-all duration-200"
          :style="{ backgroundColor: event.color || selectedPalette.colors[500] }"
        ></div>

        <div class="pl-2">
          <div class="font-medium text-slate-200 transition-colors group-hover:text-white">
            {{ event.title }}
          </div>
          <div class="text-xs text-slate-400">
            {{ formatTime(event.startDate) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mb-4 py-4 text-center text-sm text-slate-400">
      No events scheduled
    </div>

    <!-- Dynamic Theme Action Button -->
    <button
      @click="createEvent"
      class="w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
      :style="{ backgroundColor: 'var(--accent-600)' }"
    >
      + New Event
    </button>
  </div>
</template>