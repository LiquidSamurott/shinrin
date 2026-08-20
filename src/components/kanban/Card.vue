<script setup lang="ts">
import { computed } from "vue";
import { Calendar, Tag } from "@lucide/vue";
import type { Card as KanbanCard } from "../../types/kanban";
import { useKanbanStore } from "../../stores/kanbanactions/kanban";

const props = defineProps<{
  card: KanbanCard;
}>();

const kanban = useKanbanStore();

const labels = computed(() =>
  kanban.labels.filter(label =>
    props.card.labels.includes(label.id)
  )
);

function openCard() {
  kanban.openCard(props.card.id);
}
</script>

<template>
  <div
    @click="openCard"
    class="
      group
      relative
      cursor-pointer
      rounded-2xl
      border
      border-white/10
      bg-slate-900/60
      p-4.5
      shadow-md
      backdrop-blur-md
      transition-all
      duration-200
      hover:-translate-y-1
      accent-border-hover
      hover:bg-slate-900/80
      hover:shadow-xl
      hover:shadow-[var(--accent-500)]/10
      active:scale-[0.99]
    "
  >
    <!-- Title -->
    <h3 class="text-base font-semibold text-slate-100 transition-colors duration-200 group-hover:text-white">
      {{ card.title }}
    </h3>

    <!-- Description -->
    <p class="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-400 font-normal">
      {{ card.description || "No description yet..." }}
    </p>

    <!-- Footer -->
    <div class="mt-4 flex items-center justify-between gap-3 pt-2 border-t border-white/5">

      <!-- Labels -->
      <div class="flex flex-wrap items-center gap-1.5">
        <span
          v-for="label in labels"
          :key="label.id"
          class="
            inline-flex
            items-center
            rounded-md
            px-2
            py-0.5
            text-[10px]
            font-medium
            text-white
            shadow-sm
            backdrop-blur-md
            whitespace-nowrap
          "
          :style="{
            backgroundColor: label.color + '33', // 20% opacity background
            borderColor: label.color + '66',     // 40% opacity border
            color: label.color,                  // Dynamic text color matching badge
            borderWidth: '1px'
          }"
        >
          {{ label.name }}
        </span>

        <span
          v-if="labels.length === 0"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500"
        >
          <Tag class="h-3 w-3 text-slate-600" />
          No Labels
        </span>
      </div>

      <!-- Updated Date -->
      <div class="flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-500">
        <Calendar class="h-3 w-3 text-slate-600" />
        <span>{{ new Date(card.updatedAt).toLocaleDateString() }}</span>
      </div>

    </div>
  </div>
</template>