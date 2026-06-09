'use client';

import React from 'react';
import { TrueFalseCorrectToggle } from '@/components/quiz/true-false-correct-toggle';
import { resolveTrueFalseCorrectSide } from '@/lib/true-false-defaults';
import { FieldValidationMessages } from '@/components/quiz/editor/quiz-editor-validation';
import { editorClasses } from '@/components/quiz/editor/quiz-editor-classes';
import type { QuestionTypeEditorProps } from '@/components/quiz/editor/question-editor-types';

export function TrueFalseEditor({ qIdx, question, validationErrors, handlers }: QuestionTypeEditorProps) {
  return (
    <div className={editorClasses.choicesList}>
      <TrueFalseCorrectToggle
        value={resolveTrueFalseCorrectSide(question.choices)}
        onChange={(side) => handlers.onTrueFalseCorrectChange(qIdx, side)}
      />
      <FieldValidationMessages
        errors={validationErrors}
        field="questions"
        questionIndex={qIdx}
        questionField="answers"
      />
    </div>
  );
}
