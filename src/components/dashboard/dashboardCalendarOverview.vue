<script setup lang="ts">
import { computed } from "vue";

import {
  CalendarDays,
  Clock3,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Briefcase,
  Coffee,
  PartyPopper,
  ArrowRight,
} from "@lucide/vue";

import { useCalendarStore } from "../../stores/calendar";

const calendar = useCalendarStore();

/* ==========================================
   Event Counts
========================================== */

const totalEvents = computed(
  () => calendar.events.length
);

const todayEvents = computed(
  () => calendar.todayEvents
);

const upcomingEvents = computed(
  () => calendar.upcomingEvents
);

/* ==========================================
   Event Types
========================================== */

const eventTypes = [
  {
    key: "study",
    label: "Study",
    icon: BookOpen,
    color: "text-blue-400",
  },
  {
    key: "exam",
    label: "Exams",
    icon: GraduationCap,
    color: "text-amber-400",
  },
  {
    key: "assignment",
    label: "Assignments",
    icon: ClipboardList,
    color: "text-emerald-400",
  },
  {
    key: "meeting",
    label: "Meetings",
    icon: Briefcase,
    color: "text-purple-400",
  },
  {
    key: "holiday",
    label: "Holiday",
    icon: PartyPopper,
    color: "text-rose-400",
  },
  {
    key: "pomodoro",
    label: "Pomodoro",
    icon: Coffee,
    color: "text-teal-400",
  },
] as const;

const counts = computed(() =>
  eventTypes.map((type) => ({
    ...type,
    count: calendar.events.filter(
      (event) =>
        event.eventType === type.key
    ).length,
  }))
);

/* ==========================================
   Helpers
========================================== */

