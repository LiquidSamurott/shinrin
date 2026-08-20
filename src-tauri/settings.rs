pub struct AppSettings {
    pub theme: String,
    pub accent_color: String,

    pub calendar_view: String,
    pub week_starts_on: i32,
    pub show_weekends: bool,

    pub pomodoro_focus_minutes: i32,
    pub pomodoro_short_break_minutes: i32,
    pub pomodoro_long_break_minutes: i32,
    pub pomodoro_sessions_before_long_break: i32,

    pub pomodoro_auto_start_breaks: bool,
    pub pomodoro_auto_start_focus: bool,
    pub pomodoro_sound_enabled: bool,
    pub notifications_enabled: bool,

    pub daily_task_reset: String,

    pub dashboard_daily_progress: bool,
    pub dashboard_quick_notes: bool,
    pub dashboard_pomodoro_stats: bool,
    pub dashboard_study_stats: bool,

    pub web_search_enabled: bool,
    pub searxng_url: String,
}