/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

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
