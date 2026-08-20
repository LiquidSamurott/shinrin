import type {
  CalendarEvent,
  CalendarRecurrence,
} from "../../types/calendar";

import type {
  ExpandedCalendarEvent,
} from "../../types/expandedCalendarEvent";

/* =========================================
   Expand One Event
========================================= */

export function expandRecurringEvent(
  event: CalendarEvent,
  recurrence: CalendarRecurrence | null,
  rangeStart: Date,
  rangeEnd: Date
): ExpandedCalendarEvent[] {

  /*
   * Non recurring
   */

  if (!recurrence) {

    return [
      {
        ...event,

        originalId: event.id,

        occurrence: 0,
      },
    ];

  }

  const results: ExpandedCalendarEvent[] = [];

  let currentStart =
    new Date(event.startDate);

  let currentEnd =
    event.endDate
      ? new Date(event.endDate)
      : null;

  let occurrence = 0;

  while (currentStart <= rangeEnd) {

    if (
      recurrence.count !== null &&
      occurrence >= recurrence.count
    ) {
      break;
    }

    if (
      recurrence.until &&
      currentStart >
        new Date(
          recurrence.until
        )
    ) {
      break;
    }

    if (currentStart >= rangeStart) {

      results.push({

        ...event,

        id:
          `${event.id}:${occurrence}`,

        originalId:
          event.id,

        occurrence,

        startDate:
          currentStart.toISOString(),

        endDate:
          currentEnd
            ? currentEnd.toISOString()
            : null,

      });

    }

    occurrence++;

    switch (
      recurrence.frequency
    ) {

      case "DAILY":

        currentStart.setDate(
          currentStart.getDate() +
          recurrence.interval
        );

        if (currentEnd) {
          currentEnd.setDate(
            currentEnd.getDate() +
            recurrence.interval
          );
        }

        break;

      case "WEEKLY":

        currentStart.setDate(
          currentStart.getDate() +
          7 *
            recurrence.interval
        );

        if (currentEnd) {
          currentEnd.setDate(
            currentEnd.getDate() +
            7 *
              recurrence.interval
          );
        }

        break;

      case "MONTHLY":

        currentStart.setMonth(
          currentStart.getMonth() +
          recurrence.interval
        );

        if (currentEnd) {
          currentEnd.setMonth(
            currentEnd.getMonth() +
            recurrence.interval
          );
        }

        break;

      case "YEARLY":

        currentStart.setFullYear(
          currentStart.getFullYear() +
          recurrence.interval
        );

        if (currentEnd) {
          currentEnd.setFullYear(
            currentEnd.getFullYear() +
            recurrence.interval
          );
        }

        break;
    }

  }

  return results;
}

/* =========================================
   Expand Multiple Events
========================================= */

export function expandRecurringEvents(
  events: CalendarEvent[],
  recurrences: CalendarRecurrence[],
  rangeStart: Date,
  rangeEnd: Date
): ExpandedCalendarEvent[] {

  return events.flatMap(
    (event) => {

      const recurrence =
        recurrences.find(
          (r) =>
            r.eventId ===
            event.id
        ) ?? null;

      return expandRecurringEvent(
        event,
        recurrence,
        rangeStart,
        rangeEnd
      );

    }
  );

}

/* =========================================
   Helpers
========================================= */

export function getRecurrenceForEvent(
  eventId: string,
  recurrences: CalendarRecurrence[]
) {

  return (
    recurrences.find(
      (r) =>
        r.eventId === eventId
    ) ?? null
  );

}

export function isRecurring(
  eventId: string,
  recurrences: CalendarRecurrence[]
) {

  return recurrences.some(
    (r) =>
      r.eventId === eventId
  );

}