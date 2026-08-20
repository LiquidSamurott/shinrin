<script setup lang="ts">
import {
  watch,
  onBeforeUnmount,
  ref,
} from "vue";

import {
  Editor,
  EditorContent,
  Extension,
} from "@tiptap/vue-3";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Mathematics from "@tiptap/extension-mathematics";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Plugin, PluginKey } from "@tiptap/pm/state";

import EditorToolbar from "./EditorToolbar.vue";
import EquationModal from "./EquationModal.vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    editor?: Editor;
    editable?: boolean;
    placeholder?: string;
  }>(),
  {
    editable: true,
    placeholder: "Start writing...",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const equationOpen = ref(false);

/* -------------------------------------------------
   Image Upload / File Processing Handler
-------------------------------------------------- */

/**
 * Process image files safely and insert into editor.
 * Replace `uploadImage` logic if storing on AWS S3 / Cloudinary.
 */
function processImageFile(file: File, viewEditor: Editor) {
  const reader = new FileReader();

  reader.onload = () => {
    viewEditor
      .chain()
      .focus()
      .setImage({ 
        src: reader.result as string, 
        alt: file.name 
      })
      .run();
  };

  reader.readAsDataURL(file);
}
/* -------------------------------------------------
   Custom Tiptap Image Paste & Drop Extension
-------------------------------------------------- */

const ImagePasteDrop = Extension.create({
  name: "imagePasteDrop",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("imagePasteDropPlugin"),
        props: {
          // Prefixed 'view' with '_' to mark it as unused
          handlePaste(_view, event) {
            const items = event.clipboardData?.items;
            if (!items) return false;

            for (const item of items) {
              if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file && localEditor) {
                  event.preventDefault();
                  processImageFile(file, localEditor);
                  return true;
                }
              }
            }
            return false;
          },

          // Prefixed 'view' and 'slice' with '_' to mark them as unused
          handleDrop(_view, event, _slice, moved) {
            if (moved) return false;

            const files = event.dataTransfer?.files;
            if (!files || !files.length) return false;

            for (const file of files) {
              if (file.type.startsWith("image/")) {
                event.preventDefault();
                processImageFile(file, localEditor);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

/* -------------------------------------------------
   Create Editor
-------------------------------------------------- */

const localEditor =
  props.editor ??
  new Editor({
    editable: props.editable,
    content: props.modelValue,

    extensions: [
      StarterKit,

      Placeholder.configure({
        placeholder: props.placeholder,
      }),

      Highlight,

      Image.configure({
        allowBase64: true, // Prevents giant base64 string bloat
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto border border-slate-800 shadow-md my-4",
        },
      }),

      ImagePasteDrop, // Embedded paste & drop handler

      Mathematics,

      TaskList,

      TaskItem.configure({
        nested: true,
      }),

      TextAlign.configure({
        types: ["paragraph", "heading"],
      }),

      Color,
      TextStyleKit,
    ],

    onUpdate({ editor }) {
      emit("update:modelValue", editor.getHTML());
    },
  });

defineExpose({
  editor: localEditor,
});

/* -------------------------------------------------
   Sync Content & Props
-------------------------------------------------- */

watch(
  () => props.modelValue,
  (value) => {
    if (value !== localEditor.getHTML()) {
      localEditor.commands.setContent(value, {
        emitUpdate: false,
      });
    }
  }
);

watch(
  () => props.editable,
  (editable) => {
    localEditor.setEditable(editable);
  },
  {
    immediate: true,
  }
);

/* -------------------------------------------------
   Cleanup
-------------------------------------------------- */

onBeforeUnmount(() => {
  if (!props.editor) {
    localEditor.destroy();
  }
});
</script>

<template>
  <div class="flex h-full w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
    <EditorToolbar
      v-if="props.editable"
      :editor="localEditor"
      @equation="equationOpen = true"
    />

    <div class="flex-1 overflow-hidden">
      <EditorContent
        :editor="localEditor"
        class="rich-editor custom-scrollbar"
      />
    </div>

    <EquationModal
      v-model:open="equationOpen"
      :editor="localEditor"
    />
  </div>
</template>

<style scoped>
.rich-editor {
  flex: 1;
  height: 100%;
  overflow-y: auto;
}

/* Main editor styling */
:deep(.ProseMirror) {
  min-height: 100%;
  height: 100%;
  padding: 1.5rem 2rem;
  color: #f1f5f9;
  outline: none;
  line-height: 1.7;
}

/* Image selection focus state */
:deep(.ProseMirror img.ProseMirror-selectednode) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.5rem;
}

/* Paragraphs */
:deep(.ProseMirror p) {
  margin: 0.75rem 0;
}

/* Headings */
:deep(.ProseMirror h1) {
  font-size: 2rem;
  font-weight: 700;
  margin: 1.25rem 0 0.75rem;
  color: #ffffff;
}

:deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
  color: #ffffff;
}

:deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.85rem 0 0.4rem;
  color: #ffffff;
}

/* Lists */
:deep(.ProseMirror ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

:deep(.ProseMirror ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

/* Blockquote */
:deep(.ProseMirror blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  color: #94a3b8;
  margin: 1rem 0;
}

/* Code Blocks */
:deep(.ProseMirror pre) {
  background: #090d16;
  color: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid rgba(51, 65, 85, 0.5);
}

/* Placeholder */
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #64748b;
  float: left;
  pointer-events: none;
  height: 0;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.4);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.7);
}
</style>