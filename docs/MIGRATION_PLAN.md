# Relative Pitch Adjuster 移植計画書

## 📋 プロジェクト概要

### 現行アプリケーションの機能
Flutter で構築された相対音感トレーニングアプリ。以下の機能を持つ：

1. **音程当てゲーム**: ランダムに生成された3つの音符 + 基準音（Do4）を表示
2. **Wheel Selector（回転セレクタ）**: セント単位で音程を調整
3. **音声再生**: Tone.js を使用したシンセサイザー音声
4. **正誤判定**: 閾値に基づく正解判定と差分表示
5. **難易度選択**: 5段階（no check / easy / normal / hard / very hard）
6. **履歴表示**: 各音符の最後の誤差を LocalStorage で保存・表示

---

## 🎯 移植先技術スタック

| 項目 | 技術 |
|------|------|
| HTML/CSS | HTML5 + Tailwind CSS (CDN) |
| JavaScript | Vanilla JS (ES6 Modules) |
| 音声 | Tone.js |
| ストレージ | localStorage |
| ホスティング | GitHub Pages (`docs/` ディレクトリ) |

---

## 🧩 アーキテクチャ設計

```
docs/
├── index.html          # メインHTML
├── css/
│   └── styles.css      # カスタムスタイル（Tailwind 補完）
├── js/
│   ├── main.js         # エントリーポイント
│   ├── constants.js    # ソルフェージュ定数・音符定義
│   ├── state.js        # アプリケーション状態管理
│   ├── audio.js        # Tone.js ラッパー
│   ├── wheel.js        # Wheel Selector コンポーネント ★難所
│   ├── note.js         # 音符表示コンポーネント
│   ├── question.js     # 問題生成ロジック
│   └── storage.js      # localStorage 操作
└── assets/
    └── (必要に応じてアイコン等)
```

---

## 🔑 コア機能の分析

### 1. ソルフェージュ定数 (`solfege_constants.dart`)
```
音符: Do, Re, Mi, Fa, Sol, La, Si
相対音: Do3 〜 Do5 (15音)
セント値: Do4=0 を基準に -1200 〜 +1200
周波数計算: f = do4Frequency × 2^(cent/1200)
```

### 2. 状態管理 (`question_notifier.dart`)
- `didAnswer`: 回答済みフラグ
- `isFirstTry`: 初回挑戦フラグ
- `isCleared`: クリア判定
- `answerCents`: 回答値（4つの音符分）
- `correctCents`: 正解値
- `do4Frequency`: 基準周波数（ランダム）
- `relativeIndexes`: 問題の音符インデックス
- `threshold`: 難易度に応じた閾値

### 3. Wheel Selector (`answerer.dart`) ★難所
```
- 3501個のアイテム（-1750 〜 +1750 セント相当）
- itemExtent: 15px
- スクロール時に音声再生
- タッチ/ドラッグで音を再生
- アニメーション付きスクロール
```

### 4. 音声再生 (`js_caller.dart` + `my_audio.js`)
```javascript
- play(frequency): 音の開始
- stop(): 音の停止
- setNote(frequency): 音程変更
- playLong(frequency): 2秒間再生（スクロール用）
```

### 5. 問題生成アルゴリズム (`question_notifier.dart`)
```
条件:
- 最後の音符は Do4 から ±4 以内
- Fa3, La3, Fa4, La4 は最後に来ない
- 隣接音符は 4音程以内
- 同じ音符の連続なし
- 難易度によるフィルタリング
```

---

## ⚠️ 難所分析: Wheel Selector

### Flutter での実装
```dart
ListWheelScrollView(
  controller: FixedExtentScrollController,
  itemExtent: 15,
  children: List.generate(3501, (_) => Container(...)),
  onSelectedItemChanged: (i) => { ... },
)
```

### JavaScript での実現方法候補

