// src/composables/calendar/useCalendarLoader.ts

import { watch, type Ref } from "vue";

import type {
  CalendarEvent,
  CalendarReminder,
  CalendarRecurrence,
} from "../../types/calendar";

import { useCalendarStore } from "../../stores/calendar";

export function useCalendarLoader(

  calendar: ReturnType<typeof useCalendarStore>,

  loadEvent: (event: CalendarEvent) => void,

  resetForm: () => void,

  recurrence: Ref<CalendarRecurrence | null>,

  reminders: Ref<CalendarReminder[]>

) {

  watch(

    () => calendar.selectedEvent,

    (event) => {

      if (!event) {

        resetForm();

        recurrence.value = null;

        reminders.value = [];

        return;

      }

      loadEvent(event);

    },

    {
      immediate: true,
    }

  );

}