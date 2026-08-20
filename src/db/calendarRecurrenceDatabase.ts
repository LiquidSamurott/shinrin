// src/db/calendarRecurrenceDatabase.ts

import Database from "@tauri-apps/plugin-sql";

import type {
  CalendarRecurrence,
} from "../types/calendar";

let db: Database | null = null;

/* =========================================
   Database
========================================= */

async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load(
      "sqlite:shinrin.db"
    );

    await db.execute(
      "PRAGMA foreign_keys = ON;"
    );
  }

  return db;
}

/* =========================================
   Load All
========================================= */

export async function loadRecurrences(): Promise<
  CalendarRecurrence[]
> {
  const database =
    await getDatabase();

  return await database.select<
    CalendarRecurrence[]
  >(
    `
    SELECT

      id,

      event_id AS eventId,

      frequency,

      interval,

      count,

      until,

      created_at AS createdAt,

      updated_at AS updatedAt

    FROM calendar_recurrence;
    `
  );
}

/* =========================================
   Get By Event
========================================= */

export async function getRecurrence(
  eventId: string
): Promise<CalendarRecurrence | null> {

  const database =
    await getDatabase();

  const rows =
    await database.select<
      CalendarRecurrence[]
    >(
      `
      SELECT

        id,

        event_id AS eventId,

        frequency,

        interval,

        count,

        until,

        created_at AS createdAt,

        updated_at AS updatedAt

      FROM calendar_recurrence

      WHERE event_id = ?;
      `,
      [eventId]
    );

  return rows[0] ?? null;
}

/* =========================================
   Create
========================================= */

export async function createRecurrence(
  recurrence: CalendarRecurrence
): Promise<void> {

  const database =
    await getDatabase();

  await database.execute(
    `
    INSERT INTO calendar_recurrence (

      id,

      event_id,

      frequency,

      interval,

      count,

      until,

      created_at,

      updated_at

    )

    VALUES (

      ?, ?, ?, ?, ?, ?, ?, ?

    );
    `,
    [
      recurrence.id,

      recurrence.eventId,

      recurrence.frequency,

      recurrence.interval,

      recurrence.count,

      recurrence.until,

      recurrence.createdAt,

      recurrence.updatedAt,
    ]
  );
}

/* =========================================
   Update
========================================= */

export async function updateRecurrence(
  recurrence: CalendarRecurrence
): Promise<void> {

  const database =
    await getDatabase();

  await database.execute(
    `
    UPDATE calendar_recurrence

    SET

      frequency = ?,

      interval = ?,

      count = ?,

      until = ?,

      updated_at = ?

    WHERE id = ?;
    `,
    [
      recurrence.frequency,

      recurrence.interval,

      recurrence.count,

      recurrence.until,

      recurrence.updatedAt,

      recurrence.id,
    ]
  );
}

/* =========================================
   Delete
========================================= */

export async function deleteRecurrence(
  id: string
): Promise<void> {

  const database =
    await getDatabase();

  await database.execute(
    `
    DELETE FROM calendar_recurrence

    WHERE id = ?;
    `,
    [id]
  );
}

/* =========================================
   Delete By Event
========================================= */

export async function deleteRecurrenceByEvent(
  eventId: string
): Promise<void> {

  const database =
    await getDatabase();

  await database.execute(
    `
    DELETE FROM calendar_recurrence

    WHERE event_id = ?;
    `,
    [eventId]
  );
}