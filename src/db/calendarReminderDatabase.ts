// src/db/calendarReminderDatabase.ts

import Database from "@tauri-apps/plugin-sql";

import type {
  CalendarReminder,
} from "../types/calendar";

let db: Database | null = null;

/* =========================================
   Database
========================================= */

async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:shinrin.db");

    await db.execute(
      "PRAGMA foreign_keys = ON;"
    );
  }

  return db;
}

/* =========================================
   Load
========================================= */

export async function loadReminders(): Promise<CalendarReminder[]> {
  const database = await getDatabase();

  const rows = await database.select<
    Array<{
      id: string;
      eventId: string;
      minutesBefore: number;
      dismissed: number | boolean;
      createdAt: string;
    }>
  >(
    `
      SELECT
        id,
        event_id AS eventId,
        minutes_before AS minutesBefore,
        dismissed,
        created_at AS createdAt
      FROM calendar_reminders;
    `
  );

  const reminders: CalendarReminder[] =
    rows.map((row) => ({
      id: String(row.id),

      eventId: String(row.eventId),

      minutesBefore:
        Number(row.minutesBefore),

      dismissed:
        Boolean(row.dismissed),

      createdAt:
        String(row.createdAt),
    }));

  console.log(
    "[CalendarReminderDatabase] Loaded reminders:",
    reminders
  );

  return reminders;
}

/* =========================================
   Event Reminders
========================================= */

export async function getRemindersForEvent(
  eventId: string
): Promise<CalendarReminder[]> {
  const database = await getDatabase();

  const rows = await database.select<
    Array<{
      id: string;
      eventId: string;
      minutesBefore: number;
      dismissed: number | boolean;
      createdAt: string;
    }>
  >(
    `
      SELECT
        id,
        event_id AS eventId,
        minutes_before AS minutesBefore,
        dismissed,
        created_at AS createdAt
      FROM calendar_reminders
      WHERE event_id = ?;
    `,
    [eventId]
  );

  return rows.map((row) => ({
    id: String(row.id),

    eventId: String(row.eventId),

    minutesBefore:
      Number(row.minutesBefore),

    dismissed:
      Boolean(row.dismissed),

    createdAt:
      String(row.createdAt),
  }));
}

/* =========================================
   Create
========================================= */

export async function createReminder(
  reminder: CalendarReminder
): Promise<void> {
  const database = await getDatabase();

  console.log(
    "[CalendarReminderDatabase] Creating reminder:",
    reminder
  );

  await database.execute(
    `
      INSERT INTO calendar_reminders (
        id,
        event_id,
        minutes_before,
        dismissed,
        created_at
      )
      VALUES (?, ?, ?, ?, ?);
    `,
    [
      reminder.id,

      reminder.eventId,

      Number(reminder.minutesBefore),

      reminder.dismissed ? 1 : 0,

      reminder.createdAt,
    ]
  );

  console.log(
    "[CalendarReminderDatabase] Reminder created:",
    reminder.id
  );
}

/* =========================================
   Update
========================================= */

export async function updateReminder(
  reminder: CalendarReminder
): Promise<void> {
  const database = await getDatabase();

  await database.execute(
    `
      UPDATE calendar_reminders
      SET
        minutes_before = ?,
        dismissed = ?
      WHERE id = ?;
    `,
    [
      Number(reminder.minutesBefore),

      reminder.dismissed ? 1 : 0,

      reminder.id,
    ]
  );
}

/* =========================================
   Delete
========================================= */

export async function deleteReminder(
  id: string
): Promise<void> {
  const database = await getDatabase();

  await database.execute(
    `
      DELETE FROM calendar_reminders
      WHERE id = ?;
    `,
    [id]
  );
}

