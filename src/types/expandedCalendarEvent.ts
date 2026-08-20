import type { CalendarEvent } from "./calendar";

export interface ExpandedCalendarEvent
  extends CalendarEvent {

  /**
   * Original database event id.
   * Used for editing/deleting recurring events.
   */
  originalId: string;

  /**
   * Occurrence number.
   * 0 = original occurrence
   * 1 = second occurrence
   * ...
   */
  occurrence: number;
}