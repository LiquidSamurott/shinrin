<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Palette,
  Bell,
  LayoutDashboard,
  Timer,
  Bot,
  Save,
  RotateCcw,
  Settings,
  Loader2,
  CheckCircle2,
} from "@lucide/vue";

import AppearanceSettings from "./AppearanceSettings.vue";
import NotificationSettings from "./NotificationSettings.vue";
import DashboardSettings from "./DashboardSettings.vue";
import PomodoroSettings from "./PomodoroSettings.vue";
import AISettings from "./AISettings.vue";

import { useSettingsStore } from "../../stores/settings";

/* ============================================================
   Store
============================================================ */

const settings = useSettingsStore();

/* ============================================================
   Section Types
============================================================ */

type SettingsSection =
  | "appearance"
  | "notifications"
  | "dashboard"
  | "pomodoro"
  | "ai";

/* ============================================================
   Navigation
============================================================ */

const sections = [
  {
    key: "appearance" as const,
    label: "Appearance",
    description: "Theme and accent colors",
    icon: Palette,
    color: "text-purple-400",
    active: "border-purple-400/30 bg-purple-500/15 text-white",
  },
  {
    key: "notifications" as const,
    label: "Notifications",
    description: "Alerts and timer behavior",
    icon: Bell,
    color: "text-emerald-400",
    active: "border-emerald-400/30 bg-emerald-500/15 text-white",
  },
  {
    key: "dashboard" as const,
    label: "Dashboard",
    description: "Customize dashboard widgets",
    icon: LayoutDashboard,
    color: "text-cyan-400",
    active: "border-cyan-400/30 bg-cyan-500/15 text-white",
  },
  {
    key: "pomodoro" as const,
    label: "Pomodoro",
    description: "Timer durations and behavior",
    icon: Timer,
    color: "text-orange-400",
    active: "border-orange-400/30 bg-orange-500/15 text-white",
  },
  {
    key: "ai" as const,
    label: "AI Assistant",
    description: "Local AI and web search",
    icon: Bot,
    color: "text-violet-400",
    active: "border-violet-400/30 bg-violet-500/15 text-white",
  },
];

const activeSection = ref<SettingsSection>("appearance");

const activeSectionData = computed(() =>
  sections.find((section) => section.key === activeSection.value)
);

/* ============================================================
   Save State
============================================================ */

const saveMessage = ref("");
const isSaving = ref(false);

let messageTimeout: number | undefined;

/* ============================================================
   Helpers
============================================================ */

function showMessage(message: string) {
  saveMessage.value = message;

  if (messageTimeout) {
    window.clearTimeout(messageTimeout);
  }

  messageTimeout = window.setTimeout(() => {
    saveMessage.value = "";
  }, 3000);
}

/* ============================================================
   Save & Reset
============================================================ */

async function saveSettings() {
  if (isSaving.value || settings.saving) return;

  isSaving.value = true;

  try {
    await settings.saveSettings();
    showMessage("Settings saved successfully");
  } catch (error) {
    console.error("Failed to save settings:", error);
    showMessage("Failed to save settings");
  } finally {
    isSaving.value = false;
  }
}

async function resetSettings() {
  const confirmed = window.confirm("Reset all settings to their defaults?");
  if (!confirmed) return;

  try {
    await settings.resetSettings();
    showMessage("Settings reset to defaults");
  } catch (error) {
    console.error("Failed to reset settings:", error);
    showMessage("Failed to reset settings");
  }
}
</script>

