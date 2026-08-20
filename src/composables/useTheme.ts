import { computed, watch, onMounted } from "vue";
import { useSettingsStore } from "../stores/settings";

export type PaletteKey =
  | "forest"
  | "ocean"
  | "sakura"
  | "sunset"
  | "midnight"
  | "fauvist";

export interface PaletteDefinition {
  key: PaletteKey;
  label: string;
  description: string;
  colors: {
    400: string; // Light accent
    500: string; // Primary accent
    600: string; // Dark accent
  };
}

export const PALETTES: Record<PaletteKey, PaletteDefinition> = {
  forest: {
    key: "forest",
    label: "Forest",
    description: "Calm green tones for deep concentration",
    colors: {
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
    },
  },
  ocean: {
    key: "ocean",
    label: "Ocean",
    description: "Cool, soothing blue and cyan tones",
    colors: {
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
    },
  },
  sakura: {
    key: "sakura",
    label: "Sakura",
    description: "Gentle pink and soft spring hues",
    colors: {
      400: "#f9a8d4",
      500: "#ec4899",
      600: "#db2777",
    },
  },
  sunset: {
    key: "sunset",
    label: "Sunset",
    description: "Warm, energetic orange accents",
    colors: {
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
    },
  },
  midnight: {
    key: "midnight",
    label: "Midnight",
    description: "Deep, reflective violet and indigo shades",
    colors: {
      400: "#a78bfa",
      500: "#6366f1",
      600: "#4f46e5",
    },
  },
  fauvist: {
    key: "fauvist",
    label: "Fauvist",
    description: "Vibrant and expressive artistic contrast",
    colors: {
      400: "#facc15", // Bold Yellow
      500: "#ef4444", // Striking Red
      600: "#2563eb", // Deep Blue
    },
  },
};

export function useTheme() {
  const settingsStore = useSettingsStore();

  /**
   * Resolves the current palette definition, falling back to 'forest' if invalid.
   */
  const selectedPalette = computed<PaletteDefinition>(() => {
    const key = settingsStore.settings?.accentColor as PaletteKey;
    return PALETTES[key] ?? PALETTES.forest;
  });

  /**
   * Applies CSS variables to documentElement based on the active palette.
   */
  const applyTheme = () => {
    if (typeof document === "undefined") return;

    const palette = selectedPalette.value;
    const root = document.documentElement;

    root.style.setProperty("--accent-400", palette.colors[400]);
    root.style.setProperty("--accent-500", palette.colors[500]);
    root.style.setProperty("--accent-600", palette.colors[600]);

    // Apply root dark/light mode class
    if (settingsStore.settings?.theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  };

  // Watch for dynamic updates to settings store
  watch(
    () => [settingsStore.settings.accentColor, settingsStore.settings.theme],
    () => {
      applyTheme();
    },
    { deep: true, immediate: true }
  );

  onMounted(() => {
    applyTheme();
  });

  return {
    palettes: PALETTES,
    selectedPalette,
    applyTheme,
  };
}