#### 方針A: CSS Transform + タッチイベント
- `transform: translateY()` でスクロール感を実現
- `wheel` イベント + タッチイベントでスクロール
- 慣性スクロールの実装が必要
- **評価**: 細かい制御可能だが実装コスト高

#### 方針B: スライダー (`<input type="range">`)
- シンプルだがホイール感が出ない
- **評価**: 代替案としては最もシンプル

#### 方針C: カスタム Wheel コンポーネント
- 円形UIで回転操作
- 視覚的にインパクトあり
- **評価**: UXは良いが実装複雑

#### 方針D: ドラッグ可能な縦スクロール領域（推奨）
- マウスドラッグ/タッチで上下スクロール
- 中央に選択インジケーター
- CSS スナップ or JS による位置補正
- **評価**: Flutter の体験に最も近い

### 推奨実装: 方針D

```
構成要素:
1. 固定高さのコンテナ
2. 内部に縦長のスクロール領域
3. 各アイテムは色付きバー（15px間隔）
4. 中央インジケーター（選択位置表示）
5. マウス/タッチドラッグでスクロール
6. スクロール中に音声再生
7. animateTo() 相当の機能
```

---

## 📅 実装フェーズ

### Phase 1: 基盤構築（優先度: 高）✅ 完了
| # | タスク | 詳細 | 状態 |
|---|--------|------|------|
| 1-1 | プロジェクト構造作成 | `docs/` ディレクトリと基本ファイル | ✅ |
| 1-2 | HTML + Tailwind セットアップ | 基本レイアウト、ダークテーマ | ✅ |
| 1-3 | 定数定義 (`constants.js`) | Solfege, Relative, Note クラス相当 | ✅ |
| 1-4 | 状態管理 (`state.js`) | QuestionNotifier 相当の状態管理 | ✅ |

### Phase 2: 音声機能（優先度: 高）✅ 完了 (2026-01-31)
| # | タスク | 詳細 | 状態 |
|---|--------|------|------|
| 2-1 | Tone.js 統合 | CDN 読み込み、初期化 | ✅ |
| 2-2 | Audio モジュール (`audio.js`) | play, stop, setNote, playLong | ✅ |

### Phase 3: UI コンポーネント（優先度: 高）
| # | タスク | 詳細 | 見積 |
|---|--------|------|------|
| 3-1 | NoteContainer (`note.js`) | 音符表示カード | 45分 |
| 3-2 | **Wheel Selector (`wheel.js`)** | ★メインの難所 | 2-3時間 |
| 3-3 | QuestionNote 統合 | 差分表示 + NoteContainer + Wheel | 30分 |

### Phase 4: ゲームロジック（優先度: 高）
| # | タスク | 詳細 | 見積 |
|---|--------|------|------|
| 4-1 | 問題生成 (`question.js`) | generateRelativeIndexes ロジック | 45分 |
| 4-2 | 正誤判定・クリア処理 | answer(), goToNext() | 45分 |
| 4-3 | OK/Next/Retry ボタン | 状態に応じた表示切替 | 30分 |

### Phase 5: 補助機能（優先度: 中）
| # | タスク | 詳細 | 見積 |
|---|--------|------|------|
| 5-1 | 難易度セレクタ | 5段階選択UI | 30分 |
| 5-2 | Hide Cent ボタン | セント表示トグル | 15分 |
| 5-3 | Last Differences 表示 | 履歴表示コンポーネント | 45分 |
| 5-4 | localStorage 永続化 | 履歴の保存・読み込み | 30分 |

### Phase 6: 仕上げ（優先度: 低）
| # | タスク | 詳細 | 見積 |
|---|--------|------|------|
| 6-1 | レスポンシブ対応 | モバイル最適化 | 30分 |
| 6-2 | PWA 対応（任意） | Service Worker, manifest.json | 1時間 |
| 6-3 | テスト・デバッグ | 各ブラウザでの動作確認 | 1時間 |
| 6-4 | README 更新 | GitHub Pages 公開手順 | 15分 |

