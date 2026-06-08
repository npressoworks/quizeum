# Brief: quizeum-play-flow-ui — Phase 15 通常モードプレイフィードバックフロー（2026-06-08）

## Problem
通常モードのプレイ中、回答後すぐ次問へ自動遷移するため正誤・解説を確認できない。わからない問題をスキップする手段がない。全問完了後は「解答データを送信中...」の白紙待機が発生し、結果画面の Suspense シェルが活かされない。

## Current State
- `usePlayState.handleAnswerSubmit` は回答記録と `currentIdx` 進行を一体で実行（通常モードは自動次問）
- 早押しのみ `showFeedback=true` 時に即時正誤 +「次の問題へ」UI あり
- 全問完了で `saveAttempt` 完了まで「解答データを送信中...」を表示してから結果へ遷移
- 結果 `page.tsx` は RSC + `ResultSkeleton` 済みだがプレイ側が遷移をブロック

## Desired Outcome
- **通常モードのみ**: 回答 or スキップ → 即時正誤表示 →「次へ」／最終問は「結果を見る」
- スキップは空回答と同様に不正解（`failedQuestionIds`）
- 「解答データを送信中...」廃止。結果画面へ即遷移し `ResultSkeleton` で枠表示、`saveAttempt` はバックグラウンド
- 模擬試験・フラッシュカード・ウミガメ・問題リストは現状維持

## Approach
**統一フィードバックフロー + 楽観的結果遷移（アプローチ A）**
- `usePlayState` を「回答記録」と「次問進行」に分離（通常モードのみフィードバック待ち）
- 共有 `PostAnswerFeedback` UI で全問題形式に正誤・解説・次へ／結果を見る
- 完了時: sessionStorage に楽観的 attempt を保存 → 即 `router.push`（`localId`）→ バックグラウンド `saveAttempt` → 成功時 `attemptId` に URL 置換

## Scope
- **In**: `mode=normal` の全問題形式、スキップボタン、楽観的結果遷移、結果 Client の pending attempt 読み取り
- **Out**: exam / flashcard / lateral / question-list のフロー変更、`saveAttempt` API 変更（Core）、test-play

## Boundary Candidates
- `usePlayState` — record vs advance
- `PostAnswerFeedback` — 正誤・解説・CTA
- `handlePlayComplete` — 楽観的遷移 + バックグラウンド保存
- `QuizResultClient` — optimistic / Firestore フォールバック

## Out of Boundary
- `quizeum-core` の `saveAttempt` スキーマ・API 変更
- クイズ詳細の「即時正誤表示」トグル（通常モードでは新フローを常時適用しトグルは無効化または非表示）

## Upstream / Downstream
- **Upstream**: 既存 `saveAttempt`, `addPendingSyncAttempt`, `ResultSkeleton`, 正誤判定ユーティリティ
- **Downstream**: E2E 通常プレイフロー更新、Phase 12 要件 15.25 の挙動改定

## Existing Spec Touchpoints
- **Extends**: 要件 3, 要件 5, 要件 15（結果 Suspense 活用）
- **Adjacent**: Phase 14 結果アコーディオン、Phase 12 追補プレイ Suspense

## Constraints
- スキップ = 空文字 `''` 提出と同等（不正解）
- Vanilla CSS / 既存 `play.module.css` 踏襲
- オフライン完了時は既存 `localId` + pending sync パターンを維持
