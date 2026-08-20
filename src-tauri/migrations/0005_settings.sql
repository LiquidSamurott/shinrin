CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),

    -- Appearance
    theme TEXT NOT NULL DEFAULT 'dark',
    accent_color TEXT NOT NULL DEFAULT 'emerald',

    -- Calendar
    calendar_view TEXT NOT NULL DEFAULT 'timeGridWeek',
    week_starts_on INTEGER NOT NULL DEFAULT 1,
    show_weekends INTEGER NOT NULL DEFAULT 1,

    -- Pomodoro
    pomodoro_focus_minutes INTEGER NOT NULL DEFAULT 25,
    pomodoro_short_break_minutes INTEGER NOT NULL DEFAULT 5,
    pomodoro_long_break_minutes INTEGER NOT NULL DEFAULT 15,
    pomodoro_sessions_before_long_break INTEGER NOT NULL DEFAULT 4,

    pomodoro_auto_start_breaks INTEGER NOT NULL DEFAULT 0,
    pomodoro_auto_start_focus INTEGER NOT NULL DEFAULT 0,
    pomodoro_sound_enabled INTEGER NOT NULL DEFAULT 1,
    notifications_enabled INTEGER NOT NULL DEFAULT 1,

    -- Tasks
    daily_task_reset TEXT NOT NULL DEFAULT 'delete',

    -- Dashboard
    dashboard_daily_progress INTEGER NOT NULL DEFAULT 1,
    dashboard_quick_notes INTEGER NOT NULL DEFAULT 1,
    dashboard_pomodoro_stats INTEGER NOT NULL DEFAULT 1,
    dashboard_study_stats INTEGER NOT NULL DEFAULT 1,

    -- Web Search
    web_search_enabled INTEGER NOT NULL DEFAULT 0,
    searxng_url TEXT NOT NULL DEFAULT '',

    -- Metadata
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

INSERT OR IGNORE INTO settings (id)
VALUES (1);