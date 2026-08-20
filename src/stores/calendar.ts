// src/stores/calendar.ts
import {
  ref,
  computed,
  watch,
} from "vue";
import { defineStore } from "pinia";

import type {
  CalendarEvent,
  CalendarReminder,
  CalendarRecurrence,
} from "../types/calendar";

import {
  CalendarReminderScheduler,
} from "../services/calendar/reminderScheduler";

import {
  loadEvents,
} from "../db/calendarDatabase";

import {
  loadRecurrences,
} from "../db/calendarRecurrenceDatabase";

import {
  loadReminders,
} from "../db/calendarReminderDatabase";

import {
  expandRecurringEvents,
} from "../services/calendar/recurrence";

import {
  sortEvents,
} from "../services/calendar/formatting";
import type {
  ExpandedCalendarEvent,
} from "../types/expandedCalendarEvent";


/* =========================================
   Calendar Store
========================================= */

export const useCalendarStore =
defineStore(
  "calendar",
  () => {

    /* =====================================
       State
    ===================================== */

    const events =
      ref<CalendarEvent[]>([]);

    const recurrences =
      ref<CalendarRecurrence[]>([]);

    const reminders =
      ref<CalendarReminder[]>([]);

    /*
     * Expanded events are what
     * FullCalendar actually renders.
     */

    const expandedEvents =
      ref<ExpandedCalendarEvent[]>([]);

    const loading =
      ref(false);

    const loaded =
      ref(false);

    const selectedEvent =
      ref<CalendarEvent | null>(
        null
      );

    const selectedDate =
      ref<Date>(new Date());

    /*
     * FullCalendar view.
     */

    const currentView =
      ref<
        | "dayGridMonth"
        | "timeGridWeek"
        | "timeGridDay"
        | "listWeek"
        | "multiMonthYear"
      >(
        "dayGridMonth"
      );

    /* =====================================
       Refresh Expanded Events
    ===================================== */

    function refreshExpandedEvents() {

      /*
       * Expand recurring events
       * into individual occurrences
       * for approximately ±1 year.
       */

      const start =
        new Date(
          selectedDate.value
        );

      start.setFullYear(
        start.getFullYear() - 1
      );

      const end =
        new Date(
          selectedDate.value
        );

      end.setFullYear(
        end.getFullYear() + 1
      );

      expandedEvents.value =
        sortEvents(
          expandRecurringEvents(
            events.value,
            recurrences.value,
            start,
            end
          )
        );
    }

    /* =====================================
       Load Database
    ===================================== */

    async function load() {
  if (loading.value) {
    return;
  }

  loading.value = true;

  try {
    const [
      loadedEvents,
      loadedRecurrences,
      loadedReminders,
    ] = await Promise.all([
      loadEvents(),
      loadRecurrences(),
      loadReminders(),
    ]);

    events.value = loadedEvents;
    recurrences.value = loadedRecurrences;
    reminders.value = loadedReminders;

    refreshExpandedEvents();

    loaded.value = true;

    console.log(
      "[CalendarStore] Loaded:",
      {
        events: events.value.length,
        recurrences: recurrences.value.length,
        reminders: reminders.value.length,
      }
    );

  } catch (error) {
    console.error(
      "[CalendarStore] Failed to load:",
      error
    );

    throw error;

  } finally {
    loading.value = false;
  }
}


        /* =====================================
       Event CRUD
    ===================================== */

    async function createEvent(
      event: CalendarEvent
    ) {

      const {
        createEvent,
      } = await import(
        "../db/calendarDatabase"
      );

      await createEvent(event);

      events.value.push(event);

      refreshExpandedEvents();
    }

    async function updateEvent(
      event: CalendarEvent
    ) {

      const {
        updateEvent,
      } = await import(
        "../db/calendarDatabase"
      );

      await updateEvent(event);

      const index =
        events.value.findIndex(
          (e) =>
            e.id === event.id
        );

      if (index !== -1) {
        events.value[index] =
          event;
      }

      /*
       * Keep selection updated
       */

      if (
        selectedEvent.value?.id ===
        event.id
      ) {
        selectedEvent.value =
          event;
      }

      refreshExpandedEvents();
    }

    async function deleteEvent(
      id: string
    ) {

      const {
        deleteEvent,
      } = await import(
        "../db/calendarDatabase"
      );

      await deleteEvent(id);

      events.value =
        events.value.filter(
          (event) =>
            event.id !== id
        );

      /*
       * SQLite cascade removes
       * recurrence/reminders.
       *
       * Remove them locally too.
       */

      recurrences.value =
        recurrences.value.filter(
          (recurrence) =>
            recurrence.eventId !== id
        );

      reminders.value =
        reminders.value.filter(
          (reminder) =>
            reminder.eventId !== id
        );

      if (
        selectedEvent.value?.id ===
        id
      ) {
        selectedEvent.value =
          null;
      }

      refreshExpandedEvents();
    }

    /* =====================================
       Selection
    ===================================== */

    function selectEvent(
      event: CalendarEvent | null
    ) {
      selectedEvent.value =
        event;
    }

    function clearSelection() {
      selectedEvent.value =
        null;
    }

    /* =====================================
       Event Queries
    ===================================== */

    function getEvent(
      id: string
    ) {

      return events.value.find(
        (event) =>
          event.id === id
      );
    }

    const newEventDefaults = ref<{
      startDate: string;
      endDate: string;
      allDay: boolean;
    } | null>(null);

    const selectedEventRecurrence =
      computed(() => {

        if (
          !selectedEvent.value
        ) {
          return null;
        }

        return (
          recurrences.value.find(
            (recurrence) =>
              recurrence.eventId ===
              selectedEvent.value!.id
          ) ?? null
        );

      });

    const selectedEventReminders =
      computed(() => {

        if (
          !selectedEvent.value
        ) {
          return [];
        }

        return reminders.value.filter(
          (reminder) =>
            reminder.eventId ===
            selectedEvent.value!.id
        );

      });
          /* =====================================
       Recurrence CRUD
    ===================================== */

    async function createRecurrence(
      recurrence: CalendarRecurrence
    ) {
      const {
        createRecurrence,
      } = await import(
        "../db/calendarRecurrenceDatabase"
      );

      await createRecurrence(
        recurrence
      );

      recurrences.value.push(
        recurrence
      );

      refreshExpandedEvents();
    }

    async function updateRecurrence(
      recurrence: CalendarRecurrence
    ) {
      const {
        updateRecurrence,
      } = await import(
        "../db/calendarRecurrenceDatabase"
      );

      await updateRecurrence(
        recurrence
      );

      const index =
        recurrences.value.findIndex(
          (r) =>
            r.id === recurrence.id
        );

      if (index !== -1) {
        recurrences.value[index] =
          recurrence;
      }

      refreshExpandedEvents();
    }

    async function deleteRecurrence(
      id: string
    ) {
      const {
        deleteRecurrence,
      } = await import(
        "../db/calendarRecurrenceDatabase"
      );

      await deleteRecurrence(id);

      recurrences.value =
        recurrences.value.filter(
          (r) => r.id !== id
        );

      refreshExpandedEvents();
    }

    /* =====================================
       Reminder CRUD
    ===================================== */

    async function createReminder(
      reminder: CalendarReminder
    ) {
      const {
        createReminder,
      } = await import(
        "../db/calendarReminderDatabase"
      );

      await createReminder(reminder);

      reminders.value.push(reminder);

      CalendarReminderScheduler.resetReminder(
        reminder.id
      );
    }

    async function updateReminder(
      reminder: CalendarReminder
    ) {
      const {
        updateReminder,
      } = await import(
        "../db/calendarReminderDatabase"
      );

      await updateReminder(reminder);

      const index =
        reminders.value.findIndex(
          (r) => r.id === reminder.id
        );

      if (index !== -1) {
        reminders.value[index] =
          reminder;
      }

      CalendarReminderScheduler.resetReminder(
        reminder.id
      );
    }
    async function deleteReminder(
      id: string
    ) {
      const {
        deleteReminder,
      } = await import(
        "../db/calendarReminderDatabase"
      );

      await deleteReminder(id);

      reminders.value =
        reminders.value.filter(
          (r) => r.id !== id
        );
        CalendarReminderScheduler.resetReminder(id);
    }

    /* =====================================
       Navigation
    ===================================== */

    function setView(
      view:
        | "dayGridMonth"
        | "timeGridWeek"
        | "timeGridDay"
        | "listWeek"
        | "multiMonthYear"
    ) {
      currentView.value =
        view;
    }

    function goToday() {
      selectedDate.value =
        new Date();

      refreshExpandedEvents();
    }

    function next() {
      const date =
        new Date(
          selectedDate.value
        );

      switch (currentView.value) {

  case "dayGridMonth":
    date.setMonth(date.getMonth() + 1);
    break;

  case "multiMonthYear":
    date.setFullYear(date.getFullYear() + 1);
    break;

  case "timeGridWeek":
  case "listWeek":
    date.setDate(date.getDate() + 7);
    break;

  case "timeGridDay":
    date.setDate(date.getDate() + 1);
    break;
}

      selectedDate.value =
        date;

      refreshExpandedEvents();
    }

    function previous() {
      const date =
        new Date(
          selectedDate.value
        );

      switch (currentView.value) {

  case "dayGridMonth":
    date.setMonth(date.getMonth() - 1);
    break;

  case "multiMonthYear":
    date.setFullYear(date.getFullYear() - 1);
    break;

  case "timeGridWeek":
  case "listWeek":
    date.setDate(date.getDate() - 7);
    break;

  case "timeGridDay":
    date.setDate(date.getDate() - 1);
    break;
}

      selectedDate.value =
        date;

      refreshExpandedEvents();
    }
        /* =====================================
       Computed
    ===================================== */

    const todayEvents =
      computed(() => {

        const today =
          new Date();

        return expandedEvents.value.filter(
          (event) => {

            const start =
              new Date(
                event.startDate
              );

            return (
              start.getFullYear() ===
                today.getFullYear() &&
              start.getMonth() ===
                today.getMonth() &&
              start.getDate() ===
                today.getDate()
            );

          }
        );

      });

    const upcomingEvents =
      computed(() => {

        const now =
          new Date();

        return expandedEvents.value
          .filter(
            (event) =>
              new Date(
                event.startDate
              ) >= now
          )
          .slice(0, 10);

      });

    const eventsForSelectedDate =
      computed(() => {

        return expandedEvents.value.filter(
          (event) => {

            const eventDate =
              new Date(
                event.startDate
              );

            return (
              eventDate.getFullYear() ===
                selectedDate.value.getFullYear() &&
              eventDate.getMonth() ===
                selectedDate.value.getMonth() &&
              eventDate.getDate() ===
                selectedDate.value.getDate()
            );

          }
        );

      });

    /* =====================================
       Watchers
    ===================================== */

    watch(
      events,
      refreshExpandedEvents,
      {
        deep: true,
      }
    );

    watch(
      recurrences,
      refreshExpandedEvents,
      {
        deep: true,
      }
    );

    watch(
      selectedDate,
      refreshExpandedEvents
    );

    /* =====================================
       Reload
    ===================================== */

    async function reload() {
      await load();
    }

    /* =====================================
       Cleanup
    ===================================== */

    function clear() {

      events.value = [];

      recurrences.value = [];

      reminders.value = [];

      expandedEvents.value = [];

      selectedEvent.value = null;

      loaded.value = false;

    }

    /* =====================================
       Exports
    ===================================== */

    return {

      /* ---------- State ---------- */

      loading,
      loaded,

      currentView,
      selectedDate,

      selectedEvent,

      /* ---------- Data ---------- */

      events,
      recurrences,
      reminders,

      expandedEvents,
      newEventDefaults,

      /* ---------- Computed ---------- */

      todayEvents,
      upcomingEvents,
      eventsForSelectedDate,

      selectedEventRecurrence,
      selectedEventReminders,

      /* ---------- Load ---------- */

      load,
      reload,
      clear,

      /* ---------- Events ---------- */

      createEvent,
      updateEvent,
      deleteEvent,

      getEvent,

      selectEvent,
      clearSelection,

      /* ---------- Recurrence ---------- */

      createRecurrence,
      updateRecurrence,
      deleteRecurrence,

      /* ---------- Reminder ---------- */

      createReminder,
      updateReminder,
      deleteReminder,

      /* ---------- Navigation ---------- */

      setView,

      goToday,
      next,
      previous,

    };

  }
);