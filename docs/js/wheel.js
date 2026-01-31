/**
 * wheel.js - Wheel Selector コンポーネント
 * Flutter の ListWheelScrollView を JavaScript で再現
 * 
 * ★ Phase 3 の難所
 */

import { WheelConfig, indexToCent, centToIndex } from './constants.js';

/**
 * Wheel Selector クラス
 * ドラッグ/タッチで上下スクロールし、セント値を選択
 */
export class WheelSelector {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Wheel を配置するコンテナ要素
   * @param {string} options.color - バーの色 (hex)
   * @param {Function} options.onChange - 値変更時のコールバック (cent) => void
   * @param {Function} options.onDragStart - ドラッグ開始時のコールバック
   * @param {Function} options.onDragEnd - ドラッグ終了時のコールバック
   * @param {boolean} options.disabled - 無効化フラグ
   */
  constructor(options) {
    this.container = options.container;
    this.color = options.color || '#3b82f6';
    this.onChange = options.onChange || (() => {});
    this.onDragStart = options.onDragStart || (() => {});
    this.onDragEnd = options.onDragEnd || (() => {});
    this.disabled = options.disabled || false;

    // 内部状態
    this._currentIndex = WheelConfig.CENTER_INDEX; // 0セント位置
    this._isDragging = false;
    this._startY = 0;
    this._startIndex = 0;
    this._velocity = 0;
    this._lastY = 0;
    this._lastTime = 0;
    this._animationId = null;
    this._momentumAnimationId = null;

    // DOM要素
    this._track = null;
    this._indicator = null;

    // 初期化
    this._render();
    this._bindEvents();
  }

  /**
   * 現在のセント値を取得
   * @returns {number}
   */
  get cent() {
    return indexToCent(this._currentIndex);
  }

  /**
   * セント値を設定
   * @param {number} cent
   */
  set cent(cent) {
    this._currentIndex = centToIndex(cent);
    this._updateTrackPosition(false);
    this.onChange(cent);
  }

  /**
   * 無効化状態を設定
   * @param {boolean} value
   */
  setDisabled(value) {
    this.disabled = value;
    this.container.classList.toggle('wheel-disabled', value);
    this._updateBarColors();
  }

