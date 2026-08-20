import { Ref } from "vue";

import { useCalendarStore } from "../../stores/calendar";

import type {
  CalendarEvent,
  CalendarReminder,
  CalendarRecurrence,
} from "../../types/calendar";

import {
  localInputToUTC,
} from "./useCalendarDate";

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

interface Options {

  calendar: ReturnType<typeof useCalendarStore>;

  form: CalendarForm;

  recurrence: Ref<CalendarRecurrence | null>;

  reminders: Ref<CalendarReminder[]>;

  editing: Ref<boolean>;

  saving: Ref<boolean>;

  deleting: Ref<boolean>;

  emit: (event: "saved") => void;

}

export function useCalendarPersistence(
  options: Options
) {

  const {

    calendar,

    form,

    recurrence,

    reminders,

    editing,

    saving,

    deleting,

    emit,

  } = options;

  /* =====================================
     SAVE
  ===================================== */

  async function save() {

    saving.value = true;

    try {

      if (editing.value) {

        await update();

      } else {

        await create();

      }

      emit("saved");

    }

    finally {

      saving.value = false;

    }

  }

  /* =====================================
     CREATE
  ===================================== */

  async function create() {

    const event: CalendarEvent = {

      id: crypto.randomUUID(),

      title: form.title,

      description: form.description,

      startDate:
        localInputToUTC(
          form.startDate
        ),

      endDate:
        form.endDate
          ? localInputToUTC(
              form.endDate
            )
          : null,

      allDay:
        form.allDay,

      location:
        form.location,

      color:
        form.color,

      eventType:
        form.eventType,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),

    };

    await calendar.createEvent(
      event
    );

    if (recurrence.value) {

      await calendar.createRecurrence({

        ...recurrence.value,

        id:
          crypto.randomUUID(),

        eventId:
          event.id,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),

      });

    }

    for (const reminder of reminders.value) {

      await calendar.createReminder({

        ...reminder,

        id:
          crypto.randomUUID(),

        eventId:
          event.id,

        dismissed:
          false,

        createdAt:
          new Date().toISOString(),

      });

    }

  }

  /* =====================================
     UPDATE
  ===================================== */

  async function update() {

    const current =
      calendar.selectedEvent!;

    await calendar.updateEvent({

      ...current,

      title:
        form.title,

      description:
        form.description,

      startDate:
        localInputToUTC(
          form.startDate
        ),

      endDate:
        form.endDate
          ? localInputToUTC(
              form.endDate
            )
          : null,

      allDay:
        form.allDay,

      location:
        form.location,

      color:
        form.color,

      eventType:
        form.eventType,

      updatedAt:
        new Date().toISOString(),

    });

    const existingRecurrence =
      calendar.recurrences.find(

        r =>
          r.eventId === current.id

      );

    if (recurrence.value) {

      if (existingRecurrence) {

        await calendar.updateRecurrence({

          ...recurrence.value,

          id:
            existingRecurrence.id,

          eventId:
            current.id,

          updatedAt:
            new Date().toISOString(),

        });

      }

      else {

        await calendar.createRecurrence({

          ...recurrence.value,

          id:
            crypto.randomUUID(),

          eventId:
            current.id,

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),

        });

      }

    }

    else if (existingRecurrence) {

      await calendar.deleteRecurrence(

        existingRecurrence.id

      );

    }

    const existingReminders =
      calendar.reminders.filter(

        r =>
          r.eventId === current.id

      );

    for (const reminder of existingReminders) {

      await calendar.deleteReminder(

        reminder.id

      );

    }

    for (const reminder of reminders.value) {

      await calendar.createReminder({

        ...reminder,

        id:
          crypto.randomUUID(),

        eventId:
          current.id,

        dismissed:
          false,

        createdAt:
          new Date().toISOString(),

      });

    }

  }

  /* =====================================
     DELETE
  ===================================== */

  async function remove() {

    if (!editing.value) {

      return;

    }

    deleting.value = true;

    try {

      await calendar.deleteEvent(

        calendar.selectedEvent!.id

      );

      emit("saved");

    }

    finally {

      deleting.value = false;

    }

  }

  return {

    save,

    remove,

  };

}