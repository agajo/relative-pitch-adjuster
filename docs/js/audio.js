/**
 * audio.js - Tone.js ラッパー
 * Flutter の js_caller.dart + my_audio.js を JavaScript に移植
 */

/** 音色プリセット定義 */
const TIMBRE_PRESETS = {
  // === 基本波形系（倍音減衰なし） ===
  'sine': {
    name: '1. Sine',
    type: 'Synth',
    options: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.3 }
    }
  },
  'triangle': {
    name: '2. Triangle',
    type: 'Synth',
    options: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.3 }
    }
  },
  
  // === FMSynth系（FM合成、倍音が時間で変化） ===
  'fm-bell': {
    name: '3. FM Bell',
    type: 'FMSynth',
    options: {
      harmonicity: 3.01,
      modulationIndex: 14,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 1.4, sustain: 0.4, release: 0.5 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.3 }
    }
  },
  'fm-soft': {
    name: '4. FM Soft',
    type: 'FMSynth',
    options: {
      harmonicity: 2,
      modulationIndex: 3,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.4 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.1, decay: 0.8, sustain: 0.3, release: 0.5 }
    }
  },
  'fm-electric': {
    name: '5. FM Electric',
    type: 'FMSynth',
    options: {
      harmonicity: 1,
      modulationIndex: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.8, sustain: 0.5, release: 0.4 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.01, decay: 1.2, sustain: 0.1, release: 0.5 }
    }
  },
  'fm-warm': {
    name: '6. FM Warm',
    type: 'FMSynth',
    options: {
      harmonicity: 0.5,
      modulationIndex: 5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.03, decay: 0.5, sustain: 0.6, release: 0.4 },
      modulation: { type: 'triangle' },
      modulationEnvelope: { attack: 0.05, decay: 1.0, sustain: 0.2, release: 0.5 }
    }
  },
  
  // === AMSynth系（振幅変調） ===
  'am-tremolo': {
    name: '7. AM Tremolo',
    type: 'AMSynth',
    options: {
      harmonicity: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.7, release: 0.4 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.1, decay: 0.8, sustain: 0.4, release: 0.5 }
    }
  },
  'am-rich': {
    name: '8. AM Rich',
    type: 'AMSynth',
    options: {
      harmonicity: 3,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.6, release: 0.4 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.02, decay: 0.6, sustain: 0.3, release: 0.4 }
    }
  },
  
  // === PolySynth with Filter (フィルター付き) ===
  'filter-mellow': {
    name: '9. Filter Mellow',
    type: 'MonoSynth',
    options: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.4 },
      filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      filterEnvelope: { attack: 0.01, decay: 0.7, sustain: 0.2, release: 0.5, baseFrequency: 300, octaves: 3 }
    }
  },
  'filter-bright': {
    name: '10. Filter Bright',
    type: 'MonoSynth',
    options: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.3 },
      filter: { Q: 1, type: 'lowpass', rolloff: -12 },
      filterEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.4, release: 0.4, baseFrequency: 800, octaves: 2 }
    }
  },
  'filter-pluck': {
    name: '11. Filter Pluck',
    type: 'MonoSynth',
    options: {
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.5, release: 0.3 },
      filter: { Q: 3, type: 'lowpass', rolloff: -24 },
      filterEnvelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.3, baseFrequency: 200, octaves: 4 }
    }
  },
  'filter-pad': {
    name: '12. Filter Pad',
    type: 'MonoSynth',
    options: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.5, sustain: 0.8, release: 0.6 },
      filter: { Q: 1, type: 'lowpass', rolloff: -12 },
      filterEnvelope: { attack: 0.2, decay: 1.0, sustain: 0.5, release: 0.8, baseFrequency: 400, octaves: 2 }
    }
  },
  
  // === カスタム倍音減衰（基本波形＋フィルター） ===
  'harmonic-decay-1': {
    name: '13. Harmonic Decay Light',
    type: 'MonoSynth',
    options: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.8, release: 0.4 },
      filter: { Q: 1, type: 'lowpass', rolloff: -12 },
      filterEnvelope: { attack: 0.01, decay: 1.5, sustain: 0.15, release: 0.5, baseFrequency: 250, octaves: 4 }
    }
  },
  'harmonic-decay-2': {
    name: '14. Harmonic Decay Medium',
    type: 'MonoSynth',
    options: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.75, release: 0.4 },
      filter: { Q: 1.5, type: 'lowpass', rolloff: -24 },
      filterEnvelope: { attack: 0.005, decay: 2.0, sustain: 0.1, release: 0.5, baseFrequency: 200, octaves: 5 }
    }
  },
  'harmonic-decay-3': {
    name: '15. Harmonic Decay Heavy',
    type: 'MonoSynth',
    options: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.7, release: 0.4 },
      filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      filterEnvelope: { attack: 0.001, decay: 2.5, sustain: 0.05, release: 0.5, baseFrequency: 150, octaves: 6 }
    }
  },
  
  // === 複合波形系 ===
  'fat-saw': {
    name: '16. Fat Sawtooth',
    type: 'Synth',
    options: {
      oscillator: { type: 'fatsawtooth', spread: 20, count: 3 },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.7, release: 0.4 }
    }
  },
  'fat-triangle': {
    name: '17. Fat Triangle',
    type: 'Synth',
    options: {
      oscillator: { type: 'fattriangle', spread: 15, count: 3 },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.8, release: 0.3 }
    }
  },
  'pwm': {
    name: '18. PWM',
    type: 'Synth',
    options: {
      oscillator: { type: 'pwm', modulationFrequency: 0.5 },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.7, release: 0.4 }
    }
  },
  
  // === ピアノ風 ===
  'piano-like': {
    name: '19. Piano-like',
    type: 'FMSynth',
    options: {
      harmonicity: 3,
      modulationIndex: 12,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 1.0, sustain: 0.4, release: 0.5 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.005, decay: 1.5, sustain: 0.05, release: 0.5 }
    }
  },
  
  // === オルガン風 ===
  'organ-like': {
    name: '20. Organ-like',
    type: 'Synth',
    options: {
      oscillator: { type: 'sine', partials: [1, 0.5, 0.33, 0.25, 0.2, 0.16] },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.3 }
    }
  }
};

