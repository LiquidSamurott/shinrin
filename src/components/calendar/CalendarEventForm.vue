<script setup lang="ts">
import { computed, ref } from "vue";
import { Calendar, MapPin, Palette, Trash2, Check, AlertCircle } from "@lucide/vue";

import { useCalendarStore } from "../../stores/calendar";
import CalendarRecurrenceEditor from "./CalendarRecurrenceEditor.vue";
import CalendarReminderEditor from "./CalendarReminderEditor.vue";

import { useCalendarForm } from "../../composables/calendar/useCalendarForm";
import { useCalendarLoader } from "../../composables/calendar/useCalendarLoader";
import { useCalendarValidation } from "../../composables/calendar/useCalendarValidation";
import { useCalendarPersistence } from "../../composables/calendar/useCalendarPersistence";

/* ==========================================
   Emits
========================================== */

const emit = defineEmits<{
  (e: "saved"): void;
  (e: "cancel"): void;
}>();

/* ==========================================
   Store
========================================== */

const calendar = useCalendarStore();

/* ==========================================
   State
========================================== */

const saving = ref(false);
const deleting = ref(false);

/* ==========================================
   Editing
========================================== */

const editing = computed(() => calendar.selectedEvent !== null);

/* ==========================================
   Form
========================================== */

const {
  form,
  recurrence,
  reminders,
  resetForm,
  loadEvent,
} = useCalendarForm(calendar);

/* ==========================================
   Loader
========================================== */

useCalendarLoader(
  calendar,
  loadEvent,
  resetForm,
  recurrence,
  reminders
);

/* ==========================================
   Validation
========================================== */

const {
  titleError,
  dateError,
  canSave,
} = useCalendarValidation(form);

/* ==========================================
   Persistence
========================================== */

const {
  save,
  remove,
} = useCalendarPersistence({
  calendar,
  form,
  recurrence,
  reminders,
  editing,
  saving,
  deleting,
  emit,
});

/* ==========================================
   Cancel
========================================== */

function cancel() {
  resetForm();
  recurrence.value = null;
  reminders.value = [];
  calendar.clearSelection();
  emit("cancel");
}
</script>

