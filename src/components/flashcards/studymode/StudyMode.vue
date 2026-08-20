<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { Eye, Layers } from "@lucide/vue";

import { useFlashcardStore } from "../../../stores/flashcardactions";

import StudyCard from "./StudyCard.vue";
import StudyControls from "./StudyControls.vue";
import StudyProgress from "./StudyProgress.vue";
import StudySummary from "./StudySummary.vue";

const flashcards = useFlashcardStore();

onMounted(() => {
  if (!flashcards.studyQueue.length) {
    flashcards.startStudy();
  }
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

const card = computed(() => {
  return flashcards.studyQueue[flashcards.currentStudyIndex];
});

function reveal() {
  flashcards.revealAnswer();
}

function again() {
  flashcards.gradeCard("again");
}

function hard() {
  flashcards.gradeCard("hard");
}

function good() {
  flashcards.gradeCard("good");
}

function easy() {
  flashcards.gradeCard("easy");
}

// Global Keyboard Shortuts for Study Flow
function handleKeyDown(e: KeyboardEvent) {
  // Prevent shortcut trigger when interacting with input elements
  if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
    return;
  }

  if (flashcards.studyFinished || !card.value) return;

  if (!flashcards.studyRevealed) {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      reveal();
    }
  } else {
    if (e.key === "1") again();
    if (e.key === "2") hard();
    if (e.key === "3") good();
    if (e.key === "4") easy();
  }
}
</script>

<template>
  <div class="relative flex h-full w-full flex-col bg-slate-950 text-slate-100 select-none">
    <!-- Finished Screen -->
    <StudySummary v-if="flashcards.studyFinished" />

    <!-- Active Study Session -->
    <template v-else>
      <!-- Top Progress Bar Container -->
      <header class="shrink-0 border-b border-slate-800/80 bg-slate-900/40 px-6 py-4 backdrop-blur-md">
        <StudyProgress
          :current="flashcards.currentStudyIndex + 1"
          :total="flashcards.studyQueue.length"
        />
      </header>

      <!-- Central Card Canvas -->
      <main class="relative flex flex-1 items-center justify-center overflow-hidden p-6 md:p-10">
        <!-- Background Ambient Glow -->
        <div class="pointer-events-none absolute h-72 w-72 rounded-full bg-blue-600/10 blur-3xl"></div>

        <StudyCard
          v-if="card"
          :card="card"
          :revealed="flashcards.studyRevealed"
          class="relative z-10"
        />

        <!-- Empty / Loading State -->
        <div
          v-else
          class="flex flex-col items-center justify-center gap-3 text-center text-slate-500"
        >
          <Layers class="h-10 w-10 animate-pulse text-slate-600" />
          <p class="text-sm font-medium">Preparing cards...</p>
        </div>
      </main>

      <!-- Bottom Control Bar -->
      <footer class="shrink-0 border-t border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md">
        <div class="mx-auto max-w-2xl">
          <!-- Reveal Button State -->
          <div
            v-if="!flashcards.studyRevealed"
            class="flex flex-col items-center gap-2"
          >
            <button
              @click="reveal"
              class="group inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-950/50 transition-all duration-150 hover:bg-emerald-500 hover:shadow-emerald-900/60 active:scale-[0.98]"
            >
              <Eye class="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              <span>Reveal Answer</span>
            </button>

            <!-- Subtle Keyboard Hint -->
            <span class="text-xs font-medium text-slate-500">
              Press <kbd class="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">Space</kbd> or <kbd class="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">Enter</kbd>
            </span>
          </div>

          <!-- Grading Controls State -->
          <div v-else class="flex flex-col items-center gap-2">
            <StudyControls
              @again="again"
              @hard="hard"
              @good="good"
              @easy="easy"
            />

            <!-- Subtle Keyboard Shortcuts Hint -->
            <span class="text-xs font-medium text-slate-500">
              Keys: <kbd class="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">1</kbd> Again &nbsp;•&nbsp; <kbd class="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">2</kbd> Hard &nbsp;•&nbsp; <kbd class="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">3</kbd> Good &nbsp;•&nbsp; <kbd class="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">4</kbd> Easy
            </span>
          </div>
        </div>
      </footer>
    </template>
  </div>
</template>