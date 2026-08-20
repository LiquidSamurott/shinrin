// services/notification.ts

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
}

export interface NotificationConfig {
  enabled: boolean;
  defaultIcon?: string;
}

export class NotificationService {
  private static config: NotificationConfig = {
    enabled: true,
    defaultIcon: undefined,
  };

  /* =====================================
     Configuration
  ===================================== */

  static configure(config: Partial<NotificationConfig>) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  static enable() {
    this.config.enabled = true;
  }

  static disable() {
    this.config.enabled = false;
  }

  static setEnabled(value: boolean) {
    this.config.enabled = value;
  }

  static isEnabled() {
    return this.config.enabled;
  }

  static getConfig() {
    return { ...this.config };
  }

  /* =====================================
     Permission
  ===================================== */

  static async ensurePermission(): Promise<boolean> {
    try {
      let granted = await isPermissionGranted();

      if (!granted) {
        const permission = await requestPermission();
        granted = permission === "granted";
      }

      return granted;
    } catch (error) {
      console.error("[NotificationService] Failed to check permissions:", error);
      return false;
    }
  }

  /* =====================================
     Notification
  ===================================== */

 static async notify(
  options: NotificationOptions
): Promise<boolean> {
  if (!this.config.enabled) {
    return false;
  }
  const granted =
    await this.ensurePermission();
  if (!granted) {
    console.warn(
      "[NotificationService] Permission denied."
    );
    return false;
  }

  try {

    await sendNotification({
      title: options.title,
      body: options.body,

      icon:
        options.icon ??
        this.config.defaultIcon,

    });
    console.log(
      "[NotificationService] Notification sent."
    );

    return true;
  } catch (error) {

    console.error(
      "[NotificationService] Failed:",
      error
    );

    return false;
  }
}
  /* =====================================
     Convenience
  ===================================== */

  static success(title: string, body?: string) {
    return this.notify({ title, body });
  }

  static info(title: string, body?: string) {
    return this.notify({ title, body });
  }

  static warning(title: string, body?: string) {
    return this.notify({ title, body });
  }

  static error(title: string, body?: string) {
    return this.notify({ title, body });
  }

  /* =====================================
     Presets
  ===================================== */

  static async pomodoroFinished() {
    return this.notify({
      title: "Pomodoro",
      body: "Focus session complete!",
    });
  }

  static async breakFinished() {
    return this.notify({
      title: "Pomodoro",
      body: "Break finished!",
    });
  }

  static async reminder(title: string, body: string) {
    return this.notify({ title, body });
  }

  static async taskCompleted(task: string) {
    return this.notify({
      title: "Task Completed",
      body: task,
    });
  }
}