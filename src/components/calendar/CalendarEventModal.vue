<script setup lang="ts">
import { X, Calendar } from "@lucide/vue";
import CalendarEventForm from "./CalendarEventForm.vue";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

function close() {
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
        @click.self="close"
      >
        <!-- Liquid Glass Card Container -->
        <div
          class="relative flex h-[720px] w-full max-w-[900px] flex-col overflow-hidden rounded-3xl border border-white/10 border-t-white/20 bg-slate-950/50 shadow-2xl backdrop-blur-3xl select-none"
        >
          <!-- Specular Edge Highlight -->
          <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>

          <!-- Ambient Refraction Orbs -->
          <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"></div>
          <div class="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl"></div>

          <!-- Header -->
          <div
            class="z-10 flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur-xl"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] text-emerald-400 shadow-inner backdrop-blur-md">
                <Calendar class="h-5 w-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </div>

              <div>
                <h2 class="text-base font-bold tracking-tight text-white drop-shadow-md">
                  Calendar Event
                </h2>

                <p class="text-xs font-medium text-white/50">
                  Manage and schedule your event details
                </p>
              </div>
            </div>

            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 backdrop-blur-md transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
              @click="close"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Embedded Form Container -->
          <div class="z-10 flex-1 overflow-hidden">
            <CalendarEventForm
              @saved="close"
              @cancel="close"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Glass Entrance & Exit Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(16px) scale(0.96);
  opacity: 0;
}
</style>