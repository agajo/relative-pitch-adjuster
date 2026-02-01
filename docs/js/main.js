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

  // How to Play の多言語対応
  setupHowToPlay();

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
 * How to Play の多言語表示を初期化
 */
function setupHowToPlay() {
  const select = document.getElementById('howto-lang');
  if (!select) return;

  const defaultLang = resolvePreferredHowToLanguage();
  select.value = defaultLang;
  renderHowToPlay(defaultLang);

  select.addEventListener('change', (e) => {
    const lang = e.target.value;
    renderHowToPlay(lang);
  });
}

/**
 * ブラウザの言語設定から表示言語を決定
 * 非対応なら英語にフォールバック
 * @returns {string}
 */
function resolvePreferredHowToLanguage() {
  const candidates = (navigator.languages && navigator.languages.length > 0)
    ? navigator.languages
    : [navigator.language || 'en'];

  for (const locale of candidates) {
    const normalized = String(locale).toLowerCase();

    if (normalized.startsWith('ja')) return 'ja';
    if (normalized.startsWith('ko')) return 'ko';
    if (normalized.startsWith('es')) return 'es';
    if (normalized.startsWith('fr')) return 'fr';
    if (normalized.startsWith('de')) return 'de';
    if (normalized.startsWith('ru')) return 'ru';

    if (normalized.startsWith('pt')) {
      if (normalized.includes('-br')) return 'pt-BR';
      continue;
    }

    if (normalized.startsWith('zh')) {
      if (normalized.includes('hant') || normalized.includes('-tw') || normalized.includes('-hk') || normalized.includes('-mo')) {
        return 'zh-Hant';
      }
      if (normalized.includes('hans') || normalized.includes('-cn') || normalized.includes('-sg')) {
        return 'zh-Hans';
      }
      return 'zh-Hans';
    }

    if (normalized.startsWith('en')) return 'en';
  }

  return 'en';
}

/**
 * How to Play を描画
 * @param {string} lang
 */
function renderHowToPlay(lang) {
  const content = document.getElementById('howto-content');
  const titleEl = document.getElementById('howto-title');
  const labelEl = document.getElementById('howto-lang-label');
  if (!content || !titleEl || !labelEl) return;

  const copy = howToPlayCopy[lang] || howToPlayCopy.en;

  titleEl.textContent = copy.title;
  labelEl.textContent = copy.langLabel;

  const listItems = copy.steps.map((step) => `<li>${step}</li>`).join('');
  content.innerHTML = `
    <p class="howto-emphasis">${copy.intro}</p>
    <p>${copy.referenceDo}</p>
    <ul>${listItems}</ul>
  `;
}

