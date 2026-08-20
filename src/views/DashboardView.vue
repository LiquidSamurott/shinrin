<script setup lang="ts">
import DailyTodo from "../components/dashboard/dailyToDo.vue";
import calendarAgenda from "../components/dashboard/calendarAgenda.vue";
import ClockWidget from "../components/dashboard/ClockWidget.vue";
import DashboardCalendarOverview from "../components/dashboard/dashboardCalendarOverview.vue";
import PomodoroStatsWidget from "../components/dashboard/pomodoroStatsWidget.vue";
import QuickNotes from "../components/dashboard/quickNotes.vue";
</script>

<template>
  <div class="min-h-screen w-full bg-slate-950 p-4 sm:p-6 lg:p-8 text-slate-100 selection:bg-cyan-500/30">
    
    <!-- Ambient Background Light Orbs (Gives glass cards vivid depth) -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[130px]"></div>
      <div class="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[140px]"></div>
      <div class="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[130px]"></div>
    </div>

    <!-- Header Bar -->
    <header class="relative z-10 mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-white drop-shadow-md sm:text-3xl">
          Dashboard
        </h1>
        <p class="text-xs font-medium text-slate-400">
          Welcome back · Here is your daily overview
        </p>
      </div>
    </header>

    <!-- Main Grid Layout -->
    <main class="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
      
      <!-- Left Column: Tasks & Agenda (7 Columns) -->
      <div class="flex flex-col gap-6 lg:col-span-7">
        <!-- Daily Tasks (Given proper min-height so tasks render cleanly) -->
        <DailyTodo class="min-h-[280px] w-full shadow-2xl transition-all duration-300 hover:border-white/20" />
        
        <!-- Agenda (Scales smoothly when empty or populated) -->
        <calendarAgenda class="min-h-[220px] w-full flex-1 shadow-2xl transition-all duration-300 hover:border-white/20" />
      </div>

      <!-- Right Column: Time, Calendar Overview & Quick Notes (5 Columns) -->
      <div class="flex flex-col gap-6 lg:col-span-5">
        <ClockWidget class="w-full shadow-2xl transition-all duration-300 hover:border-white/20" />
        <DashboardCalendarOverview class="w-full shadow-2xl transition-all duration-300 hover:border-white/20" />
        <QuickNotes class="w-full shadow-2xl transition-all duration-300 hover:border-white/20" />
      </div>

      <!-- Bottom Banner: Study/Pomodoro Stats (12 Columns) -->
      <div class="lg:col-span-12">
        <PomodoroStatsWidget class="w-full shadow-2xl transition-all duration-300 hover:border-white/20" />
      </div>

    </main>
  </div>
</template>