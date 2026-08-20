<script setup lang="ts">
import {
  File,
  Image,
  X,
} from "@lucide/vue";

import type {
  ChatAttachment,
} from "../../types/attachement";

defineProps<{
  attachment: ChatAttachment;
}>();

const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
  >
    <div
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]"
    >
      <Image
        v-if="attachment.type === 'image'"
        class="h-4 w-4 text-fuchsia-400"
      />

      <File
        v-else
        class="h-4 w-4 text-slate-400"
      />
    </div>

    <div class="min-w-0 flex-1">
      <p
        class="truncate text-xs font-medium text-slate-200"
      >
        {{ attachment.name }}
      </p>

      <p class="text-[10px] text-slate-500">
        {{ Math.round(attachment.size / 1024) }} KB
      </p>
    </div>

    <button
      type="button"
      @click="emit('remove')"
      class="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>