/**
 * main.js - エントリーポイント
 * アプリケーションの初期化と各モジュールの統合
 */

import { getAppState } from './state.js';
import { Relative, RelativeNames, Note, formatRelativeName } from './constants.js';
import { getAudio, centToFrequency } from './audio.js';
import { NotesContainer } from './note.js';

// グローバルな状態インスタンス
const appState = getAppState();

// グローバルな Audio インスタンス
const audio = getAudio();

// 音符コンテナ
let notesContainer = null;

// スタート済みかどうか
let hasStarted = false;

/**
 * DOM が読み込まれたら初期化
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Relative Pitch Adjuster - Web Version');
  console.log('Phase 1: 基盤構築完了');
  console.log('Phase 2: 音声機能実装完了');
  console.log('Phase 3: UIコンポーネント実装完了');
  
  initializeApp();
});

/**
 * アプリケーションの初期化
 */
async function initializeApp() {
  // 音符コンテナの初期化
  const notesEl = document.getElementById('notes-container');
  if (notesEl) {
    notesContainer = new NotesContainer(notesEl);
  }

  // UI イベントの設定
  setupEventListeners();
  
  // 状態変更の購読
  appState.subscribe(handleStateChange);
  
  // 初期表示の更新
  updateUI();

  // Audio インジケーター更新ループ
  startAudioIndicatorLoop();
  
  // デバッグ情報の出力
  logDebugInfo();

  // 画面表示時に Audio 初期化を試行（失敗しても Start で再試行）
  audio.initialize().catch((err) => {
    console.error('Failed to initialize audio on load:', err);
  });

  console.log('Audio initialization requested on load');
}

/**
 * 最初の問題を開始
 */
async function startFirstQuestion() {
  // Audio が初期化されていなければ初期化を試みる（Start での再試行が優先）
  if (!audio.isInitialized) {
    audio.initialize().catch((err) => {
      console.error('Failed to initialize audio:', err);
    });
  }

  // 次の問題へ（animateCallback付き）
  await appState.goToNext(async (targetIndices) => {
    if (notesContainer) {
      await notesContainer.animateWheels(targetIndices);
    }
  });

  // 問題の更新
  if (notesContainer) {
    notesContainer.updateQuestion();
  }
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
  // Start ボタン
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    addFastTap(btnStart, handleStartClick);
  }

  // Hide Cent ボタン
  const btnHideCent = document.getElementById('btn-hide-cent');
  if (btnHideCent) {
    addFastTap(btnHideCent, () => {
      if (!hasStarted || !appState.didAnswer) return;
      appState.toggleShowCentsInAnswer();
    });
  }
  
  // OK/Next ボタン
  const btnOkNext = document.getElementById('btn-ok-next');
  if (btnOkNext) {
    addFastTap(btnOkNext, handleOkNextClick);
  }
  
  // 難易度セレクタ
  const difficultySelect = document.getElementById('difficulty-select');
  if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
      appState.setDifficulty(parseInt(e.target.value, 10));
    });
  }

  // 最初のタップ/クリックで Audio を初期化（Start とは独立）
  document.body.addEventListener('touchstart', initAudioOnFirstInteraction, { once: true, passive: true });
  document.body.addEventListener('click', initAudioOnFirstInteraction, { once: true });
}

/**
 * モバイルのクリック遅延を回避して即時反応させる
 * @param {HTMLElement} el
 * @param {(event: Event) => void} handler
 */
function addFastTap(el, handler) {
  let skipClick = false;

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    e.preventDefault();
    skipClick = true;
    handler(e);
    setTimeout(() => {
      skipClick = false;
    }, 400);
  }, { passive: false });

  el.addEventListener('click', (e) => {
    if (skipClick) {
      e.preventDefault();
      return;
    }
    handler(e);
  });
}

/**
 * 最初のユーザーインタラクションで Audio を初期化
 */
async function initAudioOnFirstInteraction() {
  if (!audio.isInitialized) {
    try {
      await audio.initialize();
    } catch (err) {
      console.error('Failed to initialize audio on first interaction:', err);
    }
  }
}

async function handleStartClick() {
  if (hasStarted) return;

  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.disabled = true;
  }

  hasStarted = true;

  if (btnStart) {
    btnStart.classList.add('hidden');
    btnStart.setAttribute('aria-hidden', 'true');
  }

  updateUI();

  audio.initialize().catch((err) => {
    console.error('Failed to initialize audio:', err);
  });

  startFirstQuestion().catch((err) => {
    console.error('Failed to start first question:', err);
  });
}

/**
 * OK/Next ボタンのクリックハンドラ
 */
async function handleOkNextClick() {
  if (!hasStarted) return;

  // Audio が初期化されていなければ初期化
  if (!audio.isInitialized) {
    await audio.initialize();
  }

  if (appState.didAnswer) {
    hideResultBanner();
    // 次の問題へ（animateCallback付き）
    await appState.goToNext(async (targetIndices) => {
      if (notesContainer) {
        await notesContainer.animateWheels(targetIndices);
      }
    });
    
    // 問題の更新
    if (notesContainer) {
      notesContainer.updateQuestion();
    }
  } else {
    // 回答を確定
    appState.answer();
    showResultBanner(appState.isCleared);
  }
}

/**
 * 音声テストボタンのクリックハンドラ
 */
/**
 * 指定したセント値の音を再生
 * @param {number} cent - セント値
 */
export function playNoteByCent(cent) {
  if (!audio.isInitialized) return;
  
  const frequency = centToFrequency(cent, appState.do4Frequency);
  audio.playLong(frequency);
}

/**
 * 音を停止
 */
