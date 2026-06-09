/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  FieldValidationMessages,
  QuizEditorErrorSummary,
} from '@/components/quiz/editor/quiz-editor-validation';
import type { QuizPublishValidationError } from '@/services/quiz-validation';

describe('QuizEditorValidation', () => {
  it('renders field validation messages when errors match', () => {
    const errors: QuizPublishValidationError[] = [
      { field: 'title', message: 'タイトルは必須です' },
    ];

    render(<FieldValidationMessages errors={errors} field="title" />);

    expect(screen.getByRole('alert')).toHaveTextContent('タイトルは必須です');
  });

  it('renders nothing when no matching field errors', () => {
    const errors: QuizPublishValidationError[] = [
      { field: 'genre', message: 'ジャンルは必須です' },
    ];

    const { container } = render(
      <FieldValidationMessages errors={errors} field="title" />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders error summary alert with validation errors', () => {
    const errors: QuizPublishValidationError[] = [
      { field: 'title', message: 'タイトルは必須です' },
    ];

    render(
      <QuizEditorErrorSummary
        errorText={null}
        validationErrors={errors}
        questions={[]}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/保存できませんでした/)).toBeInTheDocument();
    expect(screen.getByText(/タイトルは必須です/)).toBeInTheDocument();
  });
});
