/**
 * wheel.js - Wheel Picker コンポーネント
 *
 * Flutter の CupertinoPicker / ListWheelScrollView と同様に、固定幅の項目を
 * 連続的にスクロールし、操作終了時に中央の項目へスナップさせる。
 */

import { WheelConfig, indexToCent, centToIndex } from './constants.js';

const VISIBLE_ITEM_COUNT = 17;
const WHEEL_SNAP_DELAY = 120;
const MAX_MOMENTUM_ITEMS = 80;

/**
 * インデックスを Wheel の範囲内に制限する。
 * @param {number} index
 * @returns {number}
 */
export function clampWheelIndex(index) {
  return Math.max(0, Math.min(WheelConfig.ITEM_COUNT - 1, index));
}

/**
 * 連続スクロール位置から中央で選択されるインデックスを求める。
 * @param {number} scrollIndex
 * @returns {number}
 */
export function selectedIndexForScroll(scrollIndex) {
  return Math.round(clampWheelIndex(scrollIndex));
}

/**
 * ドラッグ量を連続スクロール位置へ変換する。
 * @param {number} startIndex
 * @param {number} deltaY
 * @returns {number}
 */
export function scrollIndexForDrag(startIndex, deltaY) {
  return clampWheelIndex(startIndex - deltaY / WheelConfig.ITEM_EXTENT);
}

/**
 * リリース時の速度からスナップ先を求める。
 * velocity は item / ms。短い投影時間を使い、極端な移動は制限する。
 * @param {number} scrollIndex
 * @param {number} velocity
 * @returns {number}
 */
export function momentumTargetIndex(scrollIndex, velocity) {
  const projectedItems = Math.max(-MAX_MOMENTUM_ITEMS, Math.min(MAX_MOMENTUM_ITEMS, velocity * 180));
  return selectedIndexForScroll(scrollIndex + projectedItems);
}

/**
 * Wheel Picker クラス
 * ドラッグ、タッチ、マウスホイール、キーボードでセント値を選択する。
 */
export class WheelSelector {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Wheel を配置するコンテナ要素
   * @param {string} options.color - バーの色 (hex)
   * @param {Function} options.onChange - 値変更時のコールバック (cent) => void
   * @param {Function} options.onDragStart - 操作開始時のコールバック
   * @param {Function} options.onDragEnd - 操作終了時のコールバック
   * @param {boolean} options.disabled - 無効化フラグ
   */
  constructor(options) {
    this.container = options.container;
    this.color = options.color || '#3b82f6';
    this.onChange = options.onChange || (() => {});
    this.onDragStart = options.onDragStart || (() => {});
    this.onDragEnd = options.onDragEnd || (() => {});
    this.disabled = options.disabled || false;

    this._currentIndex = WheelConfig.CENTER_INDEX;
    this._scrollIndex = WheelConfig.CENTER_INDEX;
    this._isDragging = false;
    this._startY = 0;
    this._startScrollIndex = 0;
    this._velocity = 0;
    this._lastY = 0;
    this._lastTime = 0;
    this._animationId = null;
    this._animationResolve = null;
    this._wheelSnapTimer = null;

    this._track = null;
    this._indicator = null;

    this._boundDragStart = this._handleDragStart.bind(this);
    this._boundDragMove = this._handleDragMove.bind(this);
    this._boundDragEnd = this._handleDragEnd.bind(this);
    this._boundWheel = this._handleWheel.bind(this);
    this._boundKeyDown = this._handleKeyDown.bind(this);

    this._render();
    this._bindEvents();
  }

  /** @returns {number} */
  get cent() {
    return indexToCent(this._currentIndex);
  }

  /** @param {number} cent */
  set cent(cent) {
    const index = clampWheelIndex(centToIndex(cent));
    this._scrollIndex = index;
    this._setSelectedIndex(index, false);
    this._updateTrackPosition();
    this.onChange(this.cent);
  }

  /** @param {boolean} value */
  setDisabled(value) {
    this.disabled = value;
    this.container.classList.toggle('wheel-disabled', value);
    this.container.setAttribute('aria-disabled', String(value));
    this.container.tabIndex = value ? -1 : 0;
    this._updateBarColors();
  }

  /**
   * 指定インデックスにアニメーションで移動する。
   * @param {number} targetIndex
   * @param {number} duration - ミリ秒
   * @returns {Promise<void>}
   */
  animateTo(targetIndex, duration = 200) {
    return this._animateToScrollIndex(clampWheelIndex(targetIndex), duration, false);
  }

  /**
   * セント値にアニメーションで移動する。
   * @param {number} cent
   * @param {number} duration
   * @returns {Promise<void>}
   */
  animateToCent(cent, duration = 200) {
    return this.animateTo(centToIndex(cent), duration);
  }

