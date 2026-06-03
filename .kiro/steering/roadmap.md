# Roadmap

## Overview
本プロジェクトは、クイズ投稿SNS「quizeum」のUIおよびフロントエンド画面群の実装ロードマップです。画面遷移図（`screen_transition.md`）で定義された21枚の画面を、機能ドメインごとに4つのウェーブ（スペック）に分割し、コアシステム（`quizeum-core`）のロジックやデータモデルと密接に結合しながら段階的に構築します。

## Approach Decision
- **Chosen**: 機能別垂直分割アプローチ (Vertical Feature Slicing)
- **Why**: 画面数および機能要件が非常に多いため、一括作成ではなく、認証・プロフィール、プレイ・探索、クリエイター管理、モデレーションという関連の深い垂直スライスごとに分割して設計・実装・検証を回すことで、手戻りを防止し、着実なデータ結合を行います。
- **Rejected alternatives**: 静的モックファースト（水平分割）アプローチ。21画面すべての静的HTML/CSSを先に構築する手法も検討しましたが、ステート管理やAPI連携時の手戻りリスクが高く、段階的な動作確認が難しいため却下しました。

## Scope
- **In**:
  - `screen_transition.md` に記載されている21枚の画面すべてのUIおよびNext.js App Routerでのルーティング設計。
  - Firebase Auth / Firestore / Storage / Gemini API などのコアサービス連携。
  - 親しみやすく洗練されたモダンなスタイリング（Next.js + Vanilla CSS、硬すぎないカジュアルかつプレミアムなデザイン）。
  - ウミガメのスーププレイ画面における「・・・AIが質問を分析中です」等のリッチなインタラクション表示。
- **Out**:
  - インポート機能などのシステム外連携（エクスポート機能はインスコープ）。
  - リアルタイム対戦システムなど、画面遷移図にない未定義機能。

## Constraints
- **Styling**: TailwindCSSは使用せず、Vanilla CSS（CSS Modules等）で柔軟かつ高品質に表現します。
- **Design System**: 洗練されつつも気軽に利用できるカジュアルモダンなデザイン（角丸の積極的な使用、親しみやすいカラーパレット、過度に硬すぎないタイポグラフィ）。
- **State Preservation**: プレイ画面でのリロードやオフライン時のセッション保護を `localStorage` 等で確実に維持します。

## Boundary Strategy
- **Why this split**: 認証、プレイ、クリエイター、管理といった役割ごとに仕様を閉じることで、テスト検証がしやすく、段階的な実装がスムーズになります。
- **Shared seams to watch**: 共通レイアウト（`Header` 等）、`useAuth` によるログイン状態の監視とグローバルステート、共通のCSS変数およびデザインシステムトークン。

## Specs (dependency order)

> 凡例: [x] = spec定義承認済み, [impl] = 実装完了, [ ] = 実装待ち

### Wave 0: コアロジック基盤
- [x][impl] quizeum-core -- Firebase/Firestoreサービスレイヤー、型定義、APIルート等コアロジックの実装。Dependencies: none

### Wave 1: 認証・プロフィール
- [x][impl] quizeum-auth-profile-ui -- 認証画面、プロフィール関連画面、通知一覧、ソーシャルフォロー連携UIの実装。Dependencies: quizeum-core

### Wave 2: プレイフロー
- [x][impl] quizeum-play-flow-ui -- ホーム画面、クイズ詳細・プレイ（通常・ウミガメスープ含む）、結果、弱点克服、リーダーボード、探索（タグ/ジャンル）関連画面UIの実装。Dependencies: quizeum-auth-profile-ui

### Wave 3: クリエイター管理
- [x][impl] quizeum-creator-dash-ui -- クイズおよびクイズリストの作成・編集、作家ダッシュボード（アナリティクス、指摘管理、エクスポート）UIの実装。Dependencies: quizeum-play-flow-ui

### Wave 4: モデレーション・ガバナンス（完了）
- [x][impl] quizeum-moderation-governance-ui -- 管理者モデレーション、マージリクエスト、ジャンル新設申請・投票等コミュニティ自治UIの実装。Dependencies: quizeum-creator-dash-ui

---

## Phase 5: リーダーボード分割 & マイページプレイ履歴（2026-06-03 ディスカバリー）

### Overview（本フェーズ）
クイズ単位リーダーボードを「初回プレイ」と「2回目以降（リプレイ）」に分離し、ログインユーザーがマイページ（自身のプロフィール）から `attempts` に基づくプレイ履歴を閲覧できるようにする。要件・設計の正本は `docs/` および各 `.kiro/specs/*/requirements.md`・`design.md` を同期更新する。

