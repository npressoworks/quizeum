/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrueFalseCorrectToggle } from '@/components/quiz/true-false-correct-toggle';

describe('TrueFalseCorrectToggle', () => {
  it('正解側の変更を通知する', () => {
    const onChange = jest.fn();
    render(<TrueFalseCorrectToggle value="maru" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('true-false-correct-toggle').querySelectorAll('button')[1]!);

    expect(onChange).toHaveBeenCalledWith('batsu');
  });
});
