import type { SessionType } from "./sessions";

export interface PomodoroTimers {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export const DEFAULT_TIMERS: PomodoroTimers = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function minutesToSeconds(
  minutes: number
): number {
  return minutes * 60;
}

export function secondsToMinutes(
  seconds: number
): number {
  return Math.floor(seconds / 60);
}

export function getTimerDuration(
  session: SessionType,
  timers: PomodoroTimers = DEFAULT_TIMERS
): number {
  switch (session) {
    case "focus":
      return timers.focus;

    case "shortBreak":
      return timers.shortBreak;

    case "longBreak":
      return timers.longBreak;
  }
}

export function formatTime(
  seconds: number
): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
}