<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from "vue";

import {
  Check,
  Plus,
  Trash2,
  Clock,
  ListTodo,
} from "@lucide/vue";

import {
  useDailyTodoStore,
  type TodoPriority,
} from "../../stores/dailyToDo";

const todoStore = useDailyTodoStore();

const title = ref("");
const priority = ref<TodoPriority>("medium");
const dueTime = ref<string | null>(null);
const showForm = ref(false);

let midnightTimer: number | null = null;

const sortedTodos = computed(() => {
  const priorityOrder: Record<TodoPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return [...todoStore.todos].sort((a, b) => {
    // Incomplete tasks first.
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Higher priority first.
    const priorityDifference =
      priorityOrder[a.priority] - priorityOrder[b.priority];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    // Tasks with due times first.
    if (a.dueTime && b.dueTime) {
      return a.dueTime.localeCompare(b.dueTime);
    }

    if (a.dueTime) return -1;
    if (b.dueTime) return 1;

    return a.createdAt.localeCompare(b.createdAt);
  });
});

function addTask() {
  const created = todoStore.addTodo(
    title.value,
    priority.value,
    dueTime.value
  );

  if (!created) return;

  title.value = "";
  priority.value = "medium";
  dueTime.value = null;
  showForm.value = false;
}

function checkForNewDay() {
  todoStore.cleanupExpiredTasks();
}

function scheduleMidnightReset() {
  const now = new Date();
  const tomorrow = new Date(now);

  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 50);

  const delay = tomorrow.getTime() - now.getTime();

  midnightTimer = window.setTimeout(() => {
    todoStore.resetForNewDay();
    scheduleMidnightReset();
  }, delay);
}

onMounted(() => {
  checkForNewDay();
  scheduleMidnightReset();
});

onUnmounted(() => {
  if (midnightTimer !== null) {
    window.clearTimeout(midnightTimer);
  }
});
</script>

<template>
  <section
    class="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 border-t-white/20 bg-slate-950/40 p-5 shadow-2xl backdrop-blur-3xl select-none sm:p-6"
  >
    <!-- Top Specular Edge Highlight -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>

    <!-- Liquid Ambient Refraction Orbs -->
    <div class="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl"></div>

    <div class="relative z-10 flex flex-col gap-4">
      
      <!-- Header Bar -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-emerald-400 shadow-inner backdrop-blur-xl">
            <ListTodo class="h-5 w-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          <div>
            <h2 class="text-base font-bold tracking-tight text-white drop-shadow-sm">
              Today's Tasks
            </h2>
            <p class="text-xs font-semibold text-slate-300">
              <span class="text-emerald-400 font-bold">{{ todoStore.completionCount }}</span> of {{ todoStore.totalCount }} completed
            </p>
          </div>
        </div>

        <!-- Add Task Toggle Button -->
        <button
          type="button"
          @click="showForm = !showForm"
          :class="[
            'flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 backdrop-blur-md active:scale-95',
            showForm
              ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-md'
              : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white'
          ]"
          :title="showForm ? 'Close Form' : 'Add Task'"
        >
          <Plus class="h-4 w-4 transition-transform duration-200" :class="{ 'rotate-45': showForm }" />
        </button>
      </div>

      <!-- Glass Progress Bar Container -->
      <div v-if="todoStore.totalCount > 0" class="space-y-1.5">
        <div class="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-black/30 p-0.5 shadow-inner backdrop-blur-md">
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] transition-all duration-500 ease-out"
            :style="{ width: todoStore.completionPercentage + '%' }"
          />
        </div>
      </div>

      <!-- Add Task Form Drawer -->
      <Transition name="fade-slide">
        <form
          v-if="showForm"
          class="space-y-3 rounded-2xl border border-white/15 border-t-white/25 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-2xl"
          @submit.prevent="addTask"
        >
          <input
            v-model="title"
            type="text"
            placeholder="What needs to be done?"
            autofocus
            class="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2.5 text-xs font-medium text-white outline-none placeholder:text-slate-400 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
          />

          <div class="flex flex-wrap gap-2 sm:flex-nowrap">
            <select
              v-model="priority"
              class="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-emerald-500/60"
            >
              <option value="low" class="bg-slate-900 text-white">Low priority</option>
              <option value="medium" class="bg-slate-900 text-white">Medium priority</option>
              <option value="high" class="bg-slate-900 text-white">High priority</option>
            </select>

            <input
              v-model="dueTime"
              type="time"
              class="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-emerald-500/60"
            />
          </div>

          <button
            type="submit"
            :disabled="!title.trim()"
            class="w-full rounded-xl border border-emerald-400/40 bg-emerald-500 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add Task
          </button>
        </form>
      </Transition>

      <!-- Empty State -->
      <div
        v-if="sortedTodos.length === 0 && !showForm"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-8 text-center backdrop-blur-md"
      >
        <p class="text-xs font-medium text-slate-400">
          No tasks scheduled for today.
        </p>

        <button
          type="button"
          class="mt-2 text-xs font-bold text-emerald-400 transition hover:text-emerald-300 hover:underline"
          @click="showForm = true"
        >
          Add your first task
        </button>
      </div>

      <!-- Task List Container (Scrollable with Height Limits) -->
      <div v-else-if="sortedTodos.length > 0" class="custom-scrollbar max-h-52 space-y-2 overflow-y-auto pr-1">
        <div
          v-for="task in sortedTodos"
          :key="task.id"
          class="group flex items-center gap-3 rounded-2xl border border-white/5 border-t-white/10 bg-white/[0.025] p-3 shadow-md backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-white/[0.06]"
          :class="{ 'opacity-50': task.completed }"
        >
          <!-- Custom Glass Checkbox -->
          <button
            type="button"
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all duration-200"
            :class="
              task.completed
                ? 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                : 'border-white/20 bg-white/5 hover:border-emerald-400/50'
            "
            @click="todoStore.toggleTodo(task.id)"
          >
            <Check v-if="task.completed" class="h-3.5 w-3.5 stroke-[3]" />
          </button>

          <!-- Task Details -->
          <div class="min-w-0 flex-1">
            <p
              class="truncate text-xs font-semibold"
              :class="
                task.completed
                  ? 'text-slate-500 line-through'
                  : 'text-slate-100'
              "
            >
              {{ task.title }}
            </p>

            <div class="mt-1 flex items-center gap-2">
              <!-- Priority Glass Badge -->
              <span
                class="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-inner"
                :class="{
                  'border-rose-500/40 bg-rose-500/15 text-rose-300': task.priority === 'high',
                  'border-amber-500/40 bg-amber-500/15 text-amber-300': task.priority === 'medium',
                  'border-white/15 bg-white/5 text-slate-400': task.priority === 'low',
                }"
              >
                {{ task.priority }}
              </span>

              <!-- Due Time Badge -->
              <span
                v-if="task.dueTime"
                class="flex items-center gap-1 text-[11px] font-semibold text-slate-400"
              >
                <Clock class="h-3 w-3 text-cyan-400" />
                {{ task.dueTime }}
              </span>
            </div>
          </div>

          <!-- Delete Action Button -->
          <button
            type="button"
            class="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100"
            @click="todoStore.deleteTodo(task.id)"
            title="Delete task"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>