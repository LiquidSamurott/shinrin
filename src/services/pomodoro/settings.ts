export interface PomodoroSettings {
  focus: number;

  shortBreak: number;

  longBreak: number;

  autoStartBreaks: boolean;

  autoStartFocus: boolean;

  sound: boolean;

  notifications: boolean;
}

export const DEFAULT_SETTINGS: PomodoroSettings =
{
  focus: 25 * 60,

  shortBreak: 5 * 60,

  longBreak: 15 * 60,

  autoStartBreaks: true,

  autoStartFocus: false,

  sound: true,

  notifications: true,
};

export interface PomodoroStats {
  completedSessions: number;
  interruptedSessions: number;
  totalFocusSeconds: number;

  todaySessions: number;
  weekSessions: number;
  monthSessions: number;

  currentStreak: number;
  longestStreak: number;

  lastCompletedDate: string | null;
  lastWeek: string | null;
  lastMonth: string | null;
}

export const DEFAULT_STATS: PomodoroStats = {
  completedSessions: 0,
  interruptedSessions: 0,
  totalFocusSeconds: 0,

  todaySessions: 0,
  weekSessions: 0,
  monthSessions: 0,

  currentStreak: 0,
  longestStreak: 0,

  lastCompletedDate: null,
  lastWeek: null,
  lastMonth: null,
};