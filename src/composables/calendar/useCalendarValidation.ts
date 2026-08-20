// src/composables/calendar/useCalendarValidation.ts

import { computed } from "vue";

import type { CalendarEvent } from "../../types/calendar";

interface CalendarForm {

  title: string;

  description: string;

  startDate: string;

  endDate: string;

  allDay: boolean;

  location: string;

  color: string;

  eventType: CalendarEvent["eventType"];

}

export function useCalendarValidation(
  form: CalendarForm
) {

  /* ==========================================
     Title
  ========================================== */

  const titleError =
    computed(() => {

      return (
        form.title.trim().length === 0
      );

    });

  /* ==========================================
     Dates
  ========================================== */

  const dateError =
    computed(() => {

      if (
        !form.startDate ||
        !form.endDate
      ) {

        return false;

      }

      return (
        new Date(form.endDate) <
        new Date(form.startDate)
      );

    });

  /* ==========================================
     Location
  ========================================== */

  const locationError =
    computed(() => {

      return (
        form.location.length > 255
      );

    });

  /* ==========================================
     Description
  ========================================== */

  const descriptionError =
    computed(() => {

      return (
        form.description.length > 5000
      );

    });

  /* ==========================================
     Can Save
  ========================================== */

  const canSave =
    computed(() => {

      return (

        !titleError.value &&

        !dateError.value &&

        !locationError.value &&

        !descriptionError.value

      );

    });

  return {

    titleError,

    dateError,

    locationError,

    descriptionError,

    canSave,

  };

}