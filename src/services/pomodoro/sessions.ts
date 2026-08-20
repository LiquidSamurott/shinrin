// services/pomodoro/session.ts

export type SessionType =
  | "focus"
  | "shortBreak"
  | "longBreak";

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;

  /**
   * After how many completed focus sessions
   * should a long break occur?
   *
   * Default: 4
   */
  longBreakEvery: number;

  autoStartFocus: boolean;
  autoStartBreak: boolean;
}

export interface SessionResult {
  session: SessionType;
  duration: number; // seconds
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
  autoStartFocus: false,
  autoStartBreak: false,
};

export class PomodoroSession {
  private settings: PomodoroSettings;

  constructor(
    settings?: Partial<PomodoroSettings>
  ) {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...settings,
    };
  }

  /* =====================================
     Current Session Duration
  ===================================== */

  getDuration(
    session: SessionType
  ): number {
    switch (session) {
      case "focus":
        return this.settings.focusMinutes * 60;

      case "shortBreak":
        return this.settings.shortBreakMinutes * 60;

      case "longBreak":
        return this.settings.longBreakMinutes * 60;
    }
  }

  /* =====================================
     Determine Next Session
  ===================================== */

  nextSession(
    current: SessionType,
    completedFocusSessions: number
  ): SessionResult {
    // Finished a focus session
    if (current === "focus") {
      const shouldTakeLongBreak =
        completedFocusSessions > 0 &&
        completedFocusSessions %
          this.settings.longBreakEvery ===
          0;

      if (shouldTakeLongBreak) {
        return {
          session: "longBreak",
          duration: this.getDuration(
            "longBreak"
          ),
        };
      }

      return {
        session: "shortBreak",
        duration: this.getDuration(
          "shortBreak"
        ),
      };
    }

    // Finished either break
    return {
      session: "focus",
      duration: this.getDuration(
        "focus"
      ),
    };
  }

  /* =====================================
     Session Helpers
  ===================================== */

  isFocus(
    session: SessionType
  ) {
    return session === "focus";
  }

  isBreak(
    session: SessionType
  ) {
    return (
      session === "shortBreak" ||
      session === "longBreak"
    );
  }

  isLongBreak(
    session: SessionType
  ) {
    return session === "longBreak";
  }

  isShortBreak(
    session: SessionType
  ) {
    return session === "shortBreak";
  }

  /* =====================================
     Settings
  ===================================== */

  getSettings() {
    return this.settings;
  }

  updateSettings(
    settings: Partial<PomodoroSettings>
  ) {
    this.settings = {
      ...this.settings,
      ...settings,
    };
  }

  resetSettings() {
    this.settings = {
      ...DEFAULT_SETTINGS,
    };
  }
}