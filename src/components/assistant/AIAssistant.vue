<script setup lang="ts">
import { ref, onUnmounted, computed } from "vue";
import {
  Paperclip,
  Send,
  Sparkles,
  X,
  Brain,
  ChevronDown,
  ChevronRight,
  GitBranch,
  LoaderCircle,
  Clock,
} from "@lucide/vue";

import FileAttachment from "./FileAttachment.vue";
import MindmapVisualization from "./MindmapVisualization.vue";

import type { ChatAttachment } from "../../types/attachement";
import type { AssistantMessage } from "../../types/ai";
import type { MindmapData } from "../../types/mindmap";
import { sendAssistantMessage } from "../../services/aiService";
import { generateMindmap } from "../../services/mindmapService";
import { now } from "../../utils/date";

/* =========================================================
   TYPES
========================================================= */

type ChatMode = "regular" | "mindmap";

/* =========================================================
   STATE
========================================================= */

const input = ref("");
const loading = ref(false);
const enableThinking = ref(true);
const attachments = ref<ChatAttachment[]>([]);
const messages = ref<AssistantMessage[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const chatMode = ref<ChatMode>("regular");

// Mindmap specific state
const mindmapData = ref<MindmapData | null>(null);
const mindmapLoading = ref(false);
const mindmapError = ref("");
const mindmapProgress = ref(0);
const mindmapStage = ref("");
const mindmapStartTime = ref(0);
const mindmapEstimatedTime = ref(0);
const progressInterval = ref<number | null>(null);

// Track collapsed/expanded state for thinking blocks per message
const thinkingExpanded = ref<Record<string, boolean>>({});

/* =========================================================
   COMPUTED
========================================================= */

const isMindmapMode = computed(() => chatMode.value === "mindmap");
const isRegularMode = computed(() => chatMode.value === "regular");
const hasContent = computed(() => input.value.trim() || attachments.value.length);

const wordCount = computed(() => {
  const content = input.value.trim();
  return content.split(/\s+/).filter(w => w.length > 0).length;
});

const estimatedTimeText = computed(() => {
  if (mindmapEstimatedTime.value === 0) return "Preparing...";
  if (mindmapEstimatedTime.value < 60) return `~${Math.round(mindmapEstimatedTime.value)}s`;
  const mins = Math.floor(mindmapEstimatedTime.value / 60);
  const secs = Math.round(mindmapEstimatedTime.value % 60);
  return `~${mins}m ${secs}s`;
});

const progressPercent = computed(() => Math.round(mindmapProgress.value));

/* =========================================================
   PARSER HELPER FOR THINKING TOKENS
========================================================= */

function toggleThinkingExpand(messageId: string) {
  thinkingExpanded.value[messageId] = !thinkingExpanded.value[messageId];
}

function parseMessageThinking(message: AssistantMessage): {
  thinking: string | null;
  content: string;
} {
  if ((message as any).thinking) {
    return {
      thinking: (message as any).thinking,
      content: message.content,
    };
  }

  const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|$)/i;
  const match = message.content?.match(thinkRegex);

  if (match) {
    const thinking = match[1].trim();
    const content = message.content.replace(thinkRegex, "").trim();
    return { thinking, content };
  }

  return { thinking: null, content: message.content };
}

/* =========================================================
   FILE PICKER & HANDLING
========================================================= */

function openFilePicker() {
  if (loading.value) return;
  fileInput.value?.click();
}

function getAttachmentType(file: File): ChatAttachment["type"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (
    file.type.includes("word") ||
    file.type.includes("document") ||
    file.name.endsWith(".doc") ||
    file.name.endsWith(".docx")
  ) {
    return "document";
  }
  return "text";
}

function handleFiles(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  for (const file of Array.from(target.files)) {
    const type = getAttachmentType(file);
    const attachment: ChatAttachment = {
      id: crypto.randomUUID(),
      name: file.name,
      type,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      file,
      previewUrl: type === "image" ? URL.createObjectURL(file) : undefined,
      extractedText: undefined,
    };
    attachments.value.push(attachment);
  }

  target.value = "";
}

function removeAttachment(id: string) {
  const attachment = attachments.value.find((item) => item.id === id);
  if (attachment?.previewUrl) {
    URL.revokeObjectURL(attachment.previewUrl);
  }
  attachments.value = attachments.value.filter((item) => item.id !== id);
}

