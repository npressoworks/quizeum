'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { Question } from '@/types';

export interface ReferenceQuestionViewProps {
  question: Question;
  qIdx: number;
  onDetach: (qIdx: number) => void;
}

export function ReferenceQuestionView({ question, qIdx, onDetach }: ReferenceQuestionViewProps) {
  return (
    <div className="py-3">
      <p className="mb-2 text-sm text-muted-foreground">参照リンク問題（読み取り専用）</p>
      <p className="mb-3 whitespace-pre-wrap">{question.questionText}</p>
      <Button
        type="button"
        variant="secondary"
        onClick={() => onDetach(qIdx)}
        data-testid={`detach-reference-${question.id}`}
      >
        内容を編集（コピーに切り離し）
      </Button>
    </div>
  );
}
