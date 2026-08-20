<script setup lang="ts">
import { ref, computed } from "vue";
import { Bot, Sparkles, X, Check, Copy } from "@lucide/vue";

import { useKanbanStore } from "../../stores/kanbanactions/kanban";
import {
  assistKanbanCard,
  type KanbanAiAction,
} from "../../services/kanbanAi";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const kanban = useKanbanStore();

const card = computed(() => kanban.selectedCard);

const loading = ref(false);
const result = ref("");
const error = ref("");
const copied = ref(false);

/*
============================================================
EXTRACT CARD CONTENT
============================================================

The AI works on card.content only.

Because content is currently typed as `any`, handle the
common cases safely:

- string
- null / undefined
- objects containing text
- JSON-like editor content
============================================================
*/

function extractContent(content: unknown): string {
  if (content == null) {
    return "";
  }

  if (typeof content === "string") {
    return content.trim();
  }

  if (typeof content === "number" || typeof content === "boolean") {
    return String(content);
  }

  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return "";
  }
}

/*
============================================================
RUN AI ACTION
============================================================
*/

async function runAction(action: KanbanAiAction) {
  if (!card.value) return;

  const content = extractContent(card.value.content);

  if (!content) {
    error.value =
      "This card does not contain any content for the AI to work with.";

    result.value = "";
    return;
  }

  loading.value = true;
  result.value = "";
  error.value = "";
  copied.value = false;

  try {
    result.value = await assistKanbanCard(action, {
      content,
    });
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : String(err);
  } finally {
    loading.value = false;
  }
}

/*
============================================================
COPY RESULT
============================================================
*/

async function copyResult() {
  if (!result.value) return;

  try {
    await navigator.clipboard.writeText(result.value);

    copied.value = true;

    window.setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    error.value = "Failed to copy the generated result.";
  }
}

/*
============================================================
CLOSE
============================================================
*/

function close() {
  if (loading.value) return;

  result.value = "";
  error.value = "";
  copied.value = false;

  emit("close");
}
</script>

