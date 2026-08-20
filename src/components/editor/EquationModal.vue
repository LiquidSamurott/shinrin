<script setup lang="ts">
import { ref } from "vue";

import type { Editor } from "@tiptap/vue-3";

const props = defineProps<{

    open:boolean;

    editor:Editor;

}>();

const emit=defineEmits<{

    "update:open":[boolean];

}>();

const latex=ref("");

function insert(){

props.editor
.chain()
.focus()
.insertContent({
type:"mathematics",
attrs:{
latex:latex.value
}
})
.run();

latex.value="";

emit("update:open",false);

}
</script>

<template>

<Teleport to="body">

<div
v-if="open"
class="
fixed
inset-0
flex
items-center
justify-center
bg-black/50
"
>

<div
class="
w-96
rounded-xl
bg-slate-900
p-6
"
>

<h2
class="mb-4 text-xl"
>
Insert Equation
</h2>

<textarea
v-model="latex"
class="
h-32
w-full
rounded
bg-slate-800
p-3
"
/>

<div
class="
mt-5
flex
justify-end
gap-2
"
>

<button
@click="emit('update:open',false)"
>
Cancel
</button>

<button
@click="insert"
>
Insert
</button>

</div>

</div>

</div>

</Teleport>

</template>