const TIMBRE_STORAGE_KEY = 'relative-pitch-adjuster.timbre';
const DEFAULT_TIMBRE_KEY = 'fm-soft';

/** 現在選択中の音色キー */
let currentTimbreKey = DEFAULT_TIMBRE_KEY;

function loadPersistedTimbre() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const saved = window.localStorage.getItem(TIMBRE_STORAGE_KEY);
  if (saved && TIMBRE_PRESETS[saved]) {
    currentTimbreKey = saved;
  }
}

function persistTimbre(key) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  window.localStorage.setItem(TIMBRE_STORAGE_KEY, key);
}

loadPersistedTimbre();

/**
 * 音色プリセット一覧を取得
 * @returns {Object<string, {name: string}>}
 */
export function getTimbrePresets() {
  return TIMBRE_PRESETS;
}

/**
 * 現在の音色キーを取得
 * @returns {string}
 */
export function getCurrentTimbre() {
  return currentTimbreKey;
}

/**
 * 音色を設定
 * @param {string} key - 音色のキー
 * @param {Audio} audioInstance - Audio インスタンス
 */
export function setTimbre(key, audioInstance) {
  if (!TIMBRE_PRESETS[key]) {
    console.warn(`Unknown timbre key: ${key}`);
    return;
  }
  currentTimbreKey = key;
  persistTimbre(key);
  console.log(`Timbre changed to: ${TIMBRE_PRESETS[key].name}`);
  
  // 再初期化が必要
  if (audioInstance && audioInstance._isInitialized) {
    audioInstance._reinitializeSynth();
  }
}

/**
 * Audio クラス
 * Tone.js を使用した音声再生を管理
 */
class Audio {
  constructor() {
    /** @type {Tone.Synth|Tone.FMSynth|Tone.AMSynth|Tone.MonoSynth|null} */
    this._synth = null;
    
    /** @type {boolean} */
    this._isPlaying = false;
    
    /** @type {number|null} */
    this._stopTimer = null;
    
    /** @type {boolean} */
    this._isInitialized = false;
    
    /** @type {boolean} */
    this._isContextResumed = false;
  }

