import {
  quizMatchesTag,
  quizMatchesAllTags,
  type TagMatchSpec,
} from '../../src/lib/quiz-tag-match';
import type { Quiz } from '../../src/types';

function makeQuiz(
  overrides: Partial<Pick<Quiz, 'tags' | 'canonicalTagIds'>> = {}
): Pick<Quiz, 'tags' | 'canonicalTagIds'> {
  return {
    tags: [],
    canonicalTagIds: [],
    ...overrides,
  };
}

describe('quiz-tag-match', () => {
  const jsSpec: TagMatchSpec = { canonicalId: 'javascript', normalizedInput: 'js' };
  const webSpec: TagMatchSpec = { canonicalId: 'web', normalizedInput: 'web' };

  test('canonicalTagIds のみ一致', () => {
    const quiz = makeQuiz({ canonicalTagIds: ['javascript'], tags: [] });
    expect(quizMatchesTag(quiz, jsSpec)).toBe(true);
  });

  test('legacy tags のみ一致', () => {
    const quiz = makeQuiz({ tags: ['js'], canonicalTagIds: [] });
    expect(quizMatchesTag(quiz, jsSpec)).toBe(true);
  });

  test('マージ旧タグ文字列（canonicalId）が legacy に残る場合も一致', () => {
    const quiz = makeQuiz({ tags: ['javascript'], canonicalTagIds: [] });
    expect(quizMatchesTag(quiz, jsSpec)).toBe(true);
  });

  test('不一致', () => {
    const quiz = makeQuiz({ tags: ['python'], canonicalTagIds: ['python'] });
    expect(quizMatchesTag(quiz, jsSpec)).toBe(false);
  });

  test('quizMatchesAllTags: すべてのタグを満たす', () => {
    const quiz = makeQuiz({
      canonicalTagIds: ['javascript', 'web'],
      tags: [],
    });
    expect(quizMatchesAllTags(quiz, [jsSpec, webSpec])).toBe(true);
  });

  test('quizMatchesAllTags: 一部のみ一致なら false', () => {
    const quiz = makeQuiz({ canonicalTagIds: ['javascript'], tags: [] });
    expect(quizMatchesAllTags(quiz, [jsSpec, webSpec])).toBe(false);
  });

  test('quizMatchesAllTags: 空 specs は true', () => {
    const quiz = makeQuiz({ tags: ['anything'] });
    expect(quizMatchesAllTags(quiz, [])).toBe(true);
  });
});
