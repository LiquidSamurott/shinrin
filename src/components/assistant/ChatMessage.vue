<script setup lang="ts">
import type {
  AssistantMessage,
} from "../../types/ai";

import MindmapRenderer from "../mindmap/MindmapRenderer.vue";

defineProps<{
  message: AssistantMessage;
}>();
</script>

<template>
  <div>
    <div
      v-if="message.type === 'text'"
      class="whitespace-pre-wrap text-sm leading-6 text-slate-300"
    >
      {{ message.content }}
    </div>

    <div
      v-else-if="
        message.type === 'mindmap' &&
        message.mindmap
      "
      class="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
    >
      <div class="border-b border-white/10 px-4 py-3">
        <p class="text-sm font-semibold text-white">
          {{ message.mindmap.title }}
        </p>

        <p class="mt-0.5 text-[11px] text-slate-500">
          AI-generated mindmap
        </p>
      </div>

      <MindmapRenderer
        :mindmap="message.mindmap"
      />
    </div>
  </div>
</template>