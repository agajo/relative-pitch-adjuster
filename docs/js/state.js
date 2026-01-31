/**
 * state.js - アプリケーション状態管理
 * Flutter の question_notifier.dart を JavaScript に移植
 */

import { 
  Relative, 
  RelativeNames, 
  Note, 
  Difficulty, 
  getDifficultyByIndex,
  WheelConfig,
  centToIndex
} from './constants.js';

/**
 * 問題生成アルゴリズム
 * Flutter の _generateRelativeIndexes() を移植
 * @returns {number[]} 3つの Relative インデックスの配列
 */
function generateRelativeIndexes() {
  let isOK;
  let temp;
  
  do {
    isOK = true;
    // 3つのランダムな音符インデックスを生成
    temp = Array.from({ length: 3 }, () => 
      Math.floor(Math.random() * Object.keys(Relative).length)
    );
    
    // 条件1: 最後の音符は Do4 から ±4 以内
    if (temp[2] === Relative.Do4 || Math.abs(temp[2] - Relative.Do4) > 4) {
      isOK = false;
    }
    
    // 条件2: Fa3, La3, Fa4, La4 は最後に来ない
    if ([Relative.Fa3, Relative.La3, Relative.Fa4, Relative.La4].includes(temp[2])) {
      isOK = false;
    }
    
    // 条件3: 隣接音符は 4音程以内 & 同じ音符の連続なし
    for (let i = 0; i < temp.length - 1; i++) {
      if (Math.abs(temp[i] - temp[i + 1]) > 4) {
        isOK = false;
        break;
      }
      if (temp[i] === temp[i + 1]) {
        isOK = false;
        break;
      }
    }
    
    // 条件4: 難易度によるフィルタリング（簡単すぎる問題を除外）
    const maxDiff = Math.max(...temp.map(n => Math.abs(n - Relative.Do4)));
    const random = Math.floor(Math.random() * 7);
    if (maxDiff <= random) {
      isOK = false;
    }
  } while (!isOK);
  
  return temp;
}

/**
 * アプリケーション状態を管理するクラス
 * Observer パターンで状態変更を通知
 */
export class AppState {
  constructor() {
    // 状態変更リスナー
    this._listeners = [];
    
    // ゲーム状態
    this._didAnswer = false;
    this._isFirstTry = true;
    this._isCleared = true;
    this._doShowCentInAnswer = true;
    
    // 回答・正解データ
    this._answerCents = [0, 0, 0, 0];     // 現在の回答値
    this._fixedAnswerCents = [0, 0, 0, 0]; // 確定した回答値
    this._correctCents = [0, 0, 0, 0];     // 正解のセント値
    this._relativeIndexes = [Relative.Do4, Relative.Do4, Relative.Do4, Relative.Do4];
    
    // 音声関連
    this._do4Frequency = 440;
    this._canMakeSound = true;
    
    // 難易度
    this._difficulty = Difficulty.EASY;
    this._threshold = Difficulty.EASY.threshold;
    
    // 履歴（localStorage と連携）
    this._lastDifferences = {};
    
    // 初期化
    this._loadLastDifferences();
  }

  // ===== Getter =====
  
  get didAnswer() { return this._didAnswer; }
  get isFirstTry() { return this._isFirstTry; }
  get isCleared() { return this._isCleared; }
  get doShowCentInAnswer() { return this._doShowCentInAnswer; }
  get answerCents() { return [...this._answerCents]; }
  get fixedAnswerCents() { return [...this._fixedAnswerCents]; }
  get correctCents() { return [...this._correctCents]; }
  get relativeIndexes() { return [...this._relativeIndexes]; }
  get do4Frequency() { return this._do4Frequency; }
  get canMakeSound() { return this._canMakeSound; }
  get threshold() { return this._threshold; }
  get difficulty() { return this._difficulty; }
  get lastDifferences() { return { ...this._lastDifferences }; }

  // ===== Observer パターン =====
  
  /**
   * 状態変更リスナーを追加
   * @param {Function} listener
   */
  subscribe(listener) {
    this._listeners.push(listener);
  }

  /**
   * 状態変更リスナーを削除
   * @param {Function} listener
   */
  unsubscribe(listener) {
    this._listeners = this._listeners.filter(l => l !== listener);
  }

  /**
   * 全リスナーに通知
   */
  _notify() {
    this._listeners.forEach(listener => listener(this));
  }

  // ===== 状態操作メソッド =====

  /**
   * 難易度を設定
   * @param {number} index - 難易度インデックス (0-4)
   */
  setDifficulty(index) {
    this._difficulty = getDifficultyByIndex(index);
    this._threshold = this._difficulty.threshold;
    this._updateIfCleared();
    this._notify();
  }

  /**
   * 回答セント値を設定
   * @param {number} noteIndex - 音符インデックス (0-3)
   * @param {number} cent - セント値
   */
  setAnswerCent(noteIndex, cent) {
    this._answerCents[noteIndex] = cent;
    this._notify();
  }

