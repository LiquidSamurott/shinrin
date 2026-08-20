CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,

    title TEXT NOT NULL,
    description TEXT,

    start_date TEXT NOT NULL,
    end_date TEXT,

    all_day INTEGER NOT NULL DEFAULT 0,

    color TEXT,
    location TEXT,

    recurrence_rule TEXT,

    event_type TEXT NOT NULL,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar_reminders (
    id TEXT PRIMARY KEY,

    event_id TEXT NOT NULL,

    minutes_before INTEGER NOT NULL,

    dismissed INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL,

    FOREIGN KEY (event_id)
        REFERENCES calendar_events(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS calendar_recurrence (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    frequency TEXT NOT NULL,
    interval INTEGER NOT NULL,
    count INTEGER,
    until TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(event_id)
        REFERENCES calendar_events(id)
        ON DELETE CASCADE
);