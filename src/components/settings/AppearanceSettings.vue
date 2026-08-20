<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { Palette, Moon, Sun, Monitor, Check } from "@lucide/vue";

const props = defineProps<{
  theme: string;
  accentColor: string;
}>();

const emit = defineEmits<{
  "update:theme": [value: string];
  "update:accentColor": [value: string];
}>();

const themes = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

export interface ColorOption {
  value: string;
  label: string;
  accent400: string;
  accent500: string;
  accent600: string;
}

const colors: ColorOption[] = [
  { value: "emerald", label: "Emerald", accent400: "#34d399", accent500: "#10b981", accent600: "#059669" },
  { value: "blue",    label: "Blue",    accent400: "#60a5fa", accent500: "#3b82f6", accent600: "#2563eb" },
  { value: "cyan",    label: "Cyan",    accent400: "#22d3ee", accent500: "#06b6d4", accent600: "#0891b2" },
  { value: "violet",  label: "Violet",  accent400: "#a78bfa", accent500: "#8b5cf6", accent600: "#7c3aed" },
  { value: "rose",    label: "Rose",    accent400: "#fb7185", accent500: "#f43f5e", accent600: "#e11d48" },
  { value: "amber",   label: "Amber",   accent400: "#fbbf24", accent500: "#f59e0b", accent600: "#d97706" },
  { value: "orange",  label: "Orange",  accent400: "#fb923c", accent500: "#f97316", accent600: "#ea580c" },
];

/** Find currently active color configuration */
const currentColorConfig = computed(() => {
  return (
    colors.find(
      (c) => c.value === props.accentColor || c.accent500 === props.accentColor
    ) || colors[0]
  );
});

/** Automatically push accent variables to CSS :root when selection changes */
watchEffect(() => {
  const active = currentColorConfig.value;
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--accent-400", active.accent400);
    document.documentElement.style.setProperty("--accent-500", active.accent500);
    document.documentElement.style.setProperty("--accent-600", active.accent600);
  }
});
</script>

<template>
  <section
    class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-xl"
  >
    <div class="mb-6 flex items-center gap-3">
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10"
      >
        <Palette class="h-5 w-5 text-purple-400" />
      </div>

      <div>
        <h2 class="text-lg font-bold text-white">
          Appearance
        </h2>
        <p class="text-sm text-white/45">
          Customize how Shinrin looks.
        </p>
      </div>
    </div>

    <!-- Theme Selection -->
    <div>
      <p class="mb-3 text-sm font-semibold text-white">
        Theme
      </p>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="item in themes"
          :key="item.value"
          type="button"
          class="rounded-2xl border p-4 transition duration-200"
          :class="
            props.theme === item.value
              ? 'border-[var(--accent-400)]/50 bg-[var(--accent-500)]/10 text-[var(--accent-400)]'
              : 'border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]'
          "
          @click="emit('update:theme', item.value)"
        >
          <component
            :is="item.icon"
            class="mx-auto mb-2 h-5 w-5"
          />

          <span class="text-xs font-semibold">
            {{ item.label }}
          </span>
        </button>
      </div>
    </div>

    <!-- Accent Color Picker -->
    <div class="mt-7">
      <p class="mb-3 text-sm font-semibold text-white">
        Accent Color
      </p>

      <div class="grid grid-cols-7 gap-3">
        <button
          v-for="color in colors"
          :key="color.value"
          type="button"
          :title="color.label"
          class="group relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-110"
          :class="
            currentColorConfig.value === color.value
              ? 'border-white scale-110 shadow-lg'
              : 'border-white/10 hover:border-white/40'
          "
          @click="emit('update:accentColor', color.value)"
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-95 text-slate-950 font-bold"
            :style="{ backgroundColor: color.accent500 }"
          >
            <Check 
              v-if="currentColorConfig.value === color.value" 
              class="h-4 w-4 text-slate-950 stroke-[3]" 
            />
          </span>
        </button>
      </div>

      <p class="mt-3 text-xs text-white/40">
        Selected: <span class="font-semibold text-white/80 capitalize">{{ currentColorConfig.label }}</span>
      </p>
    </div>
  </section>
</template>