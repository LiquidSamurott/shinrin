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

export function addFocusSession(
  stats: PomodoroStats,
  seconds: number
) {
  stats.completedSessions++;

  stats.totalFocusSeconds += seconds;

  stats.todaySessions++;
  stats.weekSessions++;
  stats.monthSessions++;
}

export function focusMinutes(
  stats: PomodoroStats
) {
  return Math.floor(
    stats.totalFocusSeconds / 60
  );
}