### Approach Decision（本フェーズ）
- **Chosen**: デュアルフィールド方式 — `quizzes.leaderboardFirstPlay` と `quizzes.leaderboardReplay`（各最大5件）
- **Why**: クイズ詳細UIの2タブ表示とトランザクション更新が単純。既存 `leaderboard` 単一配列の「初回／リプレイ」混在を防ぎ、マイグレーションも `leaderboard` → `leaderboardFirstPlay` リネームで完結する。
- **Rejected alternatives**:
  - 単一配列 + `playOrdinal` フィールド: 更新・ソート・上位5抽出が複雑化し、同一ユーザーの初回/リプレイが1配列に混在する。
  - サブコレクション方式: top5 用途に対して過剰な読み取りコストと実装範囲。

### Scope（本フェーズ）
- **In**:
  - F-801/F-802 の要件改定（初回限定 LB / リプレイ LB の表示・登録ルール）
  - 新機能: マイページからのプレイ履歴一覧（本人のみ、ページネーション）
  - `docs/requirements_definition.md`, `docs/db_design.md`, `docs/api_specification.md`, `docs/detailed_design.md`, `docs/screen_transition.md` の同期
  - `quizeum-core` / `quizeum-play-flow-ui` / `quizeum-auth-profile-ui` の spec 更新と実装
- **Out**:
  - 総合リーダーボード（`/leaderboard`）の仕様変更
  - 他人のプロフィールからのプレイ履歴閲覧
  - テストプレイ・未永続化モードの履歴表示
  - 既存 `leaderboard` データの自動再分類（手動マイグレーションスクリプトは別途検討可）

### Constraints（本フェーズ）
- **登録条件（2026-06-03 改定）**: 全問正解は不要。認証済みの永続化対象プレイ完了時に、正解数（`score`）と合計解答時間（`elapsedSeconds`）をリーダーボードへ登録候補とする（テストプレイ等は除外）。初回・リプレイ双方で同一ルール。
- **順位計算（canonical）**: 正解数を優先し、同数ならタイム（`elapsedSeconds`）で順位付け — `score` 降順 → `elapsedSeconds` 昇順。水平思考（ウミガメ）も合格完了時は同一比較式。
- **更新ルール**: 各LB配列で同一 `userId` は最大1エントリ。新記録が既存エントリより優位（正解数が多い、または同点で時間が短い）のときのみ差し替え。差し替えまたは新規挿入後に配列全体をソートし上位5名を保持。初回LBは当該ユーザーの**1回目の完了 attempt** のみが対象（2回目以降はリプレイLBのみ）。
- 「初回プレイ」判定: 対象クイズに対する当該ユーザーの **完了済み** `attempts` が0件のタイミングの完了記録のみ `leaderboardFirstPlay` を更新。2回目以降は `leaderboardReplay` のみ（初回側は不変）
- プレイ履歴: `mode` が `test-play` のものは除外。`completedAt` 降順、初期20件 + 追加読み込み

### Boundary Strategy（本フェーズ）
- **Core** がデータモデル・`saveAttempt` / `updateLeaderboard` / 履歴クエリAPIを所有
- **Play-flow UI** がクイズ詳細の2系統LB表示のみ所有
- **Auth-profile UI** がマイページ履歴セクション（または `/profile/[uid]/history`）のみ所有
- **Shared seam**: 初回/リプレイ判定ロジックは Core に1か所集約し UI は読み取り専用

## Existing Spec Updates（Phase 5・依存順）
- [x] quizeum-core -- `leaderboardFirstPlay` / `leaderboardReplay` 型・永続化、`saveAttempt`・`verify-truth` 内LB振り分け、`listUserPlayHistory` API、既存 `leaderboard` 後方互換読み取り。Dependencies: none
- [x] quizeum-play-flow-ui -- クイズ詳細の「初回プレイランキング」「リプレイランキング」タブ/セクション、E2E更新。Dependencies: quizeum-core
- [x] quizeum-auth-profile-ui -- 本人プロフィールにプレイ履歴専用タブ（API連携・ページング・E2E）。Dependencies: quizeum-core

## Direct Implementation Candidates（Phase 5）
- [x] docs-sync -- `docs/requirements_definition.md`（F-801/F-802 + F-108 プレイ履歴）、`docs/db_design.md`、`docs/api_specification.md`、`docs/detailed_design.md`（シーケンス・LB分岐）、`screen_transition.md`（プロフィール・クイズ詳細）を core spec 更新と同時に整合

## Specs (dependency order)
（Phase 5 では新規 spec なし — 上記 Existing Spec Updates のみ）
