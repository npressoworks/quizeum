'use client';

import React from 'react';
import { AutoGrowTextarea } from '@/components/ui/auto-grow-textarea';
import { Button } from '@/components/ui/button';
import { filterValidationErrors } from '@/services/quiz-validation';
import { FieldValidationMessages } from '@/components/quiz/editor/quiz-editor-validation';
import { editorClasses } from '@/components/quiz/editor/quiz-editor-classes';
import type { QuestionTypeEditorProps } from '@/components/quiz/editor/question-editor-types';

export function LateralThinkingEditor({
  qIdx,
  question,
  validationErrors,
  handlers,
  keywordInput,
}: QuestionTypeEditorProps & { keywordInput: string }) {
  const aiContextHasError =
    filterValidationErrors(validationErrors, {
      field: 'questions',
      questionIndex: qIdx,
      questionField: 'aiContextDetails',
    }).length > 0;

  return (
    <>
      <div className={`${editorClasses.formGroup} mt-5`}>
        <label className={editorClasses.label}>
          真相（ゲームマスター用の裏設定・解決情報）
          <span className="text-destructive"> *</span>
        </label>
        <AutoGrowTextarea
          className={`${editorClasses.textarea} ${aiContextHasError ? editorClasses.inputError : ''}`}
          placeholder="AIがプレイヤーからの自由な質問に答える基準となる「真相（裏設定）」を、20文字以上2000文字以内で詳しく記述してください。"
          value={question.aiContextDetails || ''}
          onChange={(e) => handlers.onAiContextDetailsChange(qIdx, e.target.value)}
          style={{ resize: 'vertical' }}
          minRows={5}
          data-testid={`auto-grow-truth-${qIdx}`}
        />
        <FieldValidationMessages
          errors={validationErrors}
          field="questions"
          questionIndex={qIdx}
          questionField="aiContextDetails"
        />
      </div>

      <div className={`${editorClasses.formGroup} mt-5`}>
        <label className={editorClasses.label}>
          必須正解キーワード（真相判定に使用するエッセンス。複数指定可能）
          <span className="text-destructive"> *</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className={editorClasses.input}
            placeholder="例: スープ (Enterで追加)"
            value={keywordInput}
            onChange={(e) => handlers.onKeywordInputChange(qIdx, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handlers.onAddKeyword(qIdx);
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={() => handlers.onAddKeyword(qIdx)} className="h-10 min-w-20 px-4">
            追加
          </Button>
        </div>

        <div className={`${editorClasses.tagList} mt-2.5`}>
          {(question.truthKeywords ?? []).map((kw, kwIdx) => (
            <div
              key={kwIdx}
              className={`${editorClasses.tagBadge} border-primary bg-primary/10`}
            >
              {kw}
              <button type="button" className={editorClasses.removeTagBtn} onClick={() => handlers.onRemoveKeyword(qIdx, kwIdx)}>
                &times;
              </button>
            </div>
          ))}
        </div>
        <span className={`${editorClasses.tagLimitInfo} mt-1 block`}>
          {(question.truthKeywords ?? []).length} 個の必須キーワード
        </span>
        <FieldValidationMessages
          errors={validationErrors}
          field="questions"
          questionIndex={qIdx}
          questionField="truthKeywords"
        />
      </div>
    </>
  );
}
