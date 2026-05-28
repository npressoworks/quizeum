import React from 'react';
import { QuizEditor } from '@/components/quiz/quiz-editor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '新規クイズ作成 | quizeum',
  description: 'quizeumで新しいクイズを作成・編集して投稿しましょう。',
};

export default function QuizCreatePage() {
  return <QuizEditor />;
}