<template>
  <div class="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-950 text-white">
    <!-- ========================================================
         Ambient Background
    ========================================================= -->
    <div class="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
    <div class="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />

    <!-- ========================================================
         Header
    ========================================================= -->
    <header class="relative z-30 flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/70 px-5 py-4 backdrop-blur-2xl sm:px-6 sm:py-5">
      <!-- Title -->
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner sm:h-11 sm:w-11 sm:rounded-2xl">
          <Settings class="h-5 w-5 text-emerald-400" />
        </div>
        <div class="min-w-0">
          <h1 class="truncate text-lg font-bold tracking-tight sm:text-xl">Settings</h1>
          <p class="hidden text-sm text-white/40 sm:block">Customize your Shinrin experience</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Animated Status Toast -->
        <Transition name="toast">
          <div
            v-if="saveMessage"
            class="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md lg:flex"
          >
            <CheckCircle2 class="h-4 w-4 text-emerald-400" />
            {{ saveMessage }}
          </div>
        </Transition>

        <!-- Reset Button -->
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
          @click="resetSettings"
        >
          <RotateCcw class="h-4 w-4" />
          <span class="hidden sm:inline">Reset</span>
        </button>

        <!-- Save Button -->
        <button
          type="button"
          :disabled="isSaving || settings.saving"
          class="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          @click="saveSettings"
        >
          <Loader2 v-if="isSaving || settings.saving" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          <span>{{ isSaving || settings.saving ? "Saving..." : "Save Changes" }}</span>
        </button>
      </div>
    </header>

    <!-- ========================================================
         Content Layout
    ========================================================= -->
    <div class="relative z-10 flex min-h-0 flex-1 overflow-hidden">
      
      <!-- Desktop Sidebar -->
      <aside class="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950/40 p-4 backdrop-blur-sm lg:w-72 md:block">
        <nav class="space-y-1.5" aria-label="Settings sections">
          <button
            v-for="section in sections"
            :key="section.key"
            type="button"
            :aria-current="activeSection === section.key ? 'page' : undefined"
            class="group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200"
            :class="activeSection === section.key ? section.active : 'border-transparent text-white/60 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'"
            @click="activeSection = section.key"
          >
            <!-- Icon -->
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white/[0.04] transition-colors"
              :class="activeSection === section.key ? 'border-white/20' : 'border-white/10'"
            >
              <component
                :is="section.icon"
                class="h-5 w-5 transition-colors"
                :class="activeSection === section.key ? section.color : 'text-white/60 group-hover:text-white/90'"
              />
            </div>
            <!-- Text -->
            <div class="min-w-0">
              <p class="text-sm font-semibold">{{ section.label }}</p>
              <p class="mt-0.5 truncate text-xs opacity-60" :class="activeSection === section.key ? 'text-white' : 'text-white/50'">
                {{ section.description }}
              </p>
            </div>
          </button>
        </nav>
      </aside>

      <!-- Mobile Navigation (Scrollable Pills) -->
      <div class="absolute left-0 right-0 top-0 z-20 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <div class="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="section in sections"
            :key="section.key"
            @click="activeSection = section.key"
            class="flex flex-none items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all"
            :class="activeSection === section.key ? section.active : 'border-transparent bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'"
          >
            <component :is="section.icon" class="h-4 w-4" :class="activeSection === section.key ? section.color : ''" />
            {{ section.label }}
          </button>
        </div>
      </div>

      <!-- Main Settings Area -->
      <main class="custom-scrollbar relative min-w-0 flex-1 overflow-y-auto bg-slate-950/20 p-5 pt-20 md:p-8 md:pt-8">
        <div class="mx-auto w-full max-w-4xl">
          
          <!-- Section Header -->
          <div class="mb-8">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 shadow-inner backdrop-blur-md">
                <component v-if="activeSectionData" :is="activeSectionData.icon" class="h-5 w-5" :class="activeSectionData.color" />
              </div>
              <div>
                <h2 class="text-2xl font-bold tracking-tight text-white shadow-sm">{{ activeSectionData?.label }}</h2>
                <p class="mt-1 text-sm text-white/50">{{ activeSectionData?.description }}</p>
              </div>
            </div>
          </div>

          <!-- Section Content (With Transition) -->
          <div class="relative">
            <Transition name="fade" mode="out-in">
              <div :key="activeSection">
                <AppearanceSettings
                  v-if="activeSection === 'appearance'"
                  v-model:theme="settings.settings.theme"
                  v-model:accent-color="settings.settings.accentColor"
                />

                <NotificationSettings
                  v-else-if="activeSection === 'notifications'"
                  v-model:notifications-enabled="settings.settings.notificationsEnabled"
                  v-model:sound-enabled="settings.settings.pomodoroSoundEnabled"
                  v-model:auto-start-breaks="settings.settings.pomodoroAutoStartBreaks"
                  v-model:auto-start-focus="settings.settings.pomodoroAutoStartFocus"
                />

                <DashboardSettings
                  v-else-if="activeSection === 'dashboard'"
                  v-model:daily-progress="settings.settings.dashboardDailyProgress"
                  v-model:quick-notes="settings.settings.dashboardQuickNotes"
                  v-model:pomodoro-stats="settings.settings.dashboardPomodoroStats"
                  v-model:study-stats="settings.settings.dashboardStudyStats"
                />

                <PomodoroSettings
                  v-else-if="activeSection === 'pomodoro'"
                  v-model:focus-minutes="settings.settings.pomodoroFocusMinutes"
                  v-model:short-break-minutes="settings.settings.pomodoroShortBreakMinutes"
                  v-model:long-break-minutes="settings.settings.pomodoroLongBreakMinutes"
                  v-model:sessions-before-long-break="settings.settings.pomodoroSessionsBeforeLongBreak"
                />

                <AISettings v-else-if="activeSection === 'ai'" />
              </div>
            </Transition>
          </div>
          
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar styling */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.22);
}

/* Hide scrollbar for mobile pill nav but keep functionality */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Page Transition Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Toast Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}
</style>