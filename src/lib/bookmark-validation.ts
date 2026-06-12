import {
  canViewQuiz,
  resolveFollowerStatus,
  resolveQuizVisibility,
} from './quiz-access';
import type { Quiz } from '../types';

export class QuestionNotBookmarkableError extends Error {
  readonly code = 'question-not-bookmarkable' as const;
  constructor(message = '親クイズが公開済みでない問題はブックマークできません') {
    super(message);
    this.name = 'QuestionNotBookmarkableError';
  }
}

export function assertParentQuizPublished(status: Quiz['status'] | undefined): void {
  if (status !== 'published') {
    throw new QuestionNotBookmarkableError();
  }
}

export async function assertQuizBookmarkable(
  quiz: Pick<Quiz, 'authorId' | 'status' | 'visibility'>,
  viewerUid: string
): Promise<void> {
  if (quiz.status !== 'published') {
    throw new QuestionNotBookmarkableError();
  }

  let isFollower = false;
  if (
    viewerUid !== quiz.authorId &&
    resolveQuizVisibility(quiz) === 'followers'
  ) {
    isFollower = await resolveFollowerStatus(viewerUid, quiz.authorId);
  }

  if (!canViewQuiz({ quiz, viewerUid, isFollower })) {
    throw new QuestionNotBookmarkableError('閲覧できないクイズはブックマークできません');
  }
}
