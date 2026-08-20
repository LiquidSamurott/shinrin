// services/database/pomodoroSettings.ts

import Database from "@tauri-apps/plugin-sql";

import type {
  PomodoroSettings,
} from "../../src/services/pomodoro/settings";

import {
  DEFAULT_SETTINGS,
} from "../../src/services/pomodoro/settings";

/* ============================================
   SQLite Row
============================================ */

interface PomodoroSettingsRow {
  id: number;

  focus: number;
  short_break: number;
  long_break: number;

  auto_breaks: number;
  auto_focus: number;

  sound: number;
  notifications: number;
}

/* ============================================
   Database Singleton
============================================ */

let db: Database | null = null;

async function database(): Promise<Database> {
  if (!db) {
    db = await Database.load(
      "sqlite:shinrin.db"
    );
  }

  return db;
}

/* ============================================
   Initialize Table
============================================ */

export async function initPomodoroSettings() {
  const databaseInstance =
    await database();

  await databaseInstance.execute(`
CREATE TABLE IF NOT EXISTS pomodoro_settings (
    id INTEGER PRIMARY KEY CHECK(id = 1),

    focus INTEGER NOT NULL,
    short_break INTEGER NOT NULL,
    long_break INTEGER NOT NULL,

    auto_breaks INTEGER NOT NULL,
    auto_focus INTEGER NOT NULL,

    sound INTEGER NOT NULL,
    notifications INTEGER NOT NULL
);
`);

  const rows =
    (await databaseInstance.select(
      "SELECT * FROM pomodoro_settings WHERE id = 1"
    )) as PomodoroSettingsRow[];

  if (rows.length === 0) {
    await databaseInstance.execute(
      `
INSERT INTO pomodoro_settings
VALUES (
1,
?,
?,
?,
?,
?,
?,
?
);
`,
      [
        DEFAULT_SETTINGS.focus,

        DEFAULT_SETTINGS.shortBreak,

        DEFAULT_SETTINGS.longBreak,

        Number(
          DEFAULT_SETTINGS.autoStartBreaks
        ),

        Number(
          DEFAULT_SETTINGS.autoStartFocus
        ),

        Number(DEFAULT_SETTINGS.sound),

        Number(
          DEFAULT_SETTINGS.notifications
        ),
      ]
    );
  }
}

/* ============================================
   Load
============================================ */

export async function loadSettings(): Promise<PomodoroSettings> {
  const databaseInstance =
    await database();

  const rows =
    (await databaseInstance.select(
      "SELECT * FROM pomodoro_settings WHERE id = 1"
    )) as PomodoroSettingsRow[];

  if (rows.length === 0) {
    return DEFAULT_SETTINGS;
  }

  const row = rows[0];

  return {
    focus: row.focus,

    shortBreak: row.short_break,

    longBreak: row.long_break,

    autoStartBreaks:
      Boolean(row.auto_breaks),

    autoStartFocus:
      Boolean(row.auto_focus),

    sound: Boolean(row.sound),

    notifications:
      Boolean(row.notifications),
  };
}

/* ============================================
   Save
============================================ */

export async function saveSettings(
  settings: PomodoroSettings
) {
  const databaseInstance =
    await database();

  await databaseInstance.execute(
    `
UPDATE pomodoro_settings
SET
focus=?,
short_break=?,
long_break=?,
auto_breaks=?,
auto_focus=?,
sound=?,
notifications=?
WHERE id=1;
`,
    [
      settings.focus,

      settings.shortBreak,

      settings.longBreak,

      Number(
        settings.autoStartBreaks
      ),

      Number(
        settings.autoStartFocus
      ),

      Number(settings.sound),

      Number(
        settings.notifications
      ),
    ]
  );
}

/* ============================================
   Reset
============================================ */

export async function resetSettings() {
  await saveSettings(DEFAULT_SETTINGS);
}