  /**
   * 現在の音色設定でシンセを作成
   * @private
   * @returns {Tone.Synth|Tone.FMSynth|Tone.AMSynth|Tone.MonoSynth}
   */
  _createSynth() {
    const preset = TIMBRE_PRESETS[currentTimbreKey];
    if (!preset) {
      console.warn(`Unknown timbre, falling back to triangle`);
      return new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.3 }
      }).toDestination();
    }
    
    let synth;
    switch (preset.type) {
      case 'FMSynth':
        synth = new Tone.FMSynth(preset.options).toDestination();
        break;
      case 'AMSynth':
        synth = new Tone.AMSynth(preset.options).toDestination();
        break;
      case 'MonoSynth':
        synth = new Tone.MonoSynth(preset.options).toDestination();
        break;
      case 'Synth':
      default:
        synth = new Tone.Synth(preset.options).toDestination();
        break;
    }
    
    return synth;
  }

  /**
   * シンセを再初期化（音色変更時）
   * @private
   */
  _reinitializeSynth() {
    if (this._synth) {
      if (this._isPlaying) {
        this._synth.triggerRelease();
        this._isPlaying = false;
      }
      this._synth.dispose();
    }
    this._synth = this._createSynth();
    console.log('Synth reinitialized with new timbre');
  }

  /**
   * Tone.js を初期化
   * ユーザーインタラクション後に呼び出す必要がある
   * @returns {Promise<boolean>}
   */
  async initialize() {
    if (this._isInitialized) {
      return true;
    }

    try {
      // AudioContext を resume（ブラウザポリシー対応）
      if (!this._isContextResumed) {
        await Tone.start();
        this._isContextResumed = true;
        console.log('AudioContext resumed');
      }

      // 体感レイテンシを下げる（Tone.js の先読みを抑制）
      // 0.0〜0.01 で調整可。小さすぎると音切れの可能性あり。
      if (Tone.context) {
        Tone.context.lookAhead = 0;
      }

      // シンセサイザーを作成（現在の音色設定を使用）
      this._synth = this._createSynth();

      this._isInitialized = true;
      console.log('Audio initialized');
      return true;
    } catch (e) {
      console.error('Failed to initialize audio:', e);
      return false;
    }
  }

  /**
   * 初期化済みかどうか
   * @returns {boolean}
   */
  get isInitialized() {
    return this._isInitialized;
  }

  /**
   * 音を開始（アタック）
   * @param {number} frequency - 周波数 (Hz)
   */
  play(frequency) {
    if (!this._synth) {
      console.warn('Audio not initialized');
      return;
    }

    try {
      this._synth.triggerAttack(frequency);
      this._isPlaying = true;
    } catch (e) {
      console.error('Failed to play:', e);
    }
  }

  /**
   * 音を停止（リリース）
   */
  stop() {
    if (!this._synth) return;

    try {
      this._synth.triggerRelease();
      this._isPlaying = false;
    } catch (e) {
      console.error('Failed to stop:', e);
    }
  }

  /**
   * 音程を変更（再生中に呼び出す）
   * @param {number} frequency - 周波数 (Hz)
   */
  setNote(frequency) {
    if (!this._synth) return;

    try {
      this._synth.setNote(frequency);
    } catch (e) {
      console.error('Failed to setNote:', e);
    }
  }

  /**
   * 指定時間（2秒）だけ音を再生
   * Wheel Selector でのスクロール時に使用
   * @param {number} frequency - 周波数 (Hz)
   */
  playLong(frequency) {
    if (!this._synth) {
      console.warn('Audio not initialized');
      return;
    }

    // 既存のタイマーをクリア
    if (this._stopTimer !== null) {
      clearTimeout(this._stopTimer);
      this._stopTimer = null;
    }

    try {
      if (this._isPlaying) {
        // 再生中なら音程だけ変更
        this._synth.setNote(frequency);
      } else {
        // 停止中なら再生開始
        this._synth.triggerAttack(frequency);
        this._isPlaying = true;
      }

      // 2秒後に停止
      this._stopTimer = setTimeout(() => {
        this.stop();
        this._stopTimer = null;
      }, 2000);
    } catch (e) {
      console.error('Failed to playLong:', e);
    }
  }

  /**
   * 即座に音を停止してタイマーもクリア
   */
  stopImmediate() {
    if (this._stopTimer !== null) {
      clearTimeout(this._stopTimer);
      this._stopTimer = null;
    }
    this.stop();
  }

  /**
   * 再生中かどうか
   * @returns {boolean}
   */
  get isPlaying() {
    return this._isPlaying;
  }
}

// シングルトンインスタンス
let audioInstance = null;

/**
 * Audio のシングルトンインスタンスを取得
 * @returns {Audio}
 */
export function getAudio() {
  if (!audioInstance) {
    audioInstance = new Audio();
  }
  return audioInstance;
}

/**
 * セント値から周波数を計算
 * @param {number} cent - セント値（Do4 = 0 基準）
 * @param {number} do4Frequency - Do4 の周波数
 * @returns {number} 周波数 (Hz)
 */
export function centToFrequency(cent, do4Frequency) {
  return do4Frequency * Math.pow(2, cent / 1200);
}

/**
 * 周波数からセント値を計算
 * @param {number} frequency - 周波数 (Hz)
 * @param {number} do4Frequency - Do4 の周波数
 * @returns {number} セント値
 */
export function frequencyToCent(frequency, do4Frequency) {
  return 1200 * Math.log2(frequency / do4Frequency);
}

export { Audio };
