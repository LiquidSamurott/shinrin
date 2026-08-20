<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code2,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sigma,
  Baseline,
  RotateCcw,
  Undo2,
  Redo2,
} from "@lucide/vue";

const props = defineProps<{
  editor: Editor;
}>();

const emit = defineEmits<{
  (e: "equation"): void;
}>();

const colors = [
  { label: "Black", value: "#000000" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
];
</script>

<template>
  <div class="toolbar">
    <!-- Undo / Redo -->
    <div class="toolbar-group">
      <button
        type="button"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
        title="Undo"
      >
        <Undo2 :size="16" />
      </button>

      <button
        type="button"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
        title="Redo"
      >
        <Redo2 :size="16" />
      </button>
    </div>

    <div class="divider" />

    <!-- Text Formatting -->
    <div class="toolbar-group">
      <button
        type="button"
        :disabled="!editor.isEditable"
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ active: editor.isActive('bold') }"
      >
        <Bold :size="16" />
      </button>

      <button
        type="button"
        :disabled="!editor.isEditable"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ active: editor.isActive('italic') }"
      >
        <Italic :size="16" />
      </button>

      <button
        type="button"
        :disabled="!editor.isEditable"
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ active: editor.isActive('strike') }"
      >
        <Strikethrough :size="16" />
      </button>

      <button
        type="button"
        :disabled="!editor.isEditable"
        @click="editor.chain().focus().toggleHighlight().run()"
        :class="{ active: editor.isActive('highlight') }"
      >
        <Highlighter :size="16" />
      </button>
    </div>

    <div class="divider" />

    <!-- Color Picker -->
    <div class="toolbar-group">
      <div class="color-picker">
        <Baseline :size="16" />

        <button
          v-for="color in colors"
          :key="color.value"
          type="button"
          class="color-dot"
          :style="{ backgroundColor: color.value }"
          :class="{
            active: editor.isActive('textStyle', {
              color: color.value,
            }),
          }"
          @click="
            editor
              .chain()
              .focus()
              .setColor(color.value)
              .run()
          "
          :title="color.label"
        />
      </div>

      <button
        type="button"
        @click="editor.chain().focus().unsetColor().run()"
        title="Clear color"
      >
        <RotateCcw :size="15" />
      </button>
    </div>

    <div class="divider" />

    <!-- Alignment -->
    <div class="toolbar-group">
      <button
        type="button"
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{
          active: editor.isActive({
            textAlign: 'left',
          }),
        }"
      >
        <AlignLeft :size="16" />
      </button>

      <button
        type="button"
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{
          active: editor.isActive({
            textAlign: 'center',
          }),
        }"
      >
        <AlignCenter :size="16" />
      </button>

      <button
        type="button"
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{
          active: editor.isActive({
            textAlign: 'right',
          }),
        }"
      >
        <AlignRight :size="16" />
      </button>
    </div>

    <div class="divider" />

    <!-- Lists -->
    <div class="toolbar-group">
      <button
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ active: editor.isActive('bulletList') }"
      >
        <List :size="16" />
      </button>

      <button
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ active: editor.isActive('orderedList') }"
      >
        <ListOrdered :size="16" />
      </button>

      <button
        type="button"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="{ active: editor.isActive('codeBlock') }"
      >
        <Code2 :size="16" />
      </button>
    </div>

    <div class="toolbar-spacer" />

    <!-- Equation -->
    <div class="toolbar-group">
      <button
        type="button"
        @click="emit('equation')"
        title="Insert Equation"
      >
        <Sigma :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .35rem;

  padding: .6rem;

  background: #0f172a;
  border-bottom: 1px solid #334155;

  box-sizing: border-box;

  position: sticky;
  top: 0;
  z-index: 20;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: .25rem;
}

.toolbar-spacer {
  flex: 1;
}

.divider {
  width: 1px;
  height: 22px;
  background: #334155;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  border: none;
  border-radius: 8px;

  background: transparent;
  color: #94a3b8;

  cursor: pointer;

  transition: all .15s ease;
}

button:hover:not(:disabled) {
  background: #1e293b;
  color: white;
}

button.active {
  background: #2563eb;
  color: white;
}

button:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: .35rem;

  padding: .2rem .45rem;

  border: 1px solid #334155;
  border-radius: 8px;

  background: #1e293b;
}

.color-dot {
  width: 16px;
  height: 16px;

  min-width: 16px;
  min-height: 16px;

  padding: 0;

  border-radius: 50%;
  border: 2px solid transparent;
}

.color-dot:hover {
  transform: scale(1.15);
}

.color-dot.active {
  border-color: white;
  box-shadow: 0 0 0 2px #2563eb;
}
</style>