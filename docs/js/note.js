/**
 * note.js - 音符表示コンポーネント
 * Flutter の NoteContainer と QuestionNote を JavaScript で再現
 */

import { Note, RelativeNames, centToIndex } from './constants.js';
import { WheelSelector } from './wheel.js';
import { getAppState } from './state.js';
import { getAudio, centToFrequency } from './audio.js';

/**
 * QuestionNote コンポーネント
 * 差分表示 + 正解音符 + 回答音符 + Wheel を統合
 */
export class QuestionNoteComponent {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - 配置先コンテナ
   * @param {number} options.noteIndex - 音符インデックス (0-3)
   * @param {number} options.relativeIndex - Relative インデックス
   * @param {boolean} options.isScrollable - Wheel 操作可能か
   */
  constructor(options) {
    this.container = options.container;
    this.noteIndex = options.noteIndex;
    this.relativeIndex = options.relativeIndex;
    this.isScrollable = options.isScrollable !== false;

    this._appState = getAppState();
    this._audio = getAudio();
    this._note = Note.fromRelative(this.relativeIndex);
    this._wheel = null;

    // DOM要素への参照
    this._differenceEl = null;
    this._correctNoteEl = null;
    this._answerNoteEl = null;
    this._answerCentEl = null;
    this._wheelContainer = null;

    this._render();
    this._bindEvents();
  }

  /**
   * Relative インデックスを更新
   * @param {number} relativeIndex
   */
  setRelativeIndex(relativeIndex) {
    this.relativeIndex = relativeIndex;
    this._note = Note.fromRelative(relativeIndex);
    this._updateNoteDisplay();
    if (this._wheel) {
      this._wheel.color = this._note.solfege.color;
      this._wheel._updateBarColors();
    }
  }

  /**
   * Wheel を指定インデックスにアニメーション
   * @param {number} targetIndex
   * @returns {Promise<void>}
   */
  animateWheelTo(targetIndex) {
    if (this._wheel) {
      return this._wheel.animateTo(targetIndex, 200);
    }
    return Promise.resolve();
  }

  /**
   * 状態に応じて表示を更新
   */
  update() {
    const state = this._appState;

    // 差分表示
    if (state.didAnswer) {
      const diff = state.oneDifference(this.noteIndex);
      const diffText = state.oneDifferenceText(this.noteIndex);
      this._differenceEl.textContent = diffText;
      
      // 閾値を超えていたら赤、そうでなければ緑
      if (Math.abs(diff) > state.threshold) {
        this._differenceEl.className = 'difference-display text-red-400';
      } else {
        this._differenceEl.className = 'difference-display text-green-400';
      }
    } else {
      this._differenceEl.textContent = '';
      this._differenceEl.className = 'difference-display';
    }

    // 正解音符の表示（回答後のみアクティブ表示）
    this._correctNoteEl.classList.toggle('note-card--inactive', !state.didAnswer);
    
    // 回答音符のセント表示
    const cent = state.answerCents[this.noteIndex];
    if (state.didAnswer && state.doShowCentInAnswer) {
      const prefix = cent >= 0 ? '+' : '';
      this._answerCentEl.textContent = `${prefix}${cent}`;
      this._answerCentEl.style.display = 'block';
    } else {
      this._answerCentEl.style.display = 'none';
    }
  }

  /**
   * レンダリング
   */
  _render() {
    this.container.innerHTML = '';
    this.container.className = 'question-note';

    // 差分表示
    this._differenceEl = document.createElement('div');
    this._differenceEl.className = 'difference-display';
    
    // 正解の音符カード
    this._correctNoteEl = this._createNoteCard(true);
    
    // スペーサー
    const spacer = document.createElement('div');
    spacer.className = 'h-2';

    // 回答の音符カード
    const answerWrapper = document.createElement('div');
    answerWrapper.className = 'answer-note-wrapper';
    this._answerNoteEl = this._createNoteCard(false);
    
    // 回答セント表示
    this._answerCentEl = document.createElement('div');
    this._answerCentEl.className = 'answer-cent-display';
    this._answerCentEl.style.display = 'none';
    
    answerWrapper.appendChild(this._answerNoteEl);
    answerWrapper.appendChild(this._answerCentEl);

    // Wheel コンテナ
    this._wheelContainer = document.createElement('div');
    this._wheelContainer.className = 'wheel-wrapper mt-2';
    
    // Wheel を作成
    this._wheel = new WheelSelector({
      container: this._wheelContainer,
      color: this._note.solfege.color,
      disabled: !this.isScrollable,
      onChange: (cent) => this._handleWheelChange(cent),
      onDragStart: () => this._handleDragStart(),
      onDragEnd: () => this._handleDragEnd()
    });

    // DOMに追加
    this.container.appendChild(this._differenceEl);
    this.container.appendChild(this._correctNoteEl);
    this.container.appendChild(spacer);
    this.container.appendChild(answerWrapper);
    this.container.appendChild(this._wheelContainer);
  }