---

## 🕐 総見積時間

| フェーズ | 時間 |
|---------|------|
| Phase 1 | 2時間 |
| Phase 2 | 45分 |
| Phase 3 | 3.5〜4.5時間 |
| Phase 4 | 2時間 |
| Phase 5 | 2時間 |
| Phase 6 | 2.5〜3時間 |
| **合計** | **約13〜15時間** |

---

## 🎨 UI デザイン方針

### カラーパレット (Tailwind)
```
Do  → red-500
Re  → orange-500
Mi  → yellow-500
Fa  → green-500
Sol → blue-500
La  → indigo-500
Si  → purple-500

背景 → gray-900 (ダークテーマ)
アクセント → cyan-500
```

### レイアウト構成
```
┌─────────────────────────────────────────┐
│            Relative Pitch Adjuster      │ ← ヘッダー
├─────────────────────────────────────────┤
│                                         │
│    [+12] [+5]  [-3]  [0]               │ ← 差分表示
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐             │
│    │Sol│ │Mi │ │Re │ │Do │             │ ← 正解の音符
│    └───┘ └───┘ └───┘ └───┘             │
│                                         │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐             │
│    │Sol│ │Mi │ │Re │ │Do │             │ ← 回答の音符
│    │+12│ │+5 │ │-3 │ │+0 │             │
│    └───┘ └───┘ └───┘ └───┘             │
│     ▒▒▒   ▒▒▒   ▒▒▒   ▒▒▒              │ ← Wheel
│     ▒▒▒   ▒▒▒   ▒▒▒   ▒▒▒              │
│     ▒▒▒   ▒▒▒   ▒▒▒   ▒▒▒              │
│                                         │
│      [Hide Cent]    [OK! / Next]       │ ← ボタン
│                                         │
├─────────────────────────────────────────┤
│  Your Last Gap          Difficulty     │
│  ┌──────────────┐      ┌──────────┐    │
│  │ Do5  +3      │      │ easy     │    │
│  │ Si4  -12     │      └──────────┘    │
│  │ ...          │                      │
│  └──────────────┘                      │
└─────────────────────────────────────────┘
```

---

## 🚀 実装開始チェックリスト

### Phase 1: 基盤構築 ✅ 完了 (2026-01-31)
- [x] `docs/` ディレクトリ作成
- [x] `index.html` 基本構造
- [x] Tailwind CSS CDN 設定
- [x] Tone.js CDN 設定
- [x] `js/constants.js` 実装
- [x] `js/state.js` 実装
- [x] `css/styles.css` 実装
- [x] `js/main.js` 統合

### Phase 2: 音声機能 ✅ 完了 (2026-01-31)
- [x] `js/audio.js` 実装
  - play(), stop(), setNote(), playLong() 
  - centToFrequency(), frequencyToCent()
  - ブラウザ AudioContext ポリシー対応
- [x] `js/main.js` に Audio 統合
- [x] テスト用音声再生ボタン追加

### Phase 3〜6: 未実装
- [ ] `js/wheel.js` 実装 ★
- [ ] `js/note.js` 実装
- [ ] `js/question.js` 実装
- [ ] `js/storage.js` 実装
- [ ] 動作テスト
- [ ] GitHub Pages 公開設定

---

## 📝 注意事項

1. **モバイル対応**: iOS Safari では Tone.js の AudioContext が自動でサスペンドされるため、ユーザー操作後に `Tone.start()` が必要

2. **Wheel の操作感**: タッチデバイスとマウスの両方で快適に操作できるよう、慣性スクロールの調整が重要

3. **パフォーマンス**: Wheel の要素数 (3501個) が多いため、仮想スクロールや要素の再利用を検討

4. **アクセシビリティ**: キーボード操作のサポートも考慮（上下キーで微調整など）

---

*作成日: 2026年1月31日*
