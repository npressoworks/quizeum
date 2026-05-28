import React from 'react';
import { QuizEditor } from '@/components/quiz/quiz-editor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'クイズ編集 | quizeum',
  description: '作成したクイズを編集して、再度公開・下書き保存することができます。',
};

interface EditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizEditPage({ params }: EditPageProps) {
  const { id } = await params;
  return <QuizEditor quizId={id} />;
}
