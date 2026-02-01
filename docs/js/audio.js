/**
 * audio.js - Tone.js ラッパー
 * Flutter の js_caller.dart + my_audio.js を JavaScript に移植
 */

/**
 * Audio クラス
 * Tone.js を使用した音声再生を管理
 */
class Audio {
  constructor() {
    /** @type {Tone.Synth|null} */
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

      // シンセサイザーを作成
      this._synth = new Tone.Synth({
        oscillator: {
          type: 'triangle'  // 柔らかい音色
        },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.8,
          release: 0.3
        }
      }).toDestination();

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
