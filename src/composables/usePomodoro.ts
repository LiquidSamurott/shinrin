// composables/usePomodoro.ts

import { storeToRefs } from "pinia";

import { usePomodoroStore } from "../../src/stores/pomodoro";

export function usePomodoro() {
  const store = usePomodoroStore();

  const {
    remainingSeconds,
    currentSession,
    running,
    completedFocusSessions,
    progress,
    formattedTime,
  } = storeToRefs(store);

  return {
    remainingSeconds,
    currentSession,
    running,
    completedFocusSessions,

    progress,
    formattedTime,

    start: store.start,
    pause: store.pause,
    resume: store.resume,
    stop: store.stop,
    skip: store.skip,

    setFocusMinutes: store.setFocusMinutes,
    setShortBreakMinutes:
      store.setShortBreakMinutes,
    setLongBreakMinutes:
      store.setLongBreakMinutes,
  };
}