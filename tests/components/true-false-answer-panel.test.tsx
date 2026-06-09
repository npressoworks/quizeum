/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrueFalseAnswerPanel } from '@/components/quiz/true-false-answer-panel';
import { Question } from '@/types';

function makeQuestion(): Question {
  return {
    id: 'q-tf',
    type: 'true-false',
    questionText: '地球は丸い？',
    explanation: '',
    imageUrl: null,
    hint: null,
    limitTime: null,
    correctCount: 0,
    incorrectCount: 0,
    choices: [
      { id: 'opt-true', choiceText: '〇', isCorrect: true, selectedCount: 0 },
      { id: 'opt-false', choiceText: '✕', isCorrect: false, selectedCount: 0 },
    ],
  };
}

describe('TrueFalseAnswerPanel', () => {
  it('〇クリックで正解 choiceId を即送信する', () => {
    const onConfirm = jest.fn();
    render(<TrueFalseAnswerPanel question={makeQuestion()} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByTestId('true-false-answer-true'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith('opt-true');
  });

  it('disabled 時は送信しない', () => {
    const onConfirm = jest.fn();
    render(
      <TrueFalseAnswerPanel question={makeQuestion()} onConfirm={onConfirm} disabled />
    );

    fireEvent.click(screen.getByTestId('true-false-answer-false'));

    expect(onConfirm).not.toHaveBeenCalled();
  });
});
