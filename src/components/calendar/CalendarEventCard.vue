<script setup lang="ts">
import { computed } from "vue";
import { Edit3, Trash2, MapPin, Clock } from "@lucide/vue";
import { useTheme } from "../../composables/useTheme";
import type { CalendarEvent } from "../../types/calendar";

const props = defineProps<{
  event: CalendarEvent;
}>();

const emit = defineEmits<{
  (e: "click"): void;
  (e: "edit"): void;
  (e: "delete"): void;
}>();

const { selectedPalette } = useTheme();

/* Dynamic event accent color with theme palette fallback */
const accentColor = computed(() => props.event.color ?? selectedPalette.value.colors[500]);

const start = computed(() =>
  new Date(props.event.startDate).toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
);

const end = computed(() => {
  if (!props.event.endDate) return "";

  return new Date(props.event.endDate).toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const icon = computed(() => {
  switch (props.event.eventType) {
    case "study":
      return "📚";
    case "exam":
      return "📝";
    case "assignment":
      return "📖";
    case "meeting":
      return "👥";
    case "holiday":
      return "🎉";
    case "pomodoro":
      return "🍅";
    case "task":
      return "✅";
    default:
      return "📅";
  }
});
</script>

<template>
  <div
    class="group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 border-t-white/20 bg-slate-950/40 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-slate-900/60 hover:shadow-2xl select-none"
    @click="emit('click')"
  >
    <!-- Dynamic Accent Glow (Powered by event/theme color) -->
    <div
      class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
      :style="{ backgroundColor: accentColor }"
    ></div>

    <!-- Glowing Side Accent Bar -->
    <div
      class="absolute left-0 top-0 h-full w-1.5 transition-all duration-300 group-hover:w-2"
      :style="{
        backgroundColor: accentColor,
        boxShadow: `0 0 12px ${accentColor}`
      }"
    ></div>

    <!-- Header Section -->
    <div class="flex items-center justify-between gap-2 pl-1">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-base shadow-inner backdrop-blur-md">
          {{ icon }}
        </span>

        <h3 class="truncate text-sm font-bold tracking-tight text-white drop-shadow-md group-hover:text-white/90">
          {{ event.title }}
        </h3>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-lg border border-white/0 text-white/60 transition-all duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white active:scale-90"
          title="Edit event"
          @click.stop="emit('edit')"
        >
          <Edit3 class="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-lg border border-white/0 text-white/60 transition-all duration-200 hover:border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-300 active:scale-90"
          title="Delete event"
          @click.stop="emit('delete')"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <!-- Description -->
    <p
      v-if="event.description"
      class="line-clamp-2 pl-1 text-xs font-medium text-white/60 leading-relaxed"
    >
      {{ event.description }}
    </p>

    <!-- Metadata Section -->
    <div class="flex flex-wrap items-center gap-2 pl-1 pt-0.5 text-xs font-semibold text-white/50">
      <!-- Time Badge -->
      <div class="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-white/80 shadow-inner backdrop-blur-md">
        <Clock 
          class="h-3 w-3" 
          :style="{ color: 'var(--accent-400)' }"
        />
        <span>
          <template v-if="event.allDay">All Day</template>
          <template v-else>
            {{ start }}
            <template v-if="end"> – {{ end }}</template>
          </template>
        </span>
      </div>

      <!-- Location Badge -->
      <div
        v-if="event.location"
        class="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-white/80 shadow-inner backdrop-blur-md"
      >
        <MapPin class="h-3 w-3 text-cyan-400" />
        <span class="truncate max-w-[140px]">{{ event.location }}</span>
      </div>
    </div>
  </div>
</template>