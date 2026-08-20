<script setup lang="ts">
import { reactive } from "vue";

const emit = defineEmits<{
  save: [typeof settings];
  close: [];
}>();

const settings = reactive({
  newCardsPerDay: 20,
  reviewsPerDay: 100,

  randomOrder: false,

  autoReveal: false,
  revealDelay: 5,

  showTimer: true,
  keyboardShortcuts: true,

  autoplayAudio: false,
});

function save() {
  emit("save", { ...settings });
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        class="
          w-full
          max-w-xl
          rounded-3xl
          border
          border-slate-700
          bg-slate-900
          p-8
        "
      >
        <!-- Header -->

        <div class="mb-8 flex items-center justify-between">

          <h2
            class="
              text-3xl
              font-bold
              text-white
            "
          >
            Study Settings
          </h2>

          <button
            @click="emit('close')"
            class="text-2xl text-slate-400 hover:text-white"
          >
            ✕
          </button>

        </div>

        <!-- Limits -->

        <div class="space-y-6">

          <div>
            <label class="block text-slate-300 mb-2">
              New Cards / Day
            </label>

            <input
              v-model.number="settings.newCardsPerDay"
              type="number"
              min="1"
              class="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-4
                py-3
                text-white
              "
            />
          </div>

          <div>
            <label class="block text-slate-300 mb-2">
              Reviews / Day
            </label>

            <input
              v-model.number="settings.reviewsPerDay"
              type="number"
              min="1"
              class="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-4
                py-3
                text-white
              "
            />
          </div>

          <!-- Switches -->

          <label class="flex items-center justify-between">
            <span class="text-white">
              Random Order
            </span>

            <input
              v-model="settings.randomOrder"
              type="checkbox"
            />
          </label>

          <label class="flex items-center justify-between">
            <span class="text-white">
              Auto Reveal
            </span>

            <input
              v-model="settings.autoReveal"
              type="checkbox"
            />
          </label>

          <div
            v-if="settings.autoReveal"
          >
            <label class="block text-slate-300 mb-2">
              Reveal Delay (seconds)
            </label>

            <input
              v-model.number="settings.revealDelay"
              type="number"
              min="1"
              class="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-4
                py-3
                text-white
              "
            />
          </div>

          <label class="flex items-center justify-between">
            <span class="text-white">
              Show Timer
            </span>

            <input
              v-model="settings.showTimer"
              type="checkbox"
            />
          </label>

          <label class="flex items-center justify-between">
            <span class="text-white">
              Keyboard Shortcuts
            </span>

            <input
              v-model="settings.keyboardShortcuts"
              type="checkbox"
            />
          </label>

          <label class="flex items-center justify-between">
            <span class="text-white">
              Auto Play Audio
            </span>

            <input
              v-model="settings.autoplayAudio"
              type="checkbox"
            />
          </label>

        </div>

        <!-- Footer -->

        <div class="mt-10 flex justify-end gap-4">

          <button
            @click="emit('close')"
            class="
              rounded-xl
              bg-slate-700
              px-6
              py-3
              text-white
            "
          >
            Cancel
          </button>

          <button
            @click="save"
            class="
              rounded-xl
              bg-emerald-600
              px-6
              py-3
              text-white
              hover:bg-emerald-500
            "
          >
            Save
          </button>

        </div>

      </div>
    </div>
  </Teleport>
</template>