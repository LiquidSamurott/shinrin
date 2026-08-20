// src/composables/calendar/useCalendarForm.ts

import { reactive, ref } from "vue";

import type {
  CalendarEvent,
  CalendarReminder,
  CalendarRecurrence,
} from "../../types/calendar";

import {
  createDefaultDateRange,
  utcToLocalInput,
} from "./useCalendarDate";

import { useCalendarStore } from "../../stores/calendar";

export function useCalendarForm(
  calendar: ReturnType<typeof useCalendarStore>
) {

  /* ==========================================
     Form
  ========================================== */

  const form = reactive({

    title: "",

    description: "",

    startDate: "",

    endDate: "",

    allDay: false,

    location: "",

    color: "#3b82f6",

    eventType:
      "event" as CalendarEvent["eventType"],

  });

  /* ==========================================
     Recurrence
  ========================================== */

  const recurrence =
    ref<CalendarRecurrence | null>(null);

  /* ==========================================
     Reminders
  ========================================== */

  const reminders =
    ref<CalendarReminder[]>([]);

  /* ==========================================
     Reset
  ========================================== */

  function resetForm() {

    const defaults =
      calendar.newEventDefaults;

    if (defaults) {

      form.title = "";

      form.description = "";

      form.startDate =
        utcToLocalInput(defaults.startDate);

      form.endDate =
        utcToLocalInput(defaults.endDate);

      form.allDay =
        defaults.allDay;

    } else {

      const range =
        createDefaultDateRange();

      form.title = "";

      form.description = "";

      form.startDate =
        range.start;

      form.endDate =
        range.end;

      form.allDay =
        false;

    }

    form.location = "";

    form.color =
      "#3b82f6";

    form.eventType =
      "event";

    recurrence.value =
      null;

    reminders.value = [];

  }

  /* ==========================================
     Fill From Event
  ========================================== */

  function loadEvent(
    event: CalendarEvent
  ) {

    form.title =
      event.title;

    form.description =
      event.description ?? "";

    form.startDate =
      utcToLocalInput(
        event.startDate
      );

    form.endDate =
      event.endDate
        ? utcToLocalInput(
            event.endDate
          )
        : "";

    form.allDay =
      event.allDay;

    form.location =
      event.location ?? "";

    form.color =
      event.color ??
      "#3b82f6";

    form.eventType =
      event.eventType;

    recurrence.value =
      calendar.recurrences.find(
        r => r.eventId === event.id
      ) ?? null;

    reminders.value =
      calendar.reminders.filter(
        r => r.eventId === event.id
      );

  }

  return {

    form,

    recurrence,

    reminders,

    resetForm,

    loadEvent,

  };

}