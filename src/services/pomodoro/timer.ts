export interface TimerCallbacks {
  onTick?: (seconds: number) => void;
  onFinish?: () => void;
}

export class PomodoroTimerEngine {
  private remaining: number;
  private total: number;

  private interval: ReturnType<typeof setInterval> | null =
    null;

  constructor(
    seconds: number,
    private callbacks: TimerCallbacks = {}
  ) {
    this.remaining = seconds;
    this.total = seconds;
  }

  start() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      this.remaining--;

      this.callbacks.onTick?.(this.remaining);

      if (this.remaining <= 0) {
        this.stop();

        this.remaining = 0;

        this.callbacks.onTick?.(0);

        this.callbacks.onFinish?.();
      }
    }, 1000);
  }

  pause() {
    if (!this.interval) return;

    clearInterval(this.interval);

    this.interval = null;
  }

  resume() {
    this.start();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  skip() {
    this.stop();

    this.remaining = 0;

    this.callbacks.onTick?.(0);

    this.callbacks.onFinish?.();
  }

  reset(seconds: number) {
    this.stop();

    this.total = seconds;
    this.remaining = seconds;

    this.callbacks.onTick?.(this.remaining);
  }

  destroy() {
    this.stop();
  }

  getRemainingSeconds() {
    return this.remaining;
  }
  setRemainingSeconds(seconds:number) {
    this.remaining = seconds;
    this.callbacks.onTick?.(seconds);
  }

  getProgress() {
    if (this.total === 0) return 0;

    return (
      (this.total - this.remaining) /
      this.total
    );
  }

  isRunning() {
    return this.interval !== null;
  }
}