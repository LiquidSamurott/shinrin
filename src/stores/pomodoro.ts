import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

import { PomodoroService } from "../services/pomodoro/pomodoro";

import {
  DEFAULT_TIMERS,
  formatTime,
} from "../services/pomodoro/timers";

import type {
  SessionType,
} from "../services/pomodoro/sessions";

import {
  loadSettings,
  saveSettings,
} from "../db/pomodoroSettings";

import {
  loadStats,
  saveStats,
} from "../db/pomodoroStats";

import type {
  PomodoroStats,
} from "../services/pomodoro/statistics";

import {
  DEFAULT_STATS,
} from "../services/pomodoro/statistics";

export const usePomodoroStore = defineStore(
  "pomodoro",
  () => {

    /* =====================================
       TIMER STATE
    ===================================== */

    const remainingSeconds = ref(0);

    const currentSession =
      ref<SessionType>("focus");

    const running = ref(false);

    const paused = ref(false);

    const loaded = ref(false);

    /* =====================================
       TIMER SETTINGS
    ===================================== */

    const timers = ref({
      ...DEFAULT_TIMERS,
    });

    const autoStartBreaks =
      ref(true);

    const autoStartFocus =
      ref(false);

    const sound =
      ref(true);

    const notifications =
      ref(true);

    /* =====================================
       STATISTICS
    ===================================== */

    const stats =
      ref<PomodoroStats>({
        ...DEFAULT_STATS,
      });

    /* =====================================
       RESET KEYS
    ===================================== */

    const lastDailyReset =
      ref("");

    const lastWeeklyReset =
      ref("");

    const lastMonthlyReset =
      ref("");

    /* =====================================
       DATE HELPERS
    ===================================== */

    function todayKey() {
      return new Date()
        .toISOString()
        .slice(0, 10);
    }

    function weekKey() {
      const now = new Date();

      const first =
        new Date(
          now.getFullYear(),
          0,
          1
        );

      const days =
        Math.floor(
          (now.getTime() -
            first.getTime()) /
            86400000
        );

      const week =
        Math.ceil(
          (days +
            first.getDay() +
            1) /
            7
        );

      return `${now.getFullYear()}-${week}`;
    }

    function monthKey() {
      const now =
        new Date();

      return `${now.getFullYear()}-${now.getMonth()}`;
    }

    /* =====================================
       RESET COUNTERS
    ===================================== */

    function resetCountersIfNeeded() {

      const today =
        todayKey();

      if (
        lastDailyReset.value !==
        today
      ) {
        stats.value.todaySessions = 0;
        lastDailyReset.value =
          today;
      }

      const week =
        weekKey();

      if (
        lastWeeklyReset.value !==
        week
      ) {
        stats.value.weekSessions = 0;
        lastWeeklyReset.value =
          week;
      }

      const month =
        monthKey();

      if (
        lastMonthlyReset.value !==
        month
      ) {
        stats.value.monthSessions = 0;
        lastMonthlyReset.value =
          month;
      }

    }

    /* =====================================
       SERVICE PLACEHOLDER
    ===================================== */

    let service!: PomodoroService;

    /* =====================================
       LOAD DATABASE
    ===================================== */

    async function load() {

      const settings =
        await loadSettings();

      timers.value = {
        focus:
          settings.focus,

        shortBreak:
          settings.shortBreak,

        longBreak:
          settings.longBreak,
      };

      autoStartBreaks.value =
        settings.autoStartBreaks;

      autoStartFocus.value =
        settings.autoStartFocus;

      sound.value =
        settings.sound;

      notifications.value =
        settings.notifications;

      stats.value =
        await loadStats();

      resetCountersIfNeeded();

      if (service) {

        service.updateTimers(
          timers.value
        );

        remainingSeconds.value =
          service.getRemainingSeconds();

      }

      loaded.value = true;
    }

    /* =====================================
       SAVE DATABASE
    ===================================== */

    async function save() {

      if (!loaded.value)
        return;

      await saveSettings({

        focus:
          timers.value.focus,

        shortBreak:
          timers.value.shortBreak,

        longBreak:
          timers.value.longBreak,

        autoStartBreaks:
          autoStartBreaks.value,

        autoStartFocus:
          autoStartFocus.value,

        sound:
          sound.value,

        notifications:
          notifications.value,

      });

      await saveStats(
        stats.value
      );

    }
    /* =====================================
       SERVICE
    ===================================== */

    service = new PomodoroService(
      {
        onTick(seconds) {
          remainingSeconds.value = seconds;
        },

        async onSessionChange(session) {
          const previous = currentSession.value;

          currentSession.value = session;

          running.value = service.isRunning();
          paused.value = false;

          if (previous === "focus") {
            stats.value.completedSessions++;

            stats.value.totalFocusSeconds +=
              timers.value.focus;

            stats.value.todaySessions++;
            stats.value.weekSessions++;
            stats.value.monthSessions++;

            stats.value.currentStreak++;

            if (
              stats.value.currentStreak >
              stats.value.longestStreak
            ) {
              stats.value.longestStreak =
                stats.value.currentStreak;
            }

            resetCountersIfNeeded();

            await saveStats(stats.value);
          }
        },
      },
      {
        autoStartBreaks: () =>
          autoStartBreaks.value,

        autoStartFocus: () =>
          autoStartFocus.value,
      }
    );

    currentSession.value =
      service.getCurrentSession();

    remainingSeconds.value =
      service.getRemainingSeconds();

    /* =====================================
       CONTROLS
    ===================================== */

    function start() {
      service.start();

      running.value = true;
      paused.value = false;
    }

    function pause() {
      service.pause();

      running.value = false;
      paused.value = true;
    }

    function resume() {
      service.resume();

      running.value = true;
      paused.value = false;
    }

    function stop() {
      stats.value.interruptedSessions++;
      service.stop();

      running.value = false;
      paused.value = false;

      remainingSeconds.value =
        service.getRemainingSeconds();
    }

    function skip() {
      service.skip();

      currentSession.value =
        service.getCurrentSession();

      remainingSeconds.value =
        service.getRemainingSeconds();

      running.value =
        service.isRunning();

      paused.value = false;
    }

    /* =====================================
       SETTINGS
    ===================================== */

    async function setFocusMinutes(
      minutes: number
    ) {

      timers.value.focus =
        minutes * 60;

      service.updateTimers(
        timers.value
      );

      if (
        !running.value &&
        currentSession.value === "focus"
      ) {
        remainingSeconds.value =
          timers.value.focus;
      }

      await save();
    }

    async function setShortBreakMinutes(
      minutes: number
    ) {

      timers.value.shortBreak =
        minutes * 60;

      service.updateTimers(
        timers.value
      );

      if (
        !running.value &&
        currentSession.value === "shortBreak"
      ) {
        remainingSeconds.value =
          timers.value.shortBreak;
      }

      await save();
    }

    async function setLongBreakMinutes(
      minutes: number
    ) {

      timers.value.longBreak =
        minutes * 60;

      service.updateTimers(
        timers.value
      );

      if (
        !running.value &&
        currentSession.value === "longBreak"
      ) {
        remainingSeconds.value =
          timers.value.longBreak;
      }

      await save();
    }

    async function setAutoStartBreaks(
      value: boolean
    ) {

      autoStartBreaks.value =
        value;

      await save();
    }

    async function setAutoStartFocus(
      value: boolean
    ) {

      autoStartFocus.value =
        value;

      await save();
    }

    async function setSound(
      value: boolean
    ) {

      sound.value = value;

      await save();
    }

    async function setNotifications(
      value: boolean
    ) {

      notifications.value =
        value;

      await save();
    }
        /* =====================================
       WATCHERS
    ===================================== */

    watch(
      stats,
      () => {
        if (!loaded.value) return;

        saveStats(stats.value).catch(
          console.error
        );
      },
      {
        deep: true,
      }
    );

    /* =====================================
       COMPUTED
    ===================================== */

    const formattedTime = computed(() =>
      formatTime(remainingSeconds.value)
    );

    const progress = computed(() =>
      service.getProgress()
    );

    const focusMinutes = computed(() =>
      Math.floor(
        stats.value.totalFocusSeconds / 60
      )
    );

    const completedFocusSessions = computed(
      () => stats.value.completedSessions
    );

    /* =====================================
       CLEANUP
    ===================================== */

    function destroy() {
      service.destroy();
    }

    /* =====================================
       EXPORTS
    ===================================== */

    return {
      /* ---------- Timer ---------- */

      remainingSeconds,
      formattedTime,
      progress,

      currentSession,
      running,
      paused,

      /* ---------- Settings ---------- */

      timers,

      autoStartBreaks,
      autoStartFocus,

      sound,
      notifications,

      setFocusMinutes,
      setShortBreakMinutes,
      setLongBreakMinutes,

      setAutoStartBreaks,
      setAutoStartFocus,

      setSound,
      setNotifications,

      /* ---------- Statistics ---------- */

      stats,
      focusMinutes,
      completedFocusSessions,

      /* ---------- Controls ---------- */

      start,
      pause,
      resume,
      stop,
      skip,

      /* ---------- Database ---------- */

      load,
      save,

      /* ---------- Cleanup ---------- */

      destroy,
    };
  }
);