/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmActionDialog } from '@/components/admin/confirm-action-dialog';

describe('ConfirmActionDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: '操作を確認',
    description: 'この操作を実行しますか？',
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトルと説明を表示する', () => {
    render(<ConfirmActionDialog {...defaultProps} />);
    expect(screen.getByText('操作を確認')).toBeInTheDocument();
    expect(screen.getByText('この操作を実行しますか？')).toBeInTheDocument();
  });

  it('確認ボタンクリックで onConfirm が呼ばれる', () => {
    const onConfirm = jest.fn();
    render(<ConfirmActionDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByTestId('confirm-action-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('キャンセルボタンクリックで onConfirm が呼ばれない', () => {
    const onConfirm = jest.fn();
    render(<ConfirmActionDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByTestId('cancel-action-btn'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('カスタムラベルを表示する', () => {
    render(
      <ConfirmActionDialog
        {...defaultProps}
        confirmLabel="削除する"
        cancelLabel="戻る"
      />,
    );
    expect(screen.getByTestId('confirm-action-btn')).toHaveTextContent('削除する');
    expect(screen.getByTestId('cancel-action-btn')).toHaveTextContent('戻る');
  });
});