  /**
   * セント表示の ON/OFF を切り替え
   */
  toggleShowCentsInAnswer() {
    this._doShowCentInAnswer = !this._doShowCentInAnswer;
    this._notify();
  }

  /**
   * クリア判定を更新
   */
  _updateIfCleared() {
    const maxDiff = Math.max(
      ...this._fixedAnswerCents.map((_, i) => Math.abs(this.oneDifference(i)))
    );
    this._isCleared = maxDiff < this._threshold;
  }

  /**
   * 1つの音符の差分を計算
   * @param {number} index - 音符インデックス
   * @returns {number}
   */
  oneDifference(index) {
    return this._fixedAnswerCents[index] - this._correctCents[index];
  }

  /**
   * 1つの音符の差分テキストを取得
   * @param {number} index - 音符インデックス
   * @returns {string}
   */
  oneDifferenceText(index) {
    const diff = this.oneDifference(index);
    const prefix = diff >= 0 ? '+' : '';
    return `${prefix}${diff}`;
  }

  /**
   * 合計差分を計算
   * @returns {number}
   */
  get totalDifference() {
    let total = 0;
    for (let i = 0; i < 3; i++) {
      total += Math.abs(this._fixedAnswerCents[i] - this._correctCents[i]);
    }
    return total;
  }

  /**
   * 回答を確定
   */
  answer() {
    this._didAnswer = true;
    this._fixedAnswerCents = [...this._answerCents];
    this._updateIfCleared();
    this._notify();
  }

  /**
   * 次の問題へ進む
   * @param {Function} animateCallback - Wheel アニメーション用コールバック
   */
  async goToNext(animateCallback = null) {
    // 初回挑戦で回答済みなら履歴を保存
    if (this._isFirstTry && this._didAnswer) {
      for (let i = 0; i < 3; i++) {
        const relativeName = RelativeNames[this._relativeIndexes[i]];
        this._lastDifferences[relativeName] = this.oneDifferenceText(i);
        this._saveLastDifference(relativeName, this.oneDifferenceText(i));
      }
    }

    this._didAnswer = false;
    
    // 基準周波数をランダムに設定（440Hz ± 半音程度）
    this._do4Frequency = 440 * Math.pow(2, (Math.random() * 11 - 9) / 12);

    // クリアしていれば新しい問題を生成
    if (this._isCleared) {
      this._relativeIndexes = [...generateRelativeIndexes(), Relative.Do4];
      this._isFirstTry = true;
    } else {
      this._isFirstTry = false;
    }

    this._isCleared = false;
    
    // 正解のセント値を計算
    this._correctCents = this._relativeIndexes.map(index => 
      Note.fromRelative(index).cent
    );

    // Wheel アニメーション
    this._canMakeSound = false;
    
    if (animateCallback) {
      // 各 Wheel に対してランダムなオフセットを加えてアニメーション
      const targetIndices = this._correctCents.map((cent, i) => {
        let rand = Math.floor(Math.random() * 200) - 100;
        if (rand < 0) rand -= 50;
        else rand += 50;
        
        // 4番目（Do4）はオフセットなし
        const offset = i === 3 ? 0 : rand;
        return centToIndex(cent + offset);
      });
      
      await animateCallback(targetIndices);
    }

    this._canMakeSound = true;
    this._notify();
  }

  /**
   * 初期状態に設定
   */
  setInitial() {
    this._didAnswer = false;
    this._do4Frequency = 440;
    this._relativeIndexes = [Relative.Do4, Relative.Do4, Relative.Do4, Relative.Do4];
    this._correctCents = [0, 0, 0, 0];
    this._notify();
  }

  // ===== localStorage 操作 =====

  /**
   * 履歴を localStorage から読み込み
   */
  _loadLastDifferences() {
    try {
      for (const name of RelativeNames) {
        const value = localStorage.getItem(`lastDiff_${name}`);
        if (value !== null) {
          this._lastDifferences[name] = value;
        }
      }
    } catch (e) {
      console.warn('Failed to load last differences from localStorage:', e);
    }
  }

  /**
   * 履歴を localStorage に保存
   * @param {string} relativeName
   * @param {string} differenceText
   */
  _saveLastDifference(relativeName, differenceText) {
    try {
      localStorage.setItem(`lastDiff_${relativeName}`, differenceText);
    } catch (e) {
      console.warn('Failed to save last difference to localStorage:', e);
    }
  }

  /**
   * 全履歴をクリア
   */
  clearLastDifferences() {
    for (const name of RelativeNames) {
      localStorage.removeItem(`lastDiff_${name}`);
    }
    this._lastDifferences = {};
    this._notify();
  }
}

// シングルトンインスタンス
let appStateInstance = null;

/**
 * AppState のシングルトンインスタンスを取得
 * @returns {AppState}
 */
export function getAppState() {
  if (!appStateInstance) {
    appStateInstance = new AppState();
  }
  return appStateInstance;
}
