// src/types/reminder.ts

export interface CalendarReminder {
  id: string;

  eventId: string;

  minutesBefore: number;

  dismissed: boolean;

  createdAt: string;
}