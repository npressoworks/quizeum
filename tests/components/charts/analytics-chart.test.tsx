/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnalyticsChart } from '@/components/charts/analytics-chart';

jest.mock('recharts', () => ({
  Bar: () => <div data-testid="mock-bar" />,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-bar-chart">{children}</div>
  ),
  CartesianGrid: () => null,
  XAxis: () => null,
}));

jest.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));

describe('AnalyticsChart', () => {
  const sampleData = [
    { label: 'Mon', value: 10 },
    { label: 'Tue', value: 20 },
  ];

  it('title と期間ラベルをレンダリングする', () => {
    render(
      <AnalyticsChart data={sampleData} title="日別プレイ数" color="primary" />,
    );
    expect(screen.getByText('日別プレイ数')).toBeInTheDocument();
    expect(screen.getByText('直近7日間')).toBeInTheDocument();
  });

  it('ChartContainer と BarChart を描画する', () => {
    render(
      <AnalyticsChart data={sampleData} title="日別好評価率" color="accent" unit="%" />,
    );
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
  });

  it('空データでもエラーなくレンダリングする', () => {
    render(<AnalyticsChart data={[]} title="空データ" />);
    expect(screen.getByText('空データ')).toBeInTheDocument();
  });
});