<template>
  <form
    class="relative flex h-full flex-col bg-slate-950/40 backdrop-blur-3xl select-none"
    @submit.prevent="save"
  >
    <!-- Liquid Edge Highlight Line -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

    <!-- Ambient Refraction Orbs -->
    <div class="pointer-events-none absolute -top-16 right-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"></div>
    <div class="pointer-events-none absolute bottom-1/3 -left-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>

    <!-- =====================================
         Header
    ====================================== -->
    <div
      class="z-10 flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur-xl"
    >
      <div>
        <h2 class="text-lg font-bold tracking-tight text-white drop-shadow-md">
          {{ editing ? "Edit Event" : "New Event" }}
        </h2>

        <p class="text-xs font-medium text-white/50">
          {{
            editing
              ? "Update your calendar event details"
              : "Create a new event on your calendar"
          }}
        </p>
      </div>
    </div>

    <!-- =====================================
         Body
    ====================================== -->

    <div class="custom-scrollbar z-10 flex-1 overflow-y-auto p-6 space-y-8">

      <!-- ===============================
           Basic Information
      ================================ -->

      <section class="space-y-4">

        <h3
          class="flex items-center gap-2 border-b border-white/10 pb-2 text-[11px] font-bold uppercase tracking-widest text-white/40"
        >
          <Calendar class="h-3.5 w-3.5 text-emerald-400" />
          Event Details
        </h3>

        <!-- Title -->

        <div>
          <label class="mb-1.5 block text-xs font-semibold text-white/80">
            Title
          </label>

          <input
            v-model="form.title"
            type="text"
            placeholder="Mathematics Study Session"
            class="w-full rounded-2xl border border-white/10 border-t-white/15 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-400/20"
          />

          <p
            v-if="titleError"
            class="mt-1.5 flex items-center gap-1 text-xs text-rose-400"
          >
            <AlertCircle class="h-3.5 w-3.5" />
            Title is required.
          </p>
        </div>

        <!-- Description -->

        <div>
          <label class="mb-1.5 block text-xs font-semibold text-white/80">
            Description
          </label>

          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Add additional details or notes..."
            class="w-full rounded-2xl border border-white/10 border-t-white/15 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        <!-- Date Range -->

        <div class="grid grid-cols-2 gap-4">

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-white/80">
              Start
            </label>

            <input
              v-model="form.startDate"
              type="datetime-local"
              class="w-full rounded-2xl border border-white/10 border-t-white/15 bg-white/[0.03] px-3.5 py-2 text-xs text-white shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-400/20 [color-scheme:dark]"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-white/80">
              End
            </label>

            <input
              v-model="form.endDate"
              type="datetime-local"
              class="w-full rounded-2xl border border-white/10 border-t-white/15 bg-white/[0.03] px-3.5 py-2 text-xs text-white shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-400/20 [color-scheme:dark]"
            />
          </div>

        </div>

        <p
          v-if="dateError"
          class="flex items-center gap-1 text-xs text-rose-400"
        >
          <AlertCircle class="h-3.5 w-3.5" />
          End date must be after the start date.
        </p>

        <!-- All Day Toggle -->

        <label class="group flex items-center gap-3 cursor-pointer select-none">
          <div class="relative flex items-center">
            <input
              v-model="form.allDay"
              type="checkbox"
              class="peer sr-only"
            />
            <div class="h-5 w-9 rounded-full border border-white/15 bg-white/10 transition peer-checked:bg-emerald-500 peer-checked:border-emerald-400"></div>
            <div class="absolute left-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4 shadow-md"></div>
          </div>

          <span class="text-xs font-semibold text-white/80 group-hover:text-white">
            All Day Event
          </span>
        </label>

        <!-- Location -->

        <div>
          <label class="mb-1.5 block text-xs font-semibold text-white/80">
            Location
          </label>

          <div class="relative">
            <input
              v-model="form.location"
              type="text"
              placeholder="Room 301 / Zoom / Library"
              class="w-full rounded-2xl border border-white/10 border-t-white/15 bg-white/[0.03] px-4 py-2.5 pl-9 text-sm text-white placeholder-white/20 shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-400/20"
            />
            <MapPin class="absolute left-3 top-3 h-4 w-4 text-white/40" />
          </div>
        </div>

      </section>

      <!-- ===============================
           Appearance
      ================================ -->

      <section class="space-y-4">

        <h3
          class="flex items-center gap-2 border-b border-white/10 pb-2 text-[11px] font-bold uppercase tracking-widest text-white/40"
        >
          <Palette class="h-3.5 w-3.5 text-cyan-400" />
          Appearance
        </h3>

        <!-- Event Type -->

        <div>
          <label class="mb-1.5 block text-xs font-semibold text-white/80">
            Event Type
          </label>

          <select
            v-model="form.eventType"
            class="w-full rounded-2xl border border-white/10 border-t-white/15 bg-slate-900/80 px-4 py-2.5 text-sm text-white shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
          >
            <option value="event">📅 Event</option>
            <option value="study">📚 Study</option>
            <option value="exam">📝 Exam</option>
            <option value="assignment">📖 Assignment</option>
            <option value="meeting">👥 Meeting</option>
            <option value="holiday">🎉 Holiday</option>
            <option value="pomodoro">🍅 Pomodoro</option>
            <option value="task">✅ Task</option>
          </select>
        </div>

        <!-- Color Swatches -->

        <div>

          <label class="mb-2.5 block text-xs font-semibold text-white/80">
            Color
          </label>

          <div class="flex flex-wrap gap-2.5">

            <button
              v-for="color in [
                '#3b82f6',
                '#22c55e',
                '#a855f7',
                '#ef4444',
                '#eab308',
                '#14b8a6',
                '#f97316',
                '#ec4899'
              ]"
              :key="color"
              type="button"
              :style="{ backgroundColor: color }"
              class="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/20 shadow-md backdrop-blur-md transition hover:scale-110 active:scale-95"
              @click="form.color = color"
            >
              <Check
                v-if="form.color === color"
                class="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              />
            </button>

          </div>

        </div>

      </section>

      <!-- ===============================
           Recurrence
      ================================ -->

      <section>

        <CalendarRecurrenceEditor
          v-model="recurrence"
        />

      </section>

      <!-- ===============================
           Reminders
      ================================ -->

      <section>

        <CalendarReminderEditor
          v-model="reminders"
        />

      </section>

    </div>

    <!-- =====================================
         Footer
    ====================================== -->

    <div
      class="z-10 flex items-center justify-between border-t border-white/10 px-6 py-4 backdrop-blur-xl"
    >

      <button
        v-if="editing"
        type="button"
        @click="remove"
        :disabled="deleting"
        class="flex items-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-300 shadow-lg backdrop-blur-xl transition hover:border-rose-400 hover:bg-rose-500/30 active:scale-95 disabled:opacity-50"
      >
        <Trash2 class="h-3.5 w-3.5" />
        {{ deleting ? "Deleting..." : "Delete" }}
      </button>

      <div
        v-else
        class="w-20"
      />

      <div class="flex items-center gap-3">

        <button
          type="button"
          @click="cancel"
          class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
        >
          Cancel
        </button>

        <button
          type="submit"
          :disabled="!canSave || saving"
          class="group relative overflow-hidden rounded-2xl border border-emerald-400/40 border-t-emerald-300/60 bg-gradient-to-b from-emerald-500/80 to-emerald-600/80 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 backdrop-blur-xl transition hover:scale-[1.02] hover:border-emerald-300 hover:from-emerald-400 hover:to-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <!-- Specular reflection highlight -->
          <div class="pointer-events-none absolute -inset-x-6 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
          <span>{{ saving ? "Saving..." : editing ? "Save Changes" : "Create Event" }}</span>
        </button>

      </div>

    </div>

  </form>
</template>

<style scoped>
/* Custom Glass Scrollbar */
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