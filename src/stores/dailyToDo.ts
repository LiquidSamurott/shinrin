import { computed, ref } from "vue";
import { defineStore } from "pinia";

export type TodoPriority = "low" | "medium" | "high";

export interface DailyTodo {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  dueTime: string | null;
  date: string;
  createdAt: string;
}

const STORAGE_KEY = "shinrin-daily-todos";

function getTodayKey(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function loadTodayTodos(): DailyTodo[] {
  const today = getTodayKey();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: DailyTodo[] = JSON.parse(raw);

    // Delete anything belonging to a previous day.
    return parsed.filter(
      (todo) => todo.date === today
    );
  } catch (error) {
    console.error(
      "[DailyTodo] Failed to load todos:",
      error
    );

    return [];
  }
}

export const useDailyTodoStore = defineStore(
  "dailyTodo",
  () => {
    const todos = ref<DailyTodo[]>(
      loadTodayTodos()
    );

    const today = computed(() =>
      getTodayKey()
    );

    const activeTodos = computed(() =>
      todos.value.filter(
        (todo) => !todo.completed
      )
    );

    const completedTodos = computed(() =>
      todos.value.filter(
        (todo) => todo.completed
      )
    );

    const completionCount = computed(
      () => completedTodos.value.length
    );

    const totalCount = computed(
      () => todos.value.length
    );

    const completionPercentage =
      computed(() => {
        if (totalCount.value === 0) {
          return 0;
        }

        return Math.round(
          (completionCount.value /
            totalCount.value) *
            100
        );
      });

    function persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          todos.value
        )
      );
    }

    function cleanupExpiredTasks() {
      const currentDate =
        getTodayKey();

      const validTodos =
        todos.value.filter(
          (todo) =>
            todo.date ===
            currentDate
        );

      if (
        validTodos.length !==
        todos.value.length
      ) {
        todos.value =
          validTodos;

        persist();
      }
    }

    function addTodo(
      title: string,
      priority: TodoPriority = "medium",
      dueTime: string | null = null
    ) {
      const cleanTitle =
        title.trim();

      if (!cleanTitle) {
        return null;
      }

      cleanupExpiredTasks();

      const todo: DailyTodo = {
        id: crypto.randomUUID(),

        title: cleanTitle,

        completed: false,

        priority,

        dueTime,

        date: getTodayKey(),

        createdAt:
          new Date().toISOString(),
      };

      todos.value.push(todo);

      persist();

      return todo;
    }

    function toggleTodo(
      id: string
    ) {
      const todo =
        todos.value.find(
          (item) =>
            item.id === id
        );

      if (!todo) {
        return;
      }

      todo.completed =
        !todo.completed;

      persist();
    }

    function completeTodo(
      id: string
    ) {
      const todo =
        todos.value.find(
          (item) =>
            item.id === id
        );

      if (!todo) {
        return;
      }

      todo.completed = true;

      persist();
    }

    function deleteTodo(
      id: string
    ) {
      todos.value =
        todos.value.filter(
          (todo) =>
            todo.id !== id
        );

      persist();
    }

    function updateTodo(
      id: string,
      updates: Partial<
        Pick<
          DailyTodo,
          | "title"
          | "priority"
          | "dueTime"
        >
      >
    ) {
      const todo =
        todos.value.find(
          (item) =>
            item.id === id
        );

      if (!todo) {
        return;
      }

      Object.assign(
        todo,
        updates
      );

      persist();
    }

    function resetForNewDay() {
      const currentDate =
        getTodayKey();

      todos.value =
        todos.value.filter(
          (todo) =>
            todo.date ===
            currentDate
        );

      persist();
    }

    function clearAll() {
      todos.value = [];

      persist();
    }

    return {
      todos,

      today,

      activeTodos,
      completedTodos,

      completionCount,
      totalCount,
      completionPercentage,

      addTodo,
      toggleTodo,
      completeTodo,
      deleteTodo,
      updateTodo,

      cleanupExpiredTasks,
      resetForNewDay,
      clearAll,
    };
  }
);