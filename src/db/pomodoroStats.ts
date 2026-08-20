// services/pomodoro/statsDatabase.ts

import Database from "@tauri-apps/plugin-sql";

import type {
  PomodoroStats,
} from "../services/pomodoro/statistics";

let db: Database | null = null;

async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:shinrin.db");
  }
  await db.execute(
    "PRAGMA foreign_keys = ON;"
  );

  return db;
}

export async function loadStats(): Promise<PomodoroStats> {
  const database = await getDatabase();

  const rows = await database.select<PomodoroStats[]>(
    `
    SELECT
      completed_sessions      AS completedSessions,
      interrupted_sessions    AS interruptedSessions,

      total_focus_seconds     AS totalFocusSeconds,

      today_sessions          AS todaySessions,
      week_sessions           AS weekSessions,
      month_sessions          AS monthSessions,

      current_streak          AS currentStreak,
      longest_streak          AS longestStreak,

      last_completed_date     AS lastCompletedDate,
      last_week               AS lastWeek,
      last_month              AS lastMonth

    FROM pomodoro_stats
    WHERE id = 1;
    `
  );

  return rows[0];
}

export async function saveStats(
  stats: PomodoroStats
): Promise<void> {
  const database = await getDatabase();

  await database.execute(
    `
    UPDATE pomodoro_stats
    SET
      completed_sessions=?,
      interrupted_sessions=?,

      total_focus_seconds=?,

      today_sessions=?,
      week_sessions=?,
      month_sessions=?,

      current_streak=?,
      longest_streak=?,

      last_completed_date=?,
      last_week=?,
      last_month=?

    WHERE id=1;
    `,
    [
      stats.completedSessions,
      stats.interruptedSessions,

      stats.totalFocusSeconds,

      stats.todaySessions,
      stats.weekSessions,
      stats.monthSessions,

      stats.currentStreak,
      stats.longestStreak,

      stats.lastCompletedDate,
      stats.lastWeek,
      stats.lastMonth,
    ]
  );
}