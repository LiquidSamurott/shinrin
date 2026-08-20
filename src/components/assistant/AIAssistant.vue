<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import {
  Paperclip,
  Send,
  Sparkles,
  X,
  Brain,
  ChevronDown,
  ChevronRight,
} from "@lucide/vue";

import FileAttachment from "./FileAttachment.vue";

import type { ChatAttachment } from "../../types/attachement";
import type { AssistantMessage } from "../../types/ai";
import { sendAssistantMessage } from "../../services/aiService";
import { now } from "../../utils/date";

/* =========================================================
   STATE
========================================================= */

const input = ref("");
const loading = ref(false);
const enableThinking = ref(true);
const attachments = ref<ChatAttachment[]>([]);
const messages = ref<AssistantMessage[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

// Track collapsed/expanded state for thinking blocks per message
const thinkingExpanded = ref<Record<string, boolean>>({});

function toggleThinkingExpand(messageId: string) {
  thinkingExpanded.value[messageId] = !thinkingExpanded.value[messageId];
}

/* =========================================================
   PARSER HELPER FOR THINKING TOKENS
========================================================= */

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
   SEND MESSAGE
========================================================= */

async function sendMessage() {
  if (loading.value) return;

  const rawMessage = input.value.trim();
  if (!rawMessage && !attachments.value.length) return;

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
   CLEANUP
========================================================= */

onUnmounted(() => {
  for (const attachment of attachments.value) {
    if (attachment.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
  }
});
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
            Ask questions or analyze your files
          </p>
        </div>
      </div>

      <!-- Thinking Mode Toggle -->
      <button
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

    <!-- Messages Container -->
    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div
        v-if="!messages.length"
        class="flex h-full items-center justify-center"
      >
        <div class="max-w-md text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          >
            <Sparkles class="h-6 w-6" />
          </div>
          <h2 class="text-lg font-semibold text-slate-100">How can I help?</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            Ask a question, attach study material, or turn on Thinking Mode to
            solve complex logic, math, or Japanese grammar.
          </p>
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
              class="rounded-2xl rounded-br-md border border-emerald-500/20 bg-emerald-500/10 px-4 py-3"
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
              class="rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"
                >
                  <Sparkles class="h-3.5 w-3.5" />
                </div>
                <span
                  class="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                >
                  Shinrin AI
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
              <p class="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {{ parseMessageThinking(message).content }}
              </p>

              <!-- Mindmap Visualization Section -->
              <div
                v-if="message.type === 'mindmap' && message.mindmap"
                class="mt-4 overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/70 p-4"
              >
                <div class="mb-3">
                  <p class="text-sm font-semibold text-white">
                    {{ message.mindmap.title }}
                  </p>
                  <p class="mt-0.5 text-[11px] text-slate-500">
                    Generated from your provided material
                  </p>
                </div>

                <div
                  class="overflow-x-auto rounded-lg border border-white/[0.06] bg-black/20 p-4"
                >
                  <div class="min-w-[500px] space-y-2">
                    <div
                      v-for="node in message.mindmap.nodes"
                      :key="node.id"
                      class="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2"
                    >
                      <p class="text-sm font-medium text-slate-200">
                        {{ node.text }}
                      </p>
                    </div>
                  </div>
                </div>
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

        <!-- Thinking / Generation Loading State -->
        <div v-if="loading" class="flex justify-start">
          <div
            class="rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.03] px-4 py-3"
          >
            <div class="flex items-center gap-2">
              <Brain
                v-if="enableThinking"
                class="h-4 w-4 animate-bounce text-emerald-400"
              />
              <Sparkles
                v-else
                class="h-4 w-4 animate-pulse text-emerald-400"
              />
              <span class="text-xs text-slate-400">
                {{
                  enableThinking
                    ? "Reasoning & thinking..."
                    : "Shinrin AI is thinking..."
                }}
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
          class="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2 transition focus-within:border-emerald-500/30 focus-within:bg-white/[0.04]"
        >
          <textarea
            v-model="input"
            rows="3"
            placeholder="Ask Shinrin AI..."
            :disabled="loading"
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
                type="button"
                @click="openFilePicker"
                :disabled="loading"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-40"
                title="Attach files"
              >
                <Paperclip class="h-4 w-4" />
              </button>

              <span class="ml-1 text-[10px] text-slate-600">
                Images, PDFs & documents
              </span>
            </div>

            <button
              type="submit"
              :disabled="loading || (!input.trim() && !attachments.length)"
              class="flex h-8 items-center gap-2 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send class="h-3.5 w-3.5" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>