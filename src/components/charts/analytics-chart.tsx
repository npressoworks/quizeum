'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  title: string;
  unit?: string;
  color?: 'primary' | 'accent';
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  title,
  unit = '回',
  color = 'primary',
}) => {
  const chartConfig = {
    value: {
      label: title,
      color: color === 'primary' ? 'var(--chart-1)' : 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">{title}</h3>
        <span className="text-xs text-muted-foreground">直近7日間</span>
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [`${value}${unit}`, title]}
              />
            }
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
