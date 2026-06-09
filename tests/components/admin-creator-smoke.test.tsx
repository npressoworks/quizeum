/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmActionDialog } from '@/components/admin/confirm-action-dialog';
import { AnalyticsChart } from '@/components/charts/analytics-chart';

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

describe('ConfirmActionDialog', () => {
  test('キャンセル時に onConfirm が呼ばれない', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmActionDialog
        open
        onOpenChange={() => {}}
        title="確認"
        description="この操作を実行しますか？"
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByTestId('cancel-action-btn'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('確認時に onConfirm が呼ばれる', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmActionDialog
        open
        onOpenChange={() => {}}
        title="確認"
        description="実行します"
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByTestId('confirm-action-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('AnalyticsChart', () => {
  const sampleData = [
    { label: '5/23', value: 12 },
    { label: '5/24', value: 19 },
  ];

  test('title と data-testid 付きチャート領域を描画する', () => {
    render(
      <AnalyticsChart data={sampleData} title="日別プレイ数" color="primary" />,
    );
    expect(screen.getByText('日別プレイ数')).toBeInTheDocument();
    expect(screen.getByText('直近7日間')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
