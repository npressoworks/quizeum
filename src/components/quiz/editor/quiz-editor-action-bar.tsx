'use client';

import React from 'react';
import { Play, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { editorClasses } from '@/components/quiz/editor/quiz-editor-classes';

export interface QuizEditorActionBarProps {
  loading: boolean;
  onSaveDraft: () => void;
  onTestPlay: () => void;
  onPublish: () => void;
}

export function QuizEditorActionBar({
  loading,
  onSaveDraft,
  onTestPlay,
  onPublish,
}: QuizEditorActionBarProps) {
  return (
    <div className={editorClasses.actionsBar}>
      <Button
        type="button"
        variant="secondary"
        onClick={onSaveDraft}
        disabled={loading}
        data-analytics="quiz-save-draft"
      >
        <Save size={18} />
        下書き保存
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onTestPlay}
        disabled={loading}
        data-analytics="quiz-test-play"
      >
        <Play size={18} />
        テストプレイ
      </Button>
      <Button
        type="button"
        onClick={onPublish}
        disabled={loading}
        data-analytics="quiz-publish"
      >
        <Send size={18} />
        公開
      </Button>
    </div>
  );
}