  /**
   * 音符カードを作成
   * @param {boolean} isCorrect - 正解カードかどうか
   * @returns {HTMLElement}
   */
  _createNoteCard(isCorrect) {
    const card = document.createElement('div');
    card.className = 'note-card';
    if (!isCorrect) {
      card.classList.add('note-card--answer');
    }

    // ヘッダー（音名）
    const header = document.createElement('div');
    header.className = 'note-card__header';
    header.style.backgroundColor = this._note.solfege.color;
    header.textContent = this._note.solfege.name;

    card.appendChild(header);

    // タッチで音を鳴らす
    card.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this._playNote(isCorrect);
    });
    card.addEventListener('pointerup', () => {
      this._stopNote();
    });
    card.addEventListener('pointerleave', () => {
      this._stopNote();
    });

    return card;
  }

  /**
   * 音符表示を更新
   */
  _updateNoteDisplay() {
    // 正解音符のヘッダー更新
    const correctHeader = this._correctNoteEl.querySelector('.note-card__header');
    if (correctHeader) {
      correctHeader.style.backgroundColor = this._note.solfege.color;
      correctHeader.textContent = this._note.solfege.name;
    }

    // 回答音符のヘッダー更新
    const answerHeader = this._answerNoteEl.querySelector('.note-card__header');
    if (answerHeader) {
      answerHeader.style.backgroundColor = this._note.solfege.color;
      answerHeader.textContent = this._note.solfege.name;
    }
  }

  /**
   * イベントバインド
   */
  _bindEvents() {
    // 状態変更を購読
    this._appState.subscribe(() => this.update());
  }

  /**
   * Wheel 変更時のハンドラ
   * @param {number} cent
   */
  _handleWheelChange(cent) {
    this._appState.setAnswerCent(this.noteIndex, cent);
    
    // 音を鳴らす（canMakeSound が true の時のみ）
    if (this._appState.canMakeSound && this._audio.isInitialized) {
      const frequency = centToFrequency(cent, this._appState.do4Frequency);
      this._audio.playLong(frequency);
    }
  }

  /**
   * ドラッグ開始時のハンドラ
   */
  _handleDragStart() {
    if (!this._audio.isInitialized) return;
    
    const cent = this._appState.answerCents[this.noteIndex];
    const frequency = centToFrequency(cent, this._appState.do4Frequency);
    this._audio.play(frequency);
  }

  /**
   * ドラッグ終了時のハンドラ
   */
  _handleDragEnd() {
    // playLong で自動停止するので何もしない
  }

  /**
   * 音符の音を再生
   * @param {boolean} isCorrect
   */
  _playNote(isCorrect) {
    if (!this._audio.isInitialized) return;
    if (!this._appState.didAnswer && isCorrect) return; // 回答前は正解カードは鳴らさない

    let frequency;
    if (isCorrect) {
      // 正解の周波数
      const correctCent = this._appState.correctCents[this.noteIndex];
      frequency = centToFrequency(correctCent, this._appState.do4Frequency);
    } else {
      // 回答の周波数
      const answerCent = this._appState.answerCents[this.noteIndex];
      frequency = centToFrequency(answerCent, this._appState.do4Frequency);
    }

    this._audio.play(frequency);
  }

  /**
   * 音を停止
   */
  _stopNote() {
    this._audio.stop();
  }

  /**
   * リソースを解放
   */
  destroy() {
    if (this._wheel) {
      this._wheel.destroy();
    }
    this.container.innerHTML = '';
  }
}

/**
 * 全4つの QuestionNote を管理するコンテナ
 */
export class NotesContainer {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this._appState = getAppState();
    this._notes = [];

    this._render();
  }

  /**
   * Wheel を指定位置にアニメーション
   * @param {number[]} targetIndices - 各 Wheel の目標インデックス
   * @returns {Promise<void>}
   */
  async animateWheels(targetIndices) {
    const promises = this._notes.map((note, i) => {
      return note.animateWheelTo(targetIndices[i]);
    });
    await Promise.all(promises);
  }

  /**
   * 問題を更新（relativeIndexes が変わった時）
   */
  updateQuestion() {
    const relativeIndexes = this._appState.relativeIndexes;
    this._notes.forEach((note, i) => {
      note.setRelativeIndex(relativeIndexes[i]);
    });
  }

  /**
   * レンダリング
   */
  _render() {
    this.container.innerHTML = '';
    this.container.className = 'notes-container';

    const relativeIndexes = this._appState.relativeIndexes;

    for (let i = 0; i < 4; i++) {
      const noteContainer = document.createElement('div');
      noteContainer.className = 'note-wrapper';

      const isScrollable = i < 3; // 4番目（Do4）はスクロール不可

      const noteComponent = new QuestionNoteComponent({
        container: noteContainer,
        noteIndex: i,
        relativeIndex: relativeIndexes[i],
        isScrollable: isScrollable
      });

      this._notes.push(noteComponent);
      this.container.appendChild(noteContainer);
    }
  }

  /**
   * 全ての音符を更新
   */
  update() {
    this._notes.forEach(note => note.update());
  }

  /**
   * リソースを解放
   */
  destroy() {
    this._notes.forEach(note => note.destroy());
    this._notes = [];
    this.container.innerHTML = '';
  }
}
