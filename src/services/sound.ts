// services/sound.ts

export interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

export interface SoundConfig {
  enabled: boolean;
  masterVolume: number;
}

export class SoundService {
  /* =====================================
     Configuration
  ===================================== */

  private static config: SoundConfig = {
    enabled: true,
    masterVolume: 1,
  };

  static configure(
    config: Partial<SoundConfig>
  ) {
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

  static setMasterVolume(
    volume: number
  ) {
    this.config.masterVolume = Math.max(
      0,
      Math.min(1, volume)
    );

    for (const audio of this.cache.values()) {
      audio.volume =
        this.config.masterVolume;
    }
  }

  static getMasterVolume() {
    return this.config.masterVolume;
  }

  /* =====================================
     Audio Cache
  ===================================== */

  private static cache = new Map<
    string,
    HTMLAudioElement
  >();

  private static getAudio(
    src: string
  ): HTMLAudioElement {
    let audio =
      this.cache.get(src);

    if (!audio) {
      audio = new Audio(src);

      audio.preload = "auto";

      this.cache.set(src, audio);
    }

    return audio;
  }

  /* =====================================
     Playback
  ===================================== */

  static async play(
  src: string,
  options: SoundOptions = {}
): Promise<boolean> {

  if (!this.config.enabled) {
    return false;
  }

  const audio =
    this.getAudio(src);

  audio.pause();
  audio.currentTime = 0;

  audio.loop =
    options.loop ?? false;

  audio.volume =
    (options.volume ?? 1) *
    this.config.masterVolume;

  try {

    await audio.play();

    return true;

  } catch (err) {

    console.warn(
      "[SoundService] Failed to play sound:",
      err
    );

    return false;
  }
}

  static async resume(
    src: string
  ) {
    if (!this.config.enabled)
      return;

    const audio =
      this.cache.get(src);

    if (!audio) return;

    try {
      await audio.play();
    } catch (err) {
      console.warn(
        "[SoundService]",
        err
      );
    }
  }

  static pause(src: string) {
    this.cache.get(src)?.pause();
  }

  static stop(src: string) {
    const audio =
      this.cache.get(src);

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }

  /* =====================================
     Volume
  ===================================== */

  static setVolume(
    src: string,
    volume: number
  ) {
    const audio =
      this.cache.get(src);

    if (!audio) return;

    audio.volume =
      Math.max(
        0,
        Math.min(1, volume)
      ) *
      this.config.masterVolume;
  }

  static mute(src: string) {
    const audio =
      this.cache.get(src);

    if (!audio) return;

    audio.muted = true;
  }

  static unmute(src: string) {
    const audio =
      this.cache.get(src);

    if (!audio) return;

    audio.muted = false;
  }

  /* =====================================
     Status
  ===================================== */

  static isPlaying(
    src: string
  ): boolean {
    const audio =
      this.cache.get(src);

    if (!audio) return false;

    return !audio.paused;
  }

  static has(src: string) {
    return this.cache.has(src);
  }

  /* =====================================
     Cleanup
  ===================================== */

  static destroy(src: string) {
    const audio =
      this.cache.get(src);

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    this.cache.delete(src);
  }

  static destroyAll() {
    for (const audio of this.cache.values()) {
      audio.pause();
      audio.currentTime = 0;
    }

    this.cache.clear();
  }

  /* =====================================
     Convenience Sounds
  ===================================== */

  static playSuccess(src: string) {
    return this.play(src, {
      volume: 0.7,
    });
  }

  static playWarning(src: string) {
    return this.play(src, {
      volume: 0.8,
    });
  }

  static playError(src: string) {
    return this.play(src, {
      volume: 1,
    });
  }

  static playLoop(src: string) {
    return this.play(src, {
      loop: true,
    });
  }
}