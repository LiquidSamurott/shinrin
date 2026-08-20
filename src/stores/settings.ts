import { defineStore } from "pinia";
import Database from "@tauri-apps/plugin-sql";

/* ============================================================
   Accent Palette
============================================================ */

export const accentPalettes = {
  forest: {
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
  },

  ocean: {
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
  },

  sakura: {
    400: "#f9a8d4",
    500: "#ec4899",
    600: "#db2777",
  },

  sunset: {
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
  },

  midnight: {
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
  },

  fauvist: {
    400: "#facc15",
    500: "#f97316",
    600: "#ef4444",
  },
} as const;

export type AccentColorKey =
  keyof typeof accentPalettes;

/* ============================================================
   App Settings
============================================================ */

export interface AppSettings {
  id: number;

  /* Appearance */
  theme: string;
  accentColor: AccentColorKey;

  /* Calendar */
  calendarView: string;
  weekStartsOn: number;
  showWeekends: boolean;

  /* Pomodoro */
  pomodoroFocusMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroSessionsBeforeLongBreak: number;

  pomodoroAutoStartBreaks: boolean;
  pomodoroAutoStartFocus: boolean;
  pomodoroSoundEnabled: boolean;
  notificationsEnabled: boolean;

  /* Tasks */
  dailyTaskReset: string;

  /* Dashboard */
  dashboardDailyProgress: boolean;
  dashboardQuickNotes: boolean;
  dashboardPomodoroStats: boolean;
  dashboardStudyStats: boolean;

  /* Web Search */
  webSearchEnabled: boolean;
  searxngUrl: string;
}

/* ============================================================
   Default Settings
============================================================ */

const defaultSettings: AppSettings = {
  id: 1,

  /* Appearance */

  theme: "dark",
  accentColor: "forest",

  /* Calendar */

  calendarView: "timeGridWeek",
  weekStartsOn: 1,
  showWeekends: true,

  /* Pomodoro */

  pomodoroFocusMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroSessionsBeforeLongBreak: 4,

  pomodoroAutoStartBreaks: false,
  pomodoroAutoStartFocus: false,
  pomodoroSoundEnabled: true,
  notificationsEnabled: true,

  /* Tasks */

  dailyTaskReset: "delete",

  /* Dashboard */

  dashboardDailyProgress: true,
  dashboardQuickNotes: true,
  dashboardPomodoroStats: true,
  dashboardStudyStats: true,

  /* Web Search */

  webSearchEnabled: false,

  /*
   * Empty means:
   * "No SearXNG server configured."
   *
   * The user can configure this later.
   */
  searxngUrl: "",
};

/* ============================================================
   SQLite Row
============================================================ */

interface SettingsRow {
  id: number;

  theme: string;
  palette: string;

  calendar_view: string;
  week_starts_on: number;
  show_weekends: number;

  pomodoro_focus_minutes: number;
  pomodoro_short_break_minutes: number;
  pomodoro_long_break_minutes: number;
  pomodoro_sessions_before_long_break: number;

  pomodoro_auto_start_breaks: number;
  pomodoro_auto_start_focus: number;
  pomodoro_sound_enabled: number;
  notifications_enabled: number;

  daily_task_reset: string;

  dashboard_daily_progress: number;
  dashboard_quick_notes: number;
  dashboard_pomodoro_stats: number;
  dashboard_study_stats: number;

  web_search_enabled: number;
  searxng_url: string;

  updated_at: number;
}

/* ============================================================
   Helpers
============================================================ */

function toBoolean(
  value: number | boolean | null | undefined,
): boolean {
  return Boolean(value);
}

function isAccentColor(
  value: string,
): value is AccentColorKey {
  return value in accentPalettes;
}

function normalizeAccentColor(
  value: string,
): AccentColorKey {
  if (isAccentColor(value)) {
    return value;
  }

  return "forest";
}

/* ============================================================
   Settings Store
============================================================ */