  _render() {
    this.container.innerHTML = '';
    this.container.classList.add('wheel-container');
    this.container.classList.toggle('wheel-disabled', this.disabled);
    this.container.tabIndex = this.disabled ? -1 : 0;
    this.container.setAttribute('role', 'slider');
    this.container.setAttribute('aria-label', 'Pitch adjustment in cents');
    this.container.setAttribute('aria-valuemin', String(WheelConfig.MIN_CENT));
    this.container.setAttribute('aria-valuemax', String(WheelConfig.MAX_CENT));
    this.container.setAttribute('aria-disabled', String(this.disabled));

    this._track = document.createElement('div');
    this._track.className = 'wheel-track';
    this._track.setAttribute('aria-hidden', 'true');

    const centerSlot = Math.floor(VISIBLE_ITEM_COUNT / 2);
    for (let i = 0; i < VISIBLE_ITEM_COUNT; i++) {
      const item = document.createElement('div');
      item.className = 'wheel-item';
      item.dataset.slot = String(i - centerSlot);

      const bar = document.createElement('div');
      bar.className = 'wheel-item__bar';
      bar.style.backgroundColor = this.disabled ? '#6b7280' : this.color;

      item.appendChild(bar);
      this._track.appendChild(item);
    }

    this._indicator = document.createElement('div');
    this._indicator.className = 'wheel-indicator';
    this._indicator.setAttribute('aria-hidden', 'true');

    this.container.appendChild(this._track);
    this.container.appendChild(this._indicator);
    this._updateTrackPosition();
  }

  _bindEvents() {
    this.container.addEventListener('pointerdown', this._boundDragStart);
    document.addEventListener('pointermove', this._boundDragMove);
    document.addEventListener('pointerup', this._boundDragEnd);
    document.addEventListener('pointercancel', this._boundDragEnd);
    this.container.addEventListener('wheel', this._boundWheel, { passive: false });
    this.container.addEventListener('keydown', this._boundKeyDown);
  }

  /** @param {PointerEvent} e */
  _handleDragStart(e) {
    if (this.disabled || (e.button !== undefined && e.button !== 0)) return;

    e.preventDefault();
    this._cancelAnimation();
    this._clearWheelSnapTimer();

    this._isDragging = true;
    this._startY = e.clientY;
    this._startScrollIndex = this._scrollIndex;
    this._velocity = 0;
    this._lastY = this._startY;
    this._lastTime = performance.now();

    this.container.classList.add('wheel-dragging');
    this.container.focus({ preventScroll: true });
    if (this.container.setPointerCapture && e.pointerId !== undefined) {
      this.container.setPointerCapture(e.pointerId);
    }
    this.onDragStart();
  }

  /** @param {PointerEvent} e */
  _handleDragMove(e) {
    if (!this._isDragging) return;

    e.preventDefault();
    const currentY = e.clientY;
    const currentTime = performance.now();
    const dt = currentTime - this._lastTime;

    if (dt > 0) {
      const instantVelocity = -(currentY - this._lastY) / WheelConfig.ITEM_EXTENT / dt;
      this._velocity = this._velocity * 0.65 + instantVelocity * 0.35;
    }

    this._lastY = currentY;
    this._lastTime = currentTime;
    this._setScrollIndex(scrollIndexForDrag(this._startScrollIndex, currentY - this._startY), true);
  }

  _handleDragEnd() {
    if (!this._isDragging) return;

    this._isDragging = false;
    this.container.classList.remove('wheel-dragging');
    this.onDragEnd();
    this._snapWithMomentum(this._velocity);
  }

  /** @param {WheelEvent} e */
  _handleWheel(e) {
    if (this.disabled) return;

    e.preventDefault();
    this._cancelAnimation();
    this._clearWheelSnapTimer();

    const lineHeight = WheelConfig.ITEM_EXTENT;
    const pageHeight = this.container.clientHeight || 120;
    const deltaPixels = e.deltaMode === 1
      ? e.deltaY * lineHeight
      : e.deltaMode === 2
        ? e.deltaY * pageHeight
        : e.deltaY;

    this._setScrollIndex(this._scrollIndex + deltaPixels / WheelConfig.ITEM_EXTENT, true);
    this._wheelSnapTimer = setTimeout(() => {
      this._wheelSnapTimer = null;
      this._snapWithMomentum(0);
    }, WHEEL_SNAP_DELAY);
  }

