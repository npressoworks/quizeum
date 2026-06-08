/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/lib/security/sanitize', () => ({
  parseMarkdownToHtml: (markdown: string) => markdown,
}));

import { PostAnswerFeedback } from '@/components/quiz/post-answer-feedback';

describe('PostAnswerFeedback', () => {
  test('最終問では「結果を見る」を表示する', () => {
    const onViewResults = jest.fn();
    render(
      <PostAnswerFeedback
        isCorrect={true}
        isLastQuestion={true}
        onNext={jest.fn()}
        onViewResults={onViewResults}
      />
    );

    fireEvent.click(screen.getByTestId('play-view-results'));
    expect(onViewResults).toHaveBeenCalledTimes(1);
  });

  test('不正解時は解説を表示しない', () => {
    render(
      <PostAnswerFeedback
        isCorrect={false}
        explanation="これは解説です"
        isLastQuestion={false}
        onNext={jest.fn()}
        onViewResults={jest.fn()}
      />
    );

    expect(screen.queryByText('💡 解説:')).not.toBeInTheDocument();
    expect(screen.queryByText('これは解説です')).not.toBeInTheDocument();
  });

  test('正解時は解説を表示する', () => {
    render(
      <PostAnswerFeedback
        isCorrect={true}
        explanation="これは解説です"
        isLastQuestion={false}
        onNext={jest.fn()}
        onViewResults={jest.fn()}
      />
    );

    expect(screen.getByText('💡 解説:')).toBeInTheDocument();
    expect(screen.getByText('これは解説です')).toBeInTheDocument();
  });

  test('途中の問題では「次へ」を表示する', () => {
    const onNext = jest.fn();
    render(
      <PostAnswerFeedback
        isCorrect={false}
        correctAnswerDisplay="正解テキスト"
        isLastQuestion={false}
        onNext={onNext}
        onViewResults={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('play-next-question'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
