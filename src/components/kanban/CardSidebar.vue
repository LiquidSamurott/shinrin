<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Calendar,
  Tag,
  Star,
  Paperclip,
  Bot,
  Sparkles,
  Timer,
  Trash2,
  ChevronRight,
} from "@lucide/vue";

import { useKanbanStore } from "../../stores/kanbanactions/kanban";
import LabelModal from "./LabelModal.vue";
import KanbanAIAssistant from "./KanbanAIAssistant.vue";
import KanbanFlashcardGenerator from "./KanbanFlashcardGenerator.vue";

const kanban = useKanbanStore();

const card = computed(() => kanban.selectedCard ?? null);

const showLabels = ref(false);
const showAiAssistant = ref(false);
const showFlashcardGenerator = ref(false);

const cardLabels = computed(() => {
  if (!card.value) return [];

  return kanban.labels.filter((label) =>
    card.value!.labels.includes(label.id)
  );
});

/* ============================================================
   CARD ACTIONS
============================================================ */

function deleteCard() {
  if (!card.value) return;

  kanban.deleteCard(card.value.id);
  kanban.closeCard();
}

function toggleFavorite() {
  if (!card.value) return;

  kanban.toggleFavorite(card.value.id);
}

/* ============================================================
   AI ASSISTANT
============================================================ */

function openAiAssistant() {
  if (!card.value) return;

  showAiAssistant.value = true;
}

function closeAiAssistant() {
  showAiAssistant.value = false;
}

/* ============================================================
   FLASHCARD GENERATOR
============================================================ */

function openFlashcardGenerator() {
  if (!card.value) return;

  showFlashcardGenerator.value = true;
}

function closeFlashcardGenerator() {
  showFlashcardGenerator.value = false;
}
</script>

<<template>
  <aside class="flex w-80 shrink-0 flex-col border-l border-white/[0.07] bg-slate-950/80 backdrop-blur-2xl">
    <!-- Header -->
    <div class="border-b border-white/[0.07] px-5 py-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Card</p>
          <h2 class="mt-1 text-sm font-semibold text-slate-100">Properties</h2>
        </div>
        <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
          <Sparkles class="h-4 w-4 text-emerald-400" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-4 py-5">
      <!-- Organization -->
      <section>
        <p class="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Organization</p>

        <div class="space-y-1.5">
          <!-- Due Date -->
          <button type="button" class="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.05] active:scale-[0.99]">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 transition-colors group-hover:bg-sky-500/15">
              <Calendar class="h-4 w-4" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-200">Due Date</p>
              <p class="mt-0.5 text-[11px] text-slate-500">Set a deadline</p>
            </div>
            <ChevronRight class="h-4 w-4 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
          </button>

          <!-- Labels -->
          <button type="button" @click="showLabels = true" class="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.05] active:scale-[0.99]">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/15">
              <Tag class="h-4 w-4" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-200">Labels</p>
              <p class="mt-0.5 text-[11px] text-slate-500">Organize this card</p>
            </div>
            <ChevronRight class="h-4 w-4 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
          </button>

          <!-- Active Labels -->
          <div v-if="cardLabels.length" class="ml-11 flex flex-wrap gap-1.5 pb-1">
            <span v-for="label in cardLabels" :key="label.id" class="inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-medium" :style="{ backgroundColor: label.color + '18', borderColor: label.color + '40', color: label.color }">
              {{ label.name }}
            </span>
          </div>

          <!-- Favorite -->
          <button type="button" @click="toggleFavorite" :class="['group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 active:scale-[0.99]', card?.favorite ? 'border-amber-500/20 bg-amber-500/[0.07]' : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.05]']">
            <div :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors', card?.favorite ? 'bg-amber-500/15 text-amber-400' : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-300']">
              <Star class="h-4 w-4" :class="card?.favorite ? 'fill-amber-400' : ''" />
            </div>
            <div class="min-w-0 flex-1">
              <p :class="card?.favorite ? 'text-sm font-medium text-amber-300' : 'text-sm font-medium text-slate-200'">
                {{ card?.favorite ? "Favorited" : "Favorite" }}
              </p>
              <p class="mt-0.5 text-[11px] text-slate-500">
                {{ card?.favorite ? "Saved to favorites" : "Save for later" }}
              </p>
            </div>
          </button>

          <!-- Attachments -->
          <button type="button" class="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.05] active:scale-[0.99]">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-500/10 text-slate-400 transition-colors group-hover:bg-slate-500/15">
              <Paperclip class="h-4 w-4" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-200">Attachments</p>
              <p class="mt-0.5 text-[11px] text-slate-500">Files and references</p>
            </div>
            <ChevronRight class="h-4 w-4 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
          </button>
        </div>
      </section>

      <!-- Productivity -->
      <section class="mt-7">
        <div class="mb-2 flex items-center justify-between px-1">
          <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Productivity</p>
          <span class="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">AI</span>
        </div>

        <div class="space-y-2">
          <!-- AI Assistant -->
          <button type="button" :disabled="!card" @click="openAiAssistant" class="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.10] to-cyan-500/[0.06] px-3 py-3 text-left transition-all duration-200 hover:border-emerald-400/30 hover:from-emerald-500/[0.15] hover:to-cyan-500/[0.10] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 transition-transform duration-200 group-hover:scale-105">
              <Bot class="h-4 w-4" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-emerald-100">AI Assistant</p>
              <p class="mt-0.5 text-[11px] text-emerald-300/50">Improve & generate content</p>
            </div>
            <Sparkles class="h-4 w-4 text-emerald-400/50 transition-all duration-200 group-hover:rotate-12 group-hover:text-emerald-300" />
          </button>

          <!-- Generate Flashcards -->
          <button type="button" :disabled="!card" @click="openFlashcardGenerator" class="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.05] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-400 transition-colors group-hover:bg-fuchsia-500/15">
              <Sparkles class="h-4 w-4" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-200">Generate Flashcards</p>
              <p class="mt-0.5 text-[11px] text-slate-500">Create cards from this content</p>
            </div>
            <ChevronRight class="h-4 w-4 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
          </button>

          <!-- Pomodoro -->
          <button type="button" class="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.05] active:scale-[0.99]">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500/15">
              <Timer class="h-4 w-4" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-200">Start Pomodoro</p>
              <p class="mt-0.5 text-[11px] text-slate-500">Focus on this task</p>
            </div>
            <ChevronRight class="h-4 w-4 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
          </button>
        </div>
      </section>
    </div>

    <!-- Danger Zone -->
    <div class="border-t border-white/[0.07] p-4">
      <p class="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-500/60">Danger Zone</p>
      <button type="button" @click="deleteCard" class="group flex w-full items-center gap-3 rounded-xl border border-rose-500/10 bg-rose-500/[0.04] px-3 py-3 text-left transition-all duration-200 hover:border-rose-500/25 hover:bg-rose-500/[0.08] active:scale-[0.99]">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 transition-transform duration-200 group-hover:scale-105">
          <Trash2 class="h-4 w-4" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-rose-300">Delete Card</p>
          <p class="mt-0.5 text-[11px] text-rose-400/40">Permanently remove this card</p>
        </div>
      </button>
    </div>

    <!-- Label Modal -->
    <LabelModal :show="showLabels" @close="showLabels = false" />

    <!-- AI Assistant Modal -->
    <KanbanAIAssistant :show="showAiAssistant" :card="card" @close="closeAiAssistant" />

    <!-- Flashcard Generator Modal -->
    <KanbanFlashcardGenerator :show="showFlashcardGenerator" :card="card" @close="closeFlashcardGenerator" />
  </aside>
</template>