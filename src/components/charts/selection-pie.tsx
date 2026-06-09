'use client';

import React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart';

interface SelectionPieProps {
  data: {
    label: string;
    count: number;
  }[];
}

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export const SelectionPie: React.FC<SelectionPieProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
        解答データがまだありません
      </div>
    );
  }

  const chartData = data.map((item, idx) => ({
    name: item.label,
    value: item.count,
    segmentKey: `segment-${idx}`,
  }));

  const chartConfig = Object.fromEntries(
    chartData.map((item, idx) => [
      item.segmentKey,
      {
        label: item.name,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      },
    ]),
  ) satisfies ChartConfig;

  const segments = data.map((item, idx) => ({
    label: item.label,
    percentage: Math.round((item.count / total) * 100),
    color: PIE_COLORS[idx % PIE_COLORS.length],
  }));

  return (
    <div className="flex items-center gap-6 py-2">
      <div className="relative shrink-0">
        <ChartContainer config={chartConfig} className="mx-0 aspect-square h-[140px] w-[140px]">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={38}
              outerRadius={65}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {chartData.map((entry) => (
                <Cell key={entry.segmentKey} fill={`var(--color-${entry.segmentKey})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">合計回答</span>
          <span className="text-lg font-bold">{total}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex max-w-[140px] items-center gap-2 overflow-hidden">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate font-medium" title={seg.label}>
                {seg.label}
              </span>
            </div>
            <span className="ml-2 font-bold text-muted-foreground">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