export function stopNote() {
  audio.stop();
}

/**
 * 状態変更時のハンドラ
 * @param {AppState} state
 */
function handleStateChange(state) {
  updateUI();
  
  // 音符コンテナも更新
  if (notesContainer) {
    notesContainer.update();
  }
}

/**
 * UI を現在の状態に合わせて更新
 */
function updateUI() {
  updateOkNextButton();
  updateHideCentButton();
  updateLastDifferences();
  updateAudioIndicator();
}

/**
 * 結果バナーを表示
 * @param {boolean} isCleared
 */
function showResultBanner(isCleared) {
  const banner = document.getElementById('result-banner');
  if (!banner) return;

  banner.textContent = isCleared ? 'Correct!' : 'Incorrect';
  banner.classList.remove('hidden');
  banner.classList.toggle('result-banner--success', isCleared);
  banner.classList.toggle('result-banner--failure', !isCleared);
}

/**
 * 結果バナーを非表示
 */
function hideResultBanner() {
  const banner = document.getElementById('result-banner');
  if (!banner) return;

  banner.textContent = '';
  banner.classList.add('hidden');
  banner.classList.remove('result-banner--success', 'result-banner--failure');
}

/**
 * OK/Next ボタンの表示を更新
 */
function updateOkNextButton() {
  const btn = document.getElementById('btn-ok-next');
  if (!btn) return;
  
  if (appState.didAnswer) {
    if (appState.isCleared) {
      btn.textContent = 'Next';
      btn.className = 'px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold rounded-lg transition-colors';
    } else {
      btn.textContent = 'Retry';
      btn.className = 'px-6 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-lg transition-colors';
    }
  } else {
    btn.textContent = 'OK!';
    btn.className = 'px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold rounded-lg transition-colors';
  }

  if (!hasStarted) {
    btn.disabled = true;
    btn.classList.add('opacity-60', 'cursor-not-allowed', 'pointer-events-none');
  } else {
    btn.disabled = false;
    btn.classList.remove('opacity-60', 'cursor-not-allowed', 'pointer-events-none');
  }
}

/**
 * Hide Cent ボタンの表示を更新
 */
function updateHideCentButton() {
  const btn = document.getElementById('btn-hide-cent');
  if (!btn) return;
  
  btn.textContent = appState.doShowCentInAnswer ? 'Hide Cent' : 'Show Cent';

  const shouldEnable = hasStarted && appState.didAnswer;
  btn.disabled = !shouldEnable;
  if (shouldEnable) {
    btn.className = 'px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors';
  } else {
    btn.className = 'px-4 py-2 bg-gray-700 text-gray-400 rounded-lg opacity-60 cursor-not-allowed';
  }
}

/**
 * Last Differences の表示を更新
 */
function updateLastDifferences() {
  const container = document.getElementById('differences-list');
  if (!container) return;
  
  const differences = appState.lastDifferences;
  const hasData = Object.keys(differences).length > 0;
  
  if (!hasData) {
    container.innerHTML = '<p class="text-gray-500 italic">No history yet</p>';
    return;
  }
  
  // グリッド形式で表示
  let html = '<div class="differences-grid">';
  
  for (const name of RelativeNames) {
    const value = differences[name];
    if (value === undefined) continue;
    
    // 値に応じた色クラスを決定
    const numValue = parseInt(value, 10);
    let colorClass = 'text-gray-400';
    if (numValue > 0) colorClass = 'text-red-400';
    else if (numValue < 0) colorClass = 'text-blue-400';
    else colorClass = 'text-green-400';
    
    // 音符の色を取得
    const relativeIndex = RelativeNames.indexOf(name);
    const note = Note.fromRelative(relativeIndex);
    const noteColor = note.solfege.color;
    const displayName = formatRelativeName(relativeIndex);
    
    html += `
      <div class="difference-item" style="background-color: ${noteColor}22;">
        <span class="difference-item__name" style="color: ${noteColor};">${displayName}</span>
        <span class="difference-item__value ${colorClass}">${value}</span>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Audio インジケーター更新
 */
function updateAudioIndicator() {
  const indicator = document.getElementById('audio-indicator');
  if (!indicator) return;

  indicator.classList.remove('audio-indicator--playing');

  if (audio.isPlaying) {
    indicator.classList.add('audio-indicator--playing');
    indicator.title = 'Audio playing';
  } else {
    indicator.title = 'Audio idle';
  }
}

/**
 * Audio インジケーターの定期更新
 */
function startAudioIndicatorLoop() {
  setInterval(() => {
    updateAudioIndicator();
  }, 120);
}

/**
 * デバッグ情報をコンソールに出力
 */
function logDebugInfo() {
  console.log('=== Debug Info ===');
  console.log('AppState initialized:', appState);
  console.log('Do4 Frequency:', appState.do4Frequency);
  console.log('Threshold:', appState.threshold);
  console.log('Difficulty:', appState.difficulty.name);
  console.log('');
  console.log('定数テスト:');
  console.log('- Relative.Do4:', Relative.Do4);
  console.log('- Note.fromRelative(Do4):', Note.fromRelative(Relative.Do4));
  console.log('- Do4 at 440Hz frequency:', Note.fromRelative(Relative.Do4).frequency(440));
  console.log('');
  console.log('Audio モジュール:');
  console.log('- Audio instance:', audio);
  console.log('- Is initialized:', audio.isInitialized);
  console.log('==================');
}

// グローバルにエクスポート（デバッグ用）
window.appState = appState;
window.audio = audio;
window.playNoteByCent = playNoteByCent;
window.stopNote = stopNote;
