<script setup lang="ts">
defineProps<{
  time: string;
  progress: number;
}>();
</script>


<template>
  <div class="flex flex-col items-center justify-center">

    <div class="text-5xl font-bold tracking-widest text-white">
      {{ time }}
    </div>

  </div>
</template>