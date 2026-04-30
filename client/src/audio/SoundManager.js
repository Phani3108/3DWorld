import { Howl, Howler } from "howler";
import { SOUNDS } from "./sounds";

class SoundManager {
  constructor() {
    this._howls = {};
    this._defs = {};   // Phase 10G: track definitions (for both static + dynamic registrations)
    this._failed = new Set(); // tracks that failed to load (file 404 etc.)
    this._initialized = false;
    this._masterVolume = 0.7;
    this._categoryVolumes = { music: 0.5, sfx: 0.7, ui: 0.6 };
    this._muted = false;
    this._currentMusic = null;
    this._currentTrackMeta = null; // Phase 10G: { key, title, source, license } for the 🔊 chip
  }

  /** Initialize all Howl instances — call once after first user interaction */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Restore persisted settings
    const stored = (k, fb) => {
      const v = localStorage.getItem(k);
      return v !== null ? parseFloat(v) : fb;
    };
    this._masterVolume = stored("3dworld_vol_master", 0.7);
    this._categoryVolumes.music = stored("3dworld_vol_music", 0.5);
    this._categoryVolumes.sfx = stored("3dworld_vol_sfx", 0.7);
    this._categoryVolumes.ui = stored("3dworld_vol_ui", 0.6);
    this._muted = localStorage.getItem("3dworld_muted") === "true";

    Howler.mute(this._muted);

    for (const [key, def] of Object.entries(SOUNDS)) {
      this._registerOne(key, def);
    }
  }

  /**
   * Phase 10G — register a track def at runtime. Used by registerMusic
   * so catalog-driven city + venue tracks plug in lazily once the user
   * has interacted (init). Idempotent — calling twice with the same key
   * is a no-op.
   */
  _registerOne(key, def) {
    if (this._howls[key]) return; // idempotent
    this._defs[key] = def;
    this._howls[key] = new Howl({
      src: [def.src],
      loop: def.loop || false,
      volume: this._computeVolume(def),
      preload: def.category === "ui",
      onloaderror: () => {
        // Track is missing on disk — flag it so playMusic skips it cleanly.
        this._failed.add(key);
      },
    });
  }

  /** Phase 10G — clear current music (used on city exit). */
  stopMusic() {
    if (!this._currentMusic) return;
    const old = this._howls[this._currentMusic];
    if (old) {
      old.fade(old.volume(), 0, 1200);
      const oldKey = this._currentMusic;
      setTimeout(() => {
        if (this._currentMusic !== oldKey) this._howls[oldKey]?.stop();
      }, 1200);
    }
    this._currentMusic = null;
    this._currentTrackMeta = null;
  }

  /**
   * Phase 10G — register a music track (idempotent). Returns the key.
   * Definition shape: { src, title?, source?, license?, volume?, loop? }
   * Defaults: loop=true, category=music. Title/source/license surface in
   * the 🔊 MusicChip; missing fields just hide the chip's metadata row.
   */
  registerMusic(key, def) {
    if (!key || !def?.src) return null;
    if (!this._defs[key]) {
      this._defs[key] = {
        loop: true,
        volume: 0.5,
        category: "music",
        ...def,
      };
      if (this._initialized) this._registerOne(key, this._defs[key]);
    }
    return key;
  }

  _computeVolume(def) {
    const catVol = this._categoryVolumes[def.category] ?? 1;
    return (def.volume ?? 1) * catVol * this._masterVolume;
  }

  /** Play a sound by key. Returns the Howl sound ID. */
  play(key) {
    if (!this._initialized) return;
    const howl = this._howls[key];
    if (!howl) return;
    return howl.play();
  }

  /** Stop a sound by key */
  stop(key) {
    if (!this._initialized) return;
    this._howls[key]?.stop();
  }

  /**
   * Play background music with crossfade. Phase 10G: skips tracks that
   * failed to load (file 404) so missing assets degrade gracefully —
   * caller can chain via tryPlayFirstAvailable() to fall back to a
   * city ambient or silence.
   *
   * @param {string} key
   * @param {object} [opts] — { duck: 0..1 } overrides volume mul (used by venues with cityVolumeDuck)
   * @returns {boolean} true if playback started, false if track is missing
   */
  playMusic(key, opts = {}) {
    if (!this._initialized) return false;
    if (this._currentMusic === key) return true;
    if (this._failed.has(key)) return false; // 404 — caller should try fallback
    const howl = this._howls[key];
    const def  = this._defs[key];
    if (!howl || !def) return false;

    // Fade out current music
    if (this._currentMusic && this._howls[this._currentMusic]) {
      const old = this._howls[this._currentMusic];
      old.fade(old.volume(), 0, 1500);
      const oldKey = this._currentMusic;
      setTimeout(() => {
        if (this._currentMusic !== oldKey) {
          this._howls[oldKey]?.stop();
        }
      }, 1500);
    }

    this._currentMusic = key;
    this._currentTrackMeta = {
      key,
      title:   def.title   || null,
      source:  def.source  || null,
      license: def.license || null,
    };
    const ductMul = typeof opts.duck === "number" ? Math.max(0, Math.min(1, 1 - opts.duck)) : 1;
    const targetVol = this._computeVolume(def) * ductMul;
    howl.volume(0);
    howl.play();
    howl.fade(0, targetVol, 1500);
    return true;
  }

  /**
   * Phase 10G — try a sequence of music keys, play the first that loads.
   * Intended use:
   *   playFirstAvailable(["venue_paradise_biryani", "city_hyderabad", "ambient_room"])
   *
   * Treats already-failed (404'd) tracks as miss. Returns the key that
   * played, or null if nothing did.
   */
  playFirstAvailable(keys, opts) {
    if (!Array.isArray(keys)) return null;
    for (const k of keys) {
      if (this._failed.has(k)) continue;
      if (this.playMusic(k, opts)) return k;
    }
    return null;
  }

  /** @returns {{key, title, source, license}|null} the currently playing track meta. */
  get currentTrack() {
    if (!this._currentMusic) return null;
    return this._currentTrackMeta;
  }

  /** Update volume for a category and recompute all affected Howl volumes */
  setVolume(category, value) {
    if (category === "master") {
      this._masterVolume = value;
      localStorage.setItem("3dworld_vol_master", value);
    } else {
      this._categoryVolumes[category] = value;
      localStorage.setItem(`3dworld_vol_${category}`, value);
    }
    this._updateAllVolumes();
  }

  _updateAllVolumes() {
    // Walk all known defs (static SOUNDS + dynamically registered music)
    for (const [key, def] of Object.entries(this._defs)) {
      const howl = this._howls[key];
      if (howl) howl.volume(this._computeVolume(def));
    }
  }

  /** Toggle global mute */
  setMuted(muted) {
    this._muted = muted;
    localStorage.setItem("3dworld_muted", muted);
    Howler.mute(muted);
  }

  get muted() {
    return this._muted;
  }

  get initialized() {
    return this._initialized;
  }
}

// Singleton instance — lives outside React lifecycle
const soundManager = new SoundManager();
export default soundManager;
