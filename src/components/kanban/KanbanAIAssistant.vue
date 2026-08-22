<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Bot, Sparkles, X, Check, Copy, Pencil, Save } from "@lucide/vue";

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

// Content picker state
const selectedContent = ref("");
const customContent = ref("");
const useCustomContent = ref(false);
const showWordCount = ref(true);

// Edit mode state
const isEditing = ref(false);
const editContent = ref("");

/*
============================================================
EXTRACT AND CLEAN CONTENT
============================================================
*/

function cleanHtml(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function extractContent(content: unknown): string {
  if (content == null) {
    return "";
  }

  if (typeof content === "string") {
    return cleanHtml(content);
  }

  if (typeof content === "number" || typeof content === "boolean") {
    return String(content);
  }

  try {
    const stringified = JSON.stringify(content, null, 2);
    return cleanHtml(stringified);
  } catch {
    return "";
  }
}

// Helper to get preview
function getPreview(text: unknown, maxLength: number = 30): string {
  const clean = extractContent(text);
  if (!clean) return 'Empty';
  return clean.slice(0, maxLength) + (clean.length > maxLength ? '...' : '');
}

/*
============================================================
BUILD SELECTED CONTENT
============================================================
*/

function buildSelectedContent(): string {
  if (useCustomContent.value && customContent.value.trim()) {
    return cleanHtml(customContent.value);
  }

  if (!card.value) return "";

  // Only use content field
  if (card.value.content) {
    return extractContent(card.value.content);
  }

  return "";
}

function getWordCount(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// Watch for changes to update selected content
watch(
  [card, customContent, useCustomContent],
  () => {
    selectedContent.value = buildSelectedContent();
  },
  { immediate: true }
);

/*
============================================================
CONTENT PICKER TOGGLE
============================================================
*/

function toggleCustomContent() {
  useCustomContent.value = !useCustomContent.value;
  if (useCustomContent.value) {
    customContent.value = selectedContent.value;
  }
}

function resetContentPicker() {
  customContent.value = "";
  useCustomContent.value = false;
  selectedContent.value = buildSelectedContent();
}

/*
============================================================
EDIT CONTENT
============================================================
*/

function startEditing() {
  editContent.value = selectedContent.value;
  isEditing.value = true;
}

function cancelEditing() {
  isEditing.value = false;
  editContent.value = "";
}

function saveEditedContent() {
  if (editContent.value.trim()) {
    // If using custom content, update it
    if (useCustomContent.value) {
      customContent.value = editContent.value;
    } else {
      // Otherwise, switch to custom content mode with the edited text
      useCustomContent.value = true;
      customContent.value = editContent.value;
    }
    selectedContent.value = buildSelectedContent();
    isEditing.value = false;
    editContent.value = "";
  }
}

/*
============================================================
RUN AI ACTION
============================================================
*/

async function runAction(action: KanbanAiAction) {
  if (!card.value) return;

  const content = selectedContent.value || buildSelectedContent();

  if (!content) {
    error.value =
      "No content selected. Please choose what content you want the AI to work with.";
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
  resetContentPicker();
  isEditing.value = false;
  editContent.value = "";

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
    @click.self="close"
  >
    <div
      class="
        flex
        max-h-[90vh]
        w-full
        max-w-3xl
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
              {{ isEditing ? 'Editing content' : 'Work with this card\'s content' }}
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

      <div class="flex-1 overflow-y-auto px-6 py-5">

        <!-- Content Picker -->
        <div
          v-if="card"
          class="
            mb-5
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.03]
            overflow-hidden
          "
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-white/[0.07] px-4 py-2">
            <div class="flex items-center gap-2">
              <span
                class="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-slate-600
                "
              >
                {{ isEditing ? 'Editing' : 'Content Selector' }}
              </span>
              <span
                v-if="selectedContent && showWordCount && !isEditing"
                class="
                  rounded-full
                  border
                  border-slate-700
                  bg-slate-800/50
                  px-2
                  py-0.5
                  text-[9px]
                  font-medium
                  text-slate-400
                "
              >
                {{ getWordCount(selectedContent) }} words
              </span>
            </div>
            <div class="flex items-center gap-2">
              <!-- Edit button -->
              <button
                v-if="!isEditing && selectedContent"
                @click="startEditing"
                class="
                  rounded-lg
                  px-2
                  py-1
                  text-[10px]
                  text-slate-500
                  transition
                  hover:bg-white/10
                  hover:text-white
                  flex
                  items-center
                  gap-1
                "
              >
                <Pencil class="h-3 w-3" />
                Edit
              </button>
              <button
                v-if="!isEditing"
                @click="resetContentPicker"
                class="
                  rounded-lg
                  px-2
                  py-1
                  text-[10px]
                  text-slate-500
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                Reset
              </button>
            </div>
          </div>

          <!-- Content Options -->
          <div v-if="!isEditing" class="p-4 space-y-3">
            <div v-if="!useCustomContent" class="space-y-2">
              <!-- Only Content field -->
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-300">Content</span>
                <span class="text-xs text-slate-500 ml-auto">
                  {{ getPreview(card.content) }}
                </span>
              </div>
            </div>

            <!-- Preview of selected content -->
            <div
              v-if="selectedContent && !useCustomContent"
              class="
                rounded-lg
                border
                border-white/[0.05]
                bg-black/20
                p-3
                max-h-24
                overflow-y-auto
              "
            >
              <p class="text-xs text-slate-400 leading-5">
                {{ selectedContent.slice(0, 150) }}{{ selectedContent.length > 150 ? '...' : '' }}
              </p>
            </div>

            <!-- Divider -->
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white/[0.05]"></div>
              </div>
              <div class="relative flex justify-center">
                <button
                  @click="toggleCustomContent"
                  class="
                    px-3
                    py-1
                    text-[10px]
                    font-medium
                    text-slate-500
                    bg-slate-950
                    hover:text-slate-300
                    transition
                  "
                >
                  {{ useCustomContent ? 'Use Card Content' : 'Custom Selection' }}
                </button>
              </div>
            </div>

            <!-- Custom Content -->
            <div v-if="useCustomContent">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-slate-400">Custom Content</span>
                <span class="text-[10px] text-slate-500">
                  {{ getWordCount(customContent) }} words
                </span>
              </div>
              <textarea
                v-model="customContent"
                class="
                  w-full
                  min-h-[100px]
                  rounded-lg
                  border
                  border-white/10
                  bg-slate-900/50
                  p-3
                  text-sm
                  text-slate-200
                  outline-none
                  transition
                  resize-none
                  focus:border-emerald-500/40
                  placeholder:text-slate-600
                "
                placeholder="Enter custom content for the AI to work with..."
              />
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-slate-400">Edit Content</span>
              <span class="text-[10px] text-slate-500">
                {{ getWordCount(editContent) }} words
              </span>
            </div>
            <textarea
              v-model="editContent"
              class="
                w-full
                min-h-[150px]
                rounded-lg
                border
                border-white/10
                bg-slate-900/50
                p-3
                text-sm
                text-slate-200
                outline-none
                transition
                resize-none
                focus:border-emerald-500/40
                placeholder:text-slate-600
              "
              placeholder="Edit the content that will be sent to the AI..."
            />
            <div class="mt-3 flex items-center justify-end gap-2">
              <button
                @click="cancelEditing"
                class="
                  rounded-lg
                  px-3
                  py-1.5
                  text-xs
                  text-slate-400
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                Cancel
              </button>
              <button
                @click="saveEditedContent"
                class="
                  flex
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-emerald-500
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-white
                  transition
                  hover:bg-emerald-400
                "
              >
                <Save class="h-3.5 w-3.5" />
                Save Changes
              </button>
            </div>
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
            :disabled="loading || !selectedContent"
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
            :disabled="loading || !selectedContent"
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
            :disabled="loading || !selectedContent"
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
            :disabled="loading || !selectedContent"
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
            :disabled="loading || !selectedContent"
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
                Analyzing the selected content
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

<style scoped>
/* Custom checkbox styling */
input[type="checkbox"] {
  accent-color: #10b981;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>