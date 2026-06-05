import type { Quiz } from '../types';
import { normalizeTag } from '../services/quiz-validation';

export interface TagMatchSpec {
  /** resolveCanonicalTagIds の結果 */
  canonicalId: string;
  /** normalizeTag 済みの入力タグ */
  normalizedInput: string;
}

/** 要件 11.3 と同型: canonicalTagIds 優先、legacy tags フォールバック */
export function quizMatchesTag(
  quiz: Pick<Quiz, 'tags' | 'canonicalTagIds'>,
  spec: TagMatchSpec
): boolean {
  const canonicalIds = quiz.canonicalTagIds ?? [];
  if (canonicalIds.includes(spec.canonicalId)) {
    return true;
  }

  const legacyNormalized = new Set((quiz.tags ?? []).map((t) => normalizeTag(t)));
  return (
    legacyNormalized.has(spec.normalizedInput) || legacyNormalized.has(spec.canonicalId)
  );
}

export function quizMatchesAllTags(
  quiz: Pick<Quiz, 'tags' | 'canonicalTagIds'>,
  specs: TagMatchSpec[]
): boolean {
  if (specs.length === 0) return true;
  return specs.every((spec) => quizMatchesTag(quiz, spec));
}