/* =========================================================
   MINDMAP PROGRESS TRACKING (SINGLE PASS - OPTIMIZED)
========================================================= */

function startMindmapProgress() {
  mindmapStartTime.value = Date.now();
  mindmapProgress.value = 0;
  mindmapStage.value = "🧠 Generating mindmap...";
  
  const words = wordCount.value;
  
  // Realistic estimates for single-pass with 16K context
  if (words > 3000) {
    mindmapEstimatedTime.value = 30 + (words / 200); // 30-50 seconds
    mindmapStage.value = "📚 Processing large document...";
  } else if (words > 1500) {
    mindmapEstimatedTime.value = 20 + (words / 200); // 20-30 seconds
    mindmapStage.value = "📖 Analyzing content...";
  } else if (words > 500) {
    mindmapEstimatedTime.value = 12 + (words / 200); // 12-20 seconds
    mindmapStage.value = "🔍 Extracting concepts...";
  } else {
    mindmapEstimatedTime.value = 5 + (words / 200); // 5-10 seconds
    mindmapStage.value = "⚡ Building mindmap...";
  }
  
  // Simple progress animation (just visual feedback while AI works)
  progressInterval.value = window.setInterval(() => {
    const elapsed = (Date.now() - mindmapStartTime.value) / 1000;
    const progress = Math.min((elapsed / mindmapEstimatedTime.value) * 100, 95);
    mindmapProgress.value = progress;
    
    // Update stage based on progress
    if (progress < 20) {
      mindmapStage.value = "📖 Reading content...";
    } else if (progress < 40) {
      mindmapStage.value = "🧠 Analyzing structure...";
    } else if (progress < 60) {
      mindmapStage.value = "🔗 Building connections...";
    } else if (progress < 80) {
      mindmapStage.value = "📊 Organizing nodes...";
    } else if (progress < 95) {
      mindmapStage.value = "✨ Finalizing mindmap...";
    }
  }, 500);
}

function stopMindmapProgress() {
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
    progressInterval.value = null;
  }
  mindmapProgress.value = 100;
  mindmapStage.value = "✅ Complete!";
}

/* =========================================================
   SEND MESSAGE (REGULAR MODE)
========================================================= */

