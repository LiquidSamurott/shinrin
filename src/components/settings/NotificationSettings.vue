```vue
<script setup lang="ts">
import {
  Bell,
  Volume2,
  PlayCircle,
  Settings2,
} from "@lucide/vue";

const props = defineProps<{
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}>();

const emit = defineEmits<{
  "update:notificationsEnabled": [value: boolean];
  "update:soundEnabled": [value: boolean];
  "update:autoStartBreaks": [value: boolean];
  "update:autoStartFocus": [value: boolean];
}>();

function toggleNotifications() {
  emit(
    "update:notificationsEnabled",
    !props.notificationsEnabled
  );
}

function toggleSound() {
  emit(
    "update:soundEnabled",
    !props.soundEnabled
  );
}

function toggleAutoStartBreaks() {
  emit(
    "update:autoStartBreaks",
    !props.autoStartBreaks
  );
}

function toggleAutoStartFocus() {
  emit(
    "update:autoStartFocus",
    !props.autoStartFocus
  );
}
</script>

<template>
  <section
    class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-xl"
  >
    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10"
      >
        <Settings2 class="h-5 w-5 text-emerald-400" />
      </div>

      <div>
        <h2 class="text-lg font-bold text-white">
          Notifications
        </h2>

        <p class="text-sm text-white/45">
          Control alerts and automatic timer behavior.
        </p>
      </div>
    </div>

    <div class="space-y-3">
      <!-- Notifications -->
      <div
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div class="flex items-center gap-3">
          <Bell class="h-5 w-5 text-emerald-400" />

          <div>
            <p class="font-medium text-white">
              Notifications
            </p>

            <p class="text-xs text-white/40">
              Receive desktop timer notifications.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-all duration-300 focus:outline-none"
          :class="
            props.notificationsEnabled
              ? 'border-emerald-400/40 bg-emerald-600 shadow-lg shadow-emerald-950/30'
              : 'border-white/10 bg-white/10'
          "
          :aria-pressed="props.notificationsEnabled"
          @click="toggleNotifications"
        >
          <span
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="
              props.notificationsEnabled
                ? 'translate-x-5'
                : 'translate-x-0'
            "
          />
        </button>
      </div>

      <!-- Sound -->
      <div
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div class="flex items-center gap-3">
          <Volume2 class="h-5 w-5 text-cyan-400" />

          <div>
            <p class="font-medium text-white">
              Sound Effects
            </p>

            <p class="text-xs text-white/40">
              Play sounds when timers finish.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-all duration-300 focus:outline-none"
          :class="
            props.soundEnabled
              ? 'border-cyan-400/40 bg-cyan-600 shadow-lg shadow-cyan-950/30'
              : 'border-white/10 bg-white/10'
          "
          :aria-pressed="props.soundEnabled"
          @click="toggleSound"
        >
          <span
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="
              props.soundEnabled
                ? 'translate-x-5'
                : 'translate-x-0'
            "
          />
        </button>
      </div>

      <!-- Auto Start Breaks -->
      <div
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div class="flex items-center gap-3">
          <PlayCircle class="h-5 w-5 text-teal-400" />

          <div>
            <p class="font-medium text-white">
              Auto Start Breaks
            </p>

            <p class="text-xs text-white/40">
              Automatically start a break after focus.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-all duration-300 focus:outline-none"
          :class="
            props.autoStartBreaks
              ? 'border-teal-400/40 bg-teal-600 shadow-lg shadow-teal-950/30'
              : 'border-white/10 bg-white/10'
          "
          :aria-pressed="props.autoStartBreaks"
          @click="toggleAutoStartBreaks"
        >
          <span
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="
              props.autoStartBreaks
                ? 'translate-x-5'
                : 'translate-x-0'
            "
          />
        </button>
      </div>

      <!-- Auto Start Focus -->
      <div
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div class="flex items-center gap-3">
          <PlayCircle class="h-5 w-5 text-blue-400" />

          <div>
            <p class="font-medium text-white">
              Auto Start Focus
            </p>

            <p class="text-xs text-white/40">
              Automatically start focus after a break.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-all duration-300 focus:outline-none"
          :class="
            props.autoStartFocus
              ? 'border-blue-400/40 bg-blue-600 shadow-lg shadow-blue-950/30'
              : 'border-white/10 bg-white/10'
          "
          :aria-pressed="props.autoStartFocus"
          @click="toggleAutoStartFocus"
        >
          <span
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="
              props.autoStartFocus
                ? 'translate-x-5'
                : 'translate-x-0'
            "
          />
        </button>
      </div>
    </div>
  </section>
</template>
```
