'use client';

import { MarkdownContent } from '@/components/markdown/markdown-content';
import { QuickPressQuestionText } from '@/components/quiz/quick-press-question-text';
import type { QuickPressCharToken } from '@/lib/quick-press-plain-text';
import type { Question } from '@/types';

type QuestionTextDisplayProps = {
  question: Question | undefined;
  className?: string;
  /** quick-press: ストリームで届いた強調フラグ付きトークン列 */
  quickPressDisplayTokens?: QuickPressCharToken[];
  isQuickPressReading?: boolean;
};

export function QuestionTextDisplay({
  question,
  className,
  quickPressDisplayTokens = [],
  isQuickPressReading = false,
}: QuestionTextDisplayProps) {
  if (!question) {
    return <h2 className={className} />;
  }

  if (question.type === 'quick-press') {
    if (!isQuickPressReading) {
      return <h2 className={className} />;
    }
    return (
      <QuickPressQuestionText
        tokens={quickPressDisplayTokens}
        className={className}
      />
    );
  }

  return (
    <MarkdownContent
      markdown={question.questionText}
      className={className}
      as="h2"
    />
  );
}
