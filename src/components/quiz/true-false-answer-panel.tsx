'use client';

import React, { useMemo } from 'react';
import { Question } from '@/types';
import {
  findTrueFalseChoiceId,
  TRUE_FALSE_LABELS,
} from '@/lib/true-false-defaults';
import styles from './true-false-answer-panel.module.css';

type TrueFalseAnswerPanelProps = {
  question: Question;
  onConfirm: (answer: string) => void;
  disabled?: boolean;
};

export function TrueFalseAnswerPanel({
  question,
  onConfirm,
  disabled = false,
}: TrueFalseAnswerPanelProps) {
  const maruId = useMemo(
    () => findTrueFalseChoiceId(question.choices, 'maru'),
    [question.choices, question.id]
  );
  const batsuId = useMemo(
    () => findTrueFalseChoiceId(question.choices, 'batsu'),
    [question.choices, question.id]
  );

  const handleSelect = (choiceId: string | undefined) => {
    if (disabled || !choiceId) return;
    onConfirm(choiceId);
  };

  return (
    <div
      className={`${styles.panel} ${disabled ? styles.panelDisabled : ''}`}
      data-testid="true-false-answer-panel"
    >
      <button
        type="button"
        className={styles.answerBtn}
        onClick={() => handleSelect(maruId)}
        disabled={disabled || !maruId}
        data-testid="true-false-answer-true"
        data-analytics="quiz-answer-true-false-maru"
      >
        {TRUE_FALSE_LABELS.maru}
      </button>
      <button
        type="button"
        className={styles.answerBtn}
        onClick={() => handleSelect(batsuId)}
        disabled={disabled || !batsuId}
        data-testid="true-false-answer-false"
        data-analytics="quiz-answer-true-false-batsu"
      >
        {TRUE_FALSE_LABELS.batsu}
      </button>
    </div>
  );
}