function formatTime(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function isCurrent(event: {
  startDate: string;
  endDate?: string | null;
}) {
  const now = Date.now();

  const start =
    new Date(event.startDate).getTime();

  const end = event.endDate
    ? new Date(event.endDate).getTime()
    : start;

  return now >= start && now <= end;
}
</script>

<template>
  <section
    class="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-4 shadow-xl backdrop-blur-2xl"
  >

    <!-- Liquid glass highlight -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
    />

    <!-- Ambient glow -->
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl"
    />

    <!-- =====================================
         Header
    ====================================== -->

    <div class="relative mb-4 flex items-center justify-between">

      <div class="flex items-center gap-2.5">

        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10"
        >
          <CalendarDays
            class="h-4.5 w-4.5 text-cyan-400"
          />
        </div>

        <div>
          <h2
            class="text-sm font-bold text-white"
          >
            Calendar Overview
          </h2>

          <p
            class="text-[10px] text-white/35"
          >
            Your schedule at a glance
          </p>
        </div>

      </div>

      <span
        class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-medium text-white/40"
      >
        {{ totalEvents }} events
      </span>

    </div>

    <!-- =====================================
         Statistics
    ====================================== -->

    <div class="mb-4 grid grid-cols-2 gap-2">

      <div
        class="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5"
      >
        <p
          class="text-[9px] font-semibold uppercase tracking-wider text-white/35"
        >
          Total
        </p>

        <p
          class="mt-1 text-xl font-black text-white"
        >
          {{ totalEvents }}
        </p>
      </div>

      <div
        class="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5"
      >
        <p
          class="text-[9px] font-semibold uppercase tracking-wider text-emerald-300/50"
        >
          Today
        </p>

        <p
          class="mt-1 text-xl font-black text-emerald-400"
        >
          {{ todayEvents.length }}
        </p>
      </div>

    </div>

    <!-- =====================================
         Categories
    ====================================== -->

    <div class="mb-4">

      <div class="mb-2 flex items-center justify-between">
        <p
          class="text-[9px] font-bold uppercase tracking-widest text-white/30"
        >
          Categories
        </p>
      </div>

      <div
        class="grid grid-cols-2 gap-1.5 sm:grid-cols-3"
      >

        <div
          v-for="item in counts"
          :key="item.key"
          class="flex min-w-0 items-center gap-2 rounded-lg border border-white/5 bg-white/[0.025] px-2 py-1.5"
        >

          <component
            :is="item.icon"
            :class="[
              'h-3.5 w-3.5 shrink-0',
              item.color
            ]"
          />

          <span
            class="min-w-0 flex-1 truncate text-[9px] text-white/50"
          >
            {{ item.label }}
          </span>

          <span
            class="text-[9px] font-bold text-white/70"
          >
            {{ item.count }}
          </span>

        </div>

      </div>

    </div>

    <!-- =====================================
         Today's Schedule
    ====================================== -->

    <div>

      <div
        class="mb-2 flex items-center justify-between"
      >

        <div
          class="flex items-center gap-1.5"
        >
          <Clock3
            class="h-3.5 w-3.5 text-emerald-400"
          />

          <p
            class="text-[9px] font-bold uppercase tracking-widest text-white/30"
          >
            Today
          </p>
        </div>

        <span
          class="text-[9px] text-white/25"
        >
          {{ todayEvents.length }} events
        </span>

      </div>

      <!-- Events -->
      <div
        v-if="todayEvents.length"
        class="space-y-1.5"
      >

        <div
          v-for="event in todayEvents.slice(0, 4)"
          :key="event.id"
          class="group flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.025] px-2.5 py-2 transition hover:border-white/10 hover:bg-white/[0.05]"
        >

          <!-- Event color -->
          <div
            class="h-7 w-0.5 shrink-0 rounded-full"
            :style="{
              backgroundColor:
                event.color ?? '#3b82f6'
            }"
          />

          <!-- Time -->
          <div
            class="w-12 shrink-0"
          >
            <p
              class="text-[9px] font-medium"
              :class="
                isCurrent(event)
                  ? 'text-emerald-400'
                  : 'text-white/35'
              "
            >
              {{ formatTime(event.startDate) }}
            </p>
          </div>

          <!-- Event -->
          <div
            class="min-w-0 flex-1"
          >

            <p
              class="truncate text-[11px] font-medium text-white/75 group-hover:text-white"
            >
              {{ event.title }}
            </p>

            <p
              v-if="event.location"
              class="truncate text-[8px] text-white/25"
            >
              {{ event.location }}
            </p>

          </div>

          <!-- Now -->
          <span
            v-if="isCurrent(event)"
            class="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[7px] font-bold text-emerald-400"
          >
            NOW
          </span>

        </div>

        <!-- More -->
        <div
          v-if="todayEvents.length > 4"
          class="flex items-center justify-center gap-1 pt-1"
        >
          <span
            class="text-[9px] text-white/25"
          >
            +{{ todayEvents.length - 4 }} more
          </span>

          <ArrowRight
            class="h-2.5 w-2.5 text-white/25"
          />
        </div>

      </div>

      <!-- Empty -->
      <div
        v-else
        class="rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-3 py-5 text-center"
      >
        <CalendarDays
          class="mx-auto mb-1.5 h-5 w-5 text-white/15"
        />

        <p
          class="text-[10px] text-white/35"
        >
          Nothing scheduled today.
        </p>

        <p
          class="mt-0.5 text-[8px] text-white/20"
        >
          Your schedule is clear.
        </p>
      </div>

    </div>

    <!-- =====================================
         Upcoming
    ====================================== -->

    <div
      v-if="upcomingEvents.length"
      class="mt-4 border-t border-white/5 pt-3"
    >

      <div
        class="mb-2 flex items-center gap-1.5"
      >

        <CalendarDays
          class="h-3 w-3 text-cyan-400"
        />

        <p
          class="text-[9px] font-bold uppercase tracking-widest text-white/30"
        >
          Next Up
        </p>

      </div>

      <div
        class="flex items-center justify-between rounded-lg bg-white/[0.025] px-2.5 py-2"
      >

        <div class="min-w-0">
          <p
            class="truncate text-[10px] font-medium text-white/65"
          >
            {{ upcomingEvents[0].title }}
          </p>

          <p
            class="text-[8px] text-white/25"
          >
            {{ formatDate(upcomingEvents[0].startDate) }}
            ·
            {{ formatTime(upcomingEvents[0].startDate) }}
          </p>
        </div>

        <ArrowRight
          class="h-3 w-3 shrink-0 text-white/20"
        />

      </div>

    </div>

  </section>
</template>

