/**
 * constants.js - ソルフェージュ定数・音符定義
 * Flutter の solfege_constants.dart を JavaScript に移植
 */

/**
 * ソルフェージュ（階名）の定義
 * 各音階の名前と表示色を管理
 */
export const Solfege = Object.freeze({
  Do:  { name: 'Do',  color: '#ef4444' },  // red-500
  Re:  { name: 'Re',  color: '#f97316' },  // orange-500
  Mi:  { name: 'Mi',  color: '#eab308' },  // yellow-500
  Fa:  { name: 'Fa',  color: '#22c55e' },  // green-500
  Sol: { name: 'Sol', color: '#3b82f6' },  // blue-500
  La:  { name: 'La',  color: '#6366f1' },  // indigo-500
  Si:  { name: 'Si',  color: '#a855f7' },  // purple-500
});

/**
 * 相対音（Relative）の列挙
 * Do3 〜 Do5 の15音をインデックスで管理
 */
export const Relative = Object.freeze({
  Do3:  0,
  Re3:  1,
  Mi3:  2,
  Fa3:  3,
  Sol3: 4,
  La3:  5,
  Si3:  6,
  Do4:  7,   // 基準音
  Re4:  8,
  Mi4:  9,
  Fa4:  10,
  Sol4: 11,
  La4:  12,
  Si4:  13,
  Do5:  14,
});

/**
 * Relative インデックスから名前を取得
 */
export const RelativeNames = Object.freeze([
  'Do3', 'Re3', 'Mi3', 'Fa3', 'Sol3', 'La3', 'Si3',
  'Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5'
]);

/**
 * 音符クラス
 * Relative から Solfege とセント値を導出
 */
export class Note {
  /**
   * @param {Object} solfege - Solfege オブジェクト
   * @param {number} cent - セント値（Do4 = 0 基準）
   */
  constructor(solfege, cent) {
    this.solfege = solfege;
    this.cent = cent;
  }

  /**
   * Relative インデックスから Note を生成
   * @param {number} relativeIndex - Relative のインデックス値
   * @returns {Note}
   */
  static fromRelative(relativeIndex) {
    switch (relativeIndex) {
      case Relative.Do3:
        return new Note(Solfege.Do, -1200);
      case Relative.Re3:
        return new Note(Solfege.Re, -1000);
      case Relative.Mi3:
        return new Note(Solfege.Mi, -800);
      case Relative.Fa3:
        return new Note(Solfege.Fa, -700);
      case Relative.Sol3:
        return new Note(Solfege.Sol, -500);
      case Relative.La3:
        return new Note(Solfege.La, -300);
      case Relative.Si3:
        return new Note(Solfege.Si, -100);
      case Relative.Do4:
        return new Note(Solfege.Do, 0);
      case Relative.Re4:
        return new Note(Solfege.Re, 200);
      case Relative.Mi4:
        return new Note(Solfege.Mi, 400);
      case Relative.Fa4:
        return new Note(Solfege.Fa, 500);
      case Relative.Sol4:
        return new Note(Solfege.Sol, 700);
      case Relative.La4:
        return new Note(Solfege.La, 900);
      case Relative.Si4:
        return new Note(Solfege.Si, 1100);
      case Relative.Do5:
        return new Note(Solfege.Do, 1200);
      default:
        throw new Error(`Invalid relative index: ${relativeIndex}`);
    }
  }

  /**
   * 周波数を計算
   * @param {number} do4Frequency - Do4 の基準周波数
   * @returns {number} 周波数 (Hz)
   */
  frequency(do4Frequency) {
    return do4Frequency * Math.pow(2, this.cent / 1200);
  }

  /**
   * 任意のセント値から周波数を計算（静的メソッド）
   * @param {number} cent - セント値
   * @param {number} do4Frequency - Do4 の基準周波数
   * @returns {number} 周波数 (Hz)
   */
  static centToFrequency(cent, do4Frequency) {
    return do4Frequency * Math.pow(2, cent / 1200);
  }
}

/**
 * 難易度の定義
 */
export const Difficulty = Object.freeze({
  NO_CHECK:  { index: 0, name: 'No Check',   threshold: 10000 },
  EASY:      { index: 1, name: 'Easy',       threshold: 50 },
  NORMAL:    { index: 2, name: 'Normal',     threshold: 30 },
  HARD:      { index: 3, name: 'Hard',       threshold: 10 },
  VERY_HARD: { index: 4, name: 'Very Hard',  threshold: 5 },
});

/**
 * インデックスから難易度を取得
 * @param {number} index
 * @returns {Object}
 */
export function getDifficultyByIndex(index) {
  const difficulties = [
    Difficulty.NO_CHECK,
    Difficulty.EASY,
    Difficulty.NORMAL,
    Difficulty.HARD,
    Difficulty.VERY_HARD
  ];
  return difficulties[index] || Difficulty.EASY;
}

/**
 * Wheel Selector 用の定数
 */
export const WheelConfig = Object.freeze({
  ITEM_COUNT: 3501,         // アイテム数（-1750 〜 +1750）
  ITEM_EXTENT: 15,          // 各アイテムの高さ (px)
  CENTER_INDEX: 1750,       // 中央（0セント）のインデックス
  MIN_CENT: -1750,
  MAX_CENT: 1750,
});

/**
 * インデックスからセント値を計算
 * @param {number} index - Wheel のインデックス
 * @returns {number} セント値
 */
export function indexToCent(index) {
  return index - WheelConfig.CENTER_INDEX;
}

/**
 * セント値からインデックスを計算
 * @param {number} cent - セント値
 * @returns {number} Wheel のインデックス
 */
export function centToIndex(cent) {
  return cent + WheelConfig.CENTER_INDEX;
}
