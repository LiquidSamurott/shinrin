// src/db/calendarDatabase.ts

import Database from "@tauri-apps/plugin-sql";
import type { CalendarEvent } from "../types/calendar";

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
   Load All Events
========================================= */

export async function loadEvents(): Promise<CalendarEvent[]> {
  const database = await getDatabase();

  return await database.select<CalendarEvent[]>(
    `
    SELECT
      id,

      title,
      description,

      start_date AS startDate,
      end_date AS endDate,

      all_day AS allDay,

      color,
      location,

      event_type AS eventType,

      created_at AS createdAt,
      updated_at AS updatedAt

    FROM calendar_events

    ORDER BY start_date ASC;
    `
  );
}

/* =========================================
   Get Event
========================================= */

export async function getEvent(
  id: string
): Promise<CalendarEvent | null> {
  const database = await getDatabase();

  const rows = await database.select<CalendarEvent[]>(
    `
    SELECT
      id,

      title,
      description,

      start_date AS startDate,
      end_date AS endDate,

      all_day AS allDay,

      color,
      location,

      event_type AS eventType,

      created_at AS createdAt,
      updated_at AS updatedAt

    FROM calendar_events

    WHERE id = ?;
    `,
    [id]
  );

  return rows[0] ?? null;
}

/* =========================================
   Create Event
========================================= */

export async function createEvent(
  event: CalendarEvent
): Promise<void> {
  const database = await getDatabase();

  await database.execute(
    `
    INSERT INTO calendar_events (

      id,

      title,
      description,

      start_date,
      end_date,

      all_day,

      color,
      location,

      event_type,

      created_at,
      updated_at

    )

    VALUES (

      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?

    );
    `,
    [
      event.id,

      event.title,
      event.description,

      event.startDate,
      event.endDate,

      event.allDay ? 1 : 0,

      event.color,
      event.location,

      event.eventType,

      event.createdAt,
      event.updatedAt,
    ]
  );
}

/* =========================================
   Update Event
========================================= */

export async function updateEvent(
  event: CalendarEvent
): Promise<void> {
  const database = await getDatabase();

  await database.execute(
    `
    UPDATE calendar_events

    SET

      title = ?,
      description = ?,

      start_date = ?,
      end_date = ?,

      all_day = ?,

      color = ?,
      location = ?,

      event_type = ?,

      updated_at = ?

    WHERE id = ?;
    `,
    [
      event.title,
      event.description,

      event.startDate,
      event.endDate,

      event.allDay ? 1 : 0,

      event.color,
      event.location,

      event.eventType,

      event.updatedAt,

      event.id,
    ]
  );
}

/* =========================================
   Delete Event
========================================= */

export async function deleteEvent(
  id: string
): Promise<void> {
  const database = await getDatabase();

  await database.execute(
    `
    DELETE FROM calendar_events
    WHERE id = ?;
    `,
    [id]
  );
}

/* =========================================
   Delete All Events
========================================= */

export async function clearEvents(): Promise<void> {
  const database = await getDatabase();

  await database.execute(
    `
    DELETE FROM calendar_events;
    `
  );
}