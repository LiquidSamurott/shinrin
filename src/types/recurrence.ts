export interface CalendarRecurrence {
  id: string;

  eventId: string;

  frequency:
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY"
    | "YEARLY";

  interval: number;

  count: number | null;

  until: string | null;

  createdAt: string;

  updatedAt: string;
}