  /** @param {KeyboardEvent} e */
  _handleKeyDown(e) {
    if (this.disabled) return;

    const stepByKey = {
      ArrowUp: -1,
      ArrowDown: 1,
      PageUp: -10,
      PageDown: 10
    };

    let target = null;
    if (Object.hasOwn(stepByKey, e.key)) {
      target = this._currentIndex + stepByKey[e.key];
    } else if (e.key === 'Home') {
      target = 0;
    } else if (e.key === 'End') {
      target = WheelConfig.ITEM_COUNT - 1;
    }

    if (target === null) return;
    e.preventDefault();
    this._cancelAnimation();
    this._animateToScrollIndex(clampWheelIndex(target), 120, true);
  }

  /**
   * @param {number} scrollIndex
   * @param {boolean} notify
   */
  _setScrollIndex(scrollIndex, notify) {
    this._scrollIndex = clampWheelIndex(scrollIndex);
    this._setSelectedIndex(selectedIndexForScroll(this._scrollIndex), notify);
    this._updateTrackPosition();
  }

  /**
   * @param {number} index
   * @param {boolean} notify
   */
  _setSelectedIndex(index, notify) {
    if (index === this._currentIndex) return;
    this._currentIndex = index;
    this._updateAriaValue();
    if (notify) this.onChange(this.cent);
  }

  _updateAriaValue() {
    this.container.setAttribute('aria-valuenow', String(this.cent));
    this.container.setAttribute('aria-valuetext', `${this.cent} cents`);
  }

  _updateTrackPosition() {
    if (!this._track) return;

    const items = this._track.querySelectorAll('.wheel-item');
    items.forEach((item) => {
      const slot = Number(item.dataset.slot);
      const itemIndex = this._currentIndex + slot;
      const distance = itemIndex - this._scrollIndex;
      const absoluteDistance = Math.abs(distance);
      const angle = Math.max(-75, Math.min(75, distance * 13));
      const scale = Math.max(0.72, 1 - absoluteDistance * 0.045);
      const opacity = itemIndex < 0 || itemIndex >= WheelConfig.ITEM_COUNT
        ? 0
        : Math.max(0.08, 1 - absoluteDistance * 0.13);

      item.classList.toggle('wheel-item--selected', slot === 0);
      item.style.opacity = String(opacity);
      item.style.transform = `translateY(${distance * WheelConfig.ITEM_EXTENT}px) perspective(180px) rotateX(${angle}deg) scale(${scale})`;
    });

    this._updateAriaValue();
  }

  _updateBarColors() {
    const bars = this._track.querySelectorAll('.wheel-item__bar');
    bars.forEach((bar) => {
      bar.style.backgroundColor = this.disabled ? '#6b7280' : this.color;
    });
  }

  /** @param {number} velocity */
  _snapWithMomentum(velocity) {
    const target = momentumTargetIndex(this._scrollIndex, velocity);
    const distance = Math.abs(target - this._scrollIndex);
    const duration = Math.max(120, Math.min(420, 120 + distance * 7));
    this._animateToScrollIndex(target, duration, true);
  }

  /**
   * @param {number} targetIndex
   * @param {number} duration
   * @param {boolean} notifyEachChange
   * @returns {Promise<void>}
   */
  _animateToScrollIndex(targetIndex, duration, notifyEachChange) {
    this._cancelAnimation();
    const startIndex = this._scrollIndex;
    const distance = targetIndex - startIndex;

    if (distance === 0 || duration <= 0) {
      this._setScrollIndex(targetIndex, notifyEachChange);
      if (!notifyEachChange) this.onChange(this.cent);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this._animationResolve = resolve;
      const startTime = performance.now();
      const animate = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        this._setScrollIndex(startIndex + distance * eased, notifyEachChange);

        if (progress < 1) {
          this._animationId = requestAnimationFrame(animate);
        } else {
          this._animationId = null;
          this._animationResolve = null;
          this._setScrollIndex(targetIndex, notifyEachChange);
          if (!notifyEachChange) this.onChange(this.cent);
          resolve();
        }
      };

      this._animationId = requestAnimationFrame(animate);
    });
  }

  _cancelAnimation() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
    if (this._animationResolve) {
      this._animationResolve();
      this._animationResolve = null;
    }
  }

  _clearWheelSnapTimer() {
    if (this._wheelSnapTimer) {
      clearTimeout(this._wheelSnapTimer);
      this._wheelSnapTimer = null;
    }
  }

  destroy() {
    this._cancelAnimation();
    this._clearWheelSnapTimer();
    this.container.removeEventListener('pointerdown', this._boundDragStart);
    document.removeEventListener('pointermove', this._boundDragMove);
    document.removeEventListener('pointerup', this._boundDragEnd);
    document.removeEventListener('pointercancel', this._boundDragEnd);
    this.container.removeEventListener('wheel', this._boundWheel);
    this.container.removeEventListener('keydown', this._boundKeyDown);
    this.container.innerHTML = '';
  }
}