const howToPlayCopy = {
  en: {
    title: 'How to Play',
    langLabel: 'Language',
    intro: 'Purpose: train your relative pitch.',
    referenceDo: 'The reference Do is set independently of concert C and is re-chosen each question.',
    steps: [
      'Press <span class="howto-emphasis">Start</span> to begin and enable audio.',
      'Use the wheel under the first three notes to match the pitch; tap the note cards to listen.',
      'The fourth note is the reference Do and does not move.',
      'Press <span class="howto-emphasis">OK!</span> to check; use <span class="howto-emphasis">Next</span> if Correct, or <span class="howto-emphasis">Retry</span> if Incorrect.',
      'After answering, toggle <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span>; adjust <span class="howto-emphasis">Difficulty</span> anytime.'
    ]
  },
  ja: {
    title: '遊び方',
    langLabel: '言語',
    intro: '目的：相対音感を鍛えること。',
    referenceDo: '基準のDoは、いわゆるCの音とは関係なく決まり、問題ごとに設定されます。',
    steps: [
      '<span class="howto-emphasis">Start</span> を押して開始し、Audio を有効化します。',
      '最初の3つの音符の下にあるホイールを動かして音程を合わせ、音符カードをタップして聴き比べます。',
      '4つ目の音符は基準のDoで、ホイールは動きません。',
      '<span class="howto-emphasis">OK!</span> で判定。Correct なら <span class="howto-emphasis">Next</span>、Incorrect なら <span class="howto-emphasis">Retry</span> を使います。',
      '回答後に <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span> を切り替え、<span class="howto-emphasis">Difficulty</span> を調整できます。'
    ]
  },
  'zh-Hans': {
    title: '玩法说明',
    langLabel: '语言',
    intro: '目的：训练相对音感。',
    referenceDo: '基准 Do 的设定与固定的 C 无关，每一题都会重新设置。',
    steps: [
      '按 <span class="howto-emphasis">Start</span> 开始并启用音频。',
      '拖动前三个音符下方的轮盘来对准音高；点击音符卡片进行试听。',
      '第4个音符是基准 Do，轮盘不会移动。',
      '按 <span class="howto-emphasis">OK!</span> 判定；Correct 时用 <span class="howto-emphasis">Next</span>，Incorrect 时用 <span class="howto-emphasis">Retry</span>。',
      '答题后可切换 <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span>，并随时调整 <span class="howto-emphasis">Difficulty</span>。'
    ]
  },
  'zh-Hant': {
    title: '玩法說明',
    langLabel: '語言',
    intro: '目的：訓練相對音感。',
    referenceDo: '基準 Do 的設定與固定的 C 無關，每一題都會重新設定。',
    steps: [
      '按 <span class="howto-emphasis">Start</span> 開始並啟用音訊。',
      '拖動前三個音符下方的轉輪來對準音高；點擊音符卡片進行聆聽。',
      '第4個音符是基準 Do，轉輪不會移動。',
      '按 <span class="howto-emphasis">OK!</span> 判定；Correct 時用 <span class="howto-emphasis">Next</span>，Incorrect 時用 <span class="howto-emphasis">Retry</span>。',
      '答題後可切換 <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span>，並隨時調整 <span class="howto-emphasis">Difficulty</span>。'
    ]
  },
  ko: {
    title: '플레이 방법',
    langLabel: '언어',
    intro: '목적: 상대 음감을 훈련합니다.',
    referenceDo: '기준 Do는 고정된 C와 무관하게 정해지며, 문제마다 새로 설정됩니다.',
    steps: [
      '<span class="howto-emphasis">Start</span> 를 눌러 시작하고 Audio를 활성화합니다.',
      '앞의 3개 음표 아래의 휠을 움직여 음정을 맞추고, 음표 카드를 탭해 들어봅니다.',
      '4번째 음표는 기준 Do이며 휠이 움직이지 않습니다.',
      '<span class="howto-emphasis">OK!</span> 로 채점합니다. Correct이면 <span class="howto-emphasis">Next</span>, Incorrect이면 <span class="howto-emphasis">Retry</span> 를 사용합니다.',
      '답안 후 <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span> 를 전환하고, <span class="howto-emphasis">Difficulty</span> 를 언제든 조정할 수 있습니다.'
    ]
  },
  es: {
    title: 'Cómo jugar',
    langLabel: 'Idioma',
    intro: 'Objetivo: entrenar el oído relativo.',
    referenceDo: 'El Do de referencia se define de forma independiente del C de concierto y se vuelve a elegir en cada pregunta.',
    steps: [
      'Pulsa <span class="howto-emphasis">Start</span> para comenzar y activar el audio.',
      'Mueve la rueda bajo las tres primeras notas para ajustar la altura; toca las tarjetas para escuchar.',
      'La cuarta nota es el Do de referencia y no se mueve.',
      'Pulsa <span class="howto-emphasis">OK!</span> para comprobar; usa <span class="howto-emphasis">Next</span> si es Correct, o <span class="howto-emphasis">Retry</span> si es Incorrect.',
      'Después de responder, alterna <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span> y ajusta <span class="howto-emphasis">Difficulty</span> cuando quieras.'
    ]
  },
  'pt-BR': {
    title: 'Como jogar',
    langLabel: 'Idioma',
    intro: 'Objetivo: treinar o ouvido relativo.',
    referenceDo: 'O Do de referência é definido de forma independente do C de concerto e é escolhido novamente a cada questão.',
    steps: [
      'Clique em <span class="howto-emphasis">Start</span> para começar e ativar o áudio.',
      'Use a roda abaixo das três primeiras notas para ajustar a altura; toque nos cartões para ouvir.',
      'A quarta nota é o Do de referência e não se move.',
      'Pressione <span class="howto-emphasis">OK!</span> para verificar; use <span class="howto-emphasis">Next</span> se for Correct ou <span class="howto-emphasis">Retry</span> se for Incorrect.',
      'Depois de responder, alterne <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span> e ajuste <span class="howto-emphasis">Difficulty</span> quando quiser.'
    ]
  },
  fr: {
    title: 'Comment jouer',
    langLabel: 'Langue',
    intro: 'Objectif : entraîner l’oreille relative.',
    referenceDo: 'Le Do de référence est défini indépendamment du C de concert et est réattribué à chaque question.',
    steps: [
      'Appuyez sur <span class="howto-emphasis">Start</span> pour commencer et activer l’audio.',
      'Réglez la hauteur avec la roue sous les trois premières notes ; touchez les cartes pour écouter.',
      'La quatrième note est le Do de référence et ne bouge pas.',
      'Appuyez sur <span class="howto-emphasis">OK!</span> pour vérifier ; utilisez <span class="howto-emphasis">Next</span> si Correct ou <span class="howto-emphasis">Retry</span> si Incorrect.',
      'Après la réponse, basculez <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span> et ajustez <span class="howto-emphasis">Difficulty</span> à tout moment.'
    ]
  },
  de: {
    title: 'Spielanleitung',
    langLabel: 'Sprache',
    intro: 'Ziel: relatives Gehör trainieren.',
    referenceDo: 'Das Referenz-Do wird unabhängig vom Konzert-C festgelegt und pro Aufgabe neu gewählt.',
    steps: [
      'Drücke <span class="howto-emphasis">Start</span>, um zu beginnen und Audio zu aktivieren.',
      'Stelle die Tonhöhe mit dem Rad unter den ersten drei Noten ein; tippe die Karten an, um zu hören.',
      'Die vierte Note ist das Referenz-Do und bewegt sich nicht.',
      'Drücke <span class="howto-emphasis">OK!</span> zum Prüfen; nutze <span class="howto-emphasis">Next</span> bei Correct oder <span class="howto-emphasis">Retry</span> bei Incorrect.',
      'Nach der Antwort kannst du <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span> umschalten und <span class="howto-emphasis">Difficulty</span> jederzeit anpassen.'
    ]
  },
  ru: {
    title: 'Как играть',
    langLabel: 'Язык',
    intro: 'Цель: тренировать относительный слух.',
    referenceDo: 'Опорная Do выбирается независимо от концертного C и заново задаётся для каждого задания.',
    steps: [
      'Нажмите <span class="howto-emphasis">Start</span>, чтобы начать и включить звук.',
      'Регулируйте высоту колесом под первыми тремя нотами; нажимайте на карточки, чтобы слушать.',
      'Четвёртая нота — опорная Do, она не двигается.',
      'Нажмите <span class="howto-emphasis">OK!</span> для проверки; используйте <span class="howto-emphasis">Next</span>, если Correct, или <span class="howto-emphasis">Retry</span>, если Incorrect.',
      'После ответа переключайте <span class="howto-emphasis">Hide Cent</span> / <span class="howto-emphasis">Show Cent</span> и в любой момент меняйте <span class="howto-emphasis">Difficulty</span>.'
    ]
  }
};

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
