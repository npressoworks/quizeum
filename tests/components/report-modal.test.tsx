/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportModal } from '@/components/quiz/report-modal';
import { flagContent } from '@/services/moderation';

// flagContent のモック
jest.mock('@/services/moderation', () => ({
  flagContent: jest.fn(),
}));

describe('ReportModal Component', () => {
  const mockOnClose = jest.fn();
  const quizId = 'test-quiz-123';
  const reporterId = 'test-user-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('isOpen が false の時はレンダリングされないこと', () => {
    const { container } = render(
      <ReportModal
        isOpen={false}
        onClose={mockOnClose}
        quizId={quizId}
        reporterId={reporterId}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('isOpen が true の時に正しくフォームが表示されること', () => {
    render(
      <ReportModal
        isOpen={true}
        onClose={mockOnClose}
        quizId={quizId}
        reporterId={reporterId}
      />
    );

    expect(screen.getByText('クイズの通報')).toBeInTheDocument();
    expect(screen.getByTestId('report-reason-input')).toBeInTheDocument();
    expect(screen.getByTestId('report-submit-btn')).toBeInTheDocument();
  });

  test('通報理由を入力して送信した際、flagContent が呼び出されること', async () => {
    (flagContent as jest.Mock).mockResolvedValue(undefined);

    render(
      <ReportModal
        isOpen={true}
        onClose={mockOnClose}
        quizId={quizId}
        reporterId={reporterId}
      />
    );

    const textarea = screen.getByTestId('report-reason-input');
    const submitBtn = screen.getByTestId('report-submit-btn');

    // 理由を入力
    fireEvent.change(textarea, { target: { value: '不適切な画像が含まれています。' } });
    expect(submitBtn).not.toBeDisabled();

    // 送信
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(flagContent).toHaveBeenCalledWith(quizId, reporterId, '不適切な画像が含まれています。');
    });

    // 送信成功メッセージが表示されること
    await waitFor(() => {
      expect(screen.getByTestId('report-success-message')).toBeInTheDocument();
    });
  });

  test('flagContent が失敗した際、エラーメッセージが表示されること', async () => {
    const errorMessage = '通信エラーが発生しました。';
    (flagContent as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(
      <ReportModal
        isOpen={true}
        onClose={mockOnClose}
        quizId={quizId}
        reporterId={reporterId}
      />
    );

    const textarea = screen.getByTestId('report-reason-input');
    const submitBtn = screen.getByTestId('report-submit-btn');

    fireEvent.change(textarea, { target: { value: '著作権違反の可能性があります。' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('閉じるボタンまたはキャンセルボタンで onClose が呼ばれること', () => {
    render(
      <ReportModal
        isOpen={true}
        onClose={mockOnClose}
        quizId={quizId}
        reporterId={reporterId}
      />
    );

    const closeBtn = screen.getByLabelText('閉じる');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByText('キャンセル');
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
