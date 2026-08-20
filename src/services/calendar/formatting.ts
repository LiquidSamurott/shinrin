// src/services/calendar/formatting.ts

import type { CalendarEvent } from "../../types/calendar";

/* ==========================================
   ISO Helpers
========================================== */

export function toISO(date: Date): string {
  return date.toISOString();
}

export function fromISO(value: string): Date {
  return new Date(value);
}

/* ==========================================
   Date Formatting
========================================== */

export function formatDate(
  value: string | Date,
  locale = "en-US"
): string {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatTime(
  value: string | Date,
  locale = "en-US"
): string {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateTime(
  value: string | Date,
  locale = "en-US"
): string {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/* ==========================================
   Date Comparisons
========================================== */

export function isSameDay(
  first: Date,
  second: Date
): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isToday(
  value: string | Date
): boolean {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return isSameDay(date, new Date());
}

export function isPast(
  value: string | Date
): boolean {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return date.getTime() < Date.now();
}

export function isFuture(
  value: string | Date
): boolean {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return date.getTime() > Date.now();
}

/* ==========================================
   Duration
========================================== */

export function durationMinutes(
  start: string,
  end: string
): number {
  return Math.floor(
    (new Date(end).getTime() -
      new Date(start).getTime()) /
      60000
  );
}

export function durationHours(
  start: string,
  end: string
): number {
  return (
    new Date(end).getTime() -
    new Date(start).getTime()
  ) / 3600000;
}

/* ==========================================
   FullCalendar Mapping
========================================== */

export function toFullCalendarEvent(
  event: CalendarEvent
) {
  return {
    id: event.id,

    title: event.title,

    start: event.startDate,

    end: event.endDate ?? undefined,

    allDay: event.allDay,

    backgroundColor:
      event.color ?? undefined,

    borderColor:
      event.color ?? undefined,

    extendedProps: {
      description: event.description,
      location: event.location,
      eventType: event.eventType,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    },
  };
}

export function fromFullCalendarEvent(
  event: any
): CalendarEvent {
  return {
    id: event.id,

    title: event.title,

    description:
      event.extendedProps?.description ??
      null,

    startDate:
      event.start.toISOString(),

    endDate:
      event.end?.toISOString() ??
      null,

    allDay:
      event.allDay ?? false,

    color:
      event.backgroundColor ??
      null,

    location:
      event.extendedProps?.location ??
      null,

    eventType:
      event.extendedProps?.eventType ??
      "event",

    createdAt:
      event.extendedProps?.createdAt ??
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  };
}

/* ==========================================
   Sorting
========================================== */

export function sortEvents<
  T extends CalendarEvent
>(
  events: T[]
): T[] {
  return [...events].sort(
    (a, b) =>
      new Date(a.startDate).getTime() -
      new Date(b.startDate).getTime()
  );
}

/* ==========================================
   Range Filter
========================================== */

export function eventsBetween<
  T extends CalendarEvent
>(
  events: T[],
  start: Date,
  end: Date
): T[] {
  return events.filter((event) => {
    const eventStart =
      new Date(event.startDate);

    return (
      eventStart >= start &&
      eventStart <= end
    );
  });
}

/* ==========================================
   Upcoming Events
========================================== */

export function upcomingEvents<
  T extends CalendarEvent
>(
  events: T[],
  limit = 5
): T[] {
  return sortEvents(
    events.filter((event) =>
      isFuture(event.startDate)
    )
  ).slice(0, limit);
}

/* ==========================================
   Today's Events
========================================== */

export function todaysEvents<
  T extends CalendarEvent
>(
  events: T[]
): T[] {
  return events.filter((event) =>
    isToday(event.startDate)
  );
}