import { defineStore } from "pinia";
import Database from "@tauri-apps/plugin-sql";

/* ============================================================
   Palette
============================================================ */

export type PaletteKey =
  | "forest"
  | "ocean"
  | "sakura"
  | "sunset"
  | "midnight"
  | "fauvist";

/* ============================================================
   App Settings
============================================================ */

export interface AppSettings {
  theme: string;
  palette: PaletteKey;

  calendarView: string;
  weekStartsOn: number;
  showWeekends: boolean;

  pomodoroFocusMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroSessionsBeforeLongBreak: number;

  pomodoroAutoStartBreaks: boolean;
  pomodoroAutoStartFocus: boolean;
  pomodoroSoundEnabled: boolean;
  notificationsEnabled: boolean;

  dailyTaskReset: string;

  dashboardDailyProgress: boolean;
  dashboardQuickNotes: boolean;
  dashboardPomodoroStats: boolean;
  dashboardStudyStats: boolean;

  /* ==========================================================
     Web Search
  ========================================================== */

  webSearchEnabled: boolean;
  searxngUrl: string;
}

/* ============================================================
   Defaults
============================================================ */

const defaults: AppSettings = {
  theme: "dark",
  palette: "forest",

  calendarView: "timeGridWeek",
  weekStartsOn: 1,
  showWeekends: true,

  pomodoroFocusMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroSessionsBeforeLongBreak: 4,

  pomodoroAutoStartBreaks: false,
  pomodoroAutoStartFocus: false,
  pomodoroSoundEnabled: true,
  notificationsEnabled: true,

  dailyTaskReset: "delete",

  dashboardDailyProgress: true,
  dashboardQuickNotes: true,
  dashboardPomodoroStats: true,
  dashboardStudyStats: true,

  /* ==========================================================
     Web Search Defaults
  ========================================================== */

  webSearchEnabled: false,

  // Empty means web search is disabled until the user
  // configures a SearXNG instance.
  searxngUrl: "",
};

/* ============================================================
   Settings Store
============================================================ */