  /**
   * 指定インデックスにアニメーションで移動
   * @param {number} targetIndex
   * @param {number} duration - ミリ秒
   * @returns {Promise<void>}
   */
  animateTo(targetIndex, duration = 200) {
    return new Promise((resolve) => {
      // 既存のアニメーションをキャンセル
      if (this._animationId) {
        cancelAnimationFrame(this._animationId);
      }
      if (this._momentumAnimationId) {
        cancelAnimationFrame(this._momentumAnimationId);
      }

      const startIndex = this._currentIndex;
      const startTime = performance.now();
      const distance = targetIndex - startIndex;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeInOut
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        this._currentIndex = Math.round(startIndex + distance * eased);
        this._clampIndex();
        this._updateTrackPosition(false);

        if (progress < 1) {
          this._animationId = requestAnimationFrame(animate);
        } else {
          this._animationId = null;
          this.onChange(this.cent);
          resolve();
        }
      };

      this._animationId = requestAnimationFrame(animate);
    });
  }

  /**
   * セント値にアニメーションで移動
   * @param {number} cent
   * @param {number} duration
   * @returns {Promise<void>}
   */
  animateToCent(cent, duration = 200) {
    return this.animateTo(centToIndex(cent), duration);
  }

  /**
   * DOM をレンダリング
   */
  _render() {
    this.container.innerHTML = '';
    this.container.classList.add('wheel-container');

    // トラック（スクロールする部分）
    this._track = document.createElement('div');
    this._track.className = 'wheel-track';

    // 表示する範囲のアイテム数（パフォーマンスのため全3501個は作らない）
    const visibleCount = 21; // 中央 ± 10個
    
    for (let i = 0; i < visibleCount; i++) {
      const item = document.createElement('div');
      item.className = 'wheel-item';
      item.dataset.offset = i - Math.floor(visibleCount / 2);
      
      const bar = document.createElement('div');
      bar.className = 'wheel-item__bar';
      bar.style.backgroundColor = this.disabled ? '#6b7280' : this.color;
      
      item.appendChild(bar);
      this._track.appendChild(item);
    }

    // インジケーター（中央線）
    this._indicator = document.createElement('div');
    this._indicator.className = 'wheel-indicator';

    this.container.appendChild(this._track);
    this.container.appendChild(this._indicator);

    this._updateTrackPosition(false);
  }

  /**
   * イベントをバインド
   */
  _bindEvents() {
    // マウスイベント
    this.container.addEventListener('mousedown', this._handleDragStart.bind(this));
    document.addEventListener('mousemove', this._handleDragMove.bind(this));
    document.addEventListener('mouseup', this._handleDragEnd.bind(this));

    // タッチイベント
    this.container.addEventListener('touchstart', this._handleDragStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this._handleDragMove.bind(this), { passive: false });
    document.addEventListener('touchend', this._handleDragEnd.bind(this));

    // ホイールイベント
    this.container.addEventListener('wheel', this._handleWheel.bind(this), { passive: false });
  }

  /**
   * ドラッグ開始
   * @param {MouseEvent|TouchEvent} e
   */
  _handleDragStart(e) {
    if (this.disabled) return;

    e.preventDefault();
    
    // 既存のアニメーションをキャンセル
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
    if (this._momentumAnimationId) {
      cancelAnimationFrame(this._momentumAnimationId);
      this._momentumAnimationId = null;
    }

    this._isDragging = true;
    this._startY = this._getEventY(e);
    this._startIndex = this._currentIndex;
    this._velocity = 0;
    this._lastY = this._startY;
    this._lastTime = performance.now();

    this.container.classList.add('wheel-dragging');
    this.onDragStart();
  }

  /**
   * ドラッグ中
   * @param {MouseEvent|TouchEvent} e
   */
  _handleDragMove(e) {
    if (!this._isDragging) return;

    e.preventDefault();
    
    const currentY = this._getEventY(e);
    const deltaY = currentY - this._startY;
    const deltaIndex = Math.round(deltaY / WheelConfig.ITEM_EXTENT);
    
    // 速度を計算（慣性用）
    const currentTime = performance.now();
    const dt = currentTime - this._lastTime;
    if (dt > 0) {
      this._velocity = (currentY - this._lastY) / dt;
    }
    this._lastY = currentY;
    this._lastTime = currentTime;

    // インデックスを更新（ドラッグ方向とスクロール方向を合わせる）
    const newIndex = this._startIndex - deltaIndex;
    
    if (newIndex !== this._currentIndex) {
      this._currentIndex = newIndex;
      this._clampIndex();
      this._updateTrackPosition(true);
      this.onChange(this.cent);
    }
  }

  /**
   * ドラッグ終了
   */
  _handleDragEnd() {
    if (!this._isDragging) return;

    this._isDragging = false;
    this.container.classList.remove('wheel-dragging');
    this.onDragEnd();

    // 慣性スクロール
    if (Math.abs(this._velocity) > 0.1) {
      this._startMomentum();
    }
  }

  /**
   * マウスホイール
   * @param {WheelEvent} e
   */
  _handleWheel(e) {
    if (this.disabled) return;

    e.preventDefault();
    
    // deltaY を正規化（ブラウザによって値が異なる）
    const delta = Math.sign(e.deltaY) * Math.ceil(Math.abs(e.deltaY) / 50);
    const newIndex = this._currentIndex + delta;
    
    if (newIndex !== this._currentIndex) {
      this._currentIndex = newIndex;
      this._clampIndex();
      this._updateTrackPosition(true);
      this.onChange(this.cent);
    }
  }

  /**
   * 慣性スクロールを開始
   */
  _startMomentum() {
    const friction = 0.95;
    const minVelocity = 0.01;

    const animate = () => {
      this._velocity *= friction;

      if (Math.abs(this._velocity) < minVelocity) {
        this._momentumAnimationId = null;
        return;
      }

      // 速度に応じてインデックスを更新
      const delta = Math.round(this._velocity * 10);
      if (delta !== 0) {
        this._currentIndex -= delta;
        this._clampIndex();
        this._updateTrackPosition(true);
        this.onChange(this.cent);
      }

      this._momentumAnimationId = requestAnimationFrame(animate);
    };

    this._momentumAnimationId = requestAnimationFrame(animate);
  }

  /**
   * インデックスを有効範囲内に制限
   */
  _clampIndex() {
    this._currentIndex = Math.max(0, Math.min(WheelConfig.ITEM_COUNT - 1, this._currentIndex));
  }

  /**
   * トラック位置を更新
   * @param {boolean} animated
   */
  _updateTrackPosition(animated) {
    if (!this._track) return;

    // 現在のセント値
    const cent = this.cent;
    
    // 相対オフセット（サブピクセル精度）
    const subOffset = (cent % 1) * WheelConfig.ITEM_EXTENT;
    
    // トラック内の各アイテムのオフセットを更新
    const items = this._track.querySelectorAll('.wheel-item');
    items.forEach((item) => {
      const offset = parseInt(item.dataset.offset, 10);
      const itemCent = cent + offset;
      
      // 選択状態の更新
      item.classList.toggle('wheel-item--selected', offset === 0);
      
      // 位置の更新
      const y = offset * WheelConfig.ITEM_EXTENT - subOffset;
      item.style.transform = `translateY(${y}px)`;
    });

    // トランジションの設定
    this._track.style.transition = animated ? 'none' : 'transform 0.1s ease-out';
  }

  /**
   * バーの色を更新
   */
  _updateBarColors() {
    const bars = this._track.querySelectorAll('.wheel-item__bar');
    bars.forEach(bar => {
      bar.style.backgroundColor = this.disabled ? '#6b7280' : this.color;
    });
  }

  /**
   * イベントから Y 座標を取得
   * @param {MouseEvent|TouchEvent} e
   * @returns {number}
   */
  _getEventY(e) {
    if (e.touches && e.touches.length > 0) {
      return e.touches[0].clientY;
    }
    return e.clientY;
  }

  /**
   * リソースを解放
   */
  destroy() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
    }
    if (this._momentumAnimationId) {
      cancelAnimationFrame(this._momentumAnimationId);
    }
    this.container.innerHTML = '';
  }
}
