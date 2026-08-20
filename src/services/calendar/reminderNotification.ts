import type { CalendarEvent } from "../../types/calendar";

const EVENT_ICONS: Record<
  CalendarEvent["eventType"],
  string
> = {
  event: "📅",
  study: "📚",
  exam: "📝",
  assignment: "📌",
  meeting: "👥",
  holiday: "🎉",
  pomodoro: "🍅",
  task: "✅",
};

export function buildReminderTitle(
  event: CalendarEvent
): string {
  return `${EVENT_ICONS[event.eventType]} ${event.title}`;
}

export function buildReminderBody(
  event: CalendarEvent,
  minutesBefore: number
): string {

  const lines: string[] = [];

  if (event.location) {
    lines.push(`📍 ${event.location}`);
  }

  lines.push(
    `⏰ Starts in ${minutesBefore} minute${
      minutesBefore === 1 ? "" : "s"
    }`
  );

  if (
    event.description &&
    event.description.trim().length > 0
  ) {
    lines.push("");
    lines.push(event.description);
  }

  return lines.join("\n");
}