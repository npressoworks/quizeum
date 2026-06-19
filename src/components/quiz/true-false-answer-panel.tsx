'use client';

import React, { useMemo, useEffect } from 'react';
import { Question } from '@/types';
import {
  findTrueFalseChoiceId,
  TRUE_FALSE_LABELS,
} from '@/lib/true-false-defaults';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TrueFalseAnswerPanelProps = {
  question: Question;
  onConfirm: (answer: string) => void;
  disabled?: boolean;
  onChoiceClick?: (choiceId: string) => void;
  onChoicesOrderResolved?: (order: string[]) => void;
};

export function TrueFalseAnswerPanel({
  question,
  onConfirm,
  disabled = false,
  onChoiceClick,
  onChoicesOrderResolved,
}: TrueFalseAnswerPanelProps) {
  const maruId = useMemo(
    () => findTrueFalseChoiceId(question.choices, 'maru'),
    [question.choices, question.id]
  );
  const batsuId = useMemo(
    () => findTrueFalseChoiceId(question.choices, 'batsu'),
    [question.choices, question.id]
  );

  useEffect(() => {
    if (onChoicesOrderResolved) {
      onChoicesOrderResolved([maruId, batsuId].filter(Boolean) as string[]);
    }
  }, [maruId, batsuId, onChoicesOrderResolved]);

  const handleSelect = (choiceId: string | undefined) => {
    if (disabled || !choiceId) return;
    if (onChoiceClick) {
      onChoiceClick(choiceId);
    }
    onConfirm(choiceId);
  };

  const btnClass =
    'min-h-[72px] w-full rounded-lg border border-border bg-card px-5 py-5 text-4xl font-bold leading-none text-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:cursor-not-allowed';

  return (
    <div
      className={cn('mt-4 grid grid-cols-2 gap-4', disabled && 'pointer-events-none opacity-55')}
      data-testid="true-false-answer-panel"
    >
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => handleSelect(maruId)}
        disabled={disabled || !maruId}
        data-testid="true-false-answer-true"
        data-analytics="quiz-answer-true-false-maru"
      >
        {TRUE_FALSE_LABELS.maru}
      </Button>
      <Button
        type="button"
        variant="outline"
        className={btnClass}
        onClick={() => handleSelect(batsuId)}
        disabled={disabled || !batsuId}
        data-testid="true-false-answer-false"
        data-analytics="quiz-answer-true-false-batsu"
      >
        {TRUE_FALSE_LABELS.batsu}
      </Button>
    </div>
  );
}
