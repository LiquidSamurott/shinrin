-- ==========================================
-- Pomodoro Settings
-- ==========================================

CREATE TABLE IF NOT EXISTS pomodoro_settings (
    id INTEGER PRIMARY KEY CHECK(id = 1),

    focus INTEGER NOT NULL,
    short_break INTEGER NOT NULL,
    long_break INTEGER NOT NULL,

    auto_breaks INTEGER NOT NULL DEFAULT 1,
    auto_focus INTEGER NOT NULL DEFAULT 0,

    sound INTEGER NOT NULL DEFAULT 1,
    notifications INTEGER NOT NULL DEFAULT 1
);

INSERT OR IGNORE INTO pomodoro_settings
VALUES (
    1,
    1500,
    300,
    900,
    1,
    0,
    1,
    1
);

-- ==========================================
-- Pomodoro Statistics
-- ==========================================

CREATE TABLE IF NOT EXISTS pomodoro_stats (
    id INTEGER PRIMARY KEY CHECK(id = 1),

    completed_sessions INTEGER NOT NULL DEFAULT 0,
    interrupted_sessions INTEGER NOT NULL DEFAULT 0,

    total_focus_seconds INTEGER NOT NULL DEFAULT 0,

    today_sessions INTEGER NOT NULL DEFAULT 0,
    week_sessions INTEGER NOT NULL DEFAULT 0,
    month_sessions INTEGER NOT NULL DEFAULT 0,

    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,

    last_completed_date TEXT,
    last_week TEXT,
    last_month TEXT
);

INSERT OR IGNORE INTO pomodoro_stats
VALUES (
    1,
    0,      -- completed_sessions
    0,      -- interrupted_sessions
    0,      -- total_focus_seconds
    0,      -- today_sessions
    0,      -- week_sessions
    0,      -- month_sessions
    0,      -- current_streak
    0,      -- longest_streak
    NULL,   -- last_completed_date
    NULL,   -- last_week
    NULL    -- last_month
);