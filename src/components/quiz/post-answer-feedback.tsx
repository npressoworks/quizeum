'use client';

import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { parseMarkdownToHtml } from '@/lib/security/sanitize';
import styles from './post-answer-feedback.module.css';

export interface PostAnswerFeedbackProps {
  isCorrect: boolean;
  explanation?: string;
  correctAnswerDisplay?: string;
  isLastQuestion: boolean;
  onNext: () => void;
  onViewResults: () => void;
  quickPressTime?: number | null;
}

export function PostAnswerFeedback({
  isCorrect,
  explanation,
  correctAnswerDisplay,
  isLastQuestion,
  onNext,
  onViewResults,
  quickPressTime,
}: PostAnswerFeedbackProps) {
  return (
    <div className={styles.feedbackArea} data-testid="play-answer-feedback">
      <div
        className={`${styles.feedbackBanner} ${isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}
      >
        {isCorrect ? (
          <>
            <CheckCircle size={32} color="#00f5d4" aria-hidden="true" />
            <div>
              <div className={styles.feedbackTitleCorrect}>正解！</div>
              {quickPressTime != null && (
                <div className={styles.feedbackMeta}>
                  早押しタイム:{' '}
                  <strong className={styles.quickPressHighlight}>{quickPressTime}</strong> 秒
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <AlertTriangle size={32} color="#ff007f" aria-hidden="true" />
            <div>
              <div className={styles.feedbackTitleIncorrect}>不正解...</div>
              {quickPressTime != null && (
                <div className={styles.feedbackMeta}>
                  早押しタイム: {quickPressTime} 秒 (正解時のみ記録されます)
                </div>
              )}
              {correctAnswerDisplay && (
                <div className={styles.feedbackMeta}>正解: {correctAnswerDisplay}</div>
              )}
            </div>
          </>
        )}
      </div>

      {isCorrect && explanation && (
        <div className={styles.explanationBox}>
          <strong className={styles.explanationLabel}>💡 解説:</strong>
          <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(explanation) }} />
        </div>
      )}

      {isLastQuestion ? (
        <button
          type="button"
          className={`btn btn-primary ${styles.ctaButton}`}
          data-testid="play-view-results"
          data-analytics="quiz-play-view-results"
          onClick={onViewResults}
        >
          結果を見る ➔
        </button>
      ) : (
        <button
          type="button"
          className={`btn btn-primary ${styles.ctaButton}`}
          data-testid="play-next-question"
          data-analytics="quiz-play-next-question"
          onClick={onNext}
        >
          次へ ➔
        </button>
      )}
    </div>
  );
}