export const useSettingsStore = defineStore(
  "settings",
  {
    state: () => ({
      db: null as Database | null,

      settings: {
        ...defaultSettings,
      } as AppSettings,

      loading: false,
      saving: false,
      initialized: false,

      error: null as string | null,
    }),

    /* ========================================================
       Getters
    ======================================================== */

    getters: {
      /**
       * Currently selected accent palette.
       */
      accentPalette(state) {
        return (
          accentPalettes[
            state.settings.accentColor
          ] ?? accentPalettes.forest
        );
      },

      /**
       * Whether web search is actually usable.
       *
       * Web search needs both:
       *
       * 1. Enabled
       * 2. A configured SearXNG URL
       */
      webSearchAvailable(state): boolean {
        return (
          state.settings.webSearchEnabled &&
          state.settings.searxngUrl.trim().length > 0
        );
      },
    },

    actions: {
      /* ======================================================
         Initialize Database
      ====================================================== */

      async initialize() {
        if (!this.db) {
          this.db = await Database.load(
            "sqlite:shinrin.db",
          );
        }
      },

      /* ======================================================
         Load Settings
      ====================================================== */

      async loadSettings() {
        this.loading = true;
        this.error = null;

        try {
          await this.initialize();

          const rows =
            await this.db!.select<SettingsRow[]>(
              `
              SELECT
                id,

                theme,
                palette,

                calendar_view,
                week_starts_on,
                show_weekends,

                pomodoro_focus_minutes,
                pomodoro_short_break_minutes,
                pomodoro_long_break_minutes,
                pomodoro_sessions_before_long_break,

                pomodoro_auto_start_breaks,
                pomodoro_auto_start_focus,
                pomodoro_sound_enabled,
                notifications_enabled,

                daily_task_reset,

                dashboard_daily_progress,
                dashboard_quick_notes,
                dashboard_pomodoro_stats,
                dashboard_study_stats,

                web_search_enabled,
                searxng_url,

                updated_at

              FROM settings

              WHERE id = 1

              LIMIT 1
              `,
            );

          /* ==================================================
             Existing settings row
          ================================================== */

          if (rows.length > 0) {
            const row = rows[0];

            const accentColor =
              normalizeAccentColor(
                row.palette,
              );

            this.settings = {
              id: row.id,

              /* Appearance */

              theme: row.theme,
              accentColor,

              /* Calendar */

              calendarView:
                row.calendar_view,

              weekStartsOn:
                row.week_starts_on,

              showWeekends:
                toBoolean(
                  row.show_weekends,
                ),

              /* Pomodoro */

              pomodoroFocusMinutes:
                row.pomodoro_focus_minutes,

              pomodoroShortBreakMinutes:
                row.pomodoro_short_break_minutes,

              pomodoroLongBreakMinutes:
                row.pomodoro_long_break_minutes,

              pomodoroSessionsBeforeLongBreak:
                row.pomodoro_sessions_before_long_break,

              pomodoroAutoStartBreaks:
                toBoolean(
                  row.pomodoro_auto_start_breaks,
                ),

              pomodoroAutoStartFocus:
                toBoolean(
                  row.pomodoro_auto_start_focus,
                ),

              pomodoroSoundEnabled:
                toBoolean(
                  row.pomodoro_sound_enabled,
                ),

              notificationsEnabled:
                toBoolean(
                  row.notifications_enabled,
                ),

              /* Tasks */

              dailyTaskReset:
                row.daily_task_reset,

              /* Dashboard */

              dashboardDailyProgress:
                toBoolean(
                  row.dashboard_daily_progress,
                ),

              dashboardQuickNotes:
                toBoolean(
                  row.dashboard_quick_notes,
                ),

              dashboardPomodoroStats:
                toBoolean(
                  row.dashboard_pomodoro_stats,
                ),

              dashboardStudyStats:
                toBoolean(
                  row.dashboard_study_stats,
                ),

              /* Web Search */

              webSearchEnabled:
                toBoolean(
                  row.web_search_enabled,
                ),

              searxngUrl:
                row.searxng_url ?? "",
            };
          }

          /* ==================================================
             No settings row
          ================================================== */

          else {
            await this.insertDefaults();

            this.settings = {
              ...defaultSettings,
            };
          }

          this.initialized = true;
        } catch (error) {
          console.error(
            "Failed to load settings:",
            error,
          );

          this.error = String(error);
        } finally {
          this.loading = false;
        }
      },

      /* ======================================================
         Insert Default Settings
      ====================================================== */

      async insertDefaults() {
        await this.initialize();

        await this.db!.execute(
          `
          INSERT OR IGNORE INTO settings (
            id,

            theme,
            palette,

            calendar_view,
            week_starts_on,
            show_weekends,

            pomodoro_focus_minutes,
            pomodoro_short_break_minutes,
            pomodoro_long_break_minutes,
            pomodoro_sessions_before_long_break,

            pomodoro_auto_start_breaks,
            pomodoro_auto_start_focus,
            pomodoro_sound_enabled,
            notifications_enabled,

            daily_task_reset,

            dashboard_daily_progress,
            dashboard_quick_notes,
            dashboard_pomodoro_stats,
            dashboard_study_stats,

            web_search_enabled,
            searxng_url
          )

          VALUES (
            1,

            $1,
            $2,

            $3,
            $4,
            $5,

            $6,
            $7,
            $8,
            $9,

            $10,
            $11,
            $12,
            $13,

            $14,

            $15,
            $16,
            $17,
            $18,

            $19,
            $20
          )
          `,
          [
            /* Appearance */

            defaultSettings.theme,
            defaultSettings.accentColor,

            /* Calendar */

            defaultSettings.calendarView,
            defaultSettings.weekStartsOn,
            defaultSettings.showWeekends
              ? 1
              : 0,

            /* Pomodoro */

            defaultSettings.pomodoroFocusMinutes,
            defaultSettings.pomodoroShortBreakMinutes,
            defaultSettings.pomodoroLongBreakMinutes,
            defaultSettings.pomodoroSessionsBeforeLongBreak,

            defaultSettings.pomodoroAutoStartBreaks
              ? 1
              : 0,

            defaultSettings.pomodoroAutoStartFocus
              ? 1
              : 0,

            defaultSettings.pomodoroSoundEnabled
              ? 1
              : 0,

            defaultSettings.notificationsEnabled
              ? 1
              : 0,

            /* Tasks */

            defaultSettings.dailyTaskReset,

            /* Dashboard */

            defaultSettings.dashboardDailyProgress
              ? 1
              : 0,

            defaultSettings.dashboardQuickNotes
              ? 1
              : 0,

            defaultSettings.dashboardPomodoroStats
              ? 1
              : 0,

            defaultSettings.dashboardStudyStats
              ? 1
              : 0,

            /* Web Search */

            defaultSettings.webSearchEnabled
              ? 1
              : 0,

            defaultSettings.searxngUrl,
          ],
        );
      },

      /* ======================================================
         Save Settings
      ====================================================== */

      async saveSettings() {
        this.saving = true;
        this.error = null;

        try {
          await this.initialize();

          await this.db!.execute(
            `
            UPDATE settings

            SET
              theme = $1,
              palette = $2,

              calendar_view = $3,
              week_starts_on = $4,
              show_weekends = $5,

              pomodoro_focus_minutes = $6,
              pomodoro_short_break_minutes = $7,
              pomodoro_long_break_minutes = $8,
              pomodoro_sessions_before_long_break = $9,

              pomodoro_auto_start_breaks = $10,
              pomodoro_auto_start_focus = $11,
              pomodoro_sound_enabled = $12,
              notifications_enabled = $13,

              daily_task_reset = $14,

              dashboard_daily_progress = $15,
              dashboard_quick_notes = $16,
              dashboard_pomodoro_stats = $17,
              dashboard_study_stats = $18,

              web_search_enabled = $19,
              searxng_url = $20,

              updated_at = strftime(
                '%s',
                'now'
              )

            WHERE id = 1
            `,
            [
              /* Appearance */

              this.settings.theme,
              this.settings.accentColor,

              /* Calendar */

              this.settings.calendarView,
              this.settings.weekStartsOn,
              this.settings.showWeekends
                ? 1
                : 0,

              /* Pomodoro */

              this.settings.pomodoroFocusMinutes,
              this.settings.pomodoroShortBreakMinutes,
              this.settings.pomodoroLongBreakMinutes,
              this.settings.pomodoroSessionsBeforeLongBreak,

              this.settings.pomodoroAutoStartBreaks
                ? 1
                : 0,

              this.settings.pomodoroAutoStartFocus
                ? 1
                : 0,

              this.settings.pomodoroSoundEnabled
                ? 1
                : 0,

              this.settings.notificationsEnabled
                ? 1
                : 0,

              /* Tasks */

              this.settings.dailyTaskReset,

              /* Dashboard */

              this.settings.dashboardDailyProgress
                ? 1
                : 0,

              this.settings.dashboardQuickNotes
                ? 1
                : 0,

              this.settings.dashboardPomodoroStats
                ? 1
                : 0,

              this.settings.dashboardStudyStats
                ? 1
                : 0,

              /* Web Search */

              this.settings.webSearchEnabled
                ? 1
                : 0,

              this.settings.searxngUrl.trim(),
            ],
          );
        } catch (error) {
          console.error(
            "Failed to save settings:",
            error,
          );

          this.error = String(error);

          throw error;
        } finally {
          this.saving = false;
        }
      },

      /* ======================================================
         Reset Settings
      ====================================================== */

      async resetSettings() {
        this.saving = true;
        this.error = null;

        try {
          await this.initialize();

          await this.db!.execute(
            `
            UPDATE settings

            SET
              theme = $1,
              palette = $2,

              calendar_view = $3,
              week_starts_on = $4,
              show_weekends = $5,

              pomodoro_focus_minutes = $6,
              pomodoro_short_break_minutes = $7,
              pomodoro_long_break_minutes = $8,
              pomodoro_sessions_before_long_break = $9,

              pomodoro_auto_start_breaks = $10,
              pomodoro_auto_start_focus = $11,
              pomodoro_sound_enabled = $12,
              notifications_enabled = $13,

              daily_task_reset = $14,

              dashboard_daily_progress = $15,
              dashboard_quick_notes = $16,
              dashboard_pomodoro_stats = $17,
              dashboard_study_stats = $18,

              web_search_enabled = $19,
              searxng_url = $20,

              updated_at = strftime(
                '%s',
                'now'
              )

            WHERE id = 1
            `,
            [
              defaultSettings.theme,
              defaultSettings.accentColor,

              defaultSettings.calendarView,
              defaultSettings.weekStartsOn,
              defaultSettings.showWeekends
                ? 1
                : 0,

              defaultSettings.pomodoroFocusMinutes,
              defaultSettings.pomodoroShortBreakMinutes,
              defaultSettings.pomodoroLongBreakMinutes,
              defaultSettings.pomodoroSessionsBeforeLongBreak,

              defaultSettings.pomodoroAutoStartBreaks
                ? 1
                : 0,

              defaultSettings.pomodoroAutoStartFocus
                ? 1
                : 0,

              defaultSettings.pomodoroSoundEnabled
                ? 1
                : 0,

              defaultSettings.notificationsEnabled
                ? 1
                : 0,

              defaultSettings.dailyTaskReset,

              defaultSettings.dashboardDailyProgress
                ? 1
                : 0,

              defaultSettings.dashboardQuickNotes
                ? 1
                : 0,

              defaultSettings.dashboardPomodoroStats
                ? 1
                : 0,

              defaultSettings.dashboardStudyStats
                ? 1
                : 0,

              defaultSettings.webSearchEnabled
                ? 1
                : 0,

              defaultSettings.searxngUrl,
            ],
          );

          this.settings = {
            ...defaultSettings,
          };
        } catch (error) {
          console.error(
            "Failed to reset settings:",
            error,
          );

          this.error = String(error);

          throw error;
        } finally {
          this.saving = false;
        }
      },

      /* ======================================================
         Set Accent Palette
      ====================================================== */

      setAccentColor(
        color: AccentColorKey,
      ) {
        this.settings.accentColor = color;
      },

      /* ======================================================
         Set Web Search
      ====================================================== */

      setWebSearchEnabled(
        enabled: boolean,
      ) {
        this.settings.webSearchEnabled =
          enabled;
      },

      /* ======================================================
         Set SearXNG URL
      ====================================================== */

      setSearxngUrl(
        url: string,
      ) {
        this.settings.searxngUrl =
          url.trim();
      },

      /* ======================================================
         Enable Web Search
      ====================================================== */

      enableWebSearch(
        url: string,
      ) {
        this.settings.searxngUrl =
          url.trim();

        this.settings.webSearchEnabled =
          this.settings.searxngUrl.length > 0;
      },

      /* ======================================================
         Disable Web Search
      ====================================================== */

      disableWebSearch() {
        this.settings.webSearchEnabled =
          false;
      },
    },
  },
);