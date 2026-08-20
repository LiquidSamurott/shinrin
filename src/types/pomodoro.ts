export type SessionType =
  | "focus"
  | "shortBreak"
  | "longBreak";

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;

  autoStartBreak: boolean;
  autoStartFocus: boolean;

  notifications: boolean;
  sound: boolean;
}

export interface PomodoroState {
  running: boolean;

  session: SessionType;

  secondsLeft: number;

  completedPomodoros: number;

  settings: PomodoroSettings;
}