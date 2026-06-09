'use client';

import React from 'react';
import type { QuizListType } from '@/types';
import { Label } from '@/components/ui/label';

export interface ListTypeSelectorProps {
  value: QuizListType;
  onChange: (value: QuizListType) => void;
  disabled?: boolean;
}

export function ListTypeSelector({ value, onChange, disabled = false }: ListTypeSelectorProps) {
  return (
    <div data-testid="list-type-selector" role="radiogroup" aria-label="リスト種別" className="grid gap-2">
      <Label
        className="mb-0 flex cursor-pointer items-center gap-2 font-normal"
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      >
        <input
          type="radio"
          name="list-type"
          data-testid="list-type-quiz"
          value="quiz"
          checked={value === 'quiz'}
          onChange={() => onChange('quiz')}
          disabled={disabled}
          className="size-4 accent-primary"
        />
        <span>クイズリスト（収録単位: クイズ）</span>
      </Label>
      <Label
        className="mb-0 flex cursor-pointer items-center gap-2 font-normal"
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      >
        <input
          type="radio"
          name="list-type"
          data-testid="list-type-question"
          value="question"
          checked={value === 'question'}
          onChange={() => onChange('question')}
          disabled={disabled}
          className="size-4 accent-primary"
        />
        <span>問題リスト（収録単位: 問題）</span>
      </Label>
      {disabled && (
        <p className="mt-2 text-xs text-muted-foreground">
          作成後のリスト種別は変更できません。
        </p>
      )}
    </div>
  );
}
