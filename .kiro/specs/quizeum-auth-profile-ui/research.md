# Research & Design Decisions: quizeum-auth-profile-ui

## Summary
- **Feature**: quizeum-auth-profile-ui（Phase 5: 本人プレイ履歴専用タブ）
- **Discovery Scope**: Extension
- **Key Findings**:
  - `GET /api/user/play-history` と `PlayHistoryPage` 型は `quizeum-core` で実装済み。
  - プロフィールは `activeTab: 'quizzes' | 'lists'` のみ。本人判定は `currentUser?.id === uid`。
  - Bearer 取得パターンは `deleteUserAccount` と同一（`getIdToken()`）。

## Research Log

### プロフィールタブ構成
- **Context**: ユーザー指定「履歴は専用タブに」。
- **Findings**: 既存2タブと同じ `tabsContainer` に第3ボタンを追加するのが最小差分。別ルート `/profile/[uid]/history` は不要。
- **Implications**: `ProfileContentTab` に `'history'` を追加。他人プロフィールではボタン非表示。

### API呼び出しタイミング
- **Alternatives**: プロフィールマウント時に常時取得 / 履歴タブ初回選択時のみ。
- **Selected**: タブ初回選択時（lazy fetch）— 不要な読み込みとトークン要求を削減。
- **Follow-up**: タブ再選択時はキャッシュ済みリストをそのまま表示（再フェッチは任意・初版は再フェッチなし）。

### モード表示ラベル
- **Selected**: `src/lib/play-history-client.ts` に `getAttemptModeLabel` を集約（`normal`, `exam`, `flashcard`, `lateral`, `list` 等）。

## Design Decisions

### Decision: 専用タブ（第3タブ）方式
- **Rationale**: 要件7・ユーザー指示と一致。クイズ／リストと同等の情報アーキテクチャ。
- **Trade-offs**: タブ数増加（本人のみ）— モバイルでは横スクロールまたは折り返しで対応。

## Risks & Mitigations
- **未ログインでタブ表示** — `isMyProfile` ガードでタブ自体を出さない。
- **completedAt 文字列** — クライアントで `Date` 変換。
- **トークン期限切れ** — 401 時にログイン導線。

## References
- `.kiro/specs/quizeum-core/design.md` — PlayHistoryAPI
- `src/app/api/user/play-history/route.ts`
