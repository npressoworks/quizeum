import React from 'react';
import { QuizListEditor } from '@/components/quiz-list/quiz-list-editor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '新規問題集作成 | quizeum',
  description: '自作クイズや好みのクイズを組み合わせて、新しい問題集を作成します。',
};

export default function QuizListCreatePage() {
  return <QuizListEditor />;
}
