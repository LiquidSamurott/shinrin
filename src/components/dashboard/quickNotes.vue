<script setup lang="ts">
import { computed, ref } from "vue";

import {
  StickyNote,
  Plus,
  Trash2,
  Check,
  X,
} from "@lucide/vue";

/* ==========================================
   Types
========================================== */

interface QuickNote {
  id: string;
  text: string;
  createdAt: number;
}

/* ==========================================
   State
========================================== */

const STORAGE_KEY = "shinrin-quick-notes";

const notes = ref<QuickNote[]>(loadNotes());
const newNote = ref("");
const isAdding = ref(false);

/* ==========================================
   Storage
========================================== */

function loadNotes(): QuickNote[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      "[QuickNotes] Failed to load notes:",
      error
    );

    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notes.value)
    );
  } catch (error) {
    console.error(
      "[QuickNotes] Failed to save notes:",
      error
    );
  }
}

/* ==========================================
   Computed
========================================== */

const recentNotes = computed(() =>
  [...notes.value]
    .sort(
      (a, b) =>
        b.createdAt - a.createdAt
    )
    .slice(0, 4)
);

/* ==========================================
   Actions
========================================== */

function addNote() {
  const text = newNote.value.trim();

  if (!text) {
    return;
  }

  notes.value.unshift({
    id:
      crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random()}`,

    text,

    createdAt:
      Date.now(),
  });

  newNote.value = "";
  isAdding.value = false;

  saveNotes();
}

function deleteNote(id: string) {
  notes.value =
    notes.value.filter(
      (note) => note.id !== id
    );

  saveNotes();
}

function cancelAdd() {
  newNote.value = "";
  isAdding.value = false;
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-white/10 border-t-white/20 bg-slate-950/40 p-6 shadow-2xl backdrop-blur-3xl select-none"
  >
    <!-- Specular Top Edge Light Refraction -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>

    <!-- Liquid Refraction Light Orbs -->
    <div class="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl"></div>

    <!-- Header -->
    <div class="relative z-10 mb-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-400 shadow-inner backdrop-blur-xl"
        >
          <StickyNote class="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
        </div>

        <div>
          <h2 class="text-base font-bold tracking-tight text-white drop-shadow-sm">
            Quick Notes
          </h2>

          <p class="text-xs font-medium text-white/50">
            Capture something quickly
          </p>
        </div>
      </div>

      <button
        v-if="!isAdding"
        type="button"
        @click="isAdding = true"
        class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 backdrop-blur-md transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-500/15 hover:text-cyan-300 active:scale-95"
        title="New note"
      >
        <Plus class="h-4.5 w-4.5" />
      </button>
    </div>

    <!-- New Note Glass Drawer -->
    <Transition name="fade-slide">
      <div
        v-if="isAdding"
        class="relative z-10 mb-4 rounded-2xl border border-white/15 border-t-white/25 bg-white/[0.03] p-3.5 shadow-xl backdrop-blur-2xl"
      >
        <textarea
          v-model="newNote"
          autofocus
          rows="3"
          placeholder="Write a quick note..."
          class="w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 p-3 text-xs font-medium text-white outline-none placeholder:text-white/30 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
          @keydown.ctrl.enter="addNote"
          @keydown.meta.enter="addNote"
        />

        <div class="mt-3 flex items-center justify-between">
          <span class="text-[10px] font-semibold text-white/40">
            Ctrl + Enter to save
          </span>

          <div class="flex gap-2">
            <button
              type="button"
              @click="cancelAdd"
              class="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/5 hover:text-white active:scale-95"
            >
              <X class="h-3.5 w-3.5" />
              Cancel
            </button>

            <button
              type="button"
              @click="addNote"
              :disabled="!newNote.trim()"
              class="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/80 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check class="h-3.5 w-3.5 stroke-[3]" />
              Save
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Recent Notes Feed -->
    <div
      v-if="recentNotes.length"
      class="relative z-10 space-y-2.5"
    >
      <div
        v-for="note in recentNotes"
        :key="note.id"
        class="group relative rounded-2xl border border-white/5 border-t-white/10 bg-white/[0.02] p-3.5 shadow-md backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-white/[0.06]"
      >
        <div class="flex items-start gap-3">
          <!-- Glowing Cyan Indicator -->
          <div
            class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          />

          <div class="min-w-0 flex-1">
            <p class="whitespace-pre-wrap break-words text-xs leading-relaxed font-medium text-white/90">
              {{ note.text }}
            </p>

            <p class="mt-2 text-[10px] font-semibold text-white/40">
              {{ formatTime(note.createdAt) }}
            </p>
          </div>

          <!-- Glass Delete Action Button -->
          <button
            type="button"
            @click="deleteNote(note.id)"
            class="shrink-0 rounded-lg p-1.5 text-white/30 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100"
            title="Delete note"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p
        v-if="notes.length > 4"
        class="pt-1 text-center text-[10px] font-semibold tracking-wider text-white/40 uppercase"
      >
        Showing 4 most recent notes
      </p>
    </div>

    <!-- Liquid Empty State Button -->
    <button
      v-else-if="!isAdding"
      type="button"
      @click="isAdding = true"
      class="relative z-10 flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-500/[0.04] hover:shadow-lg active:scale-[0.99]"
    >
      <StickyNote class="mb-2 h-5 w-5 text-white/30 transition duration-200" />

      <span class="text-xs font-semibold text-white/70">
        No quick notes yet
      </span>

      <span class="mt-0.5 text-[10px] text-white/40">
        Click to create one
      </span>
    </button>
  </section>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-in-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>