// src/composables/calendar/useCalendarDate.ts

/* ==========================================
   Local Date Helpers
========================================== */

/**
 * Converts a Date into a datetime-local value.
 *
 * Example:
 * 2026-08-06T21:30
 */
export function toLocalDateTime(
  date: Date
): string {

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime() -
      offset * 60000
    );

  return local
    .toISOString()
    .slice(0, 16);

}

/* ==========================================
   UTC -> datetime-local
========================================== */

/**
 * Database UTC ISO
 * ->
 * datetime-local input
 */

export function utcToLocalInput(
  utc: string
): string {

  return toLocalDateTime(
    new Date(utc)
  );

}

/* ==========================================
   datetime-local -> UTC ISO
========================================== */

/**
 * datetime-local input
 * ->
 * Database UTC ISO
 */

export function localInputToUTC(
  value: string
): string {

  return new Date(value)
    .toISOString();

}

/* ==========================================
   Default Event Times
========================================== */

export function createDefaultDateRange() {

  const start =
    new Date();

  const end =
    new Date(start);

  end.setHours(
    end.getHours() + 1
  );

  return {

    start:
      toLocalDateTime(start),

    end:
      toLocalDateTime(end),

  };

}

/* ==========================================
   Helpers
========================================== */

export function addHours(
  value: string,
  hours: number
): string {

  const date =
    new Date(value);

  date.setHours(
    date.getHours() + hours
  );

  return toLocalDateTime(date);

}

export function addDays(
  value: string,
  days: number
): string {

  const date =
    new Date(value);

  date.setDate(
    date.getDate() + days
  );

  return toLocalDateTime(date);

}

export function addWeeks(
  value: string,
  weeks: number
): string {

  return addDays(
    value,
    weeks * 7
  );

}

export function addMonths(
  value: string,
  months: number
): string {

  const date =
    new Date(value);

  date.setMonth(
    date.getMonth() + months
  );

  return toLocalDateTime(date);

}

/* ==========================================
   Validation
========================================== */

export function isValidDateRange(
  start: string,
  end: string
): boolean {

  return (
    new Date(end) >=
    new Date(start)
  );

}

/* ==========================================
   Normalize End Time
========================================== */

export function normalizeEndDate(
  start: string,
  end: string
): string {

  if (!end) {
    return addHours(start, 1);
  }

  if (
    new Date(end) <
    new Date(start)
  ) {

    return addHours(start, 1);

  }

  return end;

}