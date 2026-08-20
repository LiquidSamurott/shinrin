// src/types/calendar.ts

/* =====================================
   Event Categories
===================================== */

export type CalendarEventType =
  | "event"
  | "study"
  | "exam"
  | "assignment"
  | "meeting"
  | "holiday"
  | "pomodoro"
  | "task";

/* =====================================
   Calendar Event
===================================== */

export interface CalendarEvent {
  id: string;

  title: string;
  description: string | null;

  startDate: string;
  endDate: string | null;

  allDay: boolean;

  color: string | null;
  location: string | null;

  eventType:
    | "event"
    | "study"
    | "exam"
    | "assignment"
    | "meeting"
    | "holiday"
    | "pomodoro"
    | "task";

  createdAt: string;
  updatedAt: string;
}

/* =====================================
   Event Creation
===================================== */

export interface CreateCalendarEvent {
  title: string;
  description?: string | null;

  startDate: string;
  endDate?: string | null;

  allDay?: boolean;

  color?: string | null;
  location?: string | null;

  recurrenceRule?: string | null;

  eventType?: CalendarEventType;
}

/* =====================================
   Event Update
===================================== */

export interface UpdateCalendarEvent
  extends Partial<CreateCalendarEvent> {
  id: string;
}

/* =====================================
   Date Range
===================================== */

export interface CalendarRange {
  start: string;
  end: string;
}

/* =====================================
   Sidebar Filters
===================================== */

export interface CalendarFilters {
  search: string;

  eventTypes: CalendarEventType[];

  showCompleted: boolean;

  color: string | null;
}

/* =====================================
   Calendar View
===================================== */

export type CalendarView =
  | "dayGridMonth"
  | "timeGridWeek"
  | "timeGridDay"
  | "listWeek";

/* =====================================
   Recurrence
===================================== */

export interface RecurrenceInstance {
  originalId: string;

  occurrenceId: string;

  startDate: string;

  endDate: string | null;
}

/* =========================================
   Calendar Recurrence
========================================= */

export type RecurrenceFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

export interface CalendarRecurrence {
  id: string;

  eventId: string;

  frequency: RecurrenceFrequency;

  interval: number;

  count: number | null;

  until: string | null;

  createdAt: string;

  updatedAt: string;
}

/* =========================================
   Calendar Reminder
========================================= */

export interface CalendarReminder {
  id: string;

  eventId: string;

  minutesBefore: number;

  dismissed: boolean;

  createdAt: string;
}
