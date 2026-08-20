import { PomodoroTimerEngine } from "./timer";
import {
  PomodoroSession,
  type SessionType,
} from "./sessions";

import {
  DEFAULT_TIMERS,
  getTimerDuration,
  type PomodoroTimers,
} from "./timers";

import { NotificationService } from "../notification";
import { SoundService } from "../sound";

import notif1 from "../../assets/sounds/notif1.mp3";

export interface PomodoroCallbacks {
  onTick?: (seconds:number)=>void;
  onSessionChange?: (session:SessionType)=>void;
}

export interface PomodoroOptions {
  autoStartBreaks?: ()=>boolean;
  autoStartFocus?: ()=>boolean;
}

export class PomodoroService {
  private timer!: PomodoroTimerEngine;
  private timers:PomodoroTimers = {...DEFAULT_TIMERS};
  private session = new PomodoroSession();
  private currentSession:SessionType = "focus";
  private completedFocusSessions = 0;

  constructor(
    private callbacks:PomodoroCallbacks = {},
    private options:PomodoroOptions = {}
  ) {
    this.createTimer();
  }

  private createTimer() {
    this.timer = new PomodoroTimerEngine(
      getTimerDuration(
        this.currentSession,
        this.timers
      ),
      {
        onTick:(seconds)=>{
          this.callbacks.onTick?.(seconds);
        },

        onFinish:()=>{
          this.finishSession();
        },
      }
    );

    this.callbacks.onTick?.(
      this.timer.getRemainingSeconds()
    );
  }

  updateTimers(timers:PomodoroTimers) {
    this.timers = {...timers};

    if(!this.timer.isRunning()) {
      const duration = getTimerDuration(
        this.currentSession,
        this.timers
      );

      this.timer.reset(duration);

      this.callbacks.onTick?.(
        this.timer.getRemainingSeconds()
      );
    }
  }

  setRemainingSeconds(seconds:number) {
    this.timer.setRemainingSeconds(seconds);

    this.callbacks.onTick?.(seconds);
  }

  private async finishSession() {
    const finishedSession = this.currentSession;

    if(finishedSession === "focus") {
      this.completedFocusSessions++;
    }

    if(NotificationService.isEnabled()) {
      await NotificationService.notify({
        title:"Pomodoro",
        body:
          finishedSession === "focus"
            ? "Focus session complete!"
            : "Break finished!",
      });
    }

    if(SoundService.isEnabled()) {
      await SoundService.play(notif1);
    }

    const next = this.session.nextSession(
      finishedSession,
      this.completedFocusSessions
    );

    this.currentSession = next.session;

    const duration = getTimerDuration(
      this.currentSession,
      this.timers
    );

    this.timer.reset(duration);

    this.callbacks.onSessionChange?.(
      this.currentSession
    );

    this.callbacks.onTick?.(
      this.timer.getRemainingSeconds()
    );

    const isBreak =
      this.currentSession === "shortBreak" ||
      this.currentSession === "longBreak";

    const autoStart = isBreak
      ? this.options.autoStartBreaks?.()
      : this.options.autoStartFocus?.();

    if(autoStart) {
      this.timer.start();
    }
  }

  start() {
    this.timer.start();
  }

  pause() {
    this.timer.pause();
  }

  resume() {
    this.timer.resume();
  }

  stop() {
    this.timer.stop();
  }

  skip() {
    this.finishSession();
  }

  getCurrentSession() {
    return this.currentSession;
  }

  getRemainingSeconds() {
    return this.timer.getRemainingSeconds();
  }

  getProgress() {
    return this.timer.getProgress();
  }

  getCompletedFocusSessions() {
    return this.completedFocusSessions;
  }

  isRunning() {
    return this.timer.isRunning();
  }

  destroy() {
    this.timer.destroy();
  }
}