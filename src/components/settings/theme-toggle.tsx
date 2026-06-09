'use client';

import React from 'react';
import { useTheme } from '@/context/theme-context';
import type { Theme } from '@/lib/theme';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'ダーク' },
  { value: 'light', label: 'ライト' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      value={[theme]}
      onValueChange={(values) => {
        const next = values[values.length - 1];
        if (next) setTheme(next as Theme);
      }}
      data-testid="settings-theme-toggle"
    >
      {OPTIONS.map((opt) => (
        <ToggleGroupItem key={opt.value} value={opt.value}>
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