<template>
  <div
    v-if="show"
    class="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/60
      p-6
      backdrop-blur-sm
    "
  >
    <div
      class="
        flex
        max-h-[85vh]
        w-full
        max-w-2xl
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-slate-950
        shadow-2xl
      "
    >
      <!-- ==================================================
           HEADER
      =================================================== -->

      <div
        class="
          flex
          shrink-0
          items-center
          justify-between
          border-b
          border-white/[0.07]
          px-6
          py-5
        "
      >
        <div class="flex items-center gap-3">
          <div
            class="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-emerald-500/20
              bg-emerald-500/10
            "
          >
            <Bot class="h-5 w-5 text-emerald-400" />
          </div>

          <div>
            <h2 class="font-semibold text-white">
              AI Assistant
            </h2>

            <p class="text-xs text-slate-500">
              Work with this card's content
            </p>
          </div>
        </div>

        <button
          @click="close"
          :disabled="loading"
          class="
            rounded-lg
            p-2
            text-slate-500
            transition
            hover:bg-white/10
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- ==================================================
           BODY
      =================================================== -->

      <div class="overflow-y-auto px-6 py-5">

        <!-- Content preview -->

        <div
          v-if="card"
          class="
            mb-5
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.03]
            p-4
          "
        >
          <div class="mb-2 flex items-center justify-between">
            <span
              class="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-slate-600
              "
            >
              Card Content
            </span>

            <span
              class="
                rounded-full
                border
                border-emerald-500/20
                bg-emerald-500/10
                px-2
                py-0.5
                text-[9px]
                font-medium
                text-emerald-400
              "
            >
              AI INPUT
            </span>
          </div>

          <div
            class="
              max-h-32
              overflow-y-auto
              whitespace-pre-wrap
              text-sm
              leading-6
              text-slate-300
            "
          >
            {{
              extractContent(card.content) ||
              "No content available"
            }}
          </div>
        </div>

        <!-- =================================================
             ACTIONS
        ================================================== -->

        <div class="mb-2">
          <p
            class="
              mb-2
              px-1
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-600
            "
          >
            Actions
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <!-- Improve -->

          <button
            @click="runAction('improve')"
            :disabled="loading"
            class="
              group
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.03]
              p-3
              text-left
              transition
              hover:border-emerald-500/20
              hover:bg-emerald-500/[0.05]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Sparkles
              class="
                mb-2
                h-4
                w-4
                text-emerald-400
                transition-transform
                group-hover:scale-110
              "
            />

            <p class="text-sm font-medium text-slate-200">
              Improve
            </p>

            <p class="mt-0.5 text-[11px] text-slate-500">
              Make the content more effective
            </p>
          </button>

          <!-- Rewrite -->

          <button
            @click="runAction('rewrite')"
            :disabled="loading"
            class="
              group
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.03]
              p-3
              text-left
              transition
              hover:border-violet-500/20
              hover:bg-violet-500/[0.05]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Sparkles
              class="
                mb-2
                h-4
                w-4
                text-violet-400
              "
            />

            <p class="text-sm font-medium text-slate-200">
              Rewrite
            </p>

            <p class="mt-0.5 text-[11px] text-slate-500">
              Rewrite while preserving meaning
            </p>
          </button>

          <!-- Clarify -->

          <button
            @click="runAction('clarify')"
            :disabled="loading"
            class="
              group
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.03]
              p-3
              text-left
              transition
              hover:border-sky-500/20
              hover:bg-sky-500/[0.05]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Bot
              class="
                mb-2
                h-4
                w-4
                text-sky-400
              "
            />

            <p class="text-sm font-medium text-slate-200">
              Make clearer
            </p>

            <p class="mt-0.5 text-[11px] text-slate-500">
              Improve clarity and structure
            </p>
          </button>

          <!-- Generate -->

          <button
            @click="runAction('generate')"
            :disabled="loading"
            class="
              group
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.03]
              p-3
              text-left
              transition
              hover:border-fuchsia-500/20
              hover:bg-fuchsia-500/[0.05]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Sparkles
              class="
                mb-2
                h-4
                w-4
                text-fuchsia-400
              "
            />

            <p class="text-sm font-medium text-slate-200">
              Expand
            </p>

            <p class="mt-0.5 text-[11px] text-slate-500">
              Develop the existing content
            </p>
          </button>

          <!-- Checklist -->

          <button
            @click="runAction('checklist')"
            :disabled="loading"
            class="
              group
              col-span-2
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.03]
              p-3
              text-left
              transition
              hover:border-orange-500/20
              hover:bg-orange-500/[0.05]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Check
              class="
                mb-2
                h-4
                w-4
                text-orange-400
              "
            />

            <p class="text-sm font-medium text-slate-200">
              Generate Checklist
            </p>

            <p class="mt-0.5 text-[11px] text-slate-500">
              Turn this content into actionable tasks
            </p>
          </button>
        </div>

        <!-- =================================================
             LOADING
        ================================================== -->

        <div
          v-if="loading"
          class="
            mt-5
            rounded-xl
            border
            border-emerald-500/20
            bg-emerald-500/[0.05]
            p-4
          "
        >
          <div class="flex items-center gap-3">
            <div
              class="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-emerald-500/20
                border-t-emerald-400
              "
            />

            <div>
              <p class="text-sm font-medium text-emerald-300">
                AI is working...
              </p>

              <p class="mt-0.5 text-[11px] text-emerald-400/50">
                Analyzing the card content
              </p>
            </div>
          </div>
        </div>

        <!-- =================================================
             ERROR
        ================================================== -->

        <div
          v-if="error"
          class="
            mt-5
            rounded-xl
            border
            border-rose-500/20
            bg-rose-500/[0.05]
            p-4
            text-sm
            leading-6
            text-rose-300
          "
        >
          {{ error }}
        </div>

        <!-- =================================================
             RESULT
        ================================================== -->

        <div v-if="result" class="mt-5">
          <div class="mb-2 flex items-center justify-between">
            <p
              class="
                px-1
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-slate-600
              "
            >
              Generated Result
            </p>

            <button
              @click="copyResult"
              class="
                flex
                items-center
                gap-1.5
                rounded-lg
                px-2
                py-1
                text-[10px]
                text-slate-500
                transition
                hover:bg-white/10
                hover:text-slate-200
              "
            >
              <Check
                v-if="copied"
                class="h-3 w-3 text-emerald-400"
              />

              <Copy
                v-else
                class="h-3 w-3"
              />

              {{ copied ? "Copied" : "Copy" }}
            </button>
          </div>

          <div
            class="
              max-h-72
              overflow-y-auto
              whitespace-pre-wrap
              rounded-xl
              border
              border-emerald-500/10
              bg-black/20
              p-4
              text-sm
              leading-6
              text-slate-200
            "
          >
            {{ result }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>