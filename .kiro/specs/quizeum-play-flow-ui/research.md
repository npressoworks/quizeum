# Research & Design Decisions: quizeum-play-flow-ui

## Summary
- **Feature**: quizeum-play-flow-ui（Phase 5 差分: クイズ単位リーダーボードUI）
- **Discovery Scope**: Extension（`quizeum-core` 実装済み、UI仕上げ）
- **Key Findings**:
  - `src/app/quiz/[id]/page.tsx` に暫定の二表縦並び実装あり（`sortLb` インライン、リプレイ行に `leaderboard-entry` 未付与）。
  - 読み取りヘルパー `getLeaderboardFirstPlay` / `getLeaderboardReplay` は `@/lib/leaderboard-ranking` に既存。
  - E2E `leaderboard.spec.ts` は旧「ハイスコア／最速」前提のまま。

## Research Log

### 既存クイズ詳細LB実装
- **Context**: Phase 5 コア実装後のUIギャップ確認。
- **Sources Consulted**: `src/app/quiz/[id]/page.tsx`, `src/lib/leaderboard-ranking.ts`, `e2e/leaderboard.spec.ts`
- **Findings**:
  - 初回／リプレイの2セクション縦並びは要件9.1を満たすが、タブUXとコンポーネント分離が未了。
  - ページ内 `sortLb` は要件9.8（表示のみ）と境界が曖昧。保存順を信頼する方針に変更。
  - リプレイ表の行に `data-testid="leaderboard-entry"` が欠落。
- **Implications**: `QuizDualLeaderboard` へ抽出し、read helper + slice のみに統一。

### プラットフォームLBとのUI一貫性
- **Context**: `/leaderboard` は既にタブUI（`leaderboard-tab`）。
- **Sources Consulted**: `src/app/leaderboard/page.tsx`
- **Findings**: クイズ単位LBもタブパターンを採用すると学習コストが低い。
- **Implications**: `quiz-leaderboard-tab-first` / `quiz-leaderboard-tab-replay` を設計。初回テーブルは `highscore-leaderboard` を後方互換維持。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 縦並び2表（現状） | 初回・リプレイを連続表示 | 実装済み | モバイルで縦長、タブ要件の弱い充足 | 採用しない |
| タブ切替 | 1系統ずつ表示 | コンパクト、/leaderboard と一貫 | タブ操作がE2Eで1ステップ増 | **採用** |
| ページ内インライン | page.tsx に表ロジック | 差分小 | 保守性・9.8境界が悪化 | 採用しない |

## Design Decisions

### Decision: 読み取りは `getLeaderboard*` + slice のみ
- **Context**: 要件9.8（更新・並び替えロジック禁止）。
- **Alternatives Considered**:
  1. ページ内 `compareLeaderboardRecords` で防御的ソート
  2. サーバー保存順を信頼し slice(0,5) のみ
- **Selected Approach**: 2 — `quizeum-core` が書き込み時に順位付け済み。
- **Rationale**: 責務分離。レガシー `leaderboard` の順序不整合はコア移行で解消。
- **Trade-offs**: 極稀にレガシーデータの表示順がずれる可能性。
- **Follow-up**: 移行後に legacy フィールド参照を廃止する際、本コンポーネントのフォールバック分岐を削除。

### Decision: `QuizDualLeaderboard` コンポーネント新設
- **Context**: 暫定実装のリファクタと E2E 契約の固定。
- **Selected Approach**: `src/components/quiz/quiz-dual-leaderboard.tsx` + CSS Module。
- **Rationale**: `QuizDetailPage` の責務をメタ・プレイ導線に集中。
- **Follow-up**: 単体テストは props で空配列／5件表示をスナップショットまたは RTL で検証（任意）。

## Risks & Mitigations
- **E2E破壊** — `fastest-leaderboard` 参照テストを `replay-leaderboard` に更新。
- **暫定縦並びからタブへ** — 同一 `data-testid="quiz-leaderboard"` を維持し既存シナリオの一部は継続可能。
- **legacy leaderboard 表示** — `getLeaderboardFirstPlay` に委譲しコアと同一ルール。

## References
- `.kiro/specs/quizeum-core/design.md` — LB永続化・`LeaderboardRecord`
- `docs/detailed_design.md` — 画面F-801/F-802（表示側）
- `src/types/index.ts` — `LeaderboardRecord`
