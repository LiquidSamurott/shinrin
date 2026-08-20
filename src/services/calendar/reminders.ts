// src/services/calendar/reminders.ts

import type { CalendarEvent } from "../../types/calendar";
import type { CalendarReminder } from "../../types/reminder";

/* =========================================
   Reminder Trigger
========================================= */

export interface TriggeredReminder {
  reminder: CalendarReminder;
  event: CalendarEvent;
}

/* =========================================
   Reminder Time
========================================= */

export function getReminderTime(
  event: CalendarEvent,
  reminder: CalendarReminder
): Date {
  const start = new Date(event.startDate);

  return new Date(
    start.getTime() -
      reminder.minutesBefore * 60 * 1000
  );
}

/* =========================================
   Is Reminder Due
========================================= */

export function isReminderDue(
  event: CalendarEvent,
  reminder: CalendarReminder,
  now = new Date()
): boolean {
  if (reminder.dismissed) {
    return false;
  }

  return (
    getReminderTime(event, reminder).getTime() <=
    now.getTime()
  );
}

/* =========================================
   Find Due Reminders
========================================= */

export function findDueReminders(
  events: CalendarEvent[],
  reminders: CalendarReminder[],
  now = new Date()
): TriggeredReminder[] {
  const triggered: TriggeredReminder[] = [];

  for (const reminder of reminders) {
    const event = events.find(
      (e) => e.id === reminder.eventId
    );

    if (!event) continue;

    if (
      isReminderDue(event, reminder, now)
    ) {
      triggered.push({
        reminder,
        event,
      });
    }
  }

  return triggered;
}

/* =========================================
   Sort Upcoming
========================================= */

export function sortUpcomingReminders(
  events: CalendarEvent[],
  reminders: CalendarReminder[]
): TriggeredReminder[] {
  return reminders
    .map((reminder) => {
      const event = events.find(
        (e) => e.id === reminder.eventId
      );

      if (!event) return null;

      return {
        reminder,
        event,
      };
    })
    .filter(
      (
        item
      ): item is TriggeredReminder =>
        item !== null
    )
    .sort((a, b) => {
      return (
        getReminderTime(
          a.event,
          a.reminder
        ).getTime() -
        getReminderTime(
          b.event,
          b.reminder
        ).getTime()
      );
    });
}

/* =========================================
   Snooze
========================================= */

export function snoozeReminder(
  reminder: CalendarReminder,
  minutes = 5
): CalendarReminder {
  return {
    ...reminder,
    minutesBefore:
      reminder.minutesBefore - minutes,
  };
}

/* =========================================
   Dismiss
========================================= */

export function dismissReminder(
  reminder: CalendarReminder
): CalendarReminder {
  return {
    ...reminder,
    dismissed: true,
  };
}