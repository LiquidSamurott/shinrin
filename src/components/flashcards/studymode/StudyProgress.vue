<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  current: number;
  total: number;

  again?: number;
  hard?: number;
  good?: number;
  easy?: number;

  eta?: string;
}>();

const progress = computed(() => {
  if (props.total === 0) return 0;

  return Math.round(
    (props.current / props.total) * 100
  );
});

const remaining = computed(() =>
  Math.max(props.total - props.current, 0)
);
</script>

<template>
  <header
    class="
      border-b
      border-slate-800
      bg-slate-900
      px-8
      py-5
    "
  >
    <!-- Top row -->
    <div class="flex items-center justify-between">
      <div>
        <h2
          class="
            text-xl
            font-bold
            text-white
          "
        >
          Study Session
        </h2>

        <p
          class="
            mt-1
            text-sm
            text-slate-400
          "
        >
          Card {{ current }} of {{ total }}
        </p>
      </div>

      <div
        class="
          text-right
          text-sm
          text-slate-400
        "
      >
        <div>{{ progress }}%</div>

        <div>
          {{ remaining }}
          remaining
        </div>

        <div v-if="eta">
          ETA: {{ eta }}
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div
      class="
        mt-5
        h-3
        overflow-hidden
        rounded-full
        bg-slate-800
      "
    >
      <div
        class="
          h-full
          rounded-full
          bg-emerald-500
          transition-all
          duration-300
        "
        :style="{ width: progress + '%' }"
      />
    </div>

    <!-- Statistics -->
    <div
      class="
        mt-5
        flex
        flex-wrap
        gap-3
      "
    >
      <div
        class="
          rounded-xl
          bg-red-900/40
          px-4
          py-2
          text-red-300
        "
      >
        Again: {{ again ?? 0 }}
      </div>

      <div
        class="
          rounded-xl
          bg-orange-900/40
          px-4
          py-2
          text-orange-300
        "
      >
        Hard: {{ hard ?? 0 }}
      </div>

      <div
        class="
          rounded-xl
          bg-emerald-900/40
          px-4
          py-2
          text-emerald-300
        "
      >
        Good: {{ good ?? 0 }}
      </div>

      <div
        class="
          rounded-xl
          bg-blue-900/40
          px-4
          py-2
          text-blue-300
        "
      >
        Easy: {{ easy ?? 0 }}
      </div>
    </div>
  </header>
</template>