async function sendMessage() {
  if (loading.value || !hasContent.value) return;

  const rawMessage = input.value.trim();
  
  // If in mindmap mode, use the mindmap generation instead
  if (isMindmapMode.value) {
    await generateMindmapFromContent();
    return;
  }

  const payloadMessage = enableThinking.value
    ? `/think ${rawMessage}`
    : `/no_think ${rawMessage}`;

  const currentAttachments = [...attachments.value];

  input.value = "";
  attachments.value = [];

  messages.value.push({
    id: crypto.randomUUID(),
    role: "user",
    type: "text",
    content: rawMessage,
    attachments: currentAttachments,
    createdAt: now(),
  });

  loading.value = true;

  try {
    const response = await sendAssistantMessage({
      message: payloadMessage,
      attachments: currentAttachments,
      enableThinking: enableThinking.value,
    });

    thinkingExpanded.value[response.id] = true;
    messages.value.push(response);
  } catch (error) {
    console.error("AI assistant error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Something went wrong while contacting Shinrin AI.";

    messages.value.push({
      id: crypto.randomUUID(),
      role: "assistant",
      type: "text",
      content: `AI request failed:\n${errorMessage}`,
      createdAt: now(),
    });
  } finally {
    loading.value = false;
  }
}

/* =========================================================
   MINDMAP GENERATION (SINGLE PASS - OPTIMIZED)
========================================================= */

async function generateMindmapFromContent() {
  if (!input.value.trim()) {
    mindmapError.value = "Please enter a topic or paste content for the mindmap.";
    return;
  }

  mindmapLoading.value = true;
  mindmapError.value = "";
  const content = input.value.trim();
  const currentAttachments = [...attachments.value];

  // Add user message
  messages.value.push({
    id: crypto.randomUUID(),
    role: "user",
    type: "mindmap",
    content: `Generate mindmap: ${content}`,
    attachments: currentAttachments,
    createdAt: now(),
  });

  input.value = "";
  attachments.value = [];

  // Start progress tracking
  startMindmapProgress();

  try {
    // SINGLE CALL - uses your backend's TaskMode::Mindmap with 16K context
    const result = await generateMindmap({
      prompt: content,
      text: content,
    });

    // Complete progress
    stopMindmapProgress();
    mindmapData.value = result;

    // Add assistant message with mindmap
    messages.value.push({
      id: crypto.randomUUID(),
      role: "assistant",
      type: "mindmap",
      content: `Generated mindmap: ${result.title || "Untitled"}`,
      mindmap: result,
      createdAt: now(),
    });

  } catch (error) {
    console.error("Mindmap generation error:", error);
    stopMindmapProgress();
    mindmapError.value = error instanceof Error ? error.message : "Failed to generate mindmap";
    
    messages.value.push({
      id: crypto.randomUUID(),
      role: "assistant",
      type: "text",
      content: `Mindmap generation failed:\n${mindmapError.value}`,
      createdAt: now(),
    });
  } finally {
    mindmapLoading.value = false;
    stopMindmapProgress();
  }
}

/* =========================================================
   DOWNLOAD FUNCTIONS
========================================================= */

function downloadMindmap(format: "json" | "svg" | "png") {
  if (!mindmapData.value) return;

  switch (format) {
    case "json":
      downloadJSON();
      break;
    case "svg":
      downloadSVG();
      break;
    case "png":
      downloadPNG();
      break;
  }
}

function downloadJSON() {
  if (!mindmapData.value) return;
  const json = JSON.stringify(mindmapData.value, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mindmap.json";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadSVG() {
  alert("SVG download is handled by the visualization component.");
}

function downloadPNG() {
  alert("PNG download requires canvas rendering. Use SVG or JSON format for now.");
}

/* =========================================================
   CLEANUP
========================================================= */

onUnmounted(() => {
  for (const attachment of attachments.value) {
    if (attachment.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
  }
  stopMindmapProgress();
});

/* =========================================================
   SWITCH MODE
========================================================= */

function switchMode(mode: ChatMode) {
  if (loading.value || mindmapLoading.value) return;
  chatMode.value = mode;
  mindmapData.value = null;
  mindmapError.value = "";
  mindmapProgress.value = 0;
  mindmapStage.value = "";
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col bg-slate-950">
    <!-- Header -->
    <div
      class="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-6 py-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        >
          <Sparkles class="h-4 w-4" />
        </div>
        <div>
          <h1 class="text-sm font-semibold text-slate-100">AI Assistant</h1>
          <p class="text-[11px] text-slate-500">
            {{ isMindmapMode ? "Generate mindmaps from your content" : "Ask questions or analyze your files" }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Mode Toggle -->
        <div class="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          <button
            type="button"
            @click="switchMode('regular')"
            class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition"
            :class="
              isRegularMode
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            "
          >
            <Sparkles class="h-3 w-3" />
            Chat
          </button>
          <button
            type="button"
            @click="switchMode('mindmap')"
            class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition"
            :class="
              isMindmapMode
                ? 'bg-fuchsia-500/20 text-fuchsia-400'
                : 'text-slate-500 hover:text-slate-300'
            "
          >
            <GitBranch class="h-3 w-3" />
            Mindmap
          </button>
        </div>

        <!-- Thinking Mode Toggle (Regular mode only) -->
        <button
          v-if="isRegularMode"
          type="button"
          @click="enableThinking = !enableThinking"
          class="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition"
          :class="
            enableThinking
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200'
          "
          title="Toggle AI Thinking / Reasoning Mode"
        >
          <Brain class="h-3.5 w-3.5" />
          <span>Thinking {{ enableThinking ? "On" : "Off" }}</span>
        </button>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div
        v-if="!messages.length"
        class="flex h-full items-center justify-center"
      >
        <div class="max-w-md text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
            :class="
              isMindmapMode
                ? 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
            "
          >
            <component :is="isMindmapMode ? GitBranch : Sparkles" class="h-6 w-6" />
          </div>
          <h2 class="text-lg font-semibold text-slate-100">
            {{ isMindmapMode ? "Generate a Mindmap" : "How can I help?" }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{
              isMindmapMode
                ? "Paste your content and I'll create a visual mindmap with key concepts and relationships."
                : "Ask a question, attach study material, or turn on Thinking Mode to solve complex problems."
            }}
          </p>
          <div v-if="isMindmapMode && input" class="mt-3 text-xs text-slate-500">
            <Clock class="h-3 w-3 inline mr-1" />
            {{ wordCount }} words · {{ estimatedTimeText }} estimated
          </div>
        </div>
      </div>

      <div v-else class="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="
            message.role === 'user' ? 'justify-end' : 'justify-start'
          "
        >
          <div class="max-w-[85%]">
            <!-- User Bubble -->
            <div
              v-if="message.role === 'user'"
              class="rounded-2xl rounded-br-md border px-4 py-3"
              :class="
                message.type === 'mindmap'
                  ? 'border-fuchsia-500/20 bg-fuchsia-500/10'
                  : 'border-emerald-500/20 bg-emerald-500/10'
              "
            >
              <p
                v-if="message.content"
                class="whitespace-pre-wrap text-sm leading-6 text-slate-200"
              >
                {{ message.content }}
              </p>

              <div
                v-if="message.attachments?.length"
                class="mt-3 flex flex-wrap gap-2"
              >
                <FileAttachment
                  v-for="attachment in message.attachments"
                  :key="attachment.id"
                  :attachment="attachment"
                />
              </div>
            </div>

            <!-- Assistant Bubble -->
            <div
              v-else
              class="rounded-2xl rounded-bl-md border px-4 py-3"
              :class="
                message.type === 'mindmap'
                  ? 'border-fuchsia-500/20 bg-fuchsia-500/[0.05]'
                  : 'border-white/[0.08] bg-white/[0.03]'
              "
            >
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-lg"
                  :class="
                    message.type === 'mindmap'
                      ? 'bg-fuchsia-500/10 text-fuchsia-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  "
                >
                  <component :is="message.type === 'mindmap' ? GitBranch : Sparkles" class="h-3.5 w-3.5" />
                </div>
                <span
                  class="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                >
                  {{ message.type === 'mindmap' ? 'Mindmap AI' : 'Shinrin AI' }}
                </span>
              </div>

              <!-- Collapsible Thought Process Section -->
              <div
                v-if="parseMessageThinking(message).thinking"
                class="mb-3 rounded-xl border border-white/10 bg-slate-900/60"
              >
                <button
                  type="button"
                  @click="toggleThinkingExpand(message.id)"
                  class="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-slate-400 transition hover:text-slate-200"
                >
                  <div class="flex items-center gap-2 font-medium">
                    <Brain class="h-3.5 w-3.5 text-emerald-400" />
                    <span>Thought Process</span>
                  </div>
                  <component
                    :is="
                      thinkingExpanded[message.id]
                        ? ChevronDown
                        : ChevronRight
                    "
                    class="h-3.5 w-3.5"
                  />
                </button>

                <div
                  v-if="thinkingExpanded[message.id]"
                  class="border-t border-white/[0.06] px-3 py-2 font-mono text-[12px] leading-relaxed text-slate-400 whitespace-pre-wrap"
                >
                  {{ parseMessageThinking(message).thinking }}
                </div>
              </div>

              <!-- Final Response Output -->
              <p v-if="message.type !== 'mindmap'" class="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {{ parseMessageThinking(message).content }}
              </p>

              <!-- Mindmap Visualization -->
              <div
                v-if="message.type === 'mindmap' && message.mindmap"
                class="mt-3"
              >
                <MindmapVisualization
                  :data="message.mindmap"
                  @download="downloadMindmap"
                />
              </div>

              <!-- Assistant Attachments -->
              <div
                v-if="message.attachments?.length"
                class="mt-3 flex flex-wrap gap-2"
              >
                <FileAttachment
                  v-for="attachment in message.attachments"
                  :key="attachment.id"
                  :attachment="attachment"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Mindmap Generation Loading State (Single Pass) -->
        <div v-if="mindmapLoading" class="flex justify-start">
          <div
            class="rounded-2xl rounded-bl-md border border-fuchsia-500/20 bg-fuchsia-500/[0.05] px-6 py-4 w-full max-w-[90%]"
          >
            <div class="flex items-center gap-3 mb-3">
              <LoaderCircle class="h-5 w-5 animate-spin text-fuchsia-400" />
              <div>
                <span class="text-sm font-medium text-fuchsia-300">
                  Generating mindmap...
                </span>
                <p class="text-xs text-fuchsia-400/60">
                  {{ mindmapStage }}
                </p>
              </div>
              <span class="ml-auto text-xs text-fuchsia-400/60">
                {{ progressPercent }}%
              </span>
            </div>
            
            <!-- Progress Bar -->
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-fuchsia-500/10">
              <div 
                class="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-500 ease-out"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>
            
            <!-- Time estimate -->
            <div class="mt-2 flex items-center justify-between text-[10px] text-fuchsia-400/50">
              <span>🧠 Using optimized mindmap mode</span>
              <span>{{ estimatedTimeText }} remaining</span>
            </div>
          </div>
        </div>

        <!-- Regular Loading State -->
        <div v-else-if="loading" class="flex justify-start">
          <div
            class="rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.03] px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <LoaderCircle class="h-4 w-4 animate-spin text-emerald-400" />
              <span class="text-xs text-slate-400">
                {{ enableThinking ? "Reasoning & thinking..." : "Shinrin AI is thinking..." }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Composer Section -->
    <div
      class="shrink-0 border-t border-white/[0.07] bg-slate-950/90 px-6 py-4"
    >
      <div class="mx-auto w-full max-w-4xl">
        <!-- Attachment Previews -->
        <div v-if="attachments.length" class="mb-3 flex flex-wrap gap-2">
          <div
            v-for="attachment in attachments"
            :key="attachment.id"
            class="group relative"
          >
            <FileAttachment :attachment="attachment" />

            <button
              type="button"
              @click="removeAttachment(attachment.id)"
              class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100"
              title="Remove file"
            >
              <X class="h-3 w-3" />
            </button>
          </div>
        </div>

        <!-- Input Form -->
        <form
          @submit.prevent="sendMessage"
          class="rounded-2xl border transition"
          :class="
            isMindmapMode
              ? 'border-fuchsia-500/20 focus-within:border-fuchsia-500/40 bg-fuchsia-500/[0.03]'
              : 'border-white/[0.08] focus-within:border-emerald-500/30 bg-white/[0.03]'
          "
        >
          <textarea
            v-model="input"
            rows="3"
            :placeholder="isMindmapMode ? 'Paste content for mindmap generation...' : 'Ask Shinrin AI...'"
            :disabled="loading || mindmapLoading"
            class="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-600 disabled:opacity-50"
            @keydown.enter.exact.prevent="sendMessage"
          />

          <div class="flex items-center justify-between px-2 pb-1">
            <div class="flex items-center gap-1">
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx"
                class="hidden"
                @change="handleFiles"
              />

              <button
                v-if="isRegularMode"
                type="button"
                @click="openFilePicker"
                :disabled="loading || mindmapLoading"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-40"
                title="Attach files"
              >
                <Paperclip class="h-4 w-4" />
              </button>

              <span v-if="isRegularMode" class="ml-1 text-[10px] text-slate-600">
                Images, PDFs & documents
              </span>
              
              <span v-if="isMindmapMode" class="ml-1 text-[10px] text-fuchsia-500/60">
                {{ wordCount > 0 ? `${wordCount} words · ${estimatedTimeText}` : 'AI will create a visual mindmap' }}
              </span>
            </div>

            <button
              type="submit"
              :disabled="loading || mindmapLoading || !hasContent"
              class="flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-40"
              :class="
                isMindmapMode
                  ? 'bg-fuchsia-500 hover:bg-fuchsia-400'
                  : 'bg-emerald-500 hover:bg-emerald-400'
              "
            >
              <component :is="isMindmapMode ? GitBranch : Send" class="h-3.5 w-3.5" />
              {{ isMindmapMode ? "Generate" : "Send" }}
            </button>
          </div>
        </form>

        <!-- Mode indicator -->
        <div class="mt-2 flex items-center justify-between">
          <span class="text-[10px] text-slate-600">
            {{ isMindmapMode ? "🧠 Mindmap Mode" : "💬 Chat Mode" }}
          </span>
          <span v-if="isMindmapMode && !mindmapLoading" class="text-[10px] text-fuchsia-500/50">
            Uses optimized mindmap mode with 16K context
          </span>
          <span v-if="isMindmapMode && mindmapLoading" class="text-[10px] text-fuchsia-500/70 animate-pulse">
            Generating...
          </span>
        </div>
      </div>
    </div>
  </div>
</template>