import { createRouter, createWebHistory } from "vue-router";

import DashboardView from "../views/DashboardView.vue";
import KanbanView from "../views/KanbanView.vue";
import CalendarView from "../views/CalendarView.vue";
import FlashcardsView from "../views/FlashcardsView.vue";
import PomodoroView from "../views/PomodoroView.vue";
import AssistantView from "../views/AssistantView.vue";
import SettingsView from "../views/SettingsView.vue";
import StudyMode from "../components/flashcards/studymode/StudyMode.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/kanban",
      name: "kanban",
      component: KanbanView,
    },
    {
      path: "/calendar",
      name: "calendar",
      component: CalendarView,
    },
    {
      path: "/flashcards",
      name: "flashcards",
      component: FlashcardsView,
    },
    {
      path: "/pomodoro",
      name: "pomodoro",
      component: PomodoroView,
    },
    {
      path: "/assistant",
      name: "assistant",
      component: AssistantView,
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
    },
    {
      path: "/flashcards/studymode",
      name: "flashcards-studymode",
      component: StudyMode,
    },
  ],
});

export default router;