export const useSettingsStore = defineStore(
  "settings",
  {
    state: () => ({
      db: null as Database | null,

      settings: {
        ...defaults,
      } as AppSettings,

      loading: false,
      saving: false,
      initialized: false,
      error: null as string | null,
    }),

    getters: {
      /* ========================================================
         Palette Validation
      ======================================================== */

      isWebSearchConfigured(state): boolean {
        return (
          state.settings.webSearchEnabled &&
          state.settings.searxngUrl.trim().length > 0
        );
      },
    },

    actions: {
      /* ========================================================
         INITIALIZE
      ======================================================== */

      async initialize() {
        if (this.initialized) {
          return;
        }

        if (this.loading) {
          return;
        }

        this.loading = true;
        this.error = null;

        try {
          this.db = await Database.load(
            "sqlite:shinrin.db",
          );

          await this.loadSettings();

          this.initialized = true;
        } catch (error) {
          console.error(
            "Failed to initialize settings:",
            error,
          );

          this.error = String(error);
        } finally {
          this.loading = false;
        }
      },

      /* ========================================================
         LOAD SETTINGS
      ======================================================== */

      async loadSettings() {
        if (!this.db) {
          throw new Error(
            "Database not initialized",
          );
        }

        const rows =
          await this.db.select<
            Array<{
              theme: string;
              palette: string;

              calendarView: string;
              weekStartsOn: number;
              showWeekends: number;

              pomodoroFocusMinutes: number;
              pomodoroShortBreakMinutes: number;
              pomodoroLongBreakMinutes: number;
              pomodoroSessionsBeforeLongBreak: number;

              pomodoroAutoStartBreaks: number;
              pomodoroAutoStartFocus: number;
              pomodoroSoundEnabled: number;
              notificationsEnabled: number;

              dailyTaskReset: string;

              dashboardDailyProgress: number;
              dashboardQuickNotes: number;
              dashboardPomodoroStats: number;
              dashboardStudyStats: number;

              webSearchEnabled: number;
              searxngUrl: string;
            }>
          >(
            `
            SELECT
              theme,
              palette,

              calendar_view AS calendarView,
              week_starts_on AS weekStartsOn,
              show_weekends AS showWeekends,

              pomodoro_focus_minutes AS pomodoroFocusMinutes,
              pomodoro_short_break_minutes AS pomodoroShortBreakMinutes,
              pomodoro_long_break_minutes AS pomodoroLongBreakMinutes,
              pomodoro_sessions_before_long_break AS pomodoroSessionsBeforeLongBreak,

              pomodoro_auto_start_breaks AS pomodoroAutoStartBreaks,
              pomodoro_auto_start_focus AS pomodoroAutoStartFocus,
              pomodoro_sound_enabled AS pomodoroSoundEnabled,
              notifications_enabled AS notificationsEnabled,

              daily_task_reset AS dailyTaskReset,

              dashboard_daily_progress AS dashboardDailyProgress,
              dashboard_quick_notes AS dashboardQuickNotes,
              dashboard_pomodoro_stats AS dashboardPomodoroStats,
              dashboard_study_stats AS dashboardStudyStats,

              web_search_enabled AS webSearchEnabled,
              searxng_url AS searxngUrl

            FROM settings

            WHERE id = 1

            LIMIT 1
            `,
          );

        /* ======================================================
           NO SETTINGS ROW
        ====================================================== */

        if (rows.length === 0) {
          await this.insertDefaults();

          this.settings = {
            ...defaults,
          };

          return;
        }

        const row = rows[0];

        /* ======================================================
           VALIDATE PALETTE
        ====================================================== */

        const palette: PaletteKey =
          this.isValidPalette(row.palette)
            ? row.palette
            : defaults.palette;

        /* ======================================================
           APPLY SETTINGS
        ====================================================== */

        this.settings = {
          ...defaults,

          theme: row.theme,

          palette,

          calendarView:
            row.calendarView,

          weekStartsOn:
            Number(row.weekStartsOn),

          showWeekends:
            Boolean(row.showWeekends),

          pomodoroFocusMinutes:
            Number(
              row.pomodoroFocusMinutes,
            ),

          pomodoroShortBreakMinutes:
            Number(
              row.pomodoroShortBreakMinutes,
            ),

          pomodoroLongBreakMinutes:
            Number(
              row.pomodoroLongBreakMinutes,
            ),

          pomodoroSessionsBeforeLongBreak:
            Number(
              row.pomodoroSessionsBeforeLongBreak,
            ),

          pomodoroAutoStartBreaks:
            Boolean(
              row.pomodoroAutoStartBreaks,
            ),

          pomodoroAutoStartFocus:
            Boolean(
              row.pomodoroAutoStartFocus,
            ),

          pomodoroSoundEnabled:
            Boolean(
              row.pomodoroSoundEnabled,
            ),

          notificationsEnabled:
            Boolean(
              row.notificationsEnabled,
            ),

          dailyTaskReset:
            row.dailyTaskReset,

          dashboardDailyProgress:
            Boolean(
              row.dashboardDailyProgress,
            ),

          dashboardQuickNotes:
            Boolean(
              row.dashboardQuickNotes,
            ),

          dashboardPomodoroStats:
            Boolean(
              row.dashboardPomodoroStats,
            ),

          dashboardStudyStats:
            Boolean(
              row.dashboardStudyStats,
            ),

          /* ====================================================
             WEB SEARCH
          ==================================================== */

          webSearchEnabled:
            Boolean(
              row.webSearchEnabled,
            ),

          searxngUrl:
            row.searxngUrl?.trim() ?? "",
        };
      },

      /* ========================================================
         VALIDATE PALETTE
      ======================================================== */

      isValidPalette(
        palette: unknown,
      ): palette is PaletteKey {
        return [
          "forest",
          "ocean",
          "sakura",
          "sunset",
          "midnight",
          "fauvist",
        ].includes(
          palette as PaletteKey,
        );
      },

      /* ========================================================
         INSERT DEFAULT SETTINGS
      ======================================================== */

      async insertDefaults() {
        if (!this.db) {
          throw new Error(
            "Database not initialized",
          );
        }

        await this.db.execute(
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

            ?, ?,

            ?, ?, ?,

            ?, ?, ?, ?,

            ?, ?, ?, ?,

            ?,

            ?, ?, ?, ?,

            ?, ?
          )
          `,
          [
            defaults.theme,
            defaults.palette,

            defaults.calendarView,
            defaults.weekStartsOn,
            defaults.showWeekends
              ? 1
              : 0,

            defaults.pomodoroFocusMinutes,
            defaults.pomodoroShortBreakMinutes,
            defaults.pomodoroLongBreakMinutes,
            defaults.pomodoroSessionsBeforeLongBreak,

            defaults.pomodoroAutoStartBreaks
              ? 1
              : 0,

            defaults.pomodoroAutoStartFocus
              ? 1
              : 0,

            defaults.pomodoroSoundEnabled
              ? 1
              : 0,

            defaults.notificationsEnabled
              ? 1
              : 0,

            defaults.dailyTaskReset,

            defaults.dashboardDailyProgress
              ? 1
              : 0,

            defaults.dashboardQuickNotes
              ? 1
              : 0,

            defaults.dashboardPomodoroStats
              ? 1
              : 0,

            defaults.dashboardStudyStats
              ? 1
              : 0,

            defaults.webSearchEnabled
              ? 1
              : 0,

            defaults.searxngUrl,
          ],
        );
      },

      /* ========================================================
         SAVE SETTINGS
      ======================================================== */

      async saveSettings() {
        if (!this.db) {
          throw new Error(
            "Database not initialized",
          );
        }

        this.saving = true;
        this.error = null;

        try {
          await this.db.execute(
            `
            UPDATE settings

            SET
              theme = ?,
              palette = ?,

              calendar_view = ?,
              week_starts_on = ?,
              show_weekends = ?,

              pomodoro_focus_minutes = ?,
              pomodoro_short_break_minutes = ?,
              pomodoro_long_break_minutes = ?,
              pomodoro_sessions_before_long_break = ?,

              pomodoro_auto_start_breaks = ?,
              pomodoro_auto_start_focus = ?,
              pomodoro_sound_enabled = ?,
              notifications_enabled = ?,

              daily_task_reset = ?,

              dashboard_daily_progress = ?,
              dashboard_quick_notes = ?,
              dashboard_pomodoro_stats = ?,
              dashboard_study_stats = ?,

              web_search_enabled = ?,
              searxng_url = ?,

              updated_at =
                strftime('%s', 'now')

            WHERE id = 1
            `,
            [
              this.settings.theme,
              this.settings.palette,

              this.settings.calendarView,
              this.settings.weekStartsOn,
              this.settings.showWeekends
                ? 1
                : 0,

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

              this.settings.dailyTaskReset,

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

              this.settings.webSearchEnabled
                ? 1
                : 0,

              this.settings.searxngUrl.trim(),
            ],
          );
        } catch (error) {
          this.error = String(error);

          console.error(
            "Failed to save settings:",
            error,
          );

          throw error;
        } finally {
          this.saving = false;
        }
      },

      /* ========================================================
         RESET SETTINGS
      ======================================================== */

      async resetSettings() {
        this.settings = {
          ...defaults,
        };

        await this.saveSettings();
      },

      /* ========================================================
         WEB SEARCH
      ======================================================== */

      setWebSearchEnabled(
        enabled: boolean,
      ) {
        this.settings.webSearchEnabled =
          enabled;
      },

      setSearxngUrl(
        url: string,
      ) {
        this.settings.searxngUrl =
          url.trim();
      },

      /* ========================================================
         PALETTE
      ======================================================== */

      setPalette(
        palette: PaletteKey,
      ) {
        if (
          !this.isValidPalette(
            palette,
          )
        ) {
          return;
        }

        this.settings.palette =
          palette;
      },
    },
  },
);