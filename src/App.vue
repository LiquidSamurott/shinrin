<script setup lang="ts">
import { onMounted } from "vue";

import AppLayout from "./components/AppLayout.vue";

import { useSettingsStore } from "./stores/settings";
import { useKanbanStore } from "./stores/kanbanactions/kanban";
import { useFlashcardStore } from "./stores/flashcardactions";
import { usePomodoroStore } from "./stores/pomodoro";
import { useCalendarStore } from "./stores/calendar";

import { loadSettings } from "./db/pomodoroSettings";
import { CalendarReminderScheduler } from "./services/calendar/reminderScheduler";
import { useTheme } from "./composables/useTheme";

const settings = useSettingsStore();
const kanban = useKanbanStore();
const flashcards = useFlashcardStore();
const pomodoro = usePomodoroStore();
const calendar = useCalendarStore();

const { applyTheme } = useTheme();

onMounted(async () => {
  try {
    /* ==========================================
       Load settings & application stores
    ========================================== */

    await loadSettings();

    // Initialize global app settings from SQLite/Database
    if (!settings.initialized) {
      await settings.initialize();
    } else {
      await settings.loadSettings();
    }

    // Apply global CSS accent variables after settings are restored
    applyTheme();

    await Promise.all([
      kanban.load(),
      flashcards.load(),
      pomodoro.load(),
      calendar.load(),
    ]);

    console.log("[App] Stores & Theme loaded.");

    /* ==========================================
       Start calendar reminder scheduler
    ========================================== */

    await CalendarReminderScheduler.start();

    console.log("[App] Calendar reminder scheduler started.");

  } catch (error) {
    console.error("[App] Failed to initialize application:", error);
  }
});
</script>

<template>
  <AppLayout />
</template>