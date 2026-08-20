<script setup lang="ts">
import { reactive, watch } from "vue";
import { Repeat, Hash, Clock } from "@lucide/vue";
import type { CalendarRecurrence } from "../../types/calendar";

const props = defineProps<{
  modelValue: CalendarRecurrence | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: CalendarRecurrence | null): void;
}>();

const form = reactive({
  frequency: "NONE",
  interval: 1,
  endMode: "never",
  until: "",
  count: 1,
});

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      form.frequency = "NONE";
      form.interval = 1;
      form.endMode = "never";
      form.until = "";
      form.count = 1;
      return;
    }

    form.frequency = value.frequency;
    form.interval = value.interval;
    form.until = value.until ?? "";
    form.count = value.count ?? 1;

    if (value.until) form.endMode = "date";
    else if (value.count) form.endMode = "count";
    else form.endMode = "never";
  },
  { immediate: true }
);

watch(
  form,
  () => {
    if (form.frequency === "NONE") {
      emit("update:modelValue", null);
      return;
    }

    emit("update:modelValue", {
      id: "",
      eventId: "",
      frequency: form.frequency as any,
      interval: form.interval,
      until: form.endMode === "date" ? form.until : null,
      count: form.endMode === "count" ? form.count : null,
      createdAt: "",
      updatedAt: "",
    });
  },
  { deep: true }
);
</script>

<template>
  <div class="space-y-4 select-none">
    <!-- Section Header -->
    <h3
      class="flex items-center gap-2 border-b border-white/10 pb-2 text-[11px] font-bold uppercase tracking-widest text-white/40"
    >
      <Repeat class="h-3.5 w-3.5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
      Recurrence
    </h3>

    <!-- Recurrence Frequency Picker -->
    <div class="space-y-1.5">
      <label class="block text-xs font-semibold text-white/80">
        Repeat Pattern
      </label>

      <div class="relative">
        <select
          v-model="form.frequency"
          class="w-full appearance-none rounded-2xl border border-white/10 border-t-white/15 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-white shadow-inner backdrop-blur-xl outline-none transition duration-200 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
        >
          <option value="NONE">Does not repeat</option>
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
        <div class="pointer-events-none absolute right-3.5 top-3 text-white/40">
          <Clock class="h-4 w-4" />
        </div>
      </div>
    </div>

    <!-- Expanded Recurrence Configuration Card -->
    <div
      v-if="form.frequency !== 'NONE'"
      class="relative overflow-hidden rounded-2xl border border-white/10 border-t-white/20 bg-white/[0.03] p-4 shadow-xl backdrop-blur-xl space-y-4"
    >
      <!-- Interval Field -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-white/80">
          Repeat Every
        </label>
        <div class="flex items-center gap-3">
          <input
            type="number"
            min="1"
            v-model.number="form.interval"
            class="w-24 rounded-2xl border border-white/10 border-t-white/15 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-white shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
          />
          <span class="text-xs font-medium text-white/60 capitalize">
            {{ form.frequency.toLowerCase().replace('ly', 's') }}
          </span>
        </div>
      </div>

      <!-- End Condition Selection -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-white/80">
            Ends
          </label>
          <select
            v-model="form.endMode"
            class="w-full appearance-none rounded-2xl border border-white/10 border-t-white/15 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-white shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
          >
            <option value="never">Never</option>
            <option value="date">On Specific Date</option>
            <option value="count">After Occurrences</option>
          </select>
        </div>

        <!-- Dynamic Date Input -->
        <div v-if="form.endMode === 'date'" class="space-y-1.5">
          <label class="block text-xs font-semibold text-white/80">
            End Date
          </label>
          <div class="relative">
            <input
              type="date"
              v-model="form.until"
              class="w-full rounded-2xl border border-white/10 border-t-white/15 bg-slate-900/80 px-3.5 py-2 text-xs text-white shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 [color-scheme:dark]"
            />
          </div>
        </div>

        <!-- Dynamic Occurrence Count Input -->
        <div v-if="form.endMode === 'count'" class="space-y-1.5">
          <label class="block text-xs font-semibold text-white/80">
            Occurrence Count
          </label>
          <div class="relative flex items-center">
            <input
              type="number"
              min="1"
              v-model.number="form.count"
              class="w-full rounded-2xl border border-white/10 border-t-white/15 bg-slate-900/80 px-3.5 py-2 pl-9 text-xs font-bold text-white shadow-inner backdrop-blur-xl outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
            />
            <Hash class="absolute left-3 h-3.5 w-3.5 text-white/40" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>