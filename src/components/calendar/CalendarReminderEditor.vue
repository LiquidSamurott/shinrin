<script setup lang="ts">
import { computed } from "vue";
import { Bell, Plus, Trash2, Clock } from "@lucide/vue";
import type { CalendarReminder } from "../../types/calendar";

/* ==========================================
   Props / Emits
========================================== */

const props = defineProps<{
  modelValue: CalendarReminder[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: CalendarReminder[]): void;
}>();

/* ==========================================
   Local Helpers
========================================== */

const reminders = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});

/* ==========================================
   Add Reminder
========================================== */

function addReminder() {
  const reminder: CalendarReminder = {
    id: crypto.randomUUID(),
    /*
     * The real event ID is assigned by
     * CalendarEventModal when the event
     * is actually created.
     */
    eventId: "",
    minutesBefore: 30,
    dismissed: false,
    createdAt: new Date().toISOString(),
  };

  reminders.value = [...reminders.value, reminder];
}

/* ==========================================
   Remove Reminder
========================================== */

function remove(index: number) {
  const updated = [...reminders.value];
  updated.splice(index, 1);
  reminders.value = updated;
}

/* ==========================================
   Reminder Label
========================================== */

function reminderLabel(minutes: number) {
  if (minutes === 0) {
    return "At time of event";
  }

  if (minutes < 60) {
    return `${minutes} minutes before`;
  }

  if (minutes === 60) {
    return "1 hour before";
  }

  if (minutes % 60 === 0 && minutes < 1440) {
    return `${minutes / 60} hours before`;
  }

  if (minutes === 1440) {
    return "1 day before";
  }

  return `${minutes} minutes before`;
}
</script>

<template>
  <div class="space-y-4 select-none">
    <!-- =====================================
         Header
    ====================================== -->

    <div class="flex items-center justify-between">
      <div>
        <h3
          class="flex items-center gap-2 border-b border-white/10 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-white/40"
        >
          <Bell class="h-3.5 w-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
          Reminders
        </h3>

        <p class="mt-1 text-xs font-medium text-white/50">
          Get notified before this event occurs.
        </p>
      </div>

      <button
        type="button"
        @click="addReminder"
        class="group relative flex items-center gap-1.5 overflow-hidden rounded-2xl border border-emerald-400/30 border-t-emerald-300/50 bg-gradient-to-b from-emerald-500/20 to-emerald-600/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition duration-200 hover:border-emerald-400/60 hover:bg-emerald-500/30 hover:text-white active:scale-95"
      >
        <Plus class="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
        <span>Add Reminder</span>
      </button>
    </div>

    <!-- =====================================
         Empty State
    ====================================== -->

    <div
      v-if="reminders.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-8 text-center backdrop-blur-md transition hover:border-white/20"
    >
      <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40 shadow-inner">
        <Clock class="h-5 w-5" />
      </div>

      <p class="mt-2 text-xs font-medium text-white/50">
        No reminders configured for this event.
      </p>

      <button
        type="button"
        @click="addReminder"
        class="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
      >
        + Click here to add one
      </button>
    </div>

    <!-- =====================================
         Reminder List
    ====================================== -->

    <div v-else class="space-y-2.5">
      <div
        v-for="(reminder, index) in reminders"
        :key="reminder.id"
        class="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 border-t-white/15 bg-white/[0.03] p-3 shadow-lg backdrop-blur-xl transition duration-200 hover:border-white/20 hover:bg-white/[0.06]"
      >
        <!-- Bell Glass Icon -->
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400 shadow-inner"
        >
          <Bell class="h-4 w-4 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
        </div>

        <!-- Select dropdown & label -->
        <div class="min-w-0 flex-1">
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-white/40">
            Notification
          </label>

          <select
            v-model.number="reminder.minutesBefore"
            class="w-full appearance-none rounded-xl border border-white/10 border-t-white/15 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white shadow-inner backdrop-blur-xl outline-none transition duration-200 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
          >
            <option :value="0">At time of event</option>
            <option :value="5">5 minutes before</option>
            <option :value="10">10 minutes before</option>
            <option :value="15">15 minutes before</option>
            <option :value="30">30 minutes before</option>
            <option :value="45">45 minutes before</option>
            <option :value="60">1 hour before</option>
            <option :value="120">2 hours before</option>
            <option :value="1440">1 day before</option>
          </select>

          <p class="mt-1 text-[11px] font-medium text-white/50">
            {{ reminderLabel(reminder.minutesBefore) }}
          </p>
        </div>

        <!-- Delete Action Button -->
        <button
          type="button"
          @click="remove(index)"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/0 text-white/40 transition duration-200 hover:border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-300 active:scale-90"
          title="Remove reminder"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>