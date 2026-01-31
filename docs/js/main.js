/**
 * main.js - エントリーポイント
 * アプリケーションの初期化と各モジュールの統合
 */

import { getAppState } from './state.js';
import { Relative, RelativeNames, Note } from './constants.js';

// グローバルな状態インスタンス
const appState = getAppState();

/**
 * DOM が読み込まれたら初期化
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Relative Pitch Adjuster - Web Version');
  console.log('Phase 1: 基盤構築完了');
  
  initializeApp();
});

/**
 * アプリケーションの初期化
 */
function initializeApp() {
  // UI イベントの設定
  setupEventListeners();
  
  // 状態変更の購読
  appState.subscribe(handleStateChange);
  
  // 初期表示の更新
  updateUI();
  
  // デバッグ情報の出力
  logDebugInfo();
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
  // Hide Cent ボタン
  const btnHideCent = document.getElementById('btn-hide-cent');
  if (btnHideCent) {
    btnHideCent.addEventListener('click', () => {
      appState.toggleShowCentsInAnswer();
    });
  }
  
  // OK/Next ボタン
  const btnOkNext = document.getElementById('btn-ok-next');
  if (btnOkNext) {
    btnOkNext.addEventListener('click', handleOkNextClick);
  }
  
  // 難易度セレクタ
  const difficultySelect = document.getElementById('difficulty-select');
  if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
      appState.setDifficulty(parseInt(e.target.value, 10));
    });
  }
}

/**
 * OK/Next ボタンのクリックハンドラ
 */
async function handleOkNextClick() {
  if (appState.didAnswer) {
    // 次の問題へ
    await appState.goToNext();
  } else {
    // 回答を確定
    appState.answer();
  }
}

/**
 * 状態変更時のハンドラ
 * @param {AppState} state
 */
function handleStateChange(state) {
  updateUI();
}

/**
 * UI を現在の状態に合わせて更新
 */
function updateUI() {
  updateOkNextButton();
  updateHideCentButton();
  updateLastDifferences();
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
}

/**
 * Hide Cent ボタンの表示を更新
 */
function updateHideCentButton() {
  const btn = document.getElementById('btn-hide-cent');
  if (!btn) return;
  
  btn.textContent = appState.doShowCentInAnswer ? 'Hide Cent' : 'Show Cent';
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
    
    html += `
      <div class="difference-item" style="background-color: ${noteColor}22;">
        <span class="difference-item__name" style="color: ${noteColor};">${name}</span>
        <span class="difference-item__value ${colorClass}">${value}</span>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * デバッグ情報をコンソールに出力
 */
function logDebugInfo() {
  console.log('=== Phase 1 Debug Info ===');
  console.log('AppState initialized:', appState);
  console.log('Do4 Frequency:', appState.do4Frequency);
  console.log('Threshold:', appState.threshold);
  console.log('Difficulty:', appState.difficulty.name);
  console.log('');
  console.log('定数テスト:');
  console.log('- Relative.Do4:', Relative.Do4);
  console.log('- Note.fromRelative(Do4):', Note.fromRelative(Relative.Do4));
  console.log('- Do4 at 440Hz frequency:', Note.fromRelative(Relative.Do4).frequency(440));
  console.log('========================');
}

// グローバルにエクスポート（デバッグ用）
window.appState = appState;
