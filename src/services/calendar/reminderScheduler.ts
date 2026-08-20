// src/services/calendar/calendarReminderScheduler.ts

import { useCalendarStore } from "../../stores/calendar";
import { NotificationService } from "../notification";
import { SoundService } from "../sound";

import {
  buildReminderTitle,
  buildReminderBody,
} from "./reminderNotification";

import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";

// Import your actual sound asset.
// Adjust this path to wherever reminder.mp3 is located.
import reminderSound from "../../assets/sounds/notif1.mp3";

/* ==========================================
   Scheduler State
========================================== */

let timer: number | null = null;

const firedReminders = new Set<string>();

const CHECK_INTERVAL_MS = 15_000;

const GRACE_PERIOD_MS = 15 * 60_000;

/* ==========================================
   Scheduler
========================================== */

export class CalendarReminderScheduler {

  static async start(): Promise<void> {

    if (timer !== null) {
      console.log(
        "[CalendarReminderScheduler] Already running."
      );
      return;
    }

    console.log(
      "[CalendarReminderScheduler] Starting..."
    );

    /* ========================================
       Notification Permission
    ======================================== */

    try {

      let permitted =
        await isPermissionGranted();

      console.log(
        "[CalendarReminderScheduler] Initial permission:",
        permitted
      );

      if (!permitted) {

        const permission =
          await requestPermission();

        console.log(
          "[CalendarReminderScheduler] Permission request:",
          permission
        );

        permitted =
          permission === "granted";
      }

      if (!permitted) {
        console.warn(
          "[CalendarReminderScheduler] Notification permission denied."
        );
      }

    } catch (error) {

      console.error(
        "[CalendarReminderScheduler] Permission check failed:",
        error
      );

    }

    /* ========================================
       Load Calendar
    ======================================== */

    const calendar =
      useCalendarStore();

    try {

      if (!calendar.loaded) {
        await calendar.load();
      }

      console.log(
        "[CalendarReminderScheduler] Calendar loaded.",
        {
          events:
            calendar.events.length,

          reminders:
            calendar.reminders.length,
        }
      );

    } catch (error) {

      console.error(
        "[CalendarReminderScheduler] Failed to load calendar:",
        error
      );

    }

    /* ========================================
       Initial Check
    ======================================== */

    await this.check();

    /* ========================================
       Periodic Check
    ======================================== */

    timer =
      window.setInterval(
        () => {
          void this.check();
        },
        CHECK_INTERVAL_MS
      );

    console.log(
      "[CalendarReminderScheduler] Started."
    );
  }

  /* ==========================================
     Stop
  ========================================== */

  static stop(): void {

    if (timer === null) {
      return;
    }

    window.clearInterval(timer);

    timer = null;

    console.log(
      "[CalendarReminderScheduler] Stopped."
    );
  }

  /* ==========================================
     Check Reminders
  ========================================== */

  static async check(): Promise<void> {

    const calendar =
      useCalendarStore();

    const now =
      Date.now();

    console.log(
      "[CalendarReminderScheduler] Checking reminders...",
      {
        events:
          calendar.events.length,

        reminders:
          calendar.reminders.length,

        now:
          new Date(now).toISOString(),
      }
    );

    for (
      const reminder
      of calendar.reminders
    ) {

      /* ======================================
         Already handled
      ====================================== */

      if (
        reminder.dismissed ||
        firedReminders.has(
          String(reminder.id)
        )
      ) {
        continue;
      }

      /* ======================================
         Find Event
      ====================================== */

      const event =
        calendar.events.find(
          (candidate) =>
            String(candidate.id) ===
            String(reminder.eventId)
        );

      if (!event) {

        console.warn(
          "[CalendarReminderScheduler] Event not found:",
          reminder.eventId
        );

        continue;
      }

      /* ======================================
         Calculate Fire Time
      ====================================== */

      const startMs =
        new Date(
          event.startDate
        ).getTime();

      if (Number.isNaN(startMs)) {

        console.error(
          "[CalendarReminderScheduler] Invalid event date:",
          event.startDate
        );

        continue;
      }

      const minutesBefore =
        Number(
          reminder.minutesBefore
        ) || 0;

      const fireTime =
        startMs -
        minutesBefore * 60_000;

      const difference =
        now - fireTime;

      /* ======================================
         Future Reminder
      ====================================== */

      if (now < fireTime) {
        continue;
      }

      /* ======================================
         Missed Reminder
      ====================================== */

      if (
        GRACE_PERIOD_MS !== null &&
        difference > GRACE_PERIOD_MS
      ) {

        console.log(
          "[CalendarReminderScheduler] Reminder expired:",
          reminder.id
        );

        await calendar.updateReminder({
          ...reminder,
          dismissed: true,
        });

        continue;
      }

      /* ======================================
         Reminder Is Due
      ====================================== */

      console.log(
        "[CalendarReminderScheduler] Reminder is due:",
        reminder.id
      );

      firedReminders.add(
        String(reminder.id)
      );

      try {

        /* ====================================
           1. OS Notification
        ==================================== */

        const notificationSuccess =
          await NotificationService.notify({

            title:
              buildReminderTitle(
                event
              ),

            body:
              buildReminderBody(
                event,
                minutesBefore
              ),

          });

        if (!notificationSuccess) {

          console.error(
            "[CalendarReminderScheduler] Notification failed."
          );

          firedReminders.delete(
            String(reminder.id)
          );

          continue;
        }

        console.log(
          "[CalendarReminderScheduler] Notification sent:",
          event.title
        );

        /* ====================================
           2. Reminder Sound
        ==================================== */

        const soundSuccess =
          await SoundService.play(
            reminderSound,
            {
              volume: 1,
            }
          );

        if (!soundSuccess) {

          console.warn(
            "[CalendarReminderScheduler] Reminder sound could not be played."
          );

        } else {

          console.log(
            "[CalendarReminderScheduler] Reminder sound played."
          );

        }

        /* ====================================
           3. Dismiss Reminder
        ==================================== */

        await calendar.updateReminder({

          ...reminder,

          dismissed:
            true,

        });

      } catch (error) {

        console.error(
          "[CalendarReminderScheduler] Failed to fire reminder:",
          error
        );

        firedReminders.delete(
          String(reminder.id)
        );
      }
    }
  }

  /* ==========================================
     Reset One Reminder
  ========================================== */

  static resetReminder(
    reminderId: string
  ): void {

    firedReminders.delete(
      String(reminderId)
    );
  }

  /* ==========================================
     Reset All
  ========================================== */

  static resetAll(): void {

    firedReminders.clear();
  }
}