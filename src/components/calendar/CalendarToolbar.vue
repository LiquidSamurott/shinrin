<script setup lang="ts">
import { computed } from "vue";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "@lucide/vue";

type CalendarView = 
  | "dayGridMonth"
  | "timeGridWeek"
  | "timeGridDay"
  | "listWeek"
  | "multiMonthYear";

interface ViewOption {
  key: CalendarView;
  label: string;
}

const props = defineProps<{
  currentView: CalendarView;
  currentDate: Date | string | number;
}>();

const emit = defineEmits<{
  (e: "today"): void;
  (e: "previous"): void;
  (e: "next"): void;
  (e: "changeView", view: CalendarView): void;
  (e: "new-event"): void;
}>();

// Explicitly defined view navigation options
const views: readonly ViewOption[] = [
  { key: "dayGridMonth", label: "Month" },
  { key: "timeGridWeek", label: "Week" },
  { key: "timeGridDay", label: "Day" },
  { key: "listWeek", label: "Agenda" },
  { key: "multiMonthYear", label: "Year" },
];

/* Robust Date Formatter preventing UTC timezone rollback */
const formattedDate = computed<string>(() => {
  if (!props.currentDate) return "";

  let date: Date;

  if (typeof props.currentDate === "string") {
    const cleanDateStr = props.currentDate.split("T")[0];
    const parts = cleanDateStr.split("-").map(Number);
    if (parts.length === 3) {
      date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      date = new Date(props.currentDate);
    }
  } else if (typeof props.currentDate === "number") {
    date = new Date(props.currentDate);
  } else {
    date = props.currentDate;
  }

  if (isNaN(date.getTime())) return "";

  if (props.currentView === "dayGridMonth") {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  if (props.currentView === "multiMonthYear") {
    return date.toLocaleDateString("en-US", { year: "numeric", timeZone: "UTC" });
  }

  if (props.currentView === "timeGridDay") {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
});
</script>

<template>
  <header
    class="relative flex items-center justify-between border-b border-white/10 bg-slate-950/40 px-6 py-3.5 backdrop-blur-2xl select-none"
  >
    <!-- Specular Edge Highlight Line -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

    <!-- Ambient Theme Light Orbs -->
    <div 
      class="pointer-events-none absolute -top-12 left-1/4 h-24 w-48 rounded-full opacity-20 blur-3xl transition-colors duration-500"
      :style="{ backgroundColor: 'var(--accent-500)' }"
    ></div>
    <div 
      class="pointer-events-none absolute -top-12 right-1/4 h-24 w-48 rounded-full opacity-15 blur-3xl transition-colors duration-500"
      :style="{ backgroundColor: 'var(--accent-600)' }"
    ></div>

    <!-- Left Controls (Navigation & Title) -->
    <div class="z-10 flex items-center gap-3">
      <!-- Date Navigation Controls -->
      <div class="flex items-center gap-1 rounded-2xl border border-white/10 border-t-white/20 bg-white/[0.03] p-1 shadow-lg backdrop-blur-xl">
        <button
          type="button"
          class="rounded-xl px-3 py-1.5 text-xs font-semibold text-white/90 transition-all duration-200 hover:border-white/10 hover:bg-white/10 hover:text-white active:scale-95"
          @click="emit('today')"
        >
          Today
        </button>

        <div class="h-4 w-px bg-white/10"></div>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
          title="Previous"
          @click="emit('previous')"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
          title="Next"
          @click="emit('next')"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>

      <!-- Date Display Header -->
      <div class="ml-2 flex items-center gap-2">
        <CalendarIcon 
          class="h-5 w-5 transition-colors duration-300"
          :style="{ 
            color: 'var(--accent-400)',
            filter: 'drop-shadow(0 0 8px var(--accent-500))' 
          }"
        />
        <h2 class="text-lg font-bold tracking-tight text-white drop-shadow-md">
          {{ formattedDate }}
        </h2>
      </div>
    </div>

    <!-- Center Controls (Glass View Switcher) -->
    <div class="z-10 flex items-center rounded-2xl border border-white/10 border-t-white/20 bg-white/[0.03] p-1 shadow-xl backdrop-blur-xl">
      <button
        v-for="view in views"
        :key="view.key"
        type="button"
        class="relative rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-300"
        :class="
          currentView === view.key
            ? 'border border-white/20 border-t-white/30 text-white shadow-md shadow-black/20 backdrop-blur-md'
            : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
        "
        :style="
          currentView === view.key
            ? {
                backgroundColor: 'color-mix(in srgb, var(--accent-500) 25%, rgba(255, 255, 255, 0.1))',
                boxShadow: '0 0 12px color-mix(in srgb, var(--accent-500) 30%, transparent)'
              }
            : {}
        "
        @click="emit('changeView', view.key)"
      >
        {{ view.label }}
      </button>
    </div>

    <!-- Right Controls (New Event CTA) -->
    <div class="z-10">
      <button
        type="button"
        class="group relative flex items-center gap-2 overflow-hidden rounded-2xl border border-white/20 border-t-white/40 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
        :style="{
          backgroundColor: 'var(--accent-600)',
          boxShadow: '0 8px 20px -4px color-mix(in srgb, var(--accent-600) 50%, transparent)'
        }"
        @click="emit('new-event')"
      >
        <!-- Liquid Reflection Flare -->
        <div class="pointer-events-none absolute -inset-x-6 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
        <Plus class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
        <span>New Event</